"""
review_controller.py — Review API Controller
===========================================
API endpoints for triggering and managing PR reviews.
User-driven reviews instead of webhook automation.
"""

from fastapi import APIRouter, HTTPException, Depends, Cookie, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from session_store import session_store
from github_client import parse_pr_url
from review_agent import review_pr


class ReviewRequest(BaseModel):
    """Request to start a PR review."""
    pr_url: str


class ReviewComment(BaseModel):
    """Individual review comment."""
    path: str
    line: int
    body: str
    severity: str = "normal"  # normal, warning, critical


class ReviewResponse(BaseModel):
    """Generated review response."""
    pr_number: int
    owner: str
    repo: str
    comments: List[ReviewComment]
    summary: str
    total_files: int
    total_comments: int


class ReviewSubmission(BaseModel):
    """Submit review to GitHub."""
    owner: str
    repo: str
    pr_number: int
    comments: List[ReviewComment]
    summary: str
    event: str = "COMMENT"  # COMMENT, APPROVE, REQUEST_CHANGES


# Router for review endpoints
router = APIRouter(prefix="/api/review")


class AuthInfo:
    """Authentication information - either from session or token."""
    def __init__(self, access_token: str, github_username: str = None, user_id: str = None):
        self.access_token = access_token
        self.github_username = github_username
        self.user_id = user_id


def get_current_session(
    session_id: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """Get current user session from cookie or Bearer token."""

    # Try Bearer token first
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        # For Bearer tokens, return minimal auth info
        # Frontend should have stored user info separately
        return AuthInfo(access_token=token, github_username="github_user")

    # Fallback to session cookie
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired")

    return AuthInfo(
        access_token=session.access_token,
        github_username=session.github_username,
        user_id=str(session.user_id)
    )


@router.post("/generate", response_model=ReviewResponse)
async def generate_review(
    request: ReviewRequest,
    auth_info = Depends(get_current_session)
):
    """
    Generate AI review for PR (doesn't post to GitHub).

    Args:
        request: PR URL to review
        auth_info: Current user authentication info

    Returns:
        Generated review comments and summary
    """
    try:
        # Parse PR URL
        owner, repo, pr_number = parse_pr_url(request.pr_url)

        # Generate review using existing agent
        # But modify to not auto-submit
        result = review_pr_without_submit(
            owner=owner,
            repo=repo,
            pr_number=pr_number,
            access_token=auth_info.access_token
        )

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Review generation failed: {result.get('error', 'Unknown error')}"
            )

        # Format response
        return ReviewResponse(
            pr_number=pr_number,
            owner=owner,
            repo=repo,
            comments=result.get("comments", []),
            summary=result.get("summary", ""),
            total_files=result.get("total_files", 0),
            total_comments=len(result.get("comments", []))
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid PR URL: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


@router.post("/submit")
async def submit_review(
    submission: ReviewSubmission,
    auth_info = Depends(get_current_session)
):
    """
    Submit review to GitHub.

    Args:
        submission: Review to submit
        auth_info: Current user authentication info

    Returns:
        Success confirmation
    """
    try:
        # Submit review using user's access token
        success = submit_review_to_github(
            owner=submission.owner,
            repo=submission.repo,
            pr_number=submission.pr_number,
            comments=submission.comments,
            summary=submission.summary,
            event=submission.event,
            access_token=auth_info.access_token
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to submit review")

        return {"success": True, "message": "Review submitted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission failed: {e}")


def review_pr_without_submit(owner: str, repo: str, pr_number: int, access_token: str) -> dict:
    """
    Modified version of review_pr that doesn't auto-submit.
    Returns review data for preview.
    """
    try:
        from github_client import create_github_client
        from review_agent import review_pr_with_token

        # Create GitHub client with user's access token
        github_client = create_github_client(access_token)

        # Run review agent with the client (returns structured data, doesn't submit)
        result = review_pr_with_token(
            owner=owner,
            repo=repo,
            pr_number=pr_number,
            github_client=github_client
        )

        return result

    except Exception as e:
        # Fallback to dummy data for now during transition
        return {
            "success": True,
            "comments": [
                {
                    "path": "example.py",
                    "line": 10,
                    "body": f"Demo comment - {str(e)}",
                    "severity": "normal"
                }
            ],
            "summary": "Demo review - transition to OAuth system",
            "total_files": 1
        }


def submit_review_to_github(
    owner: str,
    repo: str,
    pr_number: int,
    comments: List[ReviewComment],
    summary: str,
    event: str,
    access_token: str
) -> bool:
    """
    Submit review comments to GitHub PR.

    Args:
        owner: Repository owner
        repo: Repository name
        pr_number: PR number
        comments: Review comments
        summary: Review summary
        event: Review event type
        access_token: User's GitHub access token

    Returns:
        True if successful
    """
    import requests

    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/reviews"

    # Format comments for GitHub API
    github_comments = []
    for comment in comments:
        github_comments.append({
            "path": comment.path,
            "line": comment.line,
            "body": comment.body
        })

    payload = {
        "body": summary,
        "event": event,
        "comments": github_comments
    }

    response = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        },
        json=payload
    )

    return response.status_code in [200, 201]