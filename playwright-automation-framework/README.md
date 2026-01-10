# Playwright Automation Framework

A comprehensive end-to-end testing framework built with Playwright and TypeScript, designed for reliability, scalability, and seamless CI/CD integration.

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
├── tests/                  # Test specifications
│   ├── smoke/             # Critical path tests
│   ├── regression/        # Comprehensive test suite
│   └── feature/           # Feature-specific tests
├── pages/                 # Page Object Models
│   ├── BasePage.ts        # Common page functionality
│   └── components/        # Reusable UI components
├── fixtures/              # Test fixtures and setup
├── utils/                 # Helper functions and utilities
├── test-data/            # Static test data and mocks
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
# Application URLs
BASE_URL=http://localhost:3000
STAGING_URL=https://staging.yourapp.com
PRODUCTION_URL=https://yourapp.com

# Test Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123

# API Configuration (if needed)
API_BASE_URL=https://api.yourapp.com
API_KEY=your-api-key
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
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Functionality', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Create page object
    const loginPage = new LoginPage(page);

    // Perform login
    await loginPage.login('test@example.com', 'password123');

    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Page Object Example

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-button');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async isLoginFormVisible(): Promise<boolean> {
    return await this.emailInput.isVisible();
  }
}
```

### Best Practices

1. **Use Page Objects**: Encapsulate UI logic in page objects
2. **Prefer Test IDs**: Use `data-testid` attributes for reliable selectors
3. **Isolate Tests**: Each test should be independent and idempotent
4. **Descriptive Names**: Use clear, descriptive test and variable names
5. **Async/Await**: Always use async/await for Playwright operations

## 🏗️ CI/CD Integration

### GitHub Actions

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18.20.4'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Run Playwright tests
      run: npm test
      env:
        BASE_URL: ${{ secrets.BASE_URL }}
        TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
        TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: reports/
        retention-days: 14
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
image: node:18.20.4

stages:
  - test

playwright-tests:
  stage: test
  before_script:
    - npm ci
    - npx playwright install --with-deps
  script:
    - npm test
  artifacts:
    when: always
    paths:
      - reports/
    expire_in: 2 weeks
  only:
    - main
    - develop
    - merge_requests
```

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

### JUnit XML

For CI/CD integration, JUnit XML reports are generated at:
`reports/results.xml`

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