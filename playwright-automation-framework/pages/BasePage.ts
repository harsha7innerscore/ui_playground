import { Page, expect } from '@playwright/test';

/**
 * BasePage - Common functionality for all page objects
 * Following the Page Object Model pattern for self-study feature testing
 */
export class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  /**
   * Navigate to a specific path
   * @param path - Path to navigate to (relative to baseUrl)
   */
  async navigateTo(path: string): Promise<void> {
    const fullUrl = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    await this.page.goto(fullUrl);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   * Uses domcontentloaded state for better reliability
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Additional wait to ensure dynamic content is loaded
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for a specific URL pattern with timeout
   * @param urlPattern - URL pattern to wait for (can be partial URL)
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForUrl(urlPattern: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(`**${urlPattern}**`, { timeout });
  }

  /**
   * Verify current URL contains expected pattern
   * @param expectedUrlPattern - Pattern that should be present in URL
   */
  async verifyUrl(expectedUrlPattern: string): Promise<void> {
    const currentUrl = this.page.url();
    expect(currentUrl).toContain(expectedUrlPattern);
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for element to be visible with retry logic
   * @param selector - Element selector
   * @param timeout - Maximum time to wait
   */
  async waitForElementVisible(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(selector).waitFor({
      state: 'visible',
      timeout
    });
  }

  /**
   * Click element with wait and retry logic
   * @param selector - Element selector
   * @param maxRetries - Maximum number of retry attempts
   */
  async clickWithRetry(selector: string, maxRetries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForElementVisible(selector);
        await this.page.locator(selector).click();
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`Failed to click element "${selector}" after ${maxRetries} attempts: ${error}`);
        }
        console.log(`Click attempt ${attempt} failed, retrying...`);
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input field with validation
   * @param selector - Input field selector
   * @param value - Value to fill
   */
  async fillInput(selector: string, value: string): Promise<void> {
    await this.waitForElementVisible(selector);
    const input = this.page.locator(selector);
    await input.clear();
    await input.fill(value);

    // Verify the value was entered correctly
    const filledValue = await input.inputValue();
    expect(filledValue).toBe(value);
  }

  /**
   * Get element by test ID (preferred selector strategy)
   * @param testId - data-testid attribute value
   */
  getByTestId(testId: string) {
    return this.page.getByTestId(testId);
  }

  /**
   * Wait for navigation to complete
   * Useful after form submissions or link clicks
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForPageLoad();
  }

  /**
   * Take screenshot for debugging
   * @param filename - Screenshot filename (without extension)
   */
  async takeScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/${filename}.png`,
      fullPage: true
    });
  }

  /**
   * Check if element exists on page
   * @param selector - Element selector
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify page title contains expected text
   * @param expectedTitle - Expected title text
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }

  /**
   * Wait for specific amount of time
   * Use sparingly - prefer waiting for specific conditions
   * @param milliseconds - Time to wait in milliseconds
   */
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }
}