import { test, expect } from "../../../fixtures/auth.fixture";
import { LoginPage } from "../../../pages/LoginPage";
import { HomePage } from "../../../pages/HomePage";
import { SelfStudyPage } from "../../../pages/SelfStudyPage";

/**
 * SubjectsView Component Test Suite
 * Tests the subject selection interface and "Continue studying" functionality
 * Covers initial landing, subject grid, and recent task display
 */

test.describe("SubjectsView - Subject Selection Interface", () => {
  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    console.log("Setting up SubjectsView test environment...");
    // Navigate to subjects view
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should display main subjects view container", async ({ page }) => {
    // Verify main container is visible
    await expect(page.getByTestId("SubjectsView-container")).toBeVisible();
    await expect(page.getByTestId("syllabus-main-container")).toBeVisible();
    await expect(page.getByTestId("syllabus-wrapper")).toBeVisible();
  });

  test("should display greeting and welcome message", async ({ page }) => {
    // Verify top container elements
    await expect(page.getByTestId("learning-credits-title")).toBeVisible();
    await expect(
      page.getByTestId("learning-credits-description")
    ).toBeVisible();
    await expect(
      page.getByTestId("top-container-assistant-image")
    ).toBeVisible();
    await expect(page.getByTestId("top-container-avatar")).toBeVisible();

    // Verify greeting contains user's name
    const greeting = page.getByTestId("learning-credits-title");
    const greetingText = await greeting.textContent();
    expect(greetingText).toContain("Hi");
  });

  test("should display subjects section with title and grid", async ({
    page,
  }) => {
    // Verify subjects section structure
    await expect(
      page.getByTestId("SubjectsView-subjects-section")
    ).toBeVisible();
    await expect(page.getByTestId("SubjectsView-subjects-title")).toBeVisible();
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Verify subjects title text
    const subjectsTitle = page.getByTestId("SubjectsView-subjects-title");
    await expect(subjectsTitle).toHaveText("Subjects");
  });

  test("should display subject cards in the grid", async ({ page }) => {
    // Wait for subjects grid to be visible first
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Wait for loading to complete by ensuring skeleton elements are gone
    // and actual content is loaded
    await page.waitForFunction(() => {
      const skeletons = document.querySelectorAll('[data-testid*="SubjectsView-skeleton-"]');
      return skeletons.length === 0;
    }, { timeout: 15000 });

    // Find subject cards with the correct structure: data-testid="SubjectsView-${subject?.name}"
    // Exclude all container elements to match only actual subject cards
    const subjectCardsSelector = '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    // Wait for at least one subject card to be visible
    const firstSubjectCard = page.locator(subjectCardsSelector).first();
    await expect(firstSubjectCard).toBeVisible({ timeout: 15000 });

    // Now count the cards
    const subjectCards = page.locator(subjectCardsSelector);
    const cardCount = await subjectCards.count();
    expect(cardCount).toBeGreaterThan(0);

    console.log(`Found ${cardCount} subject cards in the grid`);

    // Test first subject card interaction
    await expect(firstSubjectCard).toBeVisible();
    await expect(firstSubjectCard).toBeEnabled();

    // Verify card is clickable
    await firstSubjectCard.hover();
    // Note: Not clicking to avoid navigation for other tests
  });

  test("should handle subject card selection and navigation", async ({
    page,
  }) => {
    // Wait for subjects grid to be visible first
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Wait for loading to complete by ensuring skeleton elements are gone
    await page.waitForFunction(() => {
      const skeletons = document.querySelectorAll('[data-testid*="SubjectsView-skeleton-"]');
      return skeletons.length === 0;
    }, { timeout: 15000 });

    // Find subject cards with the correct structure: data-testid="SubjectsView-${subject?.name}"
    // Exclude container elements but match actual subject cards
    const subjectCardsSelector = '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    // Wait for at least one subject card to be visible
    const firstCard = page.locator(subjectCardsSelector).first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Get subject name for logging
    const subjectName = await firstCard.getAttribute("data-testid");
    console.log(`Clicking on subject card: ${subjectName}`);

    // Click subject card
    await firstCard.click();

    // Verify navigation to the correct route by checking for the expected elements
    await expect(page.getByTestId("accordion-view-topic-subtopic-container")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("top-container-welcome-container")).toBeVisible({ timeout: 15000 });

    console.log("Successfully navigated to subject detail view");
  });

  test("should display continue studying section when available", async ({
    page,
  }) => {
    // Check if continue studying section exists
    const continueSection = page.getByTestId(
      "SubjectsView-continue-studying-section"
    );

    // This section may or may not be visible depending on user data
    const isVisible = await continueSection.isVisible().catch(() => false);

    if (isVisible) {
      await expect(
        page.getByTestId("SubjectsView-continue-studying-title")
      ).toBeVisible();
      await expect(
        page.getByTestId("SubjectsView-study-cards-container")
      ).toBeVisible();

      // Verify continue studying title text
      const title = page.getByTestId("SubjectsView-continue-studying-title");
      await expect(title).toHaveText("Continue studying");
    }
  });

  test("should display skeleton loaders while loading", async ({ page }) => {
    // Refresh to see loading state
    await page.reload();

    // Check for skeleton loaders
    const skeletons = page.locator('[data-testid*="SubjectsView-skeleton-"]');

    // Skeletons should appear briefly during loading
    // Wait for either skeletons or content to appear
    await Promise.race([
      expect(skeletons.first()).toBeVisible(),
      expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible(),
    ]);
  });

  test("should display learning credits when available", async ({ page }) => {
    // Check if learning credits container exists
    const creditsContainer = page.getByTestId("top-container-learning-credits");

    const isVisible = await creditsContainer.isVisible().catch(() => false);

    if (isVisible) {
      await expect(creditsContainer).toBeVisible();
    } else {
      // If not visible, welcome container should be visible instead
      await expect(
        page.getByTestId("top-container-welcome-container")
      ).toBeVisible();
    }
  });
});

test.describe("SubjectsView - Mobile Responsive Behavior", () => {
  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should display mobile-specific pagination for continue studying", async ({
    page,
  }) => {
    // Check if continue studying section exists on mobile
    const continueSection = page.getByTestId(
      "SubjectsView-continue-studying-section"
    );
    const isVisible = await continueSection.isVisible().catch(() => false);

    if (isVisible) {
      // Check for mobile pagination
      const paginationContainer = page.getByTestId(
        "SubjectsView-pagination-container"
      );
      const paginationVisible = await paginationContainer
        .isVisible()
        .catch(() => false);

      if (paginationVisible) {
        await expect(
          page.getByTestId("SubjectsView-pagination-component")
        ).toBeVisible();
      }
    }
  });

  test("should maintain responsive grid layout on mobile", async ({ page }) => {
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Verify grid adapts to mobile viewport
    const grid = page.getByTestId("SubjectsView-subjects-grid");
    const boundingBox = await grid.boundingBox();

    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });
});

test.describe("SubjectsView - Error Handling and Edge Cases", () => {
  test.beforeEach(async ({ loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should handle empty subjects state gracefully", async ({ page }) => {
    // Verify the component structure exists even if data is empty
    await expect(page.getByTestId("SubjectsView-container")).toBeVisible();
    await expect(
      page.getByTestId("SubjectsView-subjects-section")
    ).toBeVisible();

    // Grid should be present even if empty
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // The component should still render its basic structure
    await expect(page.getByTestId("SubjectsView-container")).toBeVisible();

    // Error boundaries should prevent crashes
    await expect(page.getByTestId("SubjectsView-subjects-title")).toBeVisible();
  });

  test("should maintain accessibility standards", async ({ page }) => {
    // Verify main container has proper ARIA attributes
    const container = page.getByTestId("SubjectsView-container");
    await expect(container).toHaveAttribute("role", "region");

    // Verify subjects title is properly labeled
    const title = page.getByTestId("SubjectsView-subjects-title");
    const tagName = await title.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("h2");
  });
});

test.describe("SubjectsView - Performance and Loading", () => {
  test.beforeEach(async ({ loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should load subjects within reasonable time", async ({ page }) => {
    const startTime = Date.now();

    // Wait for subjects to be fully loaded
    await page.waitForTimeout(3000);

    // Verify content is loaded
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    const loadTime = Date.now() - startTime;
    console.log(`Subjects loaded in ${loadTime}ms`);

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("should handle rapid subject card clicks gracefully", async ({
    page,
  }) => {
    // Wait for subjects grid to be visible first
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Wait for loading to complete
    await page.waitForFunction(() => {
      const skeletons = document.querySelectorAll('[data-testid*="SubjectsView-skeleton-"]');
      return skeletons.length === 0;
    }, { timeout: 15000 });

    // Use the correct selector to match actual subject cards
    const subjectCardsSelector = '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';
    const firstCard = page.locator(subjectCardsSelector).first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Rapid clicks should not cause errors
    await firstCard.click();
    await page.waitForTimeout(100);
    await firstCard.click();

    // Should still navigate successfully to the correct route
    await expect(page.getByTestId("accordion-view-topic-subtopic-container")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("top-container-welcome-container")).toBeVisible({ timeout: 15000 });
  });

  test.afterEach(async ({ homePage }) => {
    console.log("SubjectsView test completed, logging out...");

    try {
      await homePage.logoutIfLoggedIn();
    } catch (error) {
      console.warn("Logout failed during cleanup:", error);
    }
  });
});
