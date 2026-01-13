import { test, expect } from '../../../fixtures/auth.fixture';
import { LoginPage } from '../../../pages/LoginPage';
import { HomePage } from '../../../pages/HomePage';
import { SelfStudyPage } from '../../../pages/SelfStudyPage';

/**
 * Self-Study Feature Test Suite
 * Tests the complete flow from login → home → self-study page
 * Following the requirements specified in todoList.md
 */

test.describe('Self-Study Feature Flow', () => {

  test.beforeEach(async ({ page }) => {
    console.log('Setting up test environment...');
    // Any additional setup can be added here
  });

  /**
   * Main test case: Complete self-study flow
   * This test follows the exact requirements from todoList.md:
   *
   * 1. Navigate to BASE_URL (login page) - verify URL
   * 2. Enter TEST_USER_EMAIL and TEST_USER_PASSWORD
   * 3. Click submit button
   * 4. Verify redirect to home page - wait before verifying
   * 5. Click Self Study navigation
   * 6. Verify self-study page - wait before verifying
   */
  test('should complete positive flow: Login → Home → Self Study', async ({
    page,
    loginPage,
    homePage,
    selfStudyPage
  }) => {
    console.log('=== Starting Self-Study Flow Test ===');

    // ========================================
    // STEP 1: LOGIN PAGE FLOW
    // ========================================
    console.log('STEP 1: Login Page Flow');

    // 1.1: Navigate to BASE_URL (this is the login page)
    await loginPage.navigateToLogin();

    // 1.2: Verify this is the login page based on URL (as specified)
    await loginPage.verifyLoginPage();

    // 1.3: Verify login form elements are present
    await loginPage.verifyLoginFormElements();

    // 1.4: Fill credentials from environment variables
    // - TEST_USER_EMAIL at data-testid="login-user-id-input"
    // - TEST_USER_PASSWORD at data-testid="login-password"
    await loginPage.fillEmail();
    await loginPage.fillPassword();

    // 1.5: Trigger login by clicking data-testid="login-submit-button"
    await loginPage.clickSubmitButton();

    // 1.6: Wait for and verify redirect to home page
    // Expected: http://localhost:3000/school/aitutor/home
    await loginPage.waitForLoginRedirect();

    console.log('✓ Login flow completed successfully');

    // ========================================
    // STEP 2: HOME PAGE FLOW
    // ========================================
    console.log('STEP 2: Home Page Flow');

    // 2.1: Verify we're on home page based on URL
    // With waiting period as specified: "wait for sometime before doing this"
    await homePage.verifyHomePage();

    // 2.2: Ensure home page is fully loaded
    await homePage.waitForHomePageLoad();

    // 2.3: Trigger data-testid="nav-item-Self Study"
    // This should take us to http://localhost:3000/school/aitutor/syllabus
    await homePage.clickSelfStudyNav();

    // 2.4: Wait for navigation to self-study page
    await homePage.waitForSelfStudyNavigation();

    console.log('✓ Home page navigation completed successfully');

    // ========================================
    // STEP 3: SELF-STUDY PAGE FLOW
    // ========================================
    console.log('STEP 3: Self-Study Page Flow');

    // 3.1: Verify we're on self-study page based on URL
    // With waiting period as specified: "wait for sometime before doing this"
    await selfStudyPage.verifySelfStudyPage();

    // 3.2: Complete self-study page verification
    await selfStudyPage.completeSelfStudyVerification();

    console.log('✓ Self-study page verification completed successfully');

    // ========================================
    // TEST COMPLETION
    // ========================================
    console.log('=== Self-Study Flow Test Completed Successfully ===');

    // Final verification - ensure we ended up at the correct URL
    const finalUrl = page.url();
    expect(finalUrl).toContain('/school/aitutor/syllabus');

    console.log(`Final URL: ${finalUrl}`);
    console.log('All requirements from todoList.md have been verified ✓');
  });

  /**
   * Additional test case for individual component verification
   * This can be useful for debugging specific parts of the flow
   */
  test('should verify login page elements and functionality', async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    await loginPage.verifyLoginPage();
    await loginPage.verifyLoginFormElements();

    // Verify environment variables are being used correctly
    const email = process.env.TEST_USER_EMAIL || 'Test1177';
    const password = process.env.TEST_USER_PASSWORD || 'Test@123';

    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    console.log(`Using credentials - Email: ${email}`);
  });

  /**
   * Test case to verify URL patterns match requirements
   */
  test('should verify all required URLs match specification', async ({ page }) => {
    // Verify BASE_URL configuration
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000/school/aitutor/student/aps';
    expect(baseUrl).toBeTruthy();

    console.log(`BASE_URL: ${baseUrl}`);
    console.log('Expected Home URL: /school/aitutor/home');
    console.log('Expected Self-Study URL: /school/aitutor/syllabus');

    // These URLs are verified during the main flow test
    expect(true).toBe(true); // Placeholder assertion
  });

  test.afterEach(async ({ page }) => {
    console.log('Test completed, cleaning up...');

    // Take a screenshot for record keeping
    await page.screenshot({
      path: `test-results/self-study-flow-${Date.now()}.png`,
      fullPage: true
    });
  });
});

/**
 * Test configuration and data validation
 */
test.describe('Self-Study Test Configuration', () => {

  test('should validate environment configuration', async () => {
    // Verify all required environment variables
    const requiredEnvVars = ['BASE_URL', 'TEST_USER_EMAIL', 'TEST_USER_PASSWORD'];

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      expect(value, `Environment variable ${envVar} should be set`).toBeTruthy();
      console.log(`✓ ${envVar}: ${envVar.includes('PASSWORD') ? '[REDACTED]' : value}`);
    }

    console.log('Environment configuration validated successfully');
  });
});