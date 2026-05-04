# GitHub PR Review Agent — Updated Technical Specification (UI + OAuth आधारित)

## Overview

AI-powered GitHub Pull Request Review Agent with a user-facing UI and GitHub OAuth authentication.  
Users log in via GitHub, enter a PR URL, preview AI-generated review comments, and optionally submit them directly to GitHub.

**Core Functionality:**

- GitHub OAuth-based login (no Personal Access Tokens)
- Manual PR review trigger via UI (no webhooks)
- AI-powered analysis using Claude
- Preview-first review workflow (user approval before posting)
- Line-level comments with actionable suggestions

---

## Architecture

### System Components

User (Browser UI)
│
▼
┌────────────────────┐
│ Frontend (React) │
│ - Login Page │
│ - Home Page │
│ - Review UI │
└────────────────────┘
│
▼
┌────────────────────┐
│ FastAPI Server │
│ - Auth Routes │
│ - Review API │
│ - Session Mgmt │
└────────────────────┘
│
├──────────────► GitHub OAuth API
│ (Login + Token Exchange)
│
├──────────────► GitHub REST API
│ (PR data + Review submission)
│
▼
┌────────────────────────────────────────────┐
│ Review Agent (Claude) │
│ - Agentic loop │
│ - Tool usage (GitHub APIs) │
│ - Code analysis │
└────────────────────────────────────────────┘

---

## Key Architectural Changes

### Removed Components

- ❌ Webhook Server (`webhook_server.py`)
- ❌ GitHub Webhook Integration
- ❌ Static `GITHUB_TOKEN` (PAT)

### Added Components

- ✅ GitHub OAuth Authentication
- ✅ User Session Management
- ✅ Frontend UI (Login + Review Flow)
- ✅ Manual Review Trigger API

---

## File Structure

github-ui-pr/
├── main.py
├── config.py
├── review_agent.py
├── agent_tools.py
├── github_client.py
├── auth.py # OAuth handling
├── session_store.py # Session/token storage
├── review_controller.py # API for triggering reviews
├── frontend/ # React app
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Callback.jsx
│ │ ├── Home.jsx
│ │ └── Review.jsx
├── requirements.txt
└── README.md

---

## Environment Configuration

### Required Environment Variables

ANTHROPIC_API_KEY=...

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

### Optional (Recommended)

SESSION_SECRET=...

---

## Authentication Flow (GitHub OAuth)

### Flow Steps

1. User clicks "Login with GitHub"
2. Redirect to:

https://github.com/login/oauth/authorize

3. User authenticates
4. GitHub redirects back with `code`
5. Backend exchanges:

code → access_token

6. Backend fetches user info
7. Session created and stored

---

## Session Management

### Stored Data

{
user_id,
github_username,
access_token
}

### Notes

- Tokens are user-scoped
- Stored securely (DB or encrypted store)
- Never exposed to frontend directly

---

## Frontend UI

### 1. Login Page

- Button: "Login with GitHub"
- Redirect to OAuth flow

---

### 2. Callback Page

- Extract `code`
- Send to backend
- Redirect to Home

---

### 3. Home Page

- Input field: GitHub PR URL
- Submit button: "Analyze PR"

---

### 4. Review Page

Displays:

- PR summary
- AI-generated comments
- Severity tagging

### Actions:

- "Post Review" (submit to GitHub)
- "Cancel"
- "Regenerate"

---

## Review Flow (User-Driven)

Login → Enter PR URL → Generate Review → Preview → Submit

---

## Backend APIs

### Auth APIs

POST /auth/github/callback

- Input: `code`
- Output: session created

---

### Review APIs

POST /review

- Input: PR URL
- Action: triggers agent
- Output: generated review (not posted)

POST /review/submit

- Input: review payload
- Action: posts to GitHub

---

## Review Agent (Unchanged Core)

### Agentic Loop

1. get_pr_details
2. get_pr_files
3. get_file_content (if needed)
4. analyze
5. prepare review
6. return (no auto-submit)

---

## Tool Changes

### Modified Behavior

| Tool          | Change                                           |
| ------------- | ------------------------------------------------ |
| submit_review | Now optional, triggered only after user approval |

---

## GitHub API Integration

### Authentication

Authorization: Bearer <user_access_token>

---

### Review Submission

POST /repos/{owner}/{repo}/pulls/{number}/reviews

- Review is posted **as the logged-in user**

---

## UX Enhancements

### 1. Review Preview (Important)

- Prevents incorrect AI submissions
- Gives user control

---

### 2. Progress Indicators

Fetching PR...
Analyzing files...
Generating review...

---

### 3. Error Handling

Cases:

- Invalid PR URL
- No repo access
- No review permission
- Token expired

---

## Security Considerations

- OAuth tokens stored securely
- No token exposure to frontend
- HTTPS required
- Session protection via secure cookies/JWT

---

## Performance Considerations

### Token Usage

- Same as previous system
- Depends on PR size

### Improvements Possible

- File chunking
- Selective analysis
- Caching results

---

## Limitations

- User must have repo access
- Cannot review without write permission
- Large PRs may be slow

---

## Future Enhancements

- Multi-agent review system
- Review history dashboard
- Inline diff suggestions
- IDE integration
- Team collaboration features

---

## Summary

This updated system transforms the architecture from:

**Webhook-based automation → User-driven AI tool**

### Key Benefits:

- Better UX (login + manual control)
- Improved security (OAuth आधारित)
- No infrastructure complexity (no webhooks)
- Reviews posted as user (native GitHub experience)
