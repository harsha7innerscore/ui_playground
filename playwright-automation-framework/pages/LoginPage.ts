import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object for the Login page
 * Encapsulates login functionality and page elements
 */
export class LoginPage extends BasePage {
  // Locators for page elements
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly signUpLink: Locator;
  private readonly errorMessage: Locator;
  private readonly loginForm: Locator;
  private readonly rememberMeCheckbox: Locator;

  // Password reset form locators
  private readonly otpInput: Locator;
  private readonly newPasswordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly passwordResetSubmitButton: Locator;
  private readonly passwordResetErrorMessage: Locator;
  private readonly resendOtpLink: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators using data-testid (preferred) and fallback selectors
    this.emailInput = page
      .getByTestId("login-user-id-input")
      .or(page.locator('input[type="text"]'))
      .or(page.locator('input[type="email"]'));
    this.passwordInput = page
      .locator("#login-password-input")
      .or(page.getByTestId("login-password"))
      .or(page.locator('input[type="password"]'));
    this.loginButton = page
      .getByTestId("login-submit-button")
      .or(page.getByRole("button", { name: /log.*in/i }));
    this.forgotPasswordLink = page
      .locator("#forgot-password-link")
      .or(page.getByText(/forgot.*password/i));
    this.signUpLink = page
      .getByTestId("signup-link")
      .or(page.getByText(/sign.*up/i));
    this.errorMessage = page
      .locator("#login-error-message")
      .or(page.locator(".error-message"))
      .or(page.locator(".error, .alert-danger"));
    this.loginForm = page
      .getByTestId("student-login-right-section")
      .or(page.locator("form"));
    this.rememberMeCheckbox = page
      .getByTestId("remember-me")
      .or(page.locator('input[type="checkbox"]'));

    // Initialize password reset form locators
    this.otpInput = page
      .locator("#password-reset-otp-input")
      .or(page.locator('input[type="tel"]'))
      .or(page.locator('input[inputmode="numeric"]'));
    this.newPasswordInput = page
      .locator("#password-reset-new-input")
      .or(page.locator('input[autocomplete="new-password"]'));
    this.confirmPasswordInput = page
      .locator("#password-reset-confirm-input")
      .or(page.locator('input[id*="confirm"]'));
    this.passwordResetSubmitButton = page
      .locator("#password-reset-submit")
      .or(page.getByRole("button", { name: /set.*password/i }));
    this.passwordResetErrorMessage = page
      .locator("#password-reset-error")
      .or(page.locator(".error-message"));
    this.resendOtpLink = page
      .getByText(/resend/i)
      .or(page.locator('text[class*="rensend-text"]'));
  }

  /**
   * Navigate to the login page
   */
  async navigateToLogin(): Promise<void> {
    await this.goto("http://localhost:3000/school/aitutor/student/aps");
    await this.waitForPageLoad();
  }

  /**
   * Perform login with email and password
   * @param email - User email address
   * @param password - User password
   * @param rememberMe - Whether to check remember me option
   */
  async login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<void> {
    await this.waitForLoginFormToBeVisible();

    // Fill email field
    await this.fillInput(this.emailInput, email);

    // Fill password field
    await this.fillInput(this.passwordInput, password);

    // Handle remember me checkbox if requested
    if (rememberMe) {
      await this.checkRememberMe();
    }

    // Submit login form
    await this.submitLogin();
  }

  /**
   * Submit the login form
   */
  async submitLogin(): Promise<void> {
    await this.clickWithRetry(this.loginButton);
  }

  /**
   * Fill only the email field
   * @param email - Email address
   */
  async fillEmail(email: string): Promise<void> {
    await this.fillInput(this.emailInput, email);
  }

  /**
   * Fill only the password field
   * @param password - Password
   */
  async fillPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }

  /**
   * Check the remember me checkbox
   */
  async checkRememberMe(): Promise<void> {
    const isChecked = await this.rememberMeCheckbox.isChecked();
    if (!isChecked) {
      await this.rememberMeCheckbox.check();
    }
  }

  /**
   * Click the forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickWithRetry(this.forgotPasswordLink);
  }

  /**
   * Click the sign up link
   */
  async clickSignUp(): Promise<void> {
    await this.clickWithRetry(this.signUpLink);
  }

  /**
   * Wait for the login form to be visible
   */
  async waitForLoginFormToBeVisible(): Promise<void> {
    await this.waitForElement(this.loginForm);
  }

  /**
   * Check if the login form is visible
   * @returns True if login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return await this.isVisible(this.loginForm);
  }

  /**
   * Check if error message is displayed
   * @returns True if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Get the error message text
   * @returns Error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getTextContent(this.errorMessage);
  }

  /**
   * Verify login form elements are present
   */
  async verifyLoginFormElements(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Verify login button is enabled
   */
  async verifyLoginButtonEnabled(): Promise<void> {
    await expect(this.loginButton).toBeEnabled();
  }

  /**
   * Verify login button is disabled
   */
  async verifyLoginButtonDisabled(): Promise<void> {
    await expect(this.loginButton).toBeDisabled();
  }

  /**
   * Verify error message contains specific text
   * @param expectedText - Expected error text
   */
  async verifyErrorMessage(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Get email input value
   * @returns Current value in email field
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Get password input value
   * @returns Current value in password field
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Check if remember me is checked
   * @returns True if remember me is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    return await this.rememberMeCheckbox.isChecked();
  }

  /**
   * Verify successful login redirect
   * @param expectedUrl - Expected URL after login (default: SchoolAI URL pattern)
   */
  async verifySuccessfulLogin(expectedUrl: string | RegExp = /\/school\/aitutor\/student\/aps|\/$/): Promise<void> {
    await this.waitForNavigation(expectedUrl);
    await this.verifyUrl(expectedUrl);
  }

  /**
   * Perform login and verify success
   * @param email - User email
   * @param password - User password
   * @param expectedRedirectUrl - Expected URL after successful login
   */
  async loginAndVerifySuccess(
    email: string,
    password: string,
    expectedRedirectUrl = "/"
  ): Promise<void> {
    await this.login(email, password);
    await this.verifySuccessfulLogin(expectedRedirectUrl);
  }

  // Password Reset Methods

  /**
   * Fill the OTP input field
   * @param otp - The OTP code (4 digits)
   */
  async fillOtp(otp: string): Promise<void> {
    await this.fillInput(this.otpInput, otp);
  }

  /**
   * Fill the new password field
   * @param password - New password
   */
  async fillNewPassword(password: string): Promise<void> {
    await this.fillInput(this.newPasswordInput, password);
  }

  /**
   * Fill the confirm password field
   * @param password - Confirm password
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.fillInput(this.confirmPasswordInput, password);
  }

  /**
   * Submit the password reset form
   */
  async submitPasswordReset(): Promise<void> {
    await this.clickWithRetry(this.passwordResetSubmitButton);
  }

  /**
   * Click the resend OTP link
   */
  async clickResendOtp(): Promise<void> {
    await this.clickWithRetry(this.resendOtpLink);
  }

  /**
   * Complete password reset flow
   * @param otp - OTP code
   * @param newPassword - New password
   * @param confirmPassword - Confirm password (defaults to newPassword)
   */
  async resetPassword(
    otp: string,
    newPassword: string,
    confirmPassword = newPassword
  ): Promise<void> {
    await this.fillOtp(otp);
    await this.fillNewPassword(newPassword);
    await this.fillConfirmPassword(confirmPassword);
    await this.submitPasswordReset();
  }

  /**
   * Verify password reset form elements are present
   */
  async verifyPasswordResetFormElements(): Promise<void> {
    await expect(this.otpInput).toBeVisible();
    await expect(this.newPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.passwordResetSubmitButton).toBeVisible();
  }

  /**
   * Check if password reset error message is displayed
   * @returns True if error message is visible
   */
  async isPasswordResetErrorVisible(): Promise<boolean> {
    return await this.isVisible(this.passwordResetErrorMessage);
  }

  /**
   * Get the password reset error message text
   * @returns Error message text
   */
  async getPasswordResetErrorMessage(): Promise<string> {
    await this.waitForElement(this.passwordResetErrorMessage);
    return await this.getTextContent(this.passwordResetErrorMessage);
  }

  /**
   * Verify password reset button is enabled
   */
  async verifyPasswordResetButtonEnabled(): Promise<void> {
    await expect(this.passwordResetSubmitButton).toBeEnabled();
  }

  /**
   * Verify password reset button is disabled
   */
  async verifyPasswordResetButtonDisabled(): Promise<void> {
    await expect(this.passwordResetSubmitButton).toBeDisabled();
  }

  /**
   * Wait for password reset form to be visible
   */
  async waitForPasswordResetFormToBeVisible(): Promise<void> {
    await this.waitForElement(this.otpInput);
    await this.waitForElement(this.newPasswordInput);
    await this.waitForElement(this.confirmPasswordInput);
  }

  /**
   * Check if password reset form is visible
   * @returns True if password reset form is visible
   */
  async isPasswordResetFormVisible(): Promise<boolean> {
    return (
      (await this.isVisible(this.otpInput)) &&
      (await this.isVisible(this.newPasswordInput)) &&
      (await this.isVisible(this.confirmPasswordInput))
    );
  }
}
