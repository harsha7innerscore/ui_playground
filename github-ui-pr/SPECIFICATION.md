# GitHub PR Review Agent — Technical Specification

## Overview

AI-powered GitHub Pull Request Review Agent built with Claude Opus 4.7. Automatically analyzes code changes and posts detailed review comments with specific line-by-line feedback.

**Core Functionality:**
- Automated PR review via GitHub webhooks or CLI commands
- AI agent uses tools to read GitHub data and post reviews
- Comprehensive code analysis with security, bug, and quality checks
- Line-level comments with specific improvement suggestions

## Architecture

### System Components

```
GitHub PR Event
       │
       ▼
┌─────────────────┐    Webhook     ┌────────────────────┐
│   GitHub Repo   │ ────────────► │   FastAPI Server   │
└─────────────────┘               └────────────────────┘
                                           │
                                    Triggers Review
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────┐
│                Review Agent (Claude)                     │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  System Prompt   │    │      Agentic Loop           │ │
│  │   (cached)       │    │  1. get_pr_details          │ │
│  │                  │    │  2. get_pr_files            │ │
│  │  - Role definition│    │  3. get_file_content        │ │
│  │  - Review process│    │  4. analyze diffs           │ │
│  │  - Quality criteria│   │  5. post_review_comments    │ │
│  │  - Guidelines    │    │  6. submit_review           │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                                   │
                           Uses GitHub Tools
                                   │
                                   ▼
                    ┌─────────────────────────┐
                    │     GitHub API          │
                    │  - Read PR data         │
                    │  - Read file contents   │
                    │  - Post review comments │
                    └─────────────────────────┘
```

### File Structure

```
github-ui-pr/
├── main.py              # CLI entry point & command router
├── config.py            # Environment configuration management
├── review_agent.py      # Core Claude agent & agentic loop
├── agent_tools.py       # Tool definitions & execution
├── github_client.py     # GitHub REST API wrapper
├── webhook_server.py    # FastAPI webhook endpoint
├── requirements.txt     # Python dependencies
└── README.md           # Setup instructions
```

## Core Components

### 1. Review Agent (`review_agent.py`)

**Purpose:** Implements the agentic loop where Claude repeatedly calls tools until review is complete.

**Key Features:**
- **System Prompt Caching:** Large system prompt cached for 90% cost reduction
- **Adaptive Thinking:** Claude reasons step-by-step for complex code analysis
- **Tool Integration:** Uses GitHub API tools to gather data and post reviews
- **Error Handling:** Graceful failure with detailed error reporting
- **Iteration Limits:** Safety mechanism to prevent infinite loops

**Agentic Loop Process:**
1. **Initialize** — Set system prompt, create initial user message
2. **Loop Until Done:**
   - Call Claude with current message history
   - If `stop_reason="tool_use"` → Execute tools, append results, continue
   - If `stop_reason="end_turn"` → Review complete, exit loop
3. **Return Results** — Summary of tool calls made and final status

### 2. Agent Tools (`agent_tools.py`)

**Purpose:** Defines tools Claude can use to interact with GitHub API.

**Available Tools:**

| Tool | Purpose | Returns |
|------|---------|---------|
| `get_pr_details` | PR metadata, branches, file counts | Formatted PR summary |
| `get_pr_files` | File diffs showing all changes | Unified diff format with context |
| `get_file_content` | Full file content for context | Line-numbered file content |
| `get_pr_commits` | Commit history and messages | Commit log with authors |
| `submit_review` | Post complete review to GitHub | Review ID and status |

**Tool Execution Pattern:**
1. Claude requests tool with parameters
2. `execute_tool()` routes to appropriate GitHub API call
3. Result formatted as human-readable text
4. Returned to Claude for analysis

### 3. GitHub Client (`github_client.py`)

**Purpose:** HTTP client wrapper for GitHub REST API with authentication.

**API Endpoints Used:**
- `GET /repos/{owner}/{repo}/pulls/{number}` — PR details
- `GET /repos/{owner}/{repo}/pulls/{number}/files` — Changed files with diffs
- `GET /repos/{owner}/{repo}/contents/{path}` — File content at specific ref
- `GET /repos/{owner}/{repo}/pulls/{number}/commits` — PR commit history
- `POST /repos/{owner}/{repo}/pulls/{number}/reviews` — Submit review

**Features:**
- Bearer token authentication
- Automatic pagination handling
- Error handling with meaningful messages
- Rate limit awareness

### 4. Webhook Server (`webhook_server.py`)

**Purpose:** FastAPI server receiving GitHub webhook events for automated reviews.

**Security Features:**
- **HMAC-SHA256 Signature Verification:** Validates requests come from GitHub
- **Timing Attack Prevention:** Uses `hmac.compare_digest()` for safe comparison
- **Request Validation:** Validates JSON payload structure

**Event Handling:**
- **Trigger Events:** `opened`, `reopened`, `synchronize` (new commits)
- **Ignored Events:** Draft PRs, non-PR events, irrelevant actions
- **Background Processing:** Immediate HTTP response, review runs async

**Webhook Flow:**
1. Receive POST request from GitHub
2. Verify HMAC signature using webhook secret
3. Parse payload and extract PR information
4. Queue background review task
5. Return 202 Accepted immediately
6. Process review in background

### 5. Configuration (`config.py`)

**Purpose:** Centralized environment variable management with validation.

**Required Environment Variables:**
- `ANTHROPIC_API_KEY` — Claude API access
- `GITHUB_TOKEN` — GitHub Personal Access Token (repo scope)
- `GITHUB_WEBHOOK_SECRET` — Random string for webhook verification
- `PORT` — Server port (default: 8000)

**Configuration Pattern:**
- Load `.env` file at startup
- Validate all required variables present
- Fail fast with clear error messages if missing
- Global config object imported by all modules

## Claude Agent Behavior

### System Prompt Design

The agent is instructed to:

**Review Process Steps:**
1. Get PR details first to understand scope and context
2. Analyze all changed files with their diffs
3. Request full file content when context needed
4. Prepare comprehensive review with specific feedback
5. Submit review with overall verdict and line comments

**Review Quality Standards:**

| Severity | Criteria | Action |
|----------|----------|---------|
| **Must Fix** (REQUEST_CHANGES) | Bugs, security vulnerabilities, data integrity issues, breaking changes | Block merge |
| **Should Fix** (Comments/Request) | Error handling, performance issues, resource leaks, concurrency problems | Strong suggestions |
| **Nice to Fix** (Comments) | Code clarity, duplication, missing tests, documentation | Improvement suggestions |

**Comment Format Requirements:**
- **What:** Clear description of the issue
- **Why:** Explanation of why it matters (impact/consequences)  
- **How:** Concrete fix suggestion with code examples

### Tool Usage Patterns

**Typical Agent Workflow:**
```
1. get_pr_details → Understand PR scope and context
2. get_pr_files → See all diffs and changes
3. get_file_content (selective) → Context for complex changes
4. submit_review → Post complete review with:
   - Overall summary
   - APPROVE/REQUEST_CHANGES/COMMENT verdict
   - Line-level comments with specific feedback
```

**Adaptive Tool Selection:**
- Large PRs: Focus on most critical files first
- Simple changes: Direct analysis without extra context
- Complex logic: Read full files to understand surrounding code
- New features: Check for missing tests and documentation

## API Integration Details

### GitHub API Usage

**Authentication:** Bearer token in Authorization header
**Rate Limits:** 5000 requests/hour with authentication
**API Version:** 2022-11-28 (latest stable)

**Review Submission Format:**
```json
{
  "commit_id": "abc123",
  "body": "Overall review summary",
  "event": "APPROVE|REQUEST_CHANGES|COMMENT",
  "comments": [
    {
      "path": "src/auth.py",
      "line": 42,
      "body": "Detailed line comment"
    }
  ]
}
```

### Claude API Usage

**Model:** `claude-opus-4-7` (most capable for code review)
**Max Tokens:** 16,000 (supports detailed reviews)
**Thinking Mode:** `adaptive` (Claude decides when to reason)
**Tools:** GitHub API tools defined in JSON Schema format

**Cost Optimization:**
- System prompt caching: First call 1.25x, subsequent 0.1x
- ~90% token savings for repeated reviews
- Estimated cost: ~$0.18/day savings for 100 reviews

## Deployment Modes

### 1. Manual CLI Review

**Usage:**
```bash
python main.py review https://github.com/owner/repo/pull/123
```

**Use Cases:**
- Testing specific PRs
- One-off reviews
- CI/CD integration
- Repos without webhook setup

### 2. Automated Webhook Server

**Setup Process:**
1. Start server: `python main.py server --port 8000`
2. Expose via ngrok: `ngrok http 8000`
3. Configure GitHub webhook:
   - Payload URL: `https://xxx.ngrok.io/webhook`
   - Content type: `application/json`
   - Secret: Value from `GITHUB_WEBHOOK_SECRET`
   - Events: Pull requests

**Production Deployment:**
- Deploy server to cloud platform
- Configure proper DNS/load balancer
- Set environment variables
- Monitor webhook delivery logs

### 3. Health Monitoring

**Endpoints:**
- `GET /health` — Service status and configuration check
- `GET /` — Service information and available endpoints
- `GET /docs` — Auto-generated API documentation (Swagger UI)

## Security Considerations

### Webhook Security
- **Signature Verification:** All webhook payloads verified via HMAC-SHA256
- **Timing Attack Prevention:** Constant-time signature comparison
- **Secret Management:** Webhook secret stored in environment variables

### API Key Management
- **Environment Variables:** All secrets in `.env` file, never committed
- **Scope Minimization:** GitHub token only needs repo access for target repos
- **Validation:** Startup validation ensures all required secrets present

### Error Handling
- **Safe Failures:** Tool failures return error strings, don't crash agent
- **No Secret Exposure:** Error messages don't leak API keys or sensitive data
- **Request Validation:** Webhook payloads validated before processing

## Performance Characteristics

### Token Usage
- **System Prompt:** ~2000 tokens (cached after first call)
- **PR Analysis:** 2000-8000 tokens depending on size
- **Tool Results:** 1000-5000 tokens per file analyzed
- **Total per Review:** 5000-15000 tokens typically

### Response Times
- **Simple PR (1-3 files):** 30-60 seconds
- **Medium PR (5-10 files):** 1-3 minutes
- **Large PR (20+ files):** 3-5 minutes

### Scalability
- **Concurrent Reviews:** Multiple webhook events processed in parallel
- **Rate Limits:** GitHub API 5000/hour, Claude API based on tier
- **Background Processing:** Webhook responses immediate, review async

## Extension Points

### Adding New Tools

1. Define tool schema in `agent_tools.py`
2. Add execution logic to `execute_tool()`
3. Update system prompt if needed
4. Test with various PR scenarios

### Custom Review Criteria

Modify system prompt to:
- Add language-specific checks
- Include custom linting rules
- Enforce team coding standards
- Add security scanning integration

### Alternative Deployment

- **GitHub Actions:** Run as workflow on PR events
- **AWS Lambda:** Serverless webhook handler
- **Docker Container:** Containerized deployment
- **CI/CD Integration:** Part of existing pipeline

## Dependencies

```
anthropic>=0.50.0      # Claude API client
fastapi>=0.115.0       # Webhook server framework
uvicorn[standard]      # ASGI server
requests>=2.32.0       # GitHub API HTTP client
python-dotenv>=1.0.0   # Environment variable loading
rich>=13.9.0           # Terminal formatting
```

**Python Version:** 3.8+ (required for AsyncIO and type hints)
**External Services:** GitHub API, Anthropic API

## Configuration Examples

### Environment Variables (`.env`)
```
ANTHROPIC_API_KEY=sk-ant-api03-...
GITHUB_TOKEN=ghp_...
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6...
PORT=8000
```

### GitHub Webhook Configuration
```
Payload URL: https://yourserver.com/webhook
Content type: application/json
Secret: [your GITHUB_WEBHOOK_SECRET]
Events: Pull requests
Active: ✓
```

## Error Scenarios & Handling

| Error Type | Cause | Handling |
|------------|--------|----------|
| Invalid webhook signature | Wrong secret or malicious request | Return 403, log warning |
| GitHub API rate limit | Too many requests | Return error, suggest retry |
| Anthropic API error | Invalid key or model unavailable | Return error with instructions |
| Large PR timeout | Too many files to analyze | Partial review with note |
| Network connectivity | API unavailable | Graceful failure, error response |

## Monitoring & Observability

### Logging
- Webhook events received and processed
- Tool calls made and results
- Token usage per review
- Error conditions and failures

### Metrics
- Reviews completed per day
- Average review time
- Tool usage patterns
- Error rates by type

### Health Checks
- GitHub API connectivity
- Anthropic API connectivity
- Configuration validation
- Webhook signature verification test