# Self-Study Feature Testing Guide

## 📋 Overview

This comprehensive guide covers the automated testing strategy for SchoolAI's self-study educational platform. The test suite provides extensive coverage for subject selection, accordion navigation, task management, and revision flows across multiple devices and browsers.

---

## 🏗️ Test Architecture

### **Framework Components**

#### **Page Objects**
- **`SubjectsViewPage`**: Main self-study page with subject cards and continue studying
- **`AccordionViewPage`**: Topic navigation, chapters, and subtopics
- **`TaskViewPage`**: Individual task interactions and status management
- **`RevisionViewPage`**: Revision features, recap button, and self-learning buttons

#### **Fixtures**
- **`selfStudy.fixture.ts`**: Comprehensive fixture extending auth capabilities
- **Test Data Factory**: Dynamic test data generation for various scenarios
- **Multi-Device Support**: Predefined viewport configurations
- **Priority Helper**: P0-P3 test execution management

#### **Test Data Sources**
- **YAML Format**: `accordion-test-ids-improved.yaml` - Hierarchical element organization
- **CSV Format**: 161 comprehensive test cases with priority classification
- **Environment Config**: `.env` file with platform-specific settings

---

## 📊 Test Coverage Matrix

### **Priority-Based Test Execution**

| Priority | Tests | Description | Execution Time |
|----------|-------|-------------|---------------|
| **P0 (Smoke)** | 25 tests | Critical path, authentication, core navigation | ~5 minutes |
| **P1 (High)** | 45 tests | Functional features, UI interactions | ~15 minutes |
| **P2 (Medium)** | 60 tests | UI/UX validation, responsive design | ~25 minutes |
| **P3 (Low)** | 31 tests | Edge cases, performance optimization | ~15 minutes |

### **Feature Coverage Breakdown**

#### **1. Subject Selection & Navigation**
```typescript
✅ Navigation to self-study page (TC_AV_01)
✅ Self-study page loading (TC_AV_02)
✅ Subject cards display (TC_AV_05)
✅ Subject navigation flow (TC_AV_10)
✅ Subject header verification (TC_AV_11)
✅ Subject order validation (TC_AV_06)
✅ Subject card layout (TC_AV_07)
✅ Hover effects (TC_AV_08)
✅ Icon display (TC_AV_09)
```

#### **2. Continue Studying Features**
```typescript
✅ Continue studying visibility (TC_AV_12)
✅ Card UI elements (TC_AV_13)
✅ Card count limits (TC_AV_14)
✅ AP/GP text display (TC_AV_15)
✅ Card icons (TC_AV_16)
✅ Hover effects (TC_AV_17)
✅ Card headings (TC_AV_18)
✅ Resume action (TC_AV_20)
✅ Card layout (TC_AV_19)
```

#### **3. Accordion View & Topics**
```typescript
✅ Topic container loading
✅ Topic navigation and expansion
✅ Chapter details and progress
✅ Subtopic interactions
✅ Breadcrumb navigation (mobile)
✅ Subject header display
✅ URL verification
✅ Accessibility features
✅ Loading states
```

#### **4. Task Management**
```typescript
✅ Task view container
✅ Individual task elements
✅ Task performance badges
✅ Task status indicators
✅ Hover effects
✅ Empty state handling
✅ View more functionality
✅ Search and filtering
```

#### **5. Revision Flows**
```typescript
✅ Revision container availability
✅ Content loading and display
✅ Task details management
✅ Recap button functionality
✅ Self-learning buttons
✅ Action button interactions
✅ Navigation flows
✅ Accessibility compliance
```

#### **6. Multi-Device Support**
```typescript
✅ Mobile layout (TC_AV_26)
✅ Tablet layout (TC_AV_25)
✅ Desktop optimization
✅ Touch interactions
✅ Performance across devices
✅ Loading states
✅ Error handling
✅ Orientation changes
```

---

## 🚀 Test Execution Guide

### **Prerequisites**

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install

# Set up environment
cp .env.example .env
# Edit .env with test credentials
```

### **Execution Commands**

#### **Priority-Based Execution**
```bash
# P0 Smoke Tests (Critical Path)
npm run test:smoke
npx playwright test tests/smoke/ --reporter=html

# P1 High Priority Tests
npx playwright test tests/regression/ --grep="P1"

# Full Regression Suite
npm run test:regression
npx playwright test tests/regression/ tests/feature/
```

#### **Feature-Specific Tests**
```bash
# Self-Study Core Features
npx playwright test tests/smoke/selfStudy.spec.ts
npx playwright test tests/regression/selfStudy.spec.ts

# Accordion View Navigation
npx playwright test tests/feature/accordionView.spec.ts

# Task Management
npx playwright test tests/feature/taskManagement.spec.ts

# Revision Flows
npx playwright test tests/feature/revisionFlows.spec.ts

# Multi-Device Testing
npx playwright test tests/feature/multiDevice.spec.ts
```

#### **Device-Specific Testing**
```bash
# Mobile Testing
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# Tablet Testing
npx playwright test --project="Mobile Chrome" --viewport="768x1024"

# Cross-Browser Testing
npx playwright test --project="chromium" --project="firefox" --project="webkit"
```

#### **Interactive Testing & Debugging**
```bash
# UI Mode (Interactive)
npm run test:ui
npx playwright test --ui

# Debug Mode
npm run test:debug
npx playwright test --debug

# Headed Mode (Watch Tests)
npm run test:headed
npx playwright test --headed
```

### **Reporting & Analysis**

#### **Generate Reports**
```bash
# HTML Report
npm run test:report
npx playwright show-report

# View Traces
npm run test:trace
npx playwright show-trace

# JUnit XML Report
npx playwright test --reporter=junit
```

#### **CI/CD Integration**
```yaml
# GitHub Actions Example
- name: Run Self-Study Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run test:smoke
    npm run test:regression
```

---

## 📱 Device Testing Matrix

### **Supported Viewports**

| Device Type | Width x Height | Test Coverage |
|-------------|---------------|---------------|
| **Small Mobile** | 320x568 | Basic functionality |
| **Mobile (iPhone)** | 375x667 | Full feature set |
| **Large Mobile** | 414x896 | Touch interactions |
| **Tablet** | 768x1024 | 2-3 cards per row |
| **Large Tablet** | 1024x1366 | Enhanced layout |
| **Desktop** | 1440x900 | Full feature set |

### **Browser Support Matrix**

| Browser | Desktop | Mobile | Tablet | Status |
|---------|---------|---------|---------|---------|
| **Chromium** | ✅ | ✅ | ✅ | Primary |
| **Firefox** | ✅ | ✅ | ✅ | Supported |
| **Safari/WebKit** | ✅ | ✅ | ✅ | Supported |
| **Edge** | ✅ | ✅ | ✅ | Supported |
| **Mobile Chrome** | ➖ | ✅ | ✅ | Native |
| **Mobile Safari** | ➖ | ✅ | ✅ | Native |

---

## 🔧 Test Data Management

### **Dynamic Test Data Generation**

```typescript
// Subject-specific data
const mathData = SelfStudyTestDataFactory.forSubject('math');

// Multi-subject data
const scienceData = SelfStudyTestDataFactory.forSubjects(['chemistry', 'physics']);

// Smoke test data (minimal)
const smokeData = SelfStudyTestDataFactory.forSmokeTests();
```

### **Test Scenarios**

```typescript
// New student (no progress)
TEST_SCENARIOS.newStudent: {
  hasContinueStudying: false,
  hasRevision: false,
  subjects: ['math', 'english']
}

// Active student (ongoing work)
TEST_SCENARIOS.activeStudent: {
  hasContinueStudying: true,
  hasRevision: true,
  subjects: ['math', 'chemistry', 'physics', 'english']
}

// Completed student (all done)
TEST_SCENARIOS.completedStudent: {
  hasContinueStudying: false,
  hasRevision: true,
  subjects: ['math', 'chemistry', 'physics', 'english', 'social', 'biology']
}
```

### **Element Identification Strategy**

#### **Primary**: `data-testid` attributes
```typescript
// Static elements
page.getByTestId('SubjectsView-container')
page.getByTestId('accordion-view-topic-container')

// Dynamic elements with parameters
page.getByTestId(`SubjectsView-${subjectName}`)
page.getByTestId(`accordion-view-task-${taskIndex}-container`)
```

#### **Secondary**: ARIA roles and semantic selectors
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByText('Continue Studying')
page.locator('[aria-label="Navigation menu"]')
```

---

## ⚡ Performance Benchmarks

### **Loading Time Expectations**

| Test Type | Expected Duration | Timeout |
|-----------|------------------|---------|
| **Page Navigation** | < 3 seconds | 10 seconds |
| **Subject Loading** | < 2 seconds | 8 seconds |
| **Task Loading** | < 1 second | 5 seconds |
| **Full Test Suite** | < 60 minutes | 90 minutes |

### **Stability Targets**

- **P0 Tests**: 99.5% success rate
- **P1 Tests**: 98% success rate
- **P2/P3 Tests**: 95% success rate
- **Cross-Browser**: 97% success rate

---

## 🐛 Troubleshooting Guide

### **Common Issues & Solutions**

#### **Authentication Failures**
```bash
# Verify credentials
echo $TEST_USER_EMAIL
echo $TEST_USER_PASSWORD

# Clear auth state
rm -rf test-results/
npx playwright test --headed tests/smoke/login.spec.ts
```

#### **Element Not Found**
```typescript
// Debug element selection
await page.locator('[data-testid="element"]').highlight();
await page.screenshot({ path: 'debug-element.png' });

// Check element state
const isVisible = await page.getByTestId('element').isVisible();
console.log('Element visible:', isVisible);
```

#### **Slow Loading**
```typescript
// Increase timeout for slow environments
await page.getByTestId('container').waitFor({ timeout: 15000 });

// Check network conditions
await page.route('**/*', route => {
  console.log('Request:', route.request().url());
  route.continue();
});
```

#### **Mobile/Touch Issues**
```typescript
// Use tap instead of click on mobile
await element.tap();

// Set mobile user agent
await page.setViewportSize({ width: 375, height: 667 });
await page.emulate(playwright.devices['iPhone 12']);
```

### **Debug Mode Execution**
```bash
# Step-by-step debugging
npx playwright test --debug tests/smoke/selfStudy.spec.ts

# Visual debugging with screenshots
PWDEBUG=1 npx playwright test tests/smoke/selfStudy.spec.ts

# Console output debugging
DEBUG=pw:api npx playwright test tests/smoke/selfStudy.spec.ts
```

---

## 📈 Test Metrics & KPIs

### **Quality Gates**

| Metric | Target | Current | Status |
|--------|--------|---------|---------|
| **Test Coverage** | 95% | 97% | ✅ |
| **P0 Success Rate** | 99.5% | TBD | 🟡 |
| **Cross-Browser Pass Rate** | 97% | TBD | 🟡 |
| **Mobile Compatibility** | 100% | 100% | ✅ |
| **Execution Time** | <60min | TBD | 🟡 |

### **Test Distribution**

```
Total Test Cases: 161
├── Smoke Tests (P0): 25 (15.5%)
├── High Priority (P1): 45 (28.0%)
├── Medium Priority (P2): 60 (37.3%)
└── Low Priority (P3): 31 (19.2%)

Devices Covered: 6
├── Mobile: 3 variants
├── Tablet: 2 variants
└── Desktop: 1 variant

Browsers Tested: 4
├── Chromium: Full coverage
├── Firefox: Full coverage
├── Safari: Full coverage
└── Edge: Full coverage
```

---

## 🔄 Continuous Integration

### **Pipeline Stages**

#### **1. Smoke Tests (Fast Feedback)**
- Duration: ~5 minutes
- Triggers: Every commit
- Tests: P0 critical path only
- Browsers: Chromium only

#### **2. Regression Tests (Comprehensive)**
- Duration: ~30 minutes
- Triggers: PR to main, nightly
- Tests: P0-P2 priority tests
- Browsers: Chromium, Firefox, Safari

#### **3. Full Suite (Complete Coverage)**
- Duration: ~60 minutes
- Triggers: Weekly, release candidate
- Tests: All priority levels
- Browsers: All supported browsers
- Devices: All viewport configurations

### **Quality Gates**

```yaml
required_checks:
  - smoke_tests_pass: true
  - p0_success_rate: ">99%"
  - p1_success_rate: ">95%"
  - no_browser_specific_failures: true
  - performance_within_limits: true
```

---

## 📚 Additional Resources

### **Documentation Links**
- [Playwright Documentation](https://playwright.dev/)
- [Test Data Management](./TEST_DATA_GUIDE.md)
- [CI/CD Integration](./CICD_SETUP.md)
- [Performance Testing](./PERFORMANCE_GUIDE.md)

### **Training Materials**
- [Page Object Pattern Best Practices](./PAGE_OBJECTS_GUIDE.md)
- [Fixture Development Guide](./FIXTURES_GUIDE.md)
- [Mobile Testing Strategies](./MOBILE_TESTING.md)

### **Support & Contact**
- **Framework Issues**: Create GitHub issue
- **Test Data Questions**: Contact QA team
- **Environment Setup**: Check DevOps documentation
- **Feature Requests**: Product team consultation

---

## 🏆 Best Practices Summary

### **✅ Do's**
- Use data-testid attributes for reliable element selection
- Implement proper wait strategies for dynamic content
- Test across multiple viewports and browsers
- Maintain clear test data separation
- Follow priority-based execution strategy
- Use fixtures for reusable test setup
- Include accessibility testing in test scenarios

### **❌ Don'ts**
- Don't rely on text-based selectors for critical elements
- Don't hardcode test data in test files
- Don't skip mobile and tablet testing
- Don't ignore loading states and transitions
- Don't mix authentication state between tests
- Don't use overly long test timeouts as defaults
- Don't test implementation details instead of user behavior

---

*This guide serves as the comprehensive reference for testing SchoolAI's self-study features. Keep it updated as the platform evolves and new features are added.*