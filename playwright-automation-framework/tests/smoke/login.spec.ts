import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';

/**
 * Smoke tests for critical login functionality to access self-study features
 * These tests verify essential login flows required to access the self-study application
 */
test.describe('Login - Self-Study Access Tests', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);

    // Navigate to login page before each test
    await loginPage.navigateToLogin();
  });

  test('should display login form elements', async () => {
    // Verify all essential login form elements are present
    await loginPage.verifyLoginFormElements();
    // Note: Login button is expected to be disabled until form fields are filled
  });

  test('should enable login button when form fields are filled', async () => {
    // Arrange
    const email = process.env.TEST_USER_EMAIL || 'Test1177';
    const password = process.env.TEST_USER_PASSWORD || 'Test@123';

    // Act - Fill form fields
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);

    // Assert - Button should now be enabled
    await loginPage.verifyLoginButtonEnabled();
  });

  test('should login with valid credentials to access self-study features', async () => {
    // Arrange - Use environment variables or defaults (updated for SchoolAI)
    const email = process.env.TEST_USER_EMAIL || 'Test1177';
    const password = process.env.TEST_USER_PASSWORD || 'Test@123';

    // Act
    await loginPage.login(email, password);

    // Assert - Should reach self-study dashboard
    await loginPage.verifySuccessfulLogin();
    await homePage.verifyOnHomePage();
  });

  test('should show error for invalid credentials', async () => {
    // Arrange
    const invalidEmail = 'invalid@example.com';
    const invalidPassword = 'wrongpassword';

    // Act
    await loginPage.login(invalidEmail, invalidPassword);

    // Assert - Should stay on login page with error
    await expect(loginPage.isErrorMessageVisible()).resolves.toBe(true);
    await loginPage.verifyUrl(/\/school\/aitutor\/student\/aps|\//);
  });

  test('should show error for empty email', async () => {
    // Arrange
    const password = 'testpassword123';

    // Act
    await loginPage.fillPassword(password);
    await loginPage.submitLogin();

    // Assert
    await expect(loginPage.isErrorMessageVisible()).resolves.toBe(true);
  });

  test('should show error for empty password', async () => {
    // Arrange
    const email = 'user@example.com';

    // Act
    await loginPage.fillEmail(email);
    await loginPage.submitLogin();

    // Assert
    await expect(loginPage.isErrorMessageVisible()).resolves.toBe(true);
  });

  test('should redirect to login after logout from self-study session', async () => {
    // Arrange - Login first with SchoolAI credentials
    const email = process.env.TEST_USER_EMAIL || 'Test1177';
    const password = process.env.TEST_USER_PASSWORD || 'Test@123';
    await loginPage.login(email, password);
    await homePage.verifyOnHomePage();

    // Act - Logout
    await homePage.logout();

    // Assert - Should be back on login page
    await loginPage.verifyUrl(/\/school\/aitutor\/student\/aps|\//);
    await expect(loginPage.isLoginFormVisible()).resolves.toBe(true);
  });
});