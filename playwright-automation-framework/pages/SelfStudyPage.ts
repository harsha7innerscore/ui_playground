import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SelfStudyPage - Page object for self-study page functionality
 * Handles verification and interaction with the self-study/syllabus page
 */
export class SelfStudyPage extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify we are on the self-study page by checking URL
   * Includes waiting period as specified in requirements: "wait for sometime before doing this"
   */
  async verifySelfStudyPage(): Promise<void> {
    console.log('Waiting before verifying self-study page URL...');

    // Wait for some time as specified in requirements
    await this.wait(2000);

    // Wait for the expected self-study page URL
    const expectedSelfStudyUrl = '/school/aitutor/syllabus';
    await this.waitForUrl(expectedSelfStudyUrl, 10000);

    // Verify current URL contains the expected self-study page path
    const currentUrl = this.getCurrentUrl();
    expect(currentUrl).toContain(expectedSelfStudyUrl);
    console.log(`Verified self-study page URL: ${currentUrl}`);
  }

  /**
   * Check if we're currently on the self-study page
   * Utility method for test flow validation
   */
  async isOnSelfStudyPage(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl.includes('/school/aitutor/syllabus');
  }

  /**
   * Wait for self-study page to be fully loaded
   * Ensures the page is ready for interaction if needed in future tests
   */
  async waitForSelfStudyPageLoad(): Promise<void> {
    await this.waitForPageLoad();

    // Additional wait for any dynamic loading on self-study page
    await this.wait(1500);

    console.log('Self-study page fully loaded');
  }

  /**
   * Complete self-study page verification flow
   * This orchestrates the full self-study page verification as specified in requirements
   */
  async completeSelfStudyVerification(): Promise<void> {
    console.log('Starting self-study page verification...');

    // Step 1: Verify we're on self-study page (with wait time as specified)
    await this.verifySelfStudyPage();

    // Step 2: Ensure page is fully loaded
    await this.waitForSelfStudyPageLoad();

    console.log('Self-study page verification completed successfully');
  }

  /**
   * Get page title for validation
   * Useful for future test scenarios that might need title verification
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if any study content is visible
   * This can be expanded in future to verify specific self-study elements
   */
  async hasStudyContent(): Promise<boolean> {
    // This is a placeholder for future expansion
    // For now, just check if we're on the correct URL
    return await this.isOnSelfStudyPage();
  }

  /**
   * Navigate directly to self-study page (bypass login/home flow)
   * Useful for isolated self-study page tests in the future
   */
  async navigateDirectlyToSelfStudy(): Promise<void> {
    const selfStudyUrl = `${this.baseUrl}/school/aitutor/syllabus`;
    await this.navigateTo(selfStudyUrl);
    await this.waitForSelfStudyPageLoad();
    console.log('Navigated directly to self-study page');
  }

  /**
   * Take screenshot for visual validation
   * Can be used for visual regression testing in future
   */
  async capturePageScreenshot(filename: string = 'self-study-page'): Promise<void> {
    await this.takeScreenshot(filename);
    console.log(`Screenshot captured: ${filename}.png`);
  }
}