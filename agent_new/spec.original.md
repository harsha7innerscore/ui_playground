# React Unit Test Generator Agent — Specification

**Version**: 1.0  
**Target Builder**: LLM (Claude) or human developer  
**Stack**: Node.js + TypeScript + Anthropic Claude API

---

## 1. Purpose

Build a CLI agent that accepts a React module file, its documentation, and a target output directory, then automatically generates comprehensive unit test files and writes them into the repository. The agent adapts to the project's existing test framework and code conventions.

---

## 2. User Workflow

```
$ node dist/index.js \
    --module-path ./src/components/Button.tsx \
    --docs-path ./docs/Button.md \
    --output-path ./src/components/__tests__
```

The agent then:

1. Reads the module and documentation files
2. Scans the repo for test framework and existing test conventions
3. Sends all context to Claude
4. Writes the generated test file to the output path
5. Prints a summary

---

## 3. Project Structure

```
react-test-gen-agent/
├── src/
│   ├── index.ts           # CLI entrypoint — parses args, orchestrates steps
│   ├── reader.ts          # Reads module file and docs file from disk
│   ├── detector.ts        # Detects test framework and existing test style
│   ├── agent.ts           # Builds prompt and calls Claude API
│   └── writer.ts          # Derives filename and writes test file to disk
├── package.json
├── tsconfig.json
└── .env                   # Contains ANTHROPIC_API_KEY
```

---

## 4. File-by-File Specification

---

### 4.1 `src/index.ts` — CLI Entrypoint

**Responsibility**: Parse CLI arguments, call each module in sequence, handle errors.

**CLI Arguments**:

| Flag            | Required | Description                                                            |
| --------------- | -------- | ---------------------------------------------------------------------- |
| `--module-path` | ✅       | Absolute or relative path to the React component/module file           |
| `--docs-path`   | ✅       | Absolute or relative path to the documentation file                    |
| `--output-path` | ✅       | Directory where the test file will be written                          |
| `--dry-run`     | ❌       | If present, prints generated test to stdout instead of writing to disk |

**Logic**:

```
1. Parse args from process.argv (use 'commander' package)
2. Resolve all paths to absolute using path.resolve()
3. Validate that --module-path and --docs-path exist on disk; exit with error if not
4. Validate that --output-path directory exists; create it if it does not (fs.mkdirSync recursive)
5. Call reader.readFiles(modulePath, docsPath) → { moduleContent, docsContent }
6. Call detector.detectContext(modulePath) → { framework, exampleTest }
7. Call agent.generateTests({ moduleContent, docsContent, framework, exampleTest }) → testCode
8. If --dry-run: print testCode to stdout and exit
9. Else: call writer.writeTestFile(modulePath, outputPath, testCode)
10. Print success summary
```

**Error Handling**:

- Missing required args → print usage and exit with code 1
- File not found → print clear message with the path that failed and exit with code 1
- Claude API error → print the API error message and exit with code 1

---

### 4.2 `src/reader.ts` — File Reader

**Responsibility**: Read source files from disk and return their contents as strings.

**Exports**:

```typescript
export async function readFiles(
  modulePath: string,
  docsPath: string,
): Promise<{ moduleContent: string; docsContent: string }>;
```

**Logic**:

```
1. Read modulePath with fs.promises.readFile(modulePath, 'utf-8') → moduleContent
2. Read docsPath with fs.promises.readFile(docsPath, 'utf-8') → docsContent
3. Return { moduleContent, docsContent }
```

**Notes**:

- Do not parse or transform the content — return raw file text
- Throw a descriptive error if either file cannot be read (caller handles it)
- Support any file extension: `.tsx`, `.ts`, `.jsx`, `.js`, `.md`, `.mdx`, `.txt`

---

### 4.3 `src/detector.ts` — Context Detector

**Responsibility**: Scan the repository to determine the test framework in use and optionally find an existing test file to use as a style reference.

**Exports**:

```typescript
export interface DetectedContext {
  testingLibrary: boolean; // true if @testing-library/react is present
  exampleTest: string | null; // content of an existing test file, or null
  fileExtension: string; // '.test.tsx' | '.test.ts' | '.test.jsx' | '.test.js'
}

export async function detectContext(
  modulePath: string,
): Promise<DetectedContext>;
```

**Logic**:

```
1. Walk up the directory tree from modulePath until package.json is found (max 5 levels)
2. Parse package.json — check devDependencies and dependencies for:
   - '@testing-library/react' → testingLibrary = true
   - Note: framework is always Jest — no detection needed
3. Determine fileExtension:
   - If modulePath ends in .tsx → '.test.tsx'
   - If modulePath ends in .ts  → '.test.ts'
   - If modulePath ends in .jsx → '.test.jsx'
   - If modulePath ends in .js  → '.test.js'
4. Find an existing test file for reference:
   - Search siblings of modulePath for files matching *.test.* or *.spec.*
   - Also search an adjacent __tests__ directory
   - Pick the first match, read its content → exampleTest
   - If none found → exampleTest = null
5. Return DetectedContext
```

---

### 4.4 `src/agent.ts` — Claude Agent

**Responsibility**: Build the prompt, call the Anthropic Claude API, and return the generated test code as a string.

**Exports**:

```typescript
export interface AgentInput {
  moduleContent: string;
  docsContent: string;
  testingLibrary: boolean;
  exampleTest: string | null;
  moduleName: string; // e.g. 'Button' — derived from filename
}

export async function generateTests(input: AgentInput): Promise<string>;
```

**Claude API Call**:

```typescript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-5",
    max_tokens: 8096,
    messages: [{ role: "user", content: buildPrompt(input) }],
  }),
});
```

**Prompt Template** (`buildPrompt`):

```
You are an expert React testing engineer. Your job is to generate a complete,
production-quality unit test file for the React module below.

---

## React Module: {moduleName}

{moduleContent}

---

## Documentation for {moduleName}

{docsContent}

---

## Test Framework & Environment

- Framework: Jest (always)
- @testing-library/react available: {testingLibrary}

{if exampleTest}
## Existing Test File (use this as a style reference — match its imports,
describe/it structure, and conventions exactly):

{exampleTest}
{/if}

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
- If the component makes API calls, mock them with jest.fn() and jest.mock()
```

**Response Parsing**:

````
1. Await the API response
2. Extract text: response.content[0].text
3. Strip any accidental markdown fences (```tsx ... ```) if present
4. Return the clean string
````

---

### 4.5 `src/writer.ts` — Test File Writer

**Responsibility**: Derive the correct test filename and write the generated test code to disk.

**Exports**:

```typescript
export async function writeTestFile(
  modulePath: string,
  outputPath: string,
  testCode: string,
  fileExtension: string,
): Promise<string>; // returns the full path of the written file
```

**Logic**:

```
1. Extract the base filename from modulePath
   e.g. '/src/components/Button.tsx' → 'Button'
2. Construct test filename: '{basename}{fileExtension}'
   e.g. 'Button.test.tsx'
3. Construct full output file path: path.join(outputPath, testFilename)
4. Write testCode to that path using fs.promises.writeFile(fullPath, testCode, 'utf-8')
5. Return fullPath
```

---

## 5. package.json

```json
{
  "name": "react-test-gen-agent",
  "version": "1.0.0",
  "description": "CLI agent that generates unit tests for React modules using Claude",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 6. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 7. Environment Variables

```
# .env
ANTHROPIC_API_KEY=sk-ant-...
```

The agent reads this at startup using `dotenv`. If the key is missing, print a clear error and exit.

---

## 8. End-to-End Flow Diagram

```
index.ts
  │
  ├── parse & validate CLI args
  │
  ├── reader.readFiles()
  │     ├── fs.readFile(modulePath)   → moduleContent
  │     └── fs.readFile(docsPath)     → docsContent
  │
  ├── detector.detectContext()
  │     ├── find + parse package.json → framework, testingLibrary
  │     ├── find sibling test file    → exampleTest
  │     └── infer fileExtension
  │
  ├── agent.generateTests()
  │     ├── buildPrompt(all context)
  │     ├── POST /v1/messages (Claude API)
  │     └── parse + return testCode
  │
  └── writer.writeTestFile()
        ├── derive filename from modulePath
        ├── fs.writeFile(outputPath/filename, testCode)
        └── return written file path
```

---

## 9. Example Output

Given input `Button.tsx` + `Button.md`, the agent writes:

```
./src/components/__tests__/Button.test.tsx
```

Containing tests for:

- Renders with default props
- Renders with all prop variants (`variant`, `size`, `disabled`, `loading`)
- Click handler fires on click
- Click handler does not fire when disabled
- Shows spinner when `loading={true}`
- Matches accessibility role `button`
- Forwards `ref` correctly (if applicable)

---

## 10. Out of Scope (v1)

- Multi-file / multi-component generation in one run
- Interactive prompting (all inputs via flags only)
- Running the generated tests automatically
- Test fix/retry loop if generated tests fail
- GUI or web interface

These can be added in v2 after the core loop is validated.
