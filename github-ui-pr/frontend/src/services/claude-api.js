/**
 * Claude API Service for Frontend
 * Converted from Python review_agent.py to run in browser
 */

const ANTHROPIC_API_BASE = '/anthropic-api';
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-sonnet-4-5';

/**
 * System prompt for Claude PR reviews
 * Identical to Python version with caching support
 */
const SYSTEM_PROMPT = `You are an expert senior software engineer performing a thorough GitHub Pull Request review. Your goal is to provide the most helpful, constructive, and technically accurate review possible.

## Your Review Process

Follow these steps for every PR review:

1. **Understand the PR**: Call \`get_pr_details\` first to understand the title, description, base/head branches, and scope of changes.

2. **Read Commits (optional)**: Call \`get_pr_commits\` if commit messages would help understand the intent behind changes.

3. **Analyze Changed Files**: Call \`get_pr_files\` to see all modified files with their diffs. Read each diff carefully.

4. **Get Context When Needed**: Call \`get_file_content\` for files where you need to see the full context — e.g., to understand what a class does, what other methods exist, or what imports are present.

5. **Prepare Your Review**: Based on your analysis, prepare:
   - An overall summary and verdict
   - Specific line-level comments for issues found

6. **Submit the Review**: Call \`submit_review\` with your verdict and all comments.

## What to Review

### Must Check (file these as \`REQUEST_CHANGES\` if found)
- **Bugs**: Logic errors, off-by-one errors, null pointer issues, race conditions
- **Security vulnerabilities**: SQL injection, XSS, hardcoded secrets, insecure authentication
- **Data integrity issues**: Missing validation, incorrect data transformations, lost data
- **Breaking changes**: API changes, database migrations without backward compatibility

### Should Check (file as comments, may warrant \`REQUEST_CHANGES\`)
- **Error handling**: Missing try/catch, unhandled promise rejections, swallowed exceptions
- **Performance**: N+1 queries, unnecessary loops, missing indexes, large data in memory
- **Resource leaks**: Unclosed file handles, database connections, network connections
- **Concurrency**: Thread safety, missing locks, shared mutable state

### Nice to Check (file as \`COMMENT\` suggestions)
- **Code clarity**: Confusing variable names, missing comments on complex logic
- **Duplication**: Code that could be extracted into a reusable function
- **Test coverage**: Missing tests for new functionality or edge cases
- **Documentation**: Missing docstrings, outdated comments, unclear APIs

## Review Comment Format

For each issue found, your comment should explain:
1. **What**: Clearly state the problem
2. **Why**: Explain why it matters (bug? security? performance? maintainability?)
3. **How to fix**: Provide a concrete suggestion or code snippet

Example good comment:
\`\`\`
This function doesn't handle the case where \`user_id\` is None, which can happen
when the session expires. This will cause an \`AttributeError\` on line 45.

**Fix:**
\`\`\`python
if user_id is None:
    raise ValueError("user_id is required")
\`\`\`
Or add a guard earlier: \`user = get_user(user_id) if user_id else None\`
\`\`\`

## Verdict Guidelines

- **APPROVE**: Code is correct, safe, and ready to merge. Minor suggestions OK.
- **REQUEST_CHANGES**: Found bugs, security issues, or significant correctness problems.
- **COMMENT**: Good code overall but has non-blocking suggestions, questions, or observations.

## Tone

Be constructive and respectful. The goal is to help the author write better code, not to criticize them. Acknowledge good patterns when you see them. Ask questions rather than making assumptions about intent. Suggest improvements rather than just pointing out problems.`;

/**
 * Call Claude API with messages and tools
 */
export const callClaude = async (messages, tools = []) => {
  const response = await fetch(`${ANTHROPIC_API_BASE}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'cache-control-2024-11-25,token-counting-2024-11-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" }
        }
      ],
      tools,
      messages
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Claude API error: ${response.status}`);
  }

  return await response.json();
};

/**
 * Run PR review agent with agentic loop
 * Converted from Python review_pr function
 */
export const reviewPR = async (owner, repo, prNumber, githubToken, onProgress = () => {}) => {
  console.log(`🤖 Starting PR review for ${owner}/${repo}#${prNumber}`);

  // Import GitHub tools
  const { createGitHubTools, executeGitHubTool } = await import('./github-api.js');
  const tools = createGitHubTools(githubToken);

  // Initial messages
  const messages = [
    {
      role: "user",
      content: `Please review this pull request:

Repository: ${owner}/${repo}
PR Number: ${prNumber}

Provide a thorough code review. Start by getting the PR details and changed files, then post your review with specific line comments for any issues you find.`
    }
  ];

  let totalToolCalls = 0;
  const maxIterations = 20;
  let iteration = 0;

  onProgress({ type: 'start', iteration: 0, totalToolCalls: 0 });

  while (iteration < maxIterations) {
    iteration++;
    console.log(`⚡ Agent iteration ${iteration}/${maxIterations}`);

    onProgress({ type: 'iteration', iteration, totalToolCalls });

    try {
      // Call Claude
      const response = await callClaude(messages, tools);

      // Log token usage
      const usage = response.usage;
      const cacheRead = usage.cache_read_input_tokens || 0;
      const cacheWrite = usage.cache_creation_input_tokens || 0;

      console.log(
        `📊 Tokens: ${usage.input_tokens} input, ${usage.output_tokens} output` +
        (cacheRead ? `, ${cacheRead} cache_read` : '') +
        (cacheWrite ? `, ${cacheWrite} cache_write` : '')
      );
      console.log(`🛑 Stop reason: ${response.stop_reason}`);

      // Handle end_turn: Claude is done
      if (response.stop_reason === 'end_turn') {
        const finalText = response.content.find(block => block.text)?.text || '';

        console.log(`✅ Review complete! Used ${totalToolCalls} tool calls.`);
        if (finalText) {
          console.log(`\nClaude's final message:\n${finalText}`);
        }

        onProgress({
          type: 'complete',
          iteration,
          totalToolCalls,
          finalMessage: finalText
        });

        return {
          success: true,
          totalToolCalls,
          finalMessage: finalText,
        };
      }

      // Handle tool_use: Claude wants to call a tool
      if (response.stop_reason === 'tool_use') {
        // Add Claude's response to message history
        messages.push({
          role: 'assistant',
          content: response.content
        });

        // Process each tool call
        const toolResults = [];

        for (const block of response.content) {
          if (block.type === 'text' && block.text?.trim()) {
            console.log(`💬 Claude: ${block.text.slice(0, 200)}${block.text.length > 200 ? '...' : ''}`);
            onProgress({
              type: 'message',
              iteration,
              totalToolCalls,
              message: block.text.slice(0, 200)
            });
          }

          if (block.type !== 'tool_use') {
            continue;
          }

          // Execute tool
          const toolName = block.name;
          const toolInput = block.input;
          const toolUseId = block.id;

          totalToolCalls++;
          console.log(`🔧 Tool call: ${toolName}`);

          // Log key parameters
          ['owner', 'repo', 'pr_number', 'path', 'event'].forEach(key => {
            if (toolInput[key]) {
              console.log(`   ${key}: ${toolInput[key]}`);
            }
          });

          onProgress({
            type: 'tool_call',
            iteration,
            totalToolCalls,
            toolName,
            toolInput: Object.fromEntries(
              Object.entries(toolInput).filter(([k]) =>
                ['owner', 'repo', 'pr_number', 'path', 'event'].includes(k)
              )
            )
          });

          // Execute the tool
          const result = await executeGitHubTool(toolName, toolInput, githubToken);

          // Preview result for logging
          const resultPreview = result.slice(0, 200).replace(/\n/g, ' ');
          console.log(`   Result: ${resultPreview}${result.length > 200 ? '...' : ''}`);

          // Add tool result
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUseId,
            content: result,
          });
        }

        // Add all tool results as user message
        messages.push({
          role: 'user',
          content: toolResults
        });

        // Continue loop
        continue;
      }

      // Unexpected stop reason
      console.warn(`⚠️ Unexpected stop_reason: ${response.stop_reason}`);
      break;

    } catch (error) {
      console.error(`❌ Error in iteration ${iteration}:`, error);
      onProgress({
        type: 'error',
        iteration,
        totalToolCalls,
        error: error.message
      });

      return {
        success: false,
        totalToolCalls,
        finalMessage: '',
        error: error.message
      };
    }
  }

  // Hit max iterations
  const errorMsg = `Hit maximum iteration limit (${maxIterations}). Review may be incomplete.`;
  onProgress({
    type: 'error',
    iteration,
    totalToolCalls,
    error: errorMsg
  });

  return {
    success: false,
    totalToolCalls,
    finalMessage: '',
    error: errorMsg,
  };
};