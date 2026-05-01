export interface AgentInput {
  moduleContent: string;
  docsContent: string;
  testingLibrary: boolean;
  exampleTest: string | null;
  moduleName: string;
}

export async function generateTests(input: AgentInput): Promise<string> {
  const prompt = buildPrompt(input);

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
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  let testCode = data.content[0].text;

  // Strip any accidental markdown fences
  testCode = testCode.replace(/^```[\w]*\n/gm, '').replace(/\n```$/gm, '');

  return testCode;
}

function buildPrompt(input: AgentInput): string {
  const { moduleContent, docsContent, testingLibrary, exampleTest, moduleName } = input;

  let prompt = `You are an expert React testing engineer. Your job is to generate a complete,
production-quality unit test file for the React module below.

---

## React Module: ${moduleName}

${moduleContent}

---

## Documentation for ${moduleName}

${docsContent}

---

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

Generate a complete unit test file. Cover ALL of the following:

1. Renders without crashing (smoke test)
2. Every prop — required and optional — including boundary values and missing props
3. All user interactions visible in the code (clicks, inputs, form submissions, etc.)
4. All conditional rendering branches (if/else, ternaries, short-circuit rendering)
5. All hooks — verify state changes and side effects where possible
6. Error states and loading states if present
7. Edge cases called out in the documentation
8. Accessibility: roles, aria attributes, keyboard navigation if applicable

Rules:
- Output ONLY the test file content, no explanation, no markdown fences
- Use the same import style and describe/it nesting as the example test if provided
- Every test must have a clear, descriptive name
- Use 'screen' queries from @testing-library/react when available
- Prefer userEvent over fireEvent for interactions
- Do not mock things that do not need to be mocked
- If the component makes API calls, mock them with jest.fn() and jest.mock()`;

  return prompt;
}