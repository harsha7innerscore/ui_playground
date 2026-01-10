# Self-Study UI Testing Framework

A focused UI testing framework built with Playwright and TypeScript, designed for testing self-study learning features and educational workflows.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.20.4 or higher (LTS recommended)
- **npm**: Latest version (comes with Node.js)
- **Git**: For version control

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone [your-repository-url]
   cd playwright-automation-framework
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your application URLs and credentials
   ```

5. **Verify installation**:
   ```bash
   npm test -- --headed
   ```

## 📁 Project Structure

```
playwright-automation-framework/
├── tests/                  # Self-study test specifications
│   ├── smoke/             # Core self-study workflow tests
│   ├── regression/        # Comprehensive self-study feature tests
│   └── feature/           # Specific self-study functionality tests
├── pages/                 # Page Object Models for self-study UI
│   ├── BasePage.ts        # Common page functionality
│   └── components/        # Reusable self-study UI components
├── fixtures/              # Self-study test fixtures and authentication
├── utils/                 # Helper functions and self-study data generators
├── test-data/            # Self-study test data (sessions, notes, goals)
├── reports/              # Test execution reports
├── test-results/         # Test artifacts (screenshots, videos)
├── playwright.config.ts  # Playwright configuration
├── tsconfig.json         # TypeScript configuration
└── .env.example          # Environment variables template
```

## 🎯 Usage

### Running Tests

#### Local Development
```bash
# Run all tests
npm test

# Run tests with UI (interactive mode)
npm run test:ui

# Run specific test file
npx playwright test tests/login.spec.ts

# Run tests with browser heads visible
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

#### Filtering Tests
```bash
# Run by test name pattern
npx playwright test --grep "login"

# Run specific project (browser)
npx playwright test --project=chromium

# Run tests in specific directory
npx playwright test tests/smoke/
```

### Viewing Results

```bash
# Open HTML report
npm run test:report

# View specific trace file
npx playwright show-trace test-results/[test-name]/trace.zip
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Self-study application URL
BASE_URL=http://localhost:3000

# Test user credentials for accessing self-study features
TEST_USER_EMAIL=user@example.com
TEST_USER_PASSWORD=password123
```

### Browser Configuration

The framework is configured to run tests across multiple browsers:
- **Chromium** (Default)
- **Firefox**
- **WebKit (Safari)**
- **Mobile Chrome**
- **Mobile Safari**
- **Microsoft Edge**
- **Google Chrome**

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { StudySessionPage } from '../pages/StudySessionPage';
import { SelfStudyDataGenerator } from '../utils/data.generator';

test.describe('Self-Study Session Management', () => {
  test('should create a new study session', async ({ page }) => {
    // Generate test data for study session
    const sessionData = SelfStudyDataGenerator.studySession({
      title: 'JavaScript Fundamentals',
      subject: 'Programming',
      duration: 60
    });

    // Navigate to study sessions
    await page.goto('/study-sessions');

    // Create page object
    const studySessionPage = new StudySessionPage(page);

    // Create new session
    await studySessionPage.createSession(sessionData);

    // Verify session creation
    await expect(page.getByTestId('session-title')).toContainText('JavaScript Fundamentals');
  });
});
```

### Page Object Example

```typescript
// pages/StudySessionPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { SelfStudySessionData } from '../utils/data.generator';

export class StudySessionPage extends BasePage {
  private readonly createSessionButton: Locator;
  private readonly titleInput: Locator;
  private readonly subjectSelect: Locator;
  private readonly durationInput: Locator;
  private readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createSessionButton = page.getByTestId('create-session-btn');
    this.titleInput = page.getByTestId('session-title-input');
    this.subjectSelect = page.getByTestId('session-subject-select');
    this.durationInput = page.getByTestId('session-duration-input');
    this.saveButton = page.getByTestId('save-session-btn');
  }

  async createSession(sessionData: SelfStudySessionData): Promise<void> {
    await this.createSessionButton.click();
    await this.titleInput.fill(sessionData.title);
    await this.subjectSelect.selectOption(sessionData.subject);
    await this.durationInput.fill(sessionData.duration.toString());
    await this.saveButton.click();
  }

  async isSessionListVisible(): Promise<boolean> {
    return await this.createSessionButton.isVisible();
  }
}
```

### Best Practices

1. **Use Page Objects**: Encapsulate UI logic in page objects
2. **Prefer Test IDs**: Use `data-testid` attributes for reliable selectors
3. **Isolate Tests**: Each test should be independent and idempotent
4. **Descriptive Names**: Use clear, descriptive test and variable names
5. **Async/Await**: Always use async/await for Playwright operations


## 🐛 Debugging

### Debug Mode

Run tests in debug mode to step through execution:

```bash
# Debug specific test
npx playwright test tests/login.spec.ts --debug

# Debug with UI
npx playwright test --ui
```

### Trace Viewer

View detailed execution traces:

```bash
# Record trace
npx playwright test --trace=on

# View trace
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots of the failure state
- Video recordings of the test execution
- Browser console logs

Find these in the `test-results/` directory.

## 🔄 Maintenance

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update Playwright
npm install @playwright/test@latest
npx playwright install
```

### Handling Flaky Tests

1. **Identify**: Monitor CI execution history
2. **Investigate**: Use trace viewer and debug mode
3. **Fix**: Address root cause (timing issues, selectors, etc.)
4. **Monitor**: Verify stability improvement

## 📊 Reporting

### HTML Report

Rich, interactive HTML reports are generated automatically:

- Test execution summary
- Screenshots and videos of failures
- Execution traces for debugging
- Browser console logs

Access via: `npm run test:report`

### Console Output

Test results are also displayed in the console with detailed information about:
- Test execution summary
- Failed test details
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

#### Browser Installation
```bash
# Force reinstall all browsers
npx playwright install --force

# Install specific browser
npx playwright install chromium
```

#### Permission Errors
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm

# Or use npx instead of global install
npx playwright install
```

#### TypeScript Errors
- Ensure `@types/node` is installed
- Check `tsconfig.json` includes all test directories
- Verify Node.js version compatibility

#### Test Timeouts
- Increase timeout in `playwright.config.ts`
- Check network connectivity to test application
- Verify application is running and accessible

### Getting Help

1. **Check Logs**: Review console output and test artifacts
2. **Enable Debug**: Use `--debug` flag for step-by-step execution
3. **View Traces**: Use trace viewer for detailed execution analysis
4. **Documentation**: Reference [Playwright documentation](https://playwright.dev/)

## 🤝 Contributing

### Code Style

- Use TypeScript for all test code
- Follow established page object patterns
- Include JSDoc comments for complex functions
- Use meaningful variable and function names

### Pull Request Process

1. Create feature branch from `develop`
2. Write tests following project conventions
3. Ensure all tests pass locally
4. Update documentation if needed
5. Submit pull request with clear description

### Review Checklist

- [ ] Tests are independent and idempotent
- [ ] Page objects follow established patterns
- [ ] Selectors use `data-testid` or stable attributes
- [ ] Error handling is implemented where needed
- [ ] Documentation is updated if necessary

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Page Object Model Guide](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

**Project Specification**: See `spec.md` for detailed project requirements and architecture decisions.

**Local Configuration**: See `claude.md` for project-specific development guidelines and coding standards.