# Self-Study UI Testing Framework

A comprehensive UI testing framework built with Playwright and TypeScript, designed specifically for testing SchoolAI's self-study educational platform. Features 161+ test cases covering subject selection, accordion navigation, task management, and revision flows across multiple devices.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.20.4 or higher (LTS recommended)
- **npm**: Latest version (comes with Node.js)
- **Git**: For version control

### Installation

1. **Navigate to the framework directory**:
   ```bash
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
   # Edit .env with your SchoolAI application credentials
   ```

5. **Verify installation**:
   ```bash
   npm run test:smoke
   ```

## 📁 Project Structure

```
playwright-automation-framework/
├── tests/                      # Self-study test specifications
│   ├── smoke/                  # P0 Critical path tests (5 min)
│   │   └── selfStudy.spec.ts   # Core navigation and subject selection
│   ├── regression/             # P1/P2 Functional tests (30 min)
│   │   └── selfStudy.spec.ts   # Continue studying, responsive design
│   └── feature/                # Feature-specific test suites (45 min)
│       ├── accordionView.spec.ts     # Topic navigation, chapters, subtopics
│       ├── taskManagement.spec.ts    # Task interactions, status management
│       ├── revisionFlows.spec.ts     # Revision features, self-learning
│       └── multiDevice.spec.ts       # Cross-device responsive testing
├── pages/                      # Page Object Models (178+ methods total)
│   ├── BasePage.ts             # Common page functionality (21 methods)
│   ├── SubjectsViewPage.ts     # Subject cards, continue studying (58+ methods)
│   ├── AccordionViewPage.ts    # Topic navigation, chapters (35+ methods)
│   ├── TaskViewPage.ts         # Task interactions, status (40+ methods)
│   └── RevisionViewPage.ts     # Revision features, recap (45+ methods)
├── fixtures/                   # Advanced test fixtures
│   ├── auth.fixture.ts         # Authentication utilities
│   └── selfStudy.fixture.ts    # Self-study testing utilities
├── utils/                      # Helper functions and data generators
├── docs/                       # Comprehensive documentation
│   └── SELF_STUDY_TESTING_GUIDE.md  # 500+ line testing guide
├── test-data/                  # Test data management
├── reports/                    # Test execution reports
├── test-results/              # Test artifacts (screenshots, videos, traces)
├── accordion-test-ids-improved.yaml  # Element organization (138 lines)
├── SchooAI Web Test cases - Latest Accordion View.csv  # 161 test cases
├── playwright.config.ts       # Multi-browser, multi-device configuration
└── .env.example               # SchoolAI environment template
```

## 🎯 Test Execution Guide

### Priority-Based Test Execution

#### **P0 Smoke Tests (Critical Path - 5 minutes)**
```bash
# Essential tests that must pass before any deployment
npm run test:smoke
npx playwright test tests/smoke/ --reporter=html

# Specific P0 test cases covered:
# ✅ Navigation to self-study page (TC_AV_01)
# ✅ Self-study page loading (TC_AV_02)
# ✅ Subject cards display (TC_AV_05)
# ✅ Subject navigation (TC_AV_10)
# ✅ Card headings verification (TC_AV_18)
# ✅ Resume action functionality (TC_AV_20)
```

#### **P1/P2 Regression Tests (Comprehensive - 30 minutes)**
```bash
# Full functional and UI validation
npm run test:regression
npx playwright test tests/regression/ tests/feature/

# Covers 136+ additional test scenarios:
# ✅ Continue studying features (TC_AV_12-17)
# ✅ Subject card interactions (TC_AV_06-09)
# ✅ Responsive design (TC_AV_25-26)
# ✅ Loading states and error handling (TC_AV_27-28)
```

### Feature-Specific Test Execution

#### **Self-Study Core Features**
```bash
# Subject selection and continue studying
npx playwright test tests/smoke/selfStudy.spec.ts
npx playwright test tests/regression/selfStudy.spec.ts
```

#### **Accordion View (Topic Navigation)**
```bash
# Topic expansion, chapter navigation, subtopics
npx playwright test tests/feature/accordionView.spec.ts

# Features tested:
# ✅ Topic container loading and expansion
# ✅ Chapter details and progress tracking
# ✅ Subtopic interactions
# ✅ Breadcrumb navigation (mobile)
# ✅ Accessibility compliance
```

#### **Task Management**
```bash
# Task interactions, status tracking, performance badges
npx playwright test tests/feature/taskManagement.spec.ts

# Features tested:
# ✅ Individual task elements and interactions
# ✅ Task performance badges and status indicators
# ✅ Hover effects and accessibility
# ✅ Search and filtering capabilities
# ✅ Empty state handling
```

#### **Revision Flows**
```bash
# Revision features, recap button, self-learning actions
npx playwright test tests/feature/revisionFlows.spec.ts

# Features tested:
# ✅ Revision container availability and enablement
# ✅ Recap button functionality and hover effects
# ✅ Self-learning buttons (assessment, guided practice, etc.)
# ✅ Task details management
# ✅ Navigation flows and accessibility
```

#### **Multi-Device Testing**
```bash
# Cross-device responsive design validation
npx playwright test tests/feature/multiDevice.spec.ts

# Devices tested:
# ✅ Mobile (375x667, 320x568, 414x896)
# ✅ Tablet (768x1024, 1024x1366)
# ✅ Desktop (1440x900)
# ✅ Touch interactions and performance
# ✅ Orientation changes
```

### Device-Specific Testing

#### **Mobile Testing**
```bash
# Mobile Chrome and Safari
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# Custom mobile viewport
npx playwright test --viewport="375x667"

# Mobile-specific features:
# ✅ Single-column layout (TC_AV_26)
# ✅ Touch interactions and tap gestures
# ✅ Breadcrumb navigation
# ✅ Performance optimization
```

#### **Tablet Testing**
```bash
# Tablet layout validation
npx playwright test --viewport="768x1024"

# Tablet-specific features:
# ✅ 2-3 cards per row layout (TC_AV_25)
# ✅ Touch and mouse hybrid interactions
# ✅ Responsive spacing adjustments
```

#### **Cross-Browser Testing**
```bash
# All supported browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Specific browsers
npx playwright test --project=chromium  # Primary testing browser
npx playwright test --project=firefox   # Cross-browser validation
npx playwright test --project=webkit    # Safari compatibility
npx playwright test --project="Google Chrome"  # Real Chrome testing
```

### Interactive Testing & Debugging

#### **UI Mode (Interactive Execution)**
```bash
# Visual test runner with real-time execution
npm run test:ui
npx playwright test --ui

# Features:
# ✅ Visual test selection and execution
# ✅ Real-time browser interaction
# ✅ Step-by-step debugging
# ✅ Element inspection
```

#### **Debug Mode**
```bash
# Step-by-step debugging with breakpoints
npm run test:debug
npx playwright test --debug

# Debug specific test
npx playwright test tests/smoke/selfStudy.spec.ts --debug
```

#### **Headed Mode (Watch Tests Execute)**
```bash
# Run tests with visible browser windows
npm run test:headed
npx playwright test --headed

# Useful for:
# ✅ Visual validation of interactions
# ✅ Understanding test flow
# ✅ Identifying UI timing issues
```

### Advanced Execution Options

#### **Test Filtering and Selection**
```bash
# Run tests by priority
npx playwright test --grep="P0"     # Critical path only
npx playwright test --grep="P1"     # High priority tests

# Run by test case ID
npx playwright test --grep="TC_AV_01"  # Specific test case

# Run by feature
npx playwright test --grep="Continue Studying"
npx playwright test --grep="Subject navigation"

# Run specific test files
npx playwright test tests/smoke/     # All smoke tests
npx playwright test tests/feature/accordionView.spec.ts  # Single feature
```

#### **Parallel Execution**
```bash
# Control parallel execution
npx playwright test --workers=2     # Limit to 2 parallel workers
npx playwright test --workers=1     # Sequential execution
npx playwright test --fully-parallel  # Maximum parallelization
```

#### **Retry and Stability Testing**
```bash
# Retry failed tests
npx playwright test --retries=2

# Run tests multiple times to check stability
npx playwright test --repeat-each=5

# Stress testing
npx playwright test tests/smoke/ --repeat-each=10
```

## 📊 Reporting and Analysis

### HTML Reports
```bash
# Generate and view comprehensive HTML reports
npm run test:report
npx playwright show-report

# Report includes:
# ✅ Test execution summary with pass/fail rates
# ✅ Screenshots and videos of failures
# ✅ Performance metrics and timing data
# ✅ Cross-browser compatibility matrix
# ✅ Device-specific test results
```

### Trace Analysis
```bash
# Record detailed execution traces
npx playwright test --trace=on

# View traces for debugging
npm run test:trace
npx playwright show-trace test-results/[test-name]/trace.zip

# Trace features:
# ✅ Step-by-step execution timeline
# ✅ Network requests and responses
# ✅ DOM snapshots at each step
# ✅ Console logs and errors
```

### Test Artifacts
```bash
# Screenshots of failures
ls test-results/*/test-failed-*.png

# Video recordings
ls test-results/*/video.webm

# Console logs
ls test-results/*/test-*.txt
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# SchoolAI Platform Configuration
BASE_URL=http://localhost:3000/school/aitutor/student/aps
TEST_USER_EMAIL=Test1177
TEST_USER_PASSWORD=Test@123

# Optional Configuration
HEADLESS=true
BROWSER=chromium
VIEWPORT_WIDTH=1440
VIEWPORT_HEIGHT=900
```

### Test Data Configuration

The framework uses two primary data sources:

1. **YAML Element Organization** (`accordion-test-ids-improved.yaml`):
   - 138 lines of hierarchical element structure
   - Dynamic element patterns with parameterization
   - Component state metadata for conditional testing

2. **CSV Test Cases** (`SchooAI Web Test cases - Latest Accordion View.csv`):
   - 161 comprehensive test scenarios
   - Priority classification (P0-P3)
   - Gherkin-formatted test steps
   - Multi-device support indicators

## 🛠️ What You Need to Do

### 1. Environment Setup
```bash
# Navigate to the framework directory
cd playwright-automation-framework

# Install dependencies (if not already done)
npm install
npx playwright install

# Configure your environment
cp .env.example .env
# Edit .env with your actual SchoolAI credentials:
# - BASE_URL: Your SchoolAI instance URL
# - TEST_USER_EMAIL: Valid test user email
# - TEST_USER_PASSWORD: Valid test user password
```

### 2. Verify Your Application Setup
```bash
# Ensure your SchoolAI application is running and accessible
# The framework expects:
# ✅ SchoolAI application running on configured BASE_URL
# ✅ Test user account with access to self-study features
# ✅ Subjects configured and available for the test user
# ✅ Privacy policy checkbox functionality (if applicable)
```

### 3. Run Initial Validation
```bash
# Start with smoke tests to verify basic functionality
npm run test:smoke

# If smoke tests pass, run a broader regression test
npm run test:regression

# For comprehensive validation, run the full suite
npm test
```

### 4. CI/CD Integration (Optional)
```yaml
# Example GitHub Actions workflow (.github/workflows/playwright.yml)
name: Self-Study Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:smoke
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

## 📋 Test Coverage Summary

### **Complete Framework Metrics**
- **Total Test Cases**: 161+ (mapped from CSV)
- **Page Object Methods**: 178+ across 4 main pages
- **Device Support**: 7 viewport configurations
- **Browser Support**: 6 browsers (Chromium, Firefox, Safari, Edge, Mobile Chrome, Mobile Safari)
- **Priority Levels**: P0 (25), P1 (45), P2 (60), P3 (31)

### **Feature Coverage**
- ✅ **Subject Selection**: Card display, navigation, hover effects, icons
- ✅ **Continue Studying**: Card UI, AP/GP text, hover effects, resume actions
- ✅ **Accordion Navigation**: Topic expansion, chapter details, subtopics
- ✅ **Task Management**: Individual tasks, performance badges, status tracking
- ✅ **Revision Flows**: Recap functionality, self-learning buttons, navigation
- ✅ **Responsive Design**: Mobile (single-column), tablet (2-3 cards), desktop
- ✅ **Accessibility**: ARIA compliance, keyboard navigation, semantic HTML
- ✅ **Performance**: Loading benchmarks, stability validation

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Authentication Problems
```bash
# Verify credentials in .env file
echo $TEST_USER_EMAIL
echo $TEST_USER_PASSWORD

# Test login manually in browser using same credentials
# Check if privacy policy checkbox is required

# Clear test state
rm -rf test-results/
npx playwright test tests/smoke/selfStudy.spec.ts --headed
```

#### Element Not Found Errors
```bash
# Check if application UI has changed
# Verify data-testid attributes are present in DOM
# Run tests in headed mode to inspect elements

npx playwright test --headed --debug tests/smoke/selfStudy.spec.ts
```

#### Timeout Issues
```bash
# Increase timeouts for slow environments
# Edit playwright.config.ts:
# testTimeout: 60000  // 60 seconds
# actionTimeout: 15000  // 15 seconds

# Test on local network only first
# Check BASE_URL is correct and accessible
```

#### Mobile/Touch Testing Problems
```bash
# Ensure proper mobile emulation
npx playwright test --project="Mobile Chrome" --headed

# Test touch interactions specifically
npx playwright test tests/feature/multiDevice.spec.ts --headed
```

### Debug Commands
```bash
# Visual debugging with browser developer tools
PWDEBUG=1 npx playwright test tests/smoke/selfStudy.spec.ts

# Console output debugging
DEBUG=pw:api npx playwright test tests/smoke/selfStudy.spec.ts

# Network request debugging
DEBUG=pw:browser* npx playwright test tests/smoke/selfStudy.spec.ts
```

## 📚 Additional Resources

- **[Complete Testing Guide](./docs/SELF_STUDY_TESTING_GUIDE.md)**: 500+ line comprehensive guide
- **[Playwright Documentation](https://playwright.dev/)**: Official Playwright docs
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**: TypeScript reference
- **[Page Object Model Guide](https://playwright.dev/docs/pom)**: Best practices for page objects

## 🎯 Success Criteria

Your framework is working correctly when:

✅ **Smoke tests pass consistently** (>99% success rate)
✅ **All browsers supported** (Chromium, Firefox, Safari, Edge)
✅ **Mobile and tablet layouts validated** (responsive design works)
✅ **Authentication flows stable** (login/logout works reliably)
✅ **Subject navigation functional** (can browse and select subjects)
✅ **Continue studying features working** (if available for test user)
✅ **Performance within benchmarks** (page loads <10 seconds)
✅ **Test reports generated** (HTML reports with screenshots/videos)

---

**Framework Status**: ✅ **Production Ready** - Comprehensive automation with 161+ test cases covering all self-study features across multiple devices and browsers.

**Quick Health Check**: Run `npm run test:smoke` - if all P0 tests pass, your framework is working correctly.