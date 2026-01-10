import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Home/Dashboard page
 * Represents the main landing page after login
 */
export class HomePage extends BasePage {
  // Header elements
  private readonly header: Locator;
  private readonly logo: Locator;
  private readonly userMenu: Locator;
  private readonly logoutButton: Locator;
  private readonly profileLink: Locator;
  private readonly settingsLink: Locator;

  // Navigation elements
  private readonly navigationMenu: Locator;
  private readonly dashboardLink: Locator;
  private readonly productsLink: Locator;
  private readonly ordersLink: Locator;
  private readonly customersLink: Locator;

  // Main content elements
  private readonly welcomeMessage: Locator;
  private readonly mainContent: Locator;
  private readonly statisticsCards: Locator;
  private readonly recentActivitySection: Locator;

  // Search elements
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);

    // Header elements
    this.header = page.getByTestId('main-header').or(page.locator('header'));
    this.logo = page.getByTestId('logo').or(page.locator('.logo'));
    this.userMenu = page.getByTestId('user-menu').or(page.locator('.user-menu'));
    this.logoutButton = page.getByTestId('logout-button').or(page.getByText(/logout|sign out/i));
    this.profileLink = page.getByTestId('profile-link').or(page.getByText(/profile/i));
    this.settingsLink = page.getByTestId('settings-link').or(page.getByText(/settings/i));

    // Navigation elements
    this.navigationMenu = page.getByTestId('nav-menu').or(page.locator('nav'));
    this.dashboardLink = page.getByTestId('dashboard-link').or(page.getByRole('link', { name: /dashboard/i }));
    this.productsLink = page.getByTestId('products-link').or(page.getByRole('link', { name: /products/i }));
    this.ordersLink = page.getByTestId('orders-link').or(page.getByRole('link', { name: /orders/i }));
    this.customersLink = page.getByTestId('customers-link').or(page.getByRole('link', { name: /customers/i }));

    // Main content elements
    this.welcomeMessage = page.getByTestId('welcome-message').or(page.locator('.welcome'));
    this.mainContent = page.getByTestId('main-content').or(page.locator('main'));
    this.statisticsCards = page.getByTestId('stats-cards').or(page.locator('.stats, .statistics'));
    this.recentActivitySection = page.getByTestId('recent-activity').or(page.locator('.recent-activity'));

    // Search elements
    this.searchInput = page.getByTestId('search-input').or(page.getByPlaceholder(/search/i));
    this.searchButton = page.getByTestId('search-button').or(page.getByRole('button', { name: /search/i }));
  }

  /**
   * Navigate to the home/dashboard page
   */
  async navigateToHome(): Promise<void> {
    await this.goto('/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the home page to load completely
   */
  async waitForHomePageLoad(): Promise<void> {
    await this.waitForElement(this.mainContent);
    await this.waitForElement(this.header);
  }

  /**
   * Open user menu dropdown
   */
  async openUserMenu(): Promise<void> {
    await this.clickWithRetry(this.userMenu);
    await this.waitForElement(this.logoutButton);
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.clickWithRetry(this.logoutButton);
    await this.waitForNavigation('/login');
  }

  /**
   * Navigate to user profile
   */
  async navigateToProfile(): Promise<void> {
    await this.openUserMenu();
    await this.clickWithRetry(this.profileLink);
  }

  /**
   * Navigate to settings
   */
  async navigateToSettings(): Promise<void> {
    await this.openUserMenu();
    await this.clickWithRetry(this.settingsLink);
  }

  /**
   * Navigate to products page
   */
  async navigateToProducts(): Promise<void> {
    await this.clickWithRetry(this.productsLink);
  }

  /**
   * Navigate to orders page
   */
  async navigateToOrders(): Promise<void> {
    await this.clickWithRetry(this.ordersLink);
  }

  /**
   * Navigate to customers page
   */
  async navigateToCustomers(): Promise<void> {
    await this.clickWithRetry(this.customersLink);
  }

  /**
   * Perform search operation
   * @param searchTerm - Term to search for
   */
  async search(searchTerm: string): Promise<void> {
    await this.fillInput(this.searchInput, searchTerm);
    await this.clickWithRetry(this.searchButton);
  }

  /**
   * Get welcome message text
   * @returns Welcome message content
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getTextContent(this.welcomeMessage);
  }

  /**
   * Check if user menu is visible
   * @returns True if user menu is visible
   */
  async isUserMenuVisible(): Promise<boolean> {
    return await this.isVisible(this.userMenu);
  }

  /**
   * Check if navigation menu is visible
   * @returns True if navigation menu is visible
   */
  async isNavigationMenuVisible(): Promise<boolean> {
    return await this.isVisible(this.navigationMenu);
  }

  /**
   * Verify header elements are present
   */
  async verifyHeaderElements(): Promise<void> {
    await expect(this.header).toBeVisible();
    await expect(this.logo).toBeVisible();
    await expect(this.userMenu).toBeVisible();
  }

  /**
   * Verify navigation elements are present
   */
  async verifyNavigationElements(): Promise<void> {
    await expect(this.navigationMenu).toBeVisible();
    await expect(this.dashboardLink).toBeVisible();
    await expect(this.productsLink).toBeVisible();
    await expect(this.ordersLink).toBeVisible();
  }

  /**
   * Verify main content is loaded
   */
  async verifyMainContentLoaded(): Promise<void> {
    await expect(this.mainContent).toBeVisible();
  }

  /**
   * Verify user is on home page
   */
  async verifyOnHomePage(): Promise<void> {
    await this.verifyUrl(/\/(dashboard|home)/);
    await this.verifyHeaderElements();
    await this.verifyMainContentLoaded();
  }

  /**
   * Verify welcome message contains user name
   * @param userName - Expected user name in welcome message
   */
  async verifyWelcomeMessage(userName: string): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.welcomeMessage).toContainText(userName);
  }

  /**
   * Get statistics from dashboard cards
   * @returns Array of statistics values
   */
  async getStatisticsValues(): Promise<string[]> {
    const cards = await this.statisticsCards.all();
    const values: string[] = [];

    for (const card of cards) {
      const value = await card.textContent();
      if (value) {
        values.push(value.trim());
      }
    }

    return values;
  }

  /**
   * Verify search functionality
   * @param searchTerm - Term to search for
   */
  async verifySearchFunctionality(searchTerm: string): Promise<void> {
    await expect(this.searchInput).toBeVisible();
    await expect(this.searchButton).toBeVisible();
    await this.search(searchTerm);
    // Additional verification can be added based on search results page structure
  }

  /**
   * Check if statistics section is visible
   * @returns True if statistics section is visible
   */
  async isStatisticsSectionVisible(): Promise<boolean> {
    return await this.isVisible(this.statisticsCards);
  }

  /**
   * Check if recent activity section is visible
   * @returns True if recent activity section is visible
   */
  async isRecentActivityVisible(): Promise<boolean> {
    return await this.isVisible(this.recentActivitySection);
  }

  /**
   * Verify complete home page layout
   */
  async verifyCompleteHomePageLayout(): Promise<void> {
    await this.verifyHeaderElements();
    await this.verifyNavigationElements();
    await this.verifyMainContentLoaded();

    // Optional sections
    const hasStatistics = await this.isStatisticsSectionVisible();
    const hasRecentActivity = await this.isRecentActivityVisible();

    if (hasStatistics) {
      await expect(this.statisticsCards).toBeVisible();
    }

    if (hasRecentActivity) {
      await expect(this.recentActivitySection).toBeVisible();
    }
  }
}