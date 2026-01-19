import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * LoginPage - Page object for login functionality
 * Handles authentication flow for self-study feature testing
 */
export class LoginPage extends BasePage {
  // Element selectors using id attributes (since HTML uses id, not data-testid)
  private readonly emailInput = this.page.locator('[id="login-user-id-input"]');
  private readonly passwordInput = this.page.locator('[id="login-password-input"]');
  private readonly submitButton = this.page.locator('[id="login-submit-button"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page using BASE_URL from environment
   */
  async navigateToLogin(): Promise<void> {
    const loginUrl =
      process.env.BASE_URL ||
      "http://localhost:3000/school/aitutor/student/aps";
    await this.navigateTo(loginUrl);
    await this.verifyLoginPage();
  }

  /**
   * Verify we are on the login page by checking URL
   * This follows the requirement to "check based on the URL"
   */
  async verifyLoginPage(): Promise<void> {
    const currentUrl = this.getCurrentUrl();
    // Verify URL indicates this is a login page (contains login-related path)
    const isLoginPage =
      currentUrl.includes("student/aps") || currentUrl.includes("login");
    expect(isLoginPage).toBeTruthy();
    console.log(`Verified login page: ${currentUrl}`);
  }

  /**
   * Fill email input field with test user email from environment
   */
  async fillEmail(): Promise<void> {
    const email = process.env.TEST_USER_EMAIL || "Test1177";
    await this.waitForElementVisible('[id="login-user-id-input"]');
    await this.emailInput.clear();
    await this.emailInput.fill(email);

    // Verify email was entered correctly
    const filledValue = await this.emailInput.inputValue();
    expect(filledValue).toBe(email);
    console.log(`Filled email: ${email}`);
  }

  /**
   * Fill password input field with test user password from environment
   */
  async fillPassword(): Promise<void> {
    const password = process.env.TEST_USER_PASSWORD || "Test@123";
    await this.waitForElementVisible('[id="login-password-input"]');
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);

    // Verify password was entered (check length for security)
    const filledValue = await this.passwordInput.inputValue();
    expect(filledValue.length).toBe(password.length);
    console.log("Password filled successfully");
  }

  /**
   * Click the submit/login button
   */
  async clickSubmitButton(): Promise<void> {
    await this.waitForElementVisible('[id="login-submit-button"]');
    await this.submitButton.click();
    console.log("Login submit button clicked");
  }

  /**
   * Wait for login redirect to complete
   * Expected redirect to: http://localhost:3000/school/aitutor/home
   */
  async waitForLoginRedirect(): Promise<void> {
    // Wait for navigation to complete after login
    await this.waitForNavigation();

    // Verify redirect to the expected home page URL
    const expectedHomeUrl = "/school/aitutor/home";
    await this.waitForUrl(expectedHomeUrl, 15000);

    const currentUrl = this.getCurrentUrl();
    expect(currentUrl).toContain(expectedHomeUrl);
    console.log(`Successfully redirected to home page: ${currentUrl}`);
  }

  /**
   * Complete login flow with credentials from environment variables
   * This is the main method that orchestrates the entire login process
   */
  async login(): Promise<void> {
    console.log("Starting login flow...");

    // Step 1: Navigate to login page and verify URL
    await this.navigateToLogin();

    // Step 2: Fill credentials from environment variables
    await this.fillEmail();
    await this.fillPassword();

    // Step 3: Submit login form
    await this.clickSubmitButton();

    // Step 4: Wait for and verify successful redirect
    await this.waitForLoginRedirect();

    console.log("Login flow completed successfully");
  }

  /**
   * Check if already logged in by checking current URL
   * Useful for test setup optimization
   */
  async isLoggedIn(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl.includes("/school/aitutor/home");
  }

  /**
   * Perform login with custom credentials (for future test scenarios)
   * @param email - User email
   * @param password - User password
   */
  async loginWith(email: string, password: string): Promise<void> {
    console.log(`Starting login flow with custom credentials for: ${email}`);

    await this.navigateToLogin();

    // Fill custom credentials
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);

    await this.clickSubmitButton();
    await this.waitForLoginRedirect();

    console.log("Custom login flow completed successfully");
  }

  /**
   * Verify login form elements are present and visible
   * Useful for initial page load validation
   */
  async verifyLoginFormElements(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    console.log("Login form elements verified");
  }
}
