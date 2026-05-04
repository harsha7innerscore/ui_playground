"""
main.py — FastAPI Web Server
============================
GitHub PR Review Agent with UI and OAuth authentication.
Users log in via GitHub, enter PR URL, preview review, submit to GitHub.
"""

from fastapi import FastAPI, Request, HTTPException, Form, Cookie
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from urllib.parse import urlencode

from config import config
from auth import github_oauth
from session_store import session_store
from review_controller import router as review_router

# FastAPI app
app = FastAPI(
    title="GitHub PR Review Agent",
    description="AI-powered PR review with GitHub OAuth",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include review API routes
app.include_router(review_router)


@app.get("/")
async def root():
    """Root endpoint - redirect to login or home based on session."""
    return {"service": "GitHub PR Review Agent", "login": "/auth/login"}


@app.get("/auth/login")
async def login():
    """Initiate GitHub OAuth login."""
    # Generate auth URL
    redirect_uri = "http://localhost:8000/auth/callback"
    auth_url = github_oauth.get_auth_url(redirect_uri)

    return RedirectResponse(url=auth_url)


@app.get("/auth/callback")
async def auth_callback(code: str = None, error: str = None):
    """Handle GitHub OAuth callback."""
    if error:
        return HTMLResponse(f"<h1>Login failed: {error}</h1>", status_code=400)

    if not code:
        return HTMLResponse("<h1>Missing authorization code</h1>", status_code=400)

    try:
        # Exchange code for token
        redirect_uri = "http://localhost:8000/auth/callback"
        token_data = github_oauth.exchange_code_for_token(code, redirect_uri)
        access_token = token_data["access_token"]

        # Get user info
        user_info = github_oauth.get_user_info(access_token)

        # Create session
        session_id = session_store.create_session(
            user_id=user_info["id"],
            github_username=user_info["login"],
            access_token=access_token
        )

        # Set session cookie and redirect to home
        response = RedirectResponse(url="/home", status_code=302)
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            max_age=24 * 60 * 60,  # 24 hours
            samesite="lax"
        )

        return response

    except Exception as e:
        return HTMLResponse(f"<h1>Authentication failed: {e}</h1>", status_code=500)


@app.post("/auth/callback")
async def auth_callback_json(request: Request):
    """Handle GitHub OAuth callback for frontend (JSON response)."""
    try:
        body = await request.json()
        code = body.get("code")

        print(f"Received OAuth callback with code: {code[:10]}...")

        if not code:
            raise HTTPException(status_code=400, detail="Missing authorization code")

        # Exchange code for token
        redirect_uri = "http://localhost:3000/callback"  # Frontend callback URL
        print(f"Using redirect_uri: {redirect_uri}")

        token_data = github_oauth.exchange_code_for_token(code, redirect_uri)
        print(f"Token exchange successful: {list(token_data.keys())}")

        access_token = token_data["access_token"]

        # Get user info
        user_info = github_oauth.get_user_info(access_token)
        print(f"User info retrieved: {user_info.get('login')}")

        # Return token and user info for frontend
        return {
            "access_token": access_token,
            "token_type": token_data.get("token_type", "bearer"),
            "scope": token_data.get("scope", ""),
            "user": user_info
        }

    except Exception as e:
        print(f"OAuth callback error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@app.get("/auth/logout")
async def logout(session_id: str = Cookie(None)):
    """Logout user."""
    if session_id:
        session_store.delete_session(session_id)

    response = RedirectResponse(url="/", status_code=302)
    response.delete_cookie("session_id")
    return response


@app.get("/home")
async def home(session_id: str = Cookie(None)):
    """Home page - shows PR review form."""
    if not session_id:
        return RedirectResponse(url="/auth/login")

    session = session_store.get_session(session_id)
    if not session:
        return RedirectResponse(url="/auth/login")

    # Simple HTML home page
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>PR Review Agent</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }}
            .header {{ display: flex; justify-content: space-between; align-items: center; }}
            input[type="text"] {{ width: 100%; padding: 10px; margin: 10px 0; }}
            button {{ padding: 10px 20px; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>GitHub PR Review Agent</h1>
            <div>
                Welcome, {session.github_username}!
                <a href="/auth/logout">Logout</a>
            </div>
        </div>

        <h2>Review a Pull Request</h2>
        <form id="reviewForm">
            <label for="pr_url">GitHub PR URL:</label>
            <input type="text" id="pr_url" name="pr_url"
                   placeholder="https://github.com/owner/repo/pull/123" required>
            <br>
            <button type="submit">Generate Review</button>
        </form>

        <div id="results" style="margin-top: 20px;"></div>

        <script>
        document.getElementById('reviewForm').addEventListener('submit', async function(e) {{
            e.preventDefault();

            const prUrl = document.getElementById('pr_url').value;
            const resultsDiv = document.getElementById('results');

            resultsDiv.innerHTML = '<p>Generating review...</p>';

            try {{
                const response = await fetch('/api/review/generate', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                    }},
                    body: JSON.stringify({{ pr_url: prUrl }}),
                    credentials: 'same-origin'
                }});

                if (response.ok) {{
                    const data = await response.json();
                    displayReview(data);
                }} else {{
                    const error = await response.text();
                    resultsDiv.innerHTML = `<p style="color: red;">Error: ${{error}}</p>`;
                }}
            }} catch (error) {{
                resultsDiv.innerHTML = `<p style="color: red;">Error: ${{error.message}}</p>`;
            }}
        }});

        function displayReview(data) {{
            const html = `
                <h3>Review Generated</h3>
                <p><strong>PR:</strong> ${{data.owner}}/${{data.repo}}#${{data.pr_number}}</p>
                <p><strong>Summary:</strong> ${{data.summary}}</p>
                <p><strong>Comments:</strong> ${{data.total_comments}}</p>

                <h4>Comments:</h4>
                <ul>
                    ${{data.comments.map(c => `
                        <li>
                            <strong>${{c.path}}:${{c.line}}</strong><br>
                            ${{c.body}}
                        </li>
                    `).join('')}}
                </ul>

                <button onclick="submitReview()" style="background: green; color: white;">
                    Submit Review to GitHub
                </button>
                <button onclick="regenerateReview()" style="margin-left: 10px;">
                    Regenerate
                </button>
            `;
            document.getElementById('results').innerHTML = html;
            window.currentReview = data;
        }}

        function submitReview() {{
            if (!window.currentReview) return;

            const data = window.currentReview;
            fetch('/api/review/submit', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify({{
                    owner: data.owner,
                    repo: data.repo,
                    pr_number: data.pr_number,
                    comments: data.comments,
                    summary: data.summary,
                    event: 'COMMENT'
                }}),
                credentials: 'same-origin'
            }})
            .then(response => response.json())
            .then(result => {{
                if (result.success) {{
                    alert('Review submitted successfully!');
                }} else {{
                    alert('Failed to submit review');
                }}
            }})
            .catch(error => alert('Error: ' + error.message));
        }}

        function regenerateReview() {{
            document.getElementById('reviewForm').dispatchEvent(new Event('submit'));
        }}
        </script>
    </body>
    </html>
    """
    return HTMLResponse(html)


@app.get("/health")
async def health():
    """Health check."""
    return {
        "status": "healthy",
        "model": config.model,
        "oauth_configured": bool(config.github_client_id and config.github_client_secret),
        "anthropic_configured": bool(config.anthropic_api_key)
    }


if __name__ == "__main__":
    print(f"\n🚀 Starting GitHub PR Review Agent")
    print(f"   Web UI: http://localhost:{config.port}")
    print(f"   Health: http://localhost:{config.port}/health")
    print(f"   Login: http://localhost:{config.port}/auth/login\n")

    uvicorn.run(app, host="0.0.0.0", port=config.port, log_level="info")
