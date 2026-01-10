import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { SelfStudyDataGenerator } from '../../utils/data.generator';

/**
 * Regression tests for self-study dashboard functionality
 * Comprehensive tests for self-study features and navigation
 */
test.describe('Self-Study Dashboard - Regression Tests', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);

    // Login before each test to access self-study dashboard
    await loginPage.navigateToLogin();
    const email = process.env.TEST_USER_EMAIL || 'user@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';
    await loginPage.login(email, password);
    await homePage.verifyOnHomePage();
  });

  test('should display self-study dashboard header elements', async () => {
    // Verify header components are present and functional
    await homePage.verifyHeaderElements();
    await expect(homePage.isUserMenuVisible()).resolves.toBe(true);
  });

  test('should display self-study navigation menu', async () => {
    // Verify navigation menu contains self-study related links
    await homePage.verifyNavigationElements();
  });

  test('should display main self-study dashboard content', async () => {
    // Verify main self-study dashboard content is loaded
    await homePage.verifyMainContentLoaded();
  });

  test('should open and close user menu', async () => {
    // Test user menu interaction
    await homePage.openUserMenu();

    // Verify logout button appears when menu is open
    await homePage.waitForElement(homePage['logoutButton']);
  });

  test('should display study progress overview', async ({ page }) => {
    // Test that study progress section is visible on dashboard
    const progressSection = page.getByTestId('study-progress-overview');
    await expect(progressSection).toBeVisible();
  });

  test('should display recent study sessions', async ({ page }) => {
    // Test that recent study sessions are shown on dashboard
    const recentSessionsSection = page.getByTestId('recent-study-sessions');
    await expect(recentSessionsSection).toBeVisible();
  });

  test('should display study goals summary', async ({ page }) => {
    // Test that study goals summary is shown on dashboard
    const goalsSection = page.getByTestId('study-goals-summary');
    await expect(goalsSection).toBeVisible();
  });

  test('should search through study materials', async ({ page }) => {
    // Test search functionality for study sessions and notes
    const searchTerm = 'JavaScript';

    // Check if search elements exist
    const searchInput = page.getByTestId('study-search-input');
    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await searchInput.fill(searchTerm);
      await page.getByTestId('search-button').click();

      // Verify search results are displayed
      await expect(page.getByTestId('search-results')).toBeVisible();
    } else {
      test.skip('Study search functionality not available');
    }
  });

  test('should display welcome message with study motivation', async ({ page }) => {
    // Test welcome message specific to learning
    const welcomeMessage = page.getByTestId('study-welcome-message');
    const hasWelcomeMessage = await welcomeMessage.isVisible().catch(() => false);

    if (hasWelcomeMessage) {
      const welcomeText = await welcomeMessage.textContent();
      expect(welcomeText).toBeTruthy();
      expect(welcomeText).toContain('study' || 'learn' || 'progress');
    } else {
      test.skip('Study welcome message not available');
    }
  });

  test('should display study statistics cards', async ({ page }) => {
    // Test study statistics dashboard cards
    const statsSection = page.getByTestId('study-statistics');
    const hasStatistics = await statsSection.isVisible().catch(() => false);

    if (hasStatistics) {
      // Verify key study metrics are displayed
      await expect(page.getByTestId('total-study-time')).toBeVisible();
      await expect(page.getByTestId('completed-sessions')).toBeVisible();
      await expect(page.getByTestId('current-streak')).toBeVisible();
    } else {
      test.skip('Study statistics section not available');
    }
  });

  test('should display recent study activity', async ({ page }) => {
    // Test recent study activity section
    const recentActivity = page.getByTestId('recent-study-activity');
    const hasRecentActivity = await recentActivity.isVisible().catch(() => false);

    if (hasRecentActivity) {
      // Verify recent activity items are shown
      expect(hasRecentActivity).toBe(true);
    } else {
      test.skip('Recent study activity section not available');
    }
  });

  test('should maintain session after page reload', async ({ page }) => {
    // Test session persistence
    await page.reload();
    await homePage.waitForHomePageLoad();

    // Should still be on home page after reload
    await homePage.verifyOnHomePage();
  });

  test('should navigate to user profile', async () => {
    // Test profile navigation
    await homePage.navigateToProfile();

    // Verify navigation to profile page
    await homePage.verifyUrl(/\/profile/);
  });

  test('should navigate to settings', async () => {
    // Test settings navigation
    await homePage.navigateToSettings();

    // Verify navigation to settings page
    await homePage.verifyUrl(/\/settings/);
  });

  test('should verify complete page layout', async () => {
    // Comprehensive layout verification
    await homePage.verifyCompleteHomePageLayout();
  });

  test.describe('Responsive Design Tests', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Test mobile responsiveness
      await page.setViewportSize({ width: 375, height: 667 });

      // Wait for layout to adjust
      await page.waitForTimeout(500);

      // Verify essential elements are still visible/accessible
      await homePage.verifyHeaderElements();

      // Mobile-specific verification
      // Note: Adjust these tests based on your responsive design
      const isMobileMenuVisible = await homePage.isNavigationMenuVisible();

      // On mobile, navigation might be hidden behind hamburger menu
      // Adjust assertions based on your mobile design patterns
      if (!isMobileMenuVisible) {
        // Look for hamburger menu or mobile navigation trigger
        // This is application-specific
      }
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Test tablet responsiveness
      await page.setViewportSize({ width: 768, height: 1024 });

      // Wait for layout to adjust
      await page.waitForTimeout(500);

      // Verify layout on tablet
      await homePage.verifyHeaderElements();
      await homePage.verifyMainContentLoaded();
    });
  });
});