import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';

/**
 * Home page tests focused on self-study navigation
 * Tests verify the essential navigation path to self-study features
 */
test.describe('Home Page - Self-Study Navigation Tests', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);

    // Login before each test
    await loginPage.navigateToLogin();
    const email = process.env.TEST_USER_EMAIL || 'Test1177';
    const password = process.env.TEST_USER_PASSWORD || 'Test@123';
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.submitLogin();

    // Verify we're on home page
    await homePage.verifyOnHomePage();
  });

  test('should navigate from home page to self study', async () => {
    // Act - Navigate to Self Study via nav item
    await homePage.navigateToSelfStudy();

    // Assert - Should reach self study page
    await homePage.verifyUrl(/.*self.*study|.*syllabus|.*aps/);
  });
});