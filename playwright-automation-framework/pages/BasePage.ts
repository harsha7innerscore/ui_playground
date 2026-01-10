import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page object containing common functionality shared across all pages
 * All page objects should extend this base class
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param url - The URL to navigate to (can be relative or absolute)
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for the page to be fully loaded
   * @param state - Load state to wait for ('load', 'domcontentloaded', 'networkidle')
   */
  async waitForPageLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Wait for a specific element to be visible
   * @param locator - The element locator
   * @param timeout - Maximum wait time in milliseconds
   */
  async waitForElement(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click an element with retry logic
   * @param locator - The element to click
   * @param maxRetries - Maximum number of retry attempts
   */
  async clickWithRetry(locator: Locator, maxRetries = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input field with text
   * @param locator - The input element
   * @param text - Text to fill
   * @param options - Fill options
   */
  async fillInput(locator: Locator, text: string, options?: { force?: boolean }): Promise<void> {
    await locator.clear();
    await locator.fill(text, options);
  }

  /**
   * Get the current page title
   * @returns The page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current URL
   * @returns The current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Take a screenshot of the current page
   * @param path - Path to save the screenshot
   */
  async takeScreenshot(path?: string): Promise<Buffer> {
    return await this.page.screenshot({ path, fullPage: true });
  }

  /**
   * Scroll element into view
   * @param locator - Element to scroll into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for navigation to complete
   * @param url - Optional URL pattern to wait for
   */
  async waitForNavigation(url?: string | RegExp): Promise<void> {
    await this.page.waitForURL(url || '**');
  }

  /**
   * Check if an element is visible
   * @param locator - Element to check
   * @returns True if visible, false otherwise
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if an element is enabled
   * @param locator - Element to check
   * @returns True if enabled, false otherwise
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Get text content of an element
   * @param locator - Element to get text from
   * @returns Text content
   */
  async getTextContent(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Get attribute value of an element
   * @param locator - Element to get attribute from
   * @param attribute - Attribute name
   * @returns Attribute value
   */
  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return await locator.getAttribute(attribute);
  }

  /**
   * Wait for element to be hidden
   * @param locator - Element to wait for
   * @param timeout - Maximum wait time
   */
  async waitForElementToBeHidden(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Hover over an element
   * @param locator - Element to hover over
   */
  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /**
   * Double click an element
   * @param locator - Element to double click
   */
  async doubleClick(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /**
   * Right click an element
   * @param locator - Element to right click
   */
  async rightClick(locator: Locator): Promise<void> {
    await locator.click({ button: 'right' });
  }

  /**
   * Press a key
   * @param key - Key to press
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Reload the current page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
  }

  /**
   * Check if the page URL contains specific text
   * @param text - Text to search for in URL
   * @returns True if URL contains text
   */
  urlContains(text: string): boolean {
    return this.getCurrentUrl().includes(text);
  }

  /**
   * Verify page title
   * @param expectedTitle - Expected page title
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Verify current URL
   * @param expectedUrl - Expected URL (can be string or regex)
   */
  async verifyUrl(expectedUrl: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }
}