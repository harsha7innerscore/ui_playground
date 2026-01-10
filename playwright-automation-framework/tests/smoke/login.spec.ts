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
    await loginPage.verifyLoginButtonEnabled();
  });

  test('should login with valid credentials to access self-study features', async () => {
    // Arrange
    const email = process.env.TEST_USER_EMAIL || 'user@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';

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
    await loginPage.verifyUrl(/\/login/);
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
    // Arrange - Login first
    const email = process.env.TEST_USER_EMAIL || 'user@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';
    await loginPage.login(email, password);
    await homePage.verifyOnHomePage();

    // Act - Logout
    await homePage.logout();

    // Assert - Should be back on login page
    await loginPage.verifyUrl(/\/login/);
    await expect(loginPage.isLoginFormVisible()).resolves.toBe(true);
  });
});