export interface AgentInput {
  moduleContent: string;
  docsContent: string;
  errorContent?: string;
  testingLibrary: boolean;
  exampleTest: string | null;
  moduleName: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export async function generateTests(input: AgentInput): Promise<GeneratedFile[]> {
  const prompt = buildPrompt(input);

  console.log("Generated prompt for Claude:", prompt);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 8096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Claude API error: ${response.status} ${response.statusText} ${await response.text()}`,
    );
  }

  const data = (await response.json()) as any;
  let testCode = data.content[0].text;

  // Strip any accidental markdown fences
  testCode = testCode.replace(/^```[\w]*\n/gm, "").replace(/\n```$/gm, "");

  return parseMultiFileResponse(testCode);
}

function parseMultiFileResponse(response: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const filePattern = /===\s*FILENAME:\s*([^\s]+)\s*===\n([\s\S]*?)(?=\n===\s*FILENAME:|$)/g;

  let match;
  while ((match = filePattern.exec(response)) !== null) {
    const [, path, content] = match;
    files.push({
      path: path.trim(),
      content: content.trim()
    });
  }

  // If no files found with markers, treat as single file
  if (files.length === 0) {
    files.push({
      path: 'default.test.tsx',
      content: response
    });
  }

  return files;
}

function buildPrompt(input: AgentInput): string {
  const {
    moduleContent,
    docsContent,
    errorContent,
    testingLibrary,
    exampleTest,
    moduleName,
  } = input;

  let prompt = `You are an expert React testing engineer. Your job is to generate a complete,
production-quality test suite for the React module and all related files mentioned in the documentation.

---

## React Module: ${moduleName}

${moduleContent}

---

## Documentation for ${moduleName}

${docsContent}

---
${errorContent ? `
## Common Issues & Solutions

${errorContent}

---
` : ''}
## Test Framework & Environment

- Framework: Jest (always)
- @testing-library/react available: ${testingLibrary}`;

  if (exampleTest) {
    prompt += `

## Existing Test File (use this as a style reference — match its imports,
describe/it structure, and conventions exactly):

${exampleTest}`;
  }

  prompt += `

---

## Instructions

Generate a complete test suite based on the documentation. Include ALL files mentioned in:
- Component tree (test files for each component)
- Mocking guide (mock implementations)
- Test utilities (renderWithProviders, helpers)

Cover ALL of the following for each component:
1. Renders without crashing (smoke test)
2. Every prop — required and optional — including boundary values and missing props
3. All user interactions visible in the code (clicks, inputs, form submissions, etc.)
4. All conditional rendering branches (if/else, ternaries, short-circuit rendering)
5. All hooks — verify state changes and side effects where possible
6. Error states and loading states if present
7. Edge cases called out in the documentation
8. Accessibility: roles, aria attributes, keyboard navigation if applicable

Output Format:
\`\`\`
=== FILENAME: path/to/file.test.tsx ===
[file content]

=== FILENAME: __mocks__/library.tsx ===
[mock content]

=== FILENAME: tests/utils/helpers.tsx ===
[utility content]
\`\`\`

Rules:
- Generate ALL files mentioned in component tree and mocking sections
- Use exact file paths from documentation
- Use same import style and describe/it nesting as example test if provided
- Every test must have a clear, descriptive name
- Use 'screen' queries from @testing-library/react when available
- Prefer userEvent over fireEvent for interactions
- Implement ALL mocks specified in mocking guide section
- Do not mock things that do not need to be mocked unless specified in docs
- Avoid common issues mentioned in the Common Issues & Solutions section${errorContent ? '\n- Apply fixes and patterns from the error documentation' : ''}`;

  return prompt;
}
