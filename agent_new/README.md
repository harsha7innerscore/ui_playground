# React Test Generator Agent

CLI tool that automatically generates unit tests for React components using Claude AI.

## What It Does

- Takes React component file + docs → generates complete unit test file
- Detects test framework, existing test patterns
- Uses Claude API to generate comprehensive test coverage
- Writes test file to specified output directory

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Set your Anthropic API key:
```bash
# Create .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env
```

## Usage

```bash
node dist/index.js \
  --module-path ./src/components/Button.tsx \
  --docs-path ./docs/Button.md \
  --output-path ./src/components/__tests__
```

### CLI Options

| Option | Required | Description |
|--------|----------|-------------|
| `--module-path` | ✅ | Path to React component file |
| `--docs-path` | ✅ | Path to component documentation |
| `--output-path` | ✅ | Directory where test file will be written |
| `--dry-run` | ❌ | Print generated test to stdout instead of writing |

### Examples

**Basic usage:**
```bash
node dist/index.js \
  --module-path ./src/Button.tsx \
  --docs-path ./Button.md \
  --output-path ./src/__tests__
```

**Preview without writing:**
```bash
node dist/index.js \
  --module-path ./src/Button.tsx \
  --docs-path ./Button.md \
  --output-path ./src/__tests__ \
  --dry-run
```

## What Gets Generated

The tool generates comprehensive unit tests covering:

- ✅ Renders without crashing (smoke test)
- ✅ All props (required/optional, boundary values)
- ✅ User interactions (clicks, inputs, forms)
- ✅ Conditional rendering branches
- ✅ Hook state changes and side effects
- ✅ Error states and loading states
- ✅ Edge cases from documentation
- ✅ Accessibility (roles, ARIA attributes)

## Auto-Detection

Tool automatically detects:
- **Test Framework**: Jest (assumed)
- **Testing Library**: Checks for `@testing-library/react` in package.json
- **File Extension**: Matches component extension (.tsx → .test.tsx)
- **Test Patterns**: Uses existing test files as style reference

## Requirements

- Node.js 18+
- Anthropic API key
- React project with documentation

## Development

**Run in dev mode:**
```bash
npm run dev -- --module-path ./example.tsx --docs-path ./example.md --output-path ./tests
```

**Build:**
```bash
npm run build
```

## Project Structure

```
react-test-gen-agent/
├── src/
│   ├── index.ts      # CLI entrypoint
│   ├── reader.ts     # File reader
│   ├── detector.ts   # Context detector
│   ├── agent.ts      # Claude API integration
│   └── writer.ts     # Test file writer
├── dist/             # Compiled JS output
├── package.json
├── tsconfig.json
└── .env              # API key
```