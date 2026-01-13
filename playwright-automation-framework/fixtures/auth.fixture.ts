import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { SelfStudyPage } from '../pages/SelfStudyPage';

/**
 * Authentication fixture for self-study feature testing
 * Provides pre-authenticated page instances and page objects
 */

// Define fixture types
type AuthFixtures = {
  // Page objects
  loginPage: LoginPage;
  homePage: HomePage;
  selfStudyPage: SelfStudyPage;

  // Pre-authenticated page (for tests that need authenticated state)
  authenticatedPage: Page;

  // Authenticated page objects (already logged in)
  authenticatedHomePage: HomePage;
  authenticatedSelfStudyPage: SelfStudyPage;
};

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  // Basic page objects (not authenticated)
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  selfStudyPage: async ({ page }, use) => {
    const selfStudyPage = new SelfStudyPage(page);
    await use(selfStudyPage);
  },

  // Pre-authenticated page - performs login before test
  authenticatedPage: async ({ page }, use) => {
    console.log('Setting up authenticated page...');

    // Create login page and perform authentication
    const loginPage = new LoginPage(page);
    await loginPage.login();

    console.log('Authentication completed for fixture');
    await use(page);
  },

  // Authenticated home page - already logged in and on home page
  authenticatedHomePage: async ({ authenticatedPage }, use) => {
    const homePage = new HomePage(authenticatedPage);

    // Verify we're on home page after authentication
    await homePage.verifyHomePage();

    await use(homePage);
  },

  // Authenticated self-study page - navigated to self-study page
  authenticatedSelfStudyPage: async ({ authenticatedHomePage }, use) => {
    // Navigate from authenticated home page to self-study page
    await authenticatedHomePage.navigateToSelfStudy();

    // Create self-study page object
    const selfStudyPage = new SelfStudyPage(authenticatedHomePage.page);

    // Verify we're on self-study page
    await selfStudyPage.verifySelfStudyPage();

    await use(selfStudyPage);
  }
});

export { expect } from '@playwright/test';

/**
 * Test data for authentication scenarios
 */
export const AuthTestData = {
  // Default test credentials from environment
  defaultCredentials: {
    email: process.env.TEST_USER_EMAIL || 'Test1177',
    password: process.env.TEST_USER_PASSWORD || 'Test@123'
  },

  // Expected URLs for verification
  urls: {
    login: process.env.BASE_URL || 'http://localhost:3000/school/aitutor/student/aps',
    home: '/school/aitutor/home',
    selfStudy: '/school/aitutor/syllabus'
  },

  // Timeout configurations
  timeouts: {
    login: 15000,
    navigation: 10000,
    pageLoad: 5000
  }
};

/**
 * Helper functions for authentication testing
 */
export class AuthTestHelper {
  /**
   * Verify user is logged in by checking URL
   */
  static async verifyLoggedIn(page: Page): Promise<boolean> {
    const currentUrl = page.url();
    return currentUrl.includes(AuthTestData.urls.home);
  }

  /**
   * Perform manual login with custom credentials
   */
  static async loginWith(page: Page, email: string, password: string): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.loginWith(email, password);
  }

  /**
   * Navigate through the complete self-study flow
   */
  static async completeFullFlow(page: Page): Promise<void> {
    console.log('Starting complete self-study flow...');

    // Step 1: Login
    const loginPage = new LoginPage(page);
    await loginPage.login();

    // Step 2: Navigate to self-study from home
    const homePage = new HomePage(page);
    await homePage.navigateToSelfStudy();

    // Step 3: Verify self-study page
    const selfStudyPage = new SelfStudyPage(page);
    await selfStudyPage.completeSelfStudyVerification();

    console.log('Complete self-study flow finished successfully');
  }

  /**
   * Setup test data and environment
   */
  static async setupTestEnvironment(): Promise<void> {
    // Verify environment variables are set
    if (!process.env.BASE_URL) {
      console.warn('BASE_URL not set in environment, using default');
    }
    if (!process.env.TEST_USER_EMAIL) {
      console.warn('TEST_USER_EMAIL not set in environment, using default');
    }
    if (!process.env.TEST_USER_PASSWORD) {
      console.warn('TEST_USER_PASSWORD not set in environment, using default');
    }

    console.log('Test environment setup completed');
  }
}