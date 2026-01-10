import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

/**
 * Authentication fixture for managing user sessions
 * Provides utilities for login, logout, and session management
 */

export interface AuthUser {
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'readonly';
}

export interface AuthFixture {
  loginPage: LoginPage;
  homePage: HomePage;
  authenticatedUser: AuthUser;
  loginAsUser: (user?: AuthUser) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  loginAsReadonlyUser: () => Promise<void>;
  logout: () => Promise<void>;
  ensureAuthenticated: () => Promise<void>;
}

// Predefined test users
const TEST_USERS: Record<string, AuthUser> = {
  regular: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'testpassword123',
    role: 'user'
  },
  admin: {
    email: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_USER_PASSWORD || 'adminpassword123',
    role: 'admin'
  },
  readonly: {
    email: process.env.READONLY_USER_EMAIL || 'readonly@example.com',
    password: process.env.READONLY_USER_PASSWORD || 'readonlypassword123',
    role: 'readonly'
  }
};

/**
 * Extended test with authentication fixtures
 */
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
    // Default to regular user
    await use(TEST_USERS.regular);
  },

  loginAsUser: async ({ page, loginPage, homePage }, use) => {
    const loginAsUser = async (user: AuthUser = TEST_USERS.regular) => {
      await loginPage.navigateToLogin();
      await loginPage.login(user.email, user.password);
      await homePage.verifyOnHomePage();
    };

    await use(loginAsUser);
  },

  loginAsAdmin: async ({ page, loginPage, homePage }, use) => {
    const loginAsAdmin = async () => {
      await loginPage.navigateToLogin();
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await homePage.verifyOnHomePage();
    };

    await use(loginAsAdmin);
  },

  loginAsReadonlyUser: async ({ page, loginPage, homePage }, use) => {
    const loginAsReadonlyUser = async () => {
      await loginPage.navigateToLogin();
      await loginPage.login(TEST_USERS.readonly.email, TEST_USERS.readonly.password);
      await homePage.verifyOnHomePage();
    };

    await use(loginAsReadonlyUser);
  },

  logout: async ({ homePage, loginPage }, use) => {
    const logout = async () => {
      await homePage.logout();
      await loginPage.verifyUrl(/\/login/);
    };

    await use(logout);
  },

  ensureAuthenticated: async ({ page, loginAsUser, authenticatedUser }, use) => {
    const ensureAuthenticated = async () => {
      // Check if already authenticated by looking for home page elements
      const currentUrl = page.url();

      if (currentUrl.includes('/login') || currentUrl === 'about:blank' || currentUrl.includes('localhost') && !currentUrl.includes('/dashboard')) {
        await loginAsUser(authenticatedUser);
      } else {
        // Verify we're still authenticated by checking for user menu
        try {
          const homePage = new HomePage(page);
          const isAuthenticated = await homePage.isUserMenuVisible();

          if (!isAuthenticated) {
            await loginAsUser(authenticatedUser);
          }
        } catch {
          // If verification fails, login again
          await loginAsUser(authenticatedUser);
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
 * @param role User role
 * @returns AuthUser object
 */
export function createTestUser(email: string, password: string, role: 'admin' | 'user' | 'readonly' = 'user'): AuthUser {
  return { email, password, role };
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

/**
 * API authentication utilities for bypassing UI login
 */
export class ApiAuth {
  constructor(private page: any) {}

  /**
   * Authenticate using API call (bypass UI login)
   * @param user User credentials
   * @returns Authentication token
   */
  async authenticateViaApi(user: AuthUser): Promise<string> {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';

    const response = await this.page.request.post(`${apiBaseUrl}/auth/login`, {
      data: {
        email: user.email,
        password: user.password
      }
    });

    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const token = responseBody.token || responseBody.access_token;

    if (!token) {
      throw new Error('No authentication token received from API');
    }

    // Set token in browser storage
    const sessionManager = new SessionManager(this.page);
    await sessionManager.saveAuthToken(token);

    return token;
  }

  /**
   * Refresh authentication token
   * @param refreshToken Refresh token
   * @returns New authentication token
   */
  async refreshToken(refreshToken: string): Promise<string> {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';

    const response = await this.page.request.post(`${apiBaseUrl}/auth/refresh`, {
      data: { refresh_token: refreshToken }
    });

    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    return responseBody.token || responseBody.access_token;
  }
}

// Export for use in tests
export { expect } from '@playwright/test';