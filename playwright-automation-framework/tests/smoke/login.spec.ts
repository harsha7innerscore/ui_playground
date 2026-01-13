import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';

/**
 * Smoke tests for login functionality to access self-study features
 * Streamlined tests focused on the critical path to self-study
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

  test('should login with valid credentials and navigate to self study', async () => {
    // Arrange - Use environment variables or defaults
    const email = process.env.TEST_USER_EMAIL || 'Test1177';
    const password = process.env.TEST_USER_PASSWORD || 'Test@123';

    // Act - Login with valid credentials
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.submitLogin();

    // Assert - Should reach home page
    await homePage.verifyOnHomePage();

    // Act - Navigate to Self Study
    await homePage.navigateToSelfStudy();

    // Assert - Should reach self study page
    await homePage.verifyUrl(/.*self.*study|.*syllabus|.*aps/);
  });
});