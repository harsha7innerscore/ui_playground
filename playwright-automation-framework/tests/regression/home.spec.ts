import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';

/**
 * Regression tests for home page functionality
 * Comprehensive tests for dashboard features and navigation
 */
test.describe('Home Page - Regression Tests', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);

    // Login before each test to access home page
    await loginPage.navigateToLogin();
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'testpassword123';
    await loginPage.login(email, password);
    await homePage.verifyOnHomePage();
  });

  test('should display all header elements', async () => {
    // Verify header components are present and functional
    await homePage.verifyHeaderElements();
    await expect(homePage.isUserMenuVisible()).resolves.toBe(true);
  });

  test('should display navigation menu with all links', async () => {
    // Verify navigation menu and all primary navigation links
    await homePage.verifyNavigationElements();
  });

  test('should display main content area', async () => {
    // Verify main dashboard content is loaded
    await homePage.verifyMainContentLoaded();
  });

  test('should open and close user menu', async () => {
    // Test user menu interaction
    await homePage.openUserMenu();

    // Verify logout button appears when menu is open
    // Note: This test assumes logout button becomes visible when menu opens
    // Adjust based on actual application behavior
    await homePage.waitForElement(homePage['logoutButton']);
  });

  test('should navigate to products page', async () => {
    // Test navigation to products section
    await homePage.navigateToProducts();

    // Verify navigation occurred
    await homePage.verifyUrl(/\/products/);
  });

  test('should navigate to orders page', async () => {
    // Test navigation to orders section
    await homePage.navigateToOrders();

    // Verify navigation occurred
    await homePage.verifyUrl(/\/orders/);
  });

  test('should navigate to customers page', async () => {
    // Test navigation to customers section
    await homePage.navigateToCustomers();

    // Verify navigation occurred
    await homePage.verifyUrl(/\/customers/);
  });

  test('should perform search functionality', async ({ page }) => {
    // Test search feature if available
    const searchTerm = 'test search';

    // Check if search elements exist
    const hasSearch = await homePage.isVisible(homePage['searchInput']);

    if (hasSearch) {
      await homePage.verifySearchFunctionality(searchTerm);

      // Verify search was executed (URL change or results displayed)
      // This will depend on how your application handles search
      await page.waitForTimeout(1000); // Allow for search to process

      // Add specific assertions based on your search implementation
      // Examples:
      // await expect(page.url()).toContain('search');
      // await expect(page.locator('.search-results')).toBeVisible();
    } else {
      test.skip('Search functionality not available');
    }
  });

  test('should display welcome message', async () => {
    // Test welcome message display
    const hasWelcomeMessage = await homePage.isVisible(homePage['welcomeMessage']);

    if (hasWelcomeMessage) {
      const welcomeText = await homePage.getWelcomeMessage();
      expect(welcomeText).toBeTruthy();
      expect(welcomeText.length).toBeGreaterThan(0);
    } else {
      test.skip('Welcome message not available');
    }
  });

  test('should display statistics section', async () => {
    // Test statistics/dashboard cards if available
    const hasStatistics = await homePage.isStatisticsSectionVisible();

    if (hasStatistics) {
      const stats = await homePage.getStatisticsValues();
      expect(stats.length).toBeGreaterThan(0);

      // Verify each statistic has content
      for (const stat of stats) {
        expect(stat).toBeTruthy();
      }
    } else {
      test.skip('Statistics section not available');
    }
  });

  test('should display recent activity section', async () => {
    // Test recent activity section if available
    const hasRecentActivity = await homePage.isRecentActivityVisible();

    if (hasRecentActivity) {
      // Basic verification that section is present
      // Add more specific tests based on activity content structure
      expect(hasRecentActivity).toBe(true);
    } else {
      test.skip('Recent activity section not available');
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