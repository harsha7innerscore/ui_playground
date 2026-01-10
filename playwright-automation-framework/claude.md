# Playwright Automation Framework - Local Configuration

This file contains project-specific configurations that override global workspace settings where conflicts arise.

## Technology Stack & Version Constraints

### Core Technologies
- **Language**: TypeScript (latest stable)
- **Test Framework**: Playwright Test (@playwright/test)
- **Node.js**: 18.20.4 (required for compatibility)
- **Package Manager**: npm
- **Runtime**: Node.js 18.x environment

### Key Dependencies
```json
{
  "@playwright/test": "latest",
  "typescript": "latest",
  "@types/node": "latest"
}
```

### Version Compatibility Requirements
- All dependencies MUST be compatible with Node.js 18.20.4
- Prefer LTS versions of all dependencies
- Document any version-specific requirements in this file

## Development Commands & Workflows

### Essential Commands
```bash
# Install dependencies and browsers
npm install
npx playwright install

# Test execution
npm test                    # Run all tests
npm run test:ui            # Interactive UI mode
npm run test:debug         # Debug mode with breakpoints
npm run test:headed        # Run with browser heads visible
npm run test:report        # View test reports
npm run test:trace         # View execution traces

# Development utilities
npx playwright codegen     # Generate test code
npx playwright show-report # Open HTML report
npx playwright show-trace  # View specific trace
```

### Git Workflow Integration
- After completing each development task, create atomic git commits
- Follow conventional commit format where appropriate
- Test execution should be performed before committing changes
- Use descriptive commit messages that reference test scope

## Project-Specific Coding Standards

### File Naming Conventions
- **Test Files**: `*.spec.ts` (e.g., `login.spec.ts`)
- **Page Objects**: `*Page.ts` (e.g., `LoginPage.ts`)
- **Fixtures**: `*.fixture.ts` (e.g., `auth.fixture.ts`)
- **Utilities**: `*.util.ts` or `*.helper.ts`
- **Test Data**: `*.data.ts` or JSON files in `test-data/`

### Code Organization Patterns
```
tests/
  ├── smoke/              # Critical path tests
  ├── regression/         # Full feature tests
  └── feature/            # Feature-specific tests
    ├── auth/
    ├── dashboard/
    └── checkout/

pages/
  ├── BasePage.ts         # Common page functionality
  ├── LoginPage.ts        # Authentication pages
  └── components/         # Reusable UI components

fixtures/
  ├── auth.fixture.ts     # Authentication setup
  └── testData.fixture.ts # Test data management

utils/
  ├── api.helper.ts       # API interaction utilities
  ├── wait.helper.ts      # Custom wait strategies
  └── data.generator.ts   # Dynamic test data
```

### Selector Strategy (Override Global Patterns)
1. **Primary**: `data-testid` attributes
2. **Secondary**: ARIA roles and labels
3. **Fallback**: Stable CSS selectors
4. **Avoid**: XPath, text-based selectors

```typescript
// Preferred selector patterns
page.getByTestId('submit-button')
page.getByRole('button', { name: 'Submit' })
page.locator('[data-testid="user-menu"]')

// Avoid
page.locator('xpath=//button[contains(text(), "Submit")]')
page.locator('button:nth-child(3)')
```

## Architecture Decisions

### Page Object Model Implementation
```typescript
// BasePage.ts - Common functionality
export class BasePage {
  constructor(protected page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}

// Feature pages extend BasePage
export class LoginPage extends BasePage {
  private readonly emailInput = this.page.getByTestId('email-input');
  private readonly passwordInput = this.page.getByTestId('password-input');
  private readonly submitButton = this.page.getByTestId('login-button');

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### Test Structure Pattern
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup logic for each test
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const credentials = { email: 'test@example.com', password: 'password' };

    // Act
    await loginPage.login(credentials.email, credentials.password);

    // Assert
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Environment Configuration Strategy
- Use `.env` files for local development
- CI/CD environments use environment variables
- Never commit sensitive credentials
- Provide `.env.example` template

## Integration Requirements

### CI/CD Pipeline Configuration
- **GitHub Actions**: `.github/workflows/playwright.yml`
- **Artifact Retention**: 14 days for test reports
- **Browser Installation**: Automated in pipeline
- **Parallel Execution**: Limit to 2 workers in CI

### Reporting Configuration
```typescript
// playwright.config.ts reporters
reporter: [
  ['html', { outputFolder: 'reports/html-report', open: 'never' }],
  ['junit', { outputFile: 'reports/results.xml' }],
  ['list'] // Console output for CI
]
```

## Development Best Practices (Project Override)

### Test Independence
- Each test must be completely isolated
- Use fixtures for setup and teardown
- Avoid test dependencies and shared state
- Clear browser state between test files

### Performance Considerations
- Minimize UI-based setup (prefer API)
- Use efficient selectors
- Implement smart waiting strategies
- Group related tests in describe blocks

### Error Handling Patterns
```typescript
// Robust error handling in page objects
async clickWithRetry(locator: Locator, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.click();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await this.page.waitForTimeout(1000);
    }
  }
}
```

## Maintenance & Quality Standards

### Code Review Requirements
- All test additions require peer review
- Page object changes require architecture review
- Configuration changes require team approval

### Test Maintenance Schedule
- **Weekly**: Review flaky test reports
- **Monthly**: Update dependencies and browsers
- **Quarterly**: Architecture and pattern review

### Quality Gates
- Test suite must maintain >95% stability
- New tests must include error scenarios
- Page objects must follow established patterns
- All tests must have clear, descriptive names

## Local Development Setup

### Prerequisites Checklist
- [ ] Node.js 18.20.4 installed
- [ ] npm package manager available
- [ ] Git configured for the project
- [ ] IDE with TypeScript support

### First-Time Setup
1. Clone repository and navigate to project
2. Run `npm install` to install dependencies
3. Run `npx playwright install` to setup browsers
4. Copy `.env.example` to `.env` and configure
5. Run `npm test` to verify setup
6. Run `npm run test:ui` to explore interactive mode

## Troubleshooting Common Issues

### Browser Installation Issues
```bash
# Force reinstall browsers
npx playwright install --force

# Install specific browser
npx playwright install chromium
```

### TypeScript Configuration Issues
- Ensure `@types/node` is installed
- Check `tsconfig.json` includes test directories
- Verify Node.js version compatibility

### Test Flakiness Debugging
1. Run test multiple times: `npx playwright test --repeat-each=10`
2. Enable debug mode: `npx playwright test --debug`
3. Capture trace: `npx playwright test --trace=on`
4. Review video recordings in `test-results/`

---

*This local configuration file takes precedence over global workspace settings for the Playwright automation framework project.*