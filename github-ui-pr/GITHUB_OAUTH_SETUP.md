# GitHub OAuth App Setup

## Required: Create GitHub OAuth App

Authentication failing? Need configure GitHub OAuth app first.

### Step 1: Create OAuth App on GitHub

1. Go to GitHub: **Settings** > **Developer settings** > **OAuth Apps**
2. Click **"New OAuth App"**
3. Fill out form:

```
Application name: GitHub PR Review Agent
Homepage URL: http://localhost:3000
Application description: AI-powered PR review tool
Authorization callback URL: http://localhost:3000/callback
```

**CRITICAL:** Callback URL must be **exactly** `http://localhost:3000/callback`

### Step 2: Get Client Credentials

After creating app:
1. Copy **Client ID**
2. Generate **Client Secret**
3. Update `.env` file:

```bash
# In github-ui-pr/.env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### Step 3: Test Setup

1. Start backend:
```bash
cd github-ui-pr
python main.py
# Should show "oauth_configured": true at http://localhost:8000/health
```

2. Start frontend:
```bash
cd github-ui-pr/frontend  
npm run dev
```

3. Test flow:
   - Visit http://localhost:3000
   - Click "Login with GitHub"
   - Should redirect to GitHub authorization
   - Authorize app
   - Should redirect back to /home

### Common Issues

**"Authentication failed"** usually means:

1. **Wrong callback URL** - Must be `http://localhost:3000/callback` in GitHub app
2. **Wrong client credentials** - Check .env file values match GitHub app
3. **App not approved** - Make sure you authorized the app on GitHub
4. **Port mismatch** - Frontend must run on port 3000, backend on port 8000

### Debug Steps

1. Check browser console for error details
2. Check backend logs for OAuth errors  
3. Verify GitHub app callback URL setting
4. Test /health endpoint shows oauth_configured: true

### OAuth Flow Overview

```
Frontend (3000) -> GitHub OAuth -> Frontend /callback -> Backend API (8000) -> Success
```

Backend needs to be running for token exchange to work.