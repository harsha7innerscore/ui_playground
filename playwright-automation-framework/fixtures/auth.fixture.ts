import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

/**
 * Authentication fixture for self-study UI testing
 * Provides utilities for login, logout, and session management
 */

export interface AuthUser {
  email: string;
  password: string;
}

export interface AuthFixture {
  loginPage: LoginPage;
  homePage: HomePage;
  authenticatedUser: AuthUser;
  login: (user?: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  ensureAuthenticated: () => Promise<void>;
}

// Test user from environment variables
const TEST_USER: AuthUser = {
  email: process.env.TEST_USER_EMAIL || 'user@example.com',
  password: process.env.TEST_USER_PASSWORD || 'password123'
};

export const test = base.extend<AuthFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  authenticatedUser: async ({}, use) => {
    await use(TEST_USER);
  },

  login: async ({ page, loginPage, homePage }, use) => {
    const login = async (user: AuthUser = TEST_USER) => {
      await loginPage.navigateToLogin();
      await loginPage.login(user.email, user.password);
      await homePage.verifyOnHomePage();
    };

    await use(login);
  },

  logout: async ({ homePage, loginPage }, use) => {
    const logout = async () => {
      await homePage.logout();
      await loginPage.verifyUrl(/\/school\/aitutor\/student\/aps|\/login|\//);
    };

    await use(logout);
  },

  ensureAuthenticated: async ({ page, login, authenticatedUser }, use) => {
    const ensureAuthenticated = async () => {
      // Check if already authenticated by looking for home page elements
      const currentUrl = page.url();

      if (currentUrl.includes('/login') || currentUrl === 'about:blank' || currentUrl.includes('localhost') && !currentUrl.includes('/dashboard')) {
        await login(authenticatedUser);
      } else {
        // Verify we're still authenticated by checking for user menu
        try {
          const homePage = new HomePage(page);
          const isAuthenticated = await homePage.isUserMenuVisible();

          if (!isAuthenticated) {
            await login(authenticatedUser);
          }
        } catch {
          // If verification fails, login again
          await login(authenticatedUser);
        }
      }
    };

    await use(ensureAuthenticated);
  }
});

/**
 * Helper function to create custom user for testing
 * @param email User email
 * @param password User password
 * @returns AuthUser object
 */
export function createTestUser(email: string, password: string): AuthUser {
  return { email, password };
}

/**
 * Session storage utilities for maintaining authentication state
 */
export class SessionManager {
  constructor(private page: any) {}

  /**
   * Save authentication token to session storage
   * @param token Authentication token
   */
  async saveAuthToken(token: string): Promise<void> {
    await this.page.evaluate((token: string) => {
      sessionStorage.setItem('authToken', token);
    }, token);
  }

  /**
   * Get authentication token from session storage
   * @returns Authentication token or null
   */
  async getAuthToken(): Promise<string | null> {
    return await this.page.evaluate(() => {
      return sessionStorage.getItem('authToken');
    });
  }

  /**
   * Clear authentication data from session storage
   */
  async clearAuthData(): Promise<void> {
    await this.page.evaluate(() => {
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('authToken');
      // Clear any other auth-related storage items
    });
  }

  /**
   * Check if user is authenticated based on session data
   * @returns True if user appears to be authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return token !== null && token.length > 0;
  }
}


// Export for use in tests
export { expect } from '@playwright/test';