import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage - Page object for home page functionality
 * Handles navigation to self-study feature from home page
 */
export class HomePage extends BasePage {
  // Element selectors using data-testid attributes as specified
  private readonly selfStudyNavItem = this.getByTestId('nav-item-Self Study');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify we are on the home page by checking URL
   * Includes waiting period as specified in requirements: "wait for sometime before doing this"
   */
  async verifyHomePage(): Promise<void> {
    console.log('Waiting before verifying home page URL...');

    // Wait for some time as specified in requirements
    await this.wait(2000);

    // Wait for the expected home page URL
    const expectedHomeUrl = '/school/aitutor/home';
    await this.waitForUrl(expectedHomeUrl, 10000);

    // Verify current URL contains the expected home page path
    const currentUrl = this.getCurrentUrl();
    expect(currentUrl).toContain(expectedHomeUrl);
    console.log(`Verified home page URL: ${currentUrl}`);
  }

  /**
   * Click on Self Study navigation item
   * This should navigate to /school/aitutor/syllabus route
   */
  async clickSelfStudyNav(): Promise<void> {
    console.log('Clicking Self Study navigation item...');

    // Wait for the navigation item to be visible
    await this.waitForElementVisible('[data-testid="nav-item-Self Study"]');

    // Click the Self Study navigation item
    await this.selfStudyNavItem.click();

    console.log('Self Study navigation item clicked');
  }

  /**
   * Wait for navigation to self-study page to complete
   * Expected navigation to: http://localhost:3000/school/aitutor/syllabus
   */
  async waitForSelfStudyNavigation(): Promise<void> {
    console.log('Waiting for navigation to self-study page...');

    // Wait for navigation to complete
    await this.waitForNavigation();

    // Wait for the expected self-study URL
    const expectedSelfStudyUrl = '/school/aitutor/syllabus';
    await this.waitForUrl(expectedSelfStudyUrl, 15000);

    // Verify we've navigated to the correct URL
    const currentUrl = this.getCurrentUrl();
    expect(currentUrl).toContain(expectedSelfStudyUrl);
    console.log(`Successfully navigated to self-study page: ${currentUrl}`);
  }

  /**
   * Complete navigation from home page to self-study page
   * This orchestrates the full home page flow as specified in requirements
   */
  async navigateToSelfStudy(): Promise<void> {
    console.log('Starting navigation to Self Study from Home page...');

    // Step 1: Verify we're on home page (with wait time as specified)
    await this.verifyHomePage();

    // Step 2: Click Self Study navigation item
    await this.clickSelfStudyNav();

    // Step 3: Wait for and verify navigation to self-study page
    await this.waitForSelfStudyNavigation();

    console.log('Navigation to Self Study completed successfully');
  }

  /**
   * Verify home page elements are loaded and visible
   * Useful for ensuring page is fully loaded before interaction
   */
  async verifyHomePageElements(): Promise<void> {
    // Verify Self Study navigation item is present
    await expect(this.selfStudyNavItem).toBeVisible();
    console.log('Home page navigation elements verified');
  }

  /**
   * Check if we're currently on the home page
   * Utility method for test flow validation
   */
  async isOnHomePage(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl.includes('/school/aitutor/home');
  }

  /**
   * Get all available navigation items (for future test expansion)
   * This can help identify other navigation options on the home page
   */
  async getNavigationItems(): Promise<string[]> {
    // Look for elements with nav-item pattern in their test-id
    const navItems = await this.page.locator('[data-testid^="nav-item-"]').all();
    const navTexts: string[] = [];

    for (const item of navItems) {
      const text = await item.textContent();
      if (text) navTexts.push(text.trim());
    }

    console.log(`Found navigation items: ${navTexts.join(', ')}`);
    return navTexts;
  }

  /**
   * Wait for home page to be fully loaded
   * Ensures all dynamic content is ready before proceeding
   */
  async waitForHomePageLoad(): Promise<void> {
    await this.waitForPageLoad();

    // Additional wait for any dynamic loading on home page
    await this.wait(1500);

    // Verify key elements are present
    await this.verifyHomePageElements();

    console.log('Home page fully loaded and verified');
  }
}