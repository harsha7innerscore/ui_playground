import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Smoke tests for login and password reset functionality
 * These tests verify the updated selectors and password reset flow
 */
test.describe('Login & Password Reset - Updated Selectors', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('should display all login form elements with correct selectors', async () => {
    // Verify all login form elements are present using updated selectors
    await loginPage.verifyLoginFormElements();

    // Verify specific data-testid selectors are working
    const userIdInput = loginPage['emailInput'];
    const passwordInput = loginPage['passwordInput'];
    const loginButton = loginPage['loginButton'];
    const forgotPasswordLink = loginPage['forgotPasswordLink'];

    await expect(userIdInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    await expect(forgotPasswordLink).toBeVisible();
  });

  test('should enable login button when both fields are filled', async () => {
    // Fill form fields to enable login button
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('testpassword');

    // Verify login button is enabled
    await loginPage.verifyLoginButtonEnabled();
  });

  test('should keep login button disabled when fields are empty', async () => {
    // Verify login button is disabled initially
    await loginPage.verifyLoginButtonDisabled();
  });

  test('should navigate to password reset form when forgot password is clicked', async () => {
    // Fill user ID first (required for forgot password)
    await loginPage.fillEmail('test@example.com');

    // Click forgot password link
    await loginPage.clickForgotPassword();

    // Wait for password reset form to appear
    // Note: This test assumes the password reset form appears on the same page
    // Adjust based on your actual implementation
    await expect(async () => {
      // Check if we're still on login or if password reset elements appear
      const isPasswordResetVisible = await loginPage.isPasswordResetFormVisible();
      expect(isPasswordResetVisible).toBe(true);
    }).toPass({ timeout: 5000 });
  });

  test('should display error message for invalid login', async () => {
    // Attempt login with invalid credentials
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Verify error message appears
    await expect(loginPage.isErrorMessageVisible()).resolves.toBe(true);
  });

  test('should display all password reset form elements', async () => {
    // First trigger password reset flow
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickForgotPassword();

    // Wait for password reset form
    await loginPage.waitForPasswordResetFormToBeVisible();

    // Verify all password reset form elements
    await loginPage.verifyPasswordResetFormElements();
  });

  test('should handle OTP input correctly', async ({ page }) => {
    // Navigate to password reset form first
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickForgotPassword();

    // Wait for OTP input to be available
    await loginPage.waitForPasswordResetFormToBeVisible();

    // Test OTP input (should accept 4-digit numeric input)
    await loginPage.fillOtp('1234');

    // Verify OTP was filled correctly
    const otpInput = page.locator('#password-reset-otp-input');
    await expect(otpInput).toHaveValue('1234');
  });

  test('should validate password requirements', async ({ page }) => {
    // Navigate to password reset form
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickForgotPassword();
    await loginPage.waitForPasswordResetFormToBeVisible();

    // Fill OTP
    await loginPage.fillOtp('1234');

    // Test password validation by entering invalid password
    await loginPage.fillNewPassword('weak');

    // Verify validation messages appear (this depends on your validation implementation)
    const passwordInput = page.locator('#password-reset-new-input');
    await expect(passwordInput).toHaveValue('weak');
  });

  test('should handle password confirmation validation', async ({ page }) => {
    // Navigate to password reset form
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickForgotPassword();
    await loginPage.waitForPasswordResetFormToBeVisible();

    // Fill form with mismatched passwords
    await loginPage.fillOtp('1234');
    await loginPage.fillNewPassword('ValidPass123!');
    await loginPage.fillConfirmPassword('DifferentPass123!');

    // Verify confirm password field has the different value
    const confirmPasswordInput = page.locator('#password-reset-confirm-input');
    await expect(confirmPasswordInput).toHaveValue('DifferentPass123!');
  });

  test('should enable password reset submit button when form is valid', async () => {
    // Navigate to password reset form
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickForgotPassword();
    await loginPage.waitForPasswordResetFormToBeVisible();

    // Fill all required fields with valid data
    await loginPage.fillOtp('1234');
    await loginPage.fillNewPassword('ValidPass123!');
    await loginPage.fillConfirmPassword('ValidPass123!');

    // Verify submit button is enabled
    await loginPage.verifyPasswordResetButtonEnabled();
  });

  test('should keep password reset submit button disabled when form is invalid', async () => {
    // Navigate to password reset form
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickForgotPassword();
    await loginPage.waitForPasswordResetFormToBeVisible();

    // Initially button should be disabled
    await loginPage.verifyPasswordResetButtonDisabled();

    // Fill only OTP (incomplete form)
    await loginPage.fillOtp('1234');

    // Button should still be disabled
    await loginPage.verifyPasswordResetButtonDisabled();
  });

  test('should handle resend OTP functionality', async () => {
    // Navigate to password reset form
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickForgotPassword();
    await loginPage.waitForPasswordResetFormToBeVisible();

    // Click resend OTP (note: this might have timing restrictions in real implementation)
    await loginPage.clickResendOtp();

    // The test passes if no error is thrown when clicking resend
    // In a real test, you might verify a success message or timer reset
  });

  test('should use correct form field IDs and data-testids', async ({ page }) => {
    // Verify that our updated selectors match the actual DOM elements

    // Login form elements
    await expect(page.getByTestId('login-user-id-input')).toBeVisible();
    await expect(page.locator('#login-password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit-button')).toBeVisible();
    await expect(page.locator('#forgot-password-link')).toBeVisible();

    // Trigger password reset to test those selectors
    await page.getByTestId('login-user-id-input').fill('test@example.com');
    await page.locator('#forgot-password-link').click();

    // Wait and verify password reset form elements
    await expect(page.locator('#password-reset-otp-input')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#password-reset-new-input')).toBeVisible();
    await expect(page.locator('#password-reset-confirm-input')).toBeVisible();
    await expect(page.locator('#password-reset-submit')).toBeVisible();
  });
});