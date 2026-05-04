# GitHub PR Review Agent — OAuth UI System

AI-powered GitHub Pull Request Review Agent with web UI and GitHub OAuth authentication.

## Overview

This tool provides AI-powered code review for GitHub pull requests using Claude. Users log in with their GitHub account, enter a PR URL, preview AI-generated review comments, and optionally submit them to GitHub.

### Key Features

- **GitHub OAuth Authentication** — No need for personal access tokens
- **Web UI** — User-friendly interface for reviewing PRs
- **Preview-First Workflow** — Review AI comments before posting
- **Line-Level Comments** — Specific, actionable suggestions
- **Manual Trigger** — User-controlled, not automated

## Architecture

```
User (Web Browser)
     ↓
┌─────────────────────┐
│ React Frontend      │
│ (Login/Home/Review) │
└─────────────────────┘
     ↓
┌─────────────────────┐
│ FastAPI Server      │
│ - OAuth Routes      │
│ - Review API        │
│ - Session Mgmt      │
└─────────────────────┘
     ↓
┌─────────────────────┐
│ Claude Agent        │
│ - Code Analysis     │
│ - GitHub API calls  │
│ - Review Generation │
└─────────────────────┘
```

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret

# Optional
SESSION_SECRET=random_secret_for_session_security
PORT=8000
```

### 2. GitHub OAuth App Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Configure:
   - **Application name**: "PR Review Agent"
   - **Homepage URL**: `http://localhost:8000`
   - **Authorization callback URL**: `http://localhost:8000/auth/callback`
4. Save the Client ID and Client Secret to your `.env` file

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Usage

### 1. Start the Backend Server

```bash
python main.py
```

The server will start at `http://localhost:8000`

### 2. Start the Frontend (Development)

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

### 3. Use the Application

1. Navigate to `http://localhost:3000`
2. Click "Login with GitHub"
3. Authorize the application
4. Enter a GitHub PR URL
5. Review the AI-generated comments
6. Submit to GitHub or regenerate

## API Endpoints

### Authentication

- `GET /auth/login` - Initiate GitHub OAuth
- `GET /auth/callback` - Handle OAuth callback
- `GET /auth/logout` - Logout user

### Review API

- `POST /api/review/generate` - Generate AI review (no submission)
- `POST /api/review/submit` - Submit review to GitHub

### Other

- `GET /health` - Health check
- `GET /` - Root endpoint

## Development

### Frontend Development

```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend Development

The FastAPI server includes:

- Auto-reloading during development
- Interactive API docs at `/docs`
- Session management
- GitHub OAuth flow

## Security

- OAuth tokens stored securely in memory
- Session cookies with security flags
- HTTPS required for production
- No token exposure to frontend

## Production Deployment

1. Set production environment variables
2. Use HTTPS for OAuth callback URLs
3. Deploy backend with a production ASGI server
4. Build and serve frontend static files
5. Use Redis/database for session storage (not in-memory)

## Troubleshooting

### Common Issues

**"Authentication failed"**
- Check GitHub OAuth app configuration
- Verify Client ID/Secret in `.env`
- Ensure callback URL matches exactly

**"Invalid PR URL"**
- Use full GitHub PR URLs: `https://github.com/owner/repo/pull/123`
- Ensure you have access to the repository

**"Review generation failed"**
- Check Anthropic API key
- Verify repository access permissions
- Check rate limits

### Debugging

1. Check console logs in browser developer tools
2. Check FastAPI server logs
3. Test API endpoints directly at `/docs`
4. Verify GitHub OAuth app settings

## Differences from Webhook Version

This version replaces the webhook-based automation with a user-driven UI:

### Removed
- ❌ Webhook server
- ❌ Automatic reviews on PR creation
- ❌ Static GitHub tokens (PAT)

### Added
- ✅ GitHub OAuth authentication
- ✅ Web UI for manual reviews
- ✅ Preview-before-submit workflow
- ✅ User session management

## License

MIT License - see LICENSE file for details.
