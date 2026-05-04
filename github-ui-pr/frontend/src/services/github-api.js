/**
 * GitHub API Service for Frontend
 * Converted from Python github_client.py to run in browser
 */

const GITHUB_API_BASE = '/github-api';

/**
 * GitHub API Client Class
 */
export class GitHubClient {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.headers = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    this._updateAuthHeader();
  }

  _updateAuthHeader() {
    if (this.accessToken) {
      this.headers.Authorization = `Bearer ${this.accessToken}`;
    }
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
    this._updateAuthHeader();
  }

  async _get(path, params = null) {
    const url = new URL(`${GITHUB_API_BASE}${path}`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    await this._checkResponse(response);
    return await response.json();
  }

  async _post(path, data) {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    await this._checkResponse(response);
    return await response.json();
  }

  async _checkResponse(response) {
    if (response.status >= 400) {
      let detail;
      try {
        const errorData = await response.json();
        const message = errorData.message || 'Unknown error';
        const errors = errorData.errors || [];
        detail = message;
        if (errors.length > 0) {
          detail += ` — ${JSON.stringify(errors)}`;
        }
      } catch {
        detail = await response.text();
      }
      throw new Error(`GitHub API error ${response.status}: ${detail}`);
    }
  }

  async getPrDetails(owner, repo, prNumber) {
    const pr = await this._get(`/repos/${owner}/${repo}/pulls/${prNumber}`);

    return {
      number: pr.number,
      title: pr.title,
      description: pr.body || '(No description provided)',
      author: pr.user.login,
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      base_branch: pr.base.ref,
      head_branch: pr.head.ref,
      base_sha: pr.base.sha,
      head_sha: pr.head.sha,
      commits: pr.commits,
      changed_files: pr.changed_files,
      additions: pr.additions,
      deletions: pr.deletions,
      labels: (pr.labels || []).map(label => label.name),
      requested_reviewers: (pr.requested_reviewers || []).map(r => r.login),
      draft: pr.draft || false,
      mergeable: pr.mergeable,
    };
  }

  async getPrFiles(owner, repo, prNumber) {
    const files = [];
    let page = 1;

    while (true) {
      const pageData = await this._get(
        `/repos/${owner}/${repo}/pulls/${prNumber}/files`,
        { per_page: 100, page }
      );

      if (!pageData.length) {
        break;
      }

      for (const file of pageData) {
        files.push({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch || '(Binary file or no diff available)',
          previous_filename: file.previous_filename,
        });
      }

      if (pageData.length < 100) {
        break;
      }
      page++;
    }

    return files;
  }

  async getFileContent(owner, repo, path, ref) {
    try {
      const data = await this._get(
        `/repos/${owner}/${repo}/contents/${path}`,
        { ref }
      );

      // GitHub returns base64-encoded content
      const content = atob(data.content);
      return content;
    } catch (error) {
      return `(Could not retrieve file content: ${error.message})`;
    }
  }

  async getPrCommits(owner, repo, prNumber) {
    const commits = await this._get(
      `/repos/${owner}/${repo}/pulls/${prNumber}/commits`,
      { per_page: 100 }
    );

    return commits.map(c => ({
      sha: c.sha.slice(0, 8), // Short SHA for readability
      message: c.commit.message.split('\n')[0], // First line only
      author: c.commit.author.name,
    }));
  }

  async postReview(owner, repo, prNumber, commitId, body, event, comments = []) {
    // Format comments for GitHub's API
    const githubComments = [];

    for (const comment of comments) {
      if (!comment.path || !comment.body) {
        continue; // Skip malformed comments
      }

      const githubComment = {
        path: comment.path,
        body: comment.body,
        line: comment.line || 1,
        side: 'RIGHT', // RIGHT = new version of file
      };

      // Multi-line comment
      if (comment.start_line && comment.start_line !== comment.line) {
        githubComment.start_line = comment.start_line;
        githubComment.start_side = 'RIGHT';
      }

      githubComments.push(githubComment);
    }

    const reviewData = {
      commit_id: commitId,
      body,
      event,
      comments: githubComments,
    };

    return await this._post(
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      reviewData
    );
  }
}

/**
 * Parse GitHub PR URL into components
 */
export const parsePrUrl = (url) => {
  // Normalize: remove protocol and www prefix
  url = url.trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  // Expected format: github.com/owner/repo/pull/number
  const parts = url.split('/');

  // Find "pull" in the parts
  const pullIdx = parts.indexOf('pull');
  if (pullIdx === -1) {
    throw new Error(
      `Not a valid GitHub PR URL: ${url}\n` +
      'Expected format: https://github.com/owner/repo/pull/123'
    );
  }

  if (pullIdx < 3 || pullIdx + 1 >= parts.length) {
    throw new Error(`Malformed GitHub PR URL: ${url}`);
  }

  try {
    const owner = parts[pullIdx - 2];
    const repo = parts[pullIdx - 1];
    const prNumber = parseInt(parts[pullIdx + 1]);

    if (isNaN(prNumber)) {
      throw new Error('PR number is not a valid integer');
    }

    return { owner, repo, prNumber };
  } catch (error) {
    throw new Error(`Could not parse PR URL ${url}: ${error.message}`);
  }
};

/**
 * Tool definitions for Claude (GitHub tools)
 */
export const createGitHubTools = (githubToken) => {
  return [
    {
      name: 'get_pr_details',
      description: (
        'Get comprehensive information about a pull request: title, description, ' +
        'author, base/head branches, file counts, line additions/deletions, and labels. ' +
        'Call this FIRST before any other tool to understand what the PR is about.'
      ),
      input_schema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'GitHub repository owner (username or org name). E.g., "anthropics"'
          },
          repo: {
            type: 'string',
            description: 'GitHub repository name (without owner). E.g., "anthropic-sdk-python"'
          },
          pr_number: {
            type: 'integer',
            description: 'The pull request number (the integer in the URL, e.g., 123)'
          },
        },
        required: ['owner', 'repo', 'pr_number']
      }
    },
    {
      name: 'get_pr_files',
      description: (
        'Get all files changed in a pull request with their diffs. ' +
        'Returns filename, change status (added/modified/deleted), line counts, ' +
        'and the unified diff showing exactly what changed. ' +
        'Use this to see what code was actually modified. ' +
        'For large PRs, focus on the most important files first.'
      ),
      input_schema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          pr_number: { type: 'integer', description: 'PR number' },
        },
        required: ['owner', 'repo', 'pr_number']
      }
    },
    {
      name: 'get_file_content',
      description: (
        'Get the complete content of a specific file in the PR\'s version of the code. ' +
        'Use this when you need more context around a change — e.g., to see what class ' +
        'a modified method belongs to, what imports are at the top of the file, or how ' +
        'the rest of a module is structured. ' +
        'The diff shows WHAT changed; this shows the FULL PICTURE.'
      ),
      input_schema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          path: {
            type: 'string',
            description: 'File path relative to repo root. E.g., "src/auth/login.py"'
          },
          ref: {
            type: 'string',
            description: (
              'Git ref (branch, commit SHA, or tag) to get the file from. ' +
              'Use the PR\'s head_sha (from get_pr_details) to see the file ' +
              'as it exists in the PR.'
            )
          },
        },
        required: ['owner', 'repo', 'path', 'ref']
      }
    },
    {
      name: 'get_pr_commits',
      description: (
        'Get the list of commits in the PR with their messages and authors. ' +
        'Useful for understanding the history and intent of the changes. ' +
        'Good commit messages explain WHY the code changed, not just WHAT changed.'
      ),
      input_schema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          pr_number: { type: 'integer', description: 'PR number' },
        },
        required: ['owner', 'repo', 'pr_number']
      }
    },
    {
      name: 'submit_review',
      description: (
        'Submit the complete PR review to GitHub. ' +
        'This posts your overall assessment and all line-level comments atomically. ' +
        'Call this as your FINAL action after analyzing all relevant files. ' +
        '\n\nFor the \'event\' parameter:' +
        '\n- COMMENT: Post observations without approving/blocking (use for informational reviews)' +
        '\n- APPROVE: Approve the PR (use when code is ready to merge)' +
        '\n- REQUEST_CHANGES: Block merging until issues are fixed (use for bugs or serious concerns)' +
        '\n\nFor comments, provide specific file paths and line numbers from the PR. ' +
        'If you\'re unsure of exact line numbers, use COMMENT event and describe locations in the body.'
      ),
      input_schema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          pr_number: { type: 'integer', description: 'PR number' },
          commit_id: {
            type: 'string',
            description: 'The HEAD commit SHA of the PR (from get_pr_details as head_sha). Required by GitHub to anchor comments.'
          },
          body: {
            type: 'string',
            description: (
              'The overall review summary shown at the top. Should include: ' +
              '1) Brief summary of what the PR does, ' +
              '2) Your overall assessment, ' +
              '3) Summary of key findings (bugs, improvements, good practices). ' +
              'Write in markdown. Be constructive and specific.'
            )
          },
          event: {
            type: 'string',
            enum: ['COMMENT', 'APPROVE', 'REQUEST_CHANGES'],
            description: 'Review verdict: COMMENT (no vote), APPROVE, or REQUEST_CHANGES'
          },
          comments: {
            type: 'array',
            description: 'Array of line-level review comments',
            items: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'File path, e.g., "src/auth.py"'
                },
                line: {
                  type: 'integer',
                  description: 'Line number in the NEW version of the file (after the PR changes)'
                },
                start_line: {
                  type: 'integer',
                  description: 'Optional: Start line for a multi-line comment. Must be <= line.'
                },
                body: {
                  type: 'string',
                  description: (
                    'The comment text. Include: ' +
                    '1) What the issue is, ' +
                    '2) Why it matters (bug? security? performance? style?), ' +
                    '3) How to fix it (concrete suggestion or code snippet). ' +
                    'Write in markdown.'
                  )
                },
              },
              required: ['path', 'line', 'body']
            }
          },
        },
        required: ['owner', 'repo', 'pr_number', 'commit_id', 'body', 'event', 'comments']
      }
    },
  ];
};

/**
 * Execute GitHub tool (equivalent to execute_tool in Python)
 */
export const executeGitHubTool = async (toolName, toolInput, githubToken) => {
  const client = new GitHubClient(githubToken);

  try {
    switch (toolName) {
      case 'get_pr_details':
        const prDetails = await client.getPrDetails(
          toolInput.owner,
          toolInput.repo,
          toolInput.pr_number
        );
        return formatPrDetails(prDetails);

      case 'get_pr_files':
        const prFiles = await client.getPrFiles(
          toolInput.owner,
          toolInput.repo,
          toolInput.pr_number
        );
        return formatPrFiles(prFiles);

      case 'get_file_content':
        const content = await client.getFileContent(
          toolInput.owner,
          toolInput.repo,
          toolInput.path,
          toolInput.ref
        );
        // Add line numbers to the content for easier reference
        const lines = content.split('\n');
        const numbered = lines.map((line, i) => `${(i + 1).toString().padStart(4)} | ${line}`).join('\n');
        return `File: ${toolInput.path} (at ref ${toolInput.ref})\n\n${numbered}`;

      case 'get_pr_commits':
        const commits = await client.getPrCommits(
          toolInput.owner,
          toolInput.repo,
          toolInput.pr_number
        );
        return formatCommits(commits);

      case 'submit_review':
        const result = await client.postReview(
          toolInput.owner,
          toolInput.repo,
          toolInput.pr_number,
          toolInput.commit_id,
          toolInput.body,
          toolInput.event,
          toolInput.comments || []
        );
        const nComments = (toolInput.comments || []).length;
        return (
          'Review submitted successfully!\n' +
          `Review ID: ${result.id || 'N/A'}\n` +
          `Event: ${toolInput.event}\n` +
          `Comments posted: ${nComments}\n` +
          `URL: ${result.html_url || 'N/A'}`
        );

      default:
        return `ERROR: Unknown tool '${toolName}'. This should never happen.`;
    }
  } catch (error) {
    // Never let tool execution crash the agent loop
    return `ERROR executing ${toolName}: ${error.name}: ${error.message}`;
  }
};

/**
 * Formatting helpers (equivalent to Python formatting functions)
 */
const formatPrDetails = (pr) => {
  const lines = [
    `PR #${pr.number}: ${pr.title}`,
    `Author: ${pr.author}`,
    `State: ${pr.state}${pr.draft ? '  [DRAFT]' : ''}`,
    '',
    `Base branch: ${pr.base_branch}  ←  Head branch: ${pr.head_branch}`,
    `Head commit SHA: ${pr.head_sha}`,
    '',
    `Changes: ${pr.changed_files} files, +${pr.additions} -${pr.deletions} lines`,
    `Commits: ${pr.commits}`,
    '',
    `Description:\n${pr.description}`,
  ];

  if (pr.labels.length > 0) {
    lines.push(`\nLabels: ${pr.labels.join(', ')}`);
  }

  return lines.join('\n');
};

const formatPrFiles = (files) => {
  if (files.length === 0) {
    return 'No files changed in this PR.';
  }

  const lines = [`Changed Files (${files.length} total):\n`];

  for (const file of files) {
    lines.push(`📁 ${file.filename} (${file.status})`);
    lines.push(`   +${file.additions} -${file.deletions} lines\n`);

    if (file.patch && file.patch !== '(Binary file or no diff available)') {
      // Truncate very long diffs
      let patch = file.patch;
      if (patch.length > 3000) {
        const truncatedLines = patch.split('\n').slice(0, 100);
        patch = truncatedLines.join('\n') + '\n\n[... diff truncated after 100 lines ...]';
      }
      lines.push(`   Diff:\n${patch}\n`);
    } else {
      lines.push(`   ${file.patch}\n`);
    }
  }

  return lines.join('\n');
};

const formatCommits = (commits) => {
  if (commits.length === 0) {
    return 'No commits found in this PR.';
  }

  const lines = [`Commits (${commits.length} total):\n`];

  for (const commit of commits) {
    lines.push(`• ${commit.sha} ${commit.message} (${commit.author})`);
  }

  return lines.join('\n');
};