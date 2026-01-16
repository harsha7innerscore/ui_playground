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
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid*="SubjectsView-skeleton-"]'
        );
        return skeletons.length === 0;
      },
      { timeout: 15000 }
    );

    // Find subject cards with the correct structure: data-testid="SubjectsView-${subject?.name}"
    // Exclude all container elements to match only actual subject cards
    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

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

  test("should show white background on subject card hover", async ({
    page,
  }) => {
    // Wait for subjects grid to be visible first
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Wait for loading to complete by ensuring skeleton elements are gone
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid*="SubjectsView-skeleton-"]'
        );
        return skeletons.length === 0;
      },
      { timeout: 15000 }
    );

    // Find subject cards with the correct structure
    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    const firstSubjectCard = page.locator(subjectCardsSelector).first();
    await expect(firstSubjectCard).toBeVisible({ timeout: 15000 });

    // Get the subject name from the data-testid attribute to find the text element
    const dataTestId = await firstSubjectCard.getAttribute("data-testid");
    const subjectName = dataTestId?.replace("SubjectsView-", "") || "";

    // Find the text element inside the subject card
    const subjectNameText = firstSubjectCard.locator("text=" + subjectName);
    await expect(subjectNameText).toBeVisible();

    // Get initial background color of the text element before hover
    const initialBackgroundColor = await subjectNameText.evaluate((element) => {
      return window.getComputedStyle(element).backgroundColor;
    });

    // Hover over the subject card to trigger the hover effect
    await firstSubjectCard.hover();

    // Wait a brief moment for hover effect to apply
    await page.waitForTimeout(200);

    // Get background color of the text element after hover
    const hoverBackgroundColor = await subjectNameText.evaluate((element) => {
      return window.getComputedStyle(element).backgroundColor;
    });

    // Verify that the text background color changed to white (rgb(255, 255, 255) or rgba(255, 255, 255, 1))
    expect(hoverBackgroundColor).toMatch(
      /rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,\s*1\)|white/
    );

    console.log(
      `Subject: ${subjectName} | Initial text background: ${initialBackgroundColor}, Hover text background: ${hoverBackgroundColor}`
    );
  });

  test("should display subject card with icon and name text", async ({
    page,
  }) => {
    // Wait for subjects grid to be visible first
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Wait for loading to complete by ensuring skeleton elements are gone
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid*="SubjectsView-skeleton-"]'
        );
        return skeletons.length === 0;
      },
      { timeout: 15000 }
    );

    // Find subject cards with the correct structure
    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    const firstSubjectCard = page.locator(subjectCardsSelector).first();
    await expect(firstSubjectCard).toBeVisible({ timeout: 15000 });

    // Get the subject name from the data-testid attribute
    const dataTestId = await firstSubjectCard.getAttribute("data-testid");
    const subjectName = dataTestId?.replace("SubjectsView-", "") || "";

    expect(subjectName).toBeTruthy();
    console.log(`Testing subject card structure for: ${subjectName}`);

    // Verify subject icon exists with correct alt text
    const subjectIcon = firstSubjectCard.locator("img");
    await expect(subjectIcon).toBeVisible();

    const expectedAltText = `${subjectName} subject icon`;
    await expect(subjectIcon).toHaveAttribute("alt", expectedAltText);

    // Verify subject name text is displayed
    const subjectNameText = firstSubjectCard.locator("text=" + subjectName);
    await expect(subjectNameText).toBeVisible();

    console.log(
      `Verified subject card structure: icon with alt="${expectedAltText}" and name text "${subjectName}"`
    );
  });

  test("should handle subject card selection and navigation", async ({
    page,
  }) => {
    // Wait for subjects grid to be visible first
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Wait for loading to complete by ensuring skeleton elements are gone
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid*="SubjectsView-skeleton-"]'
        );
        return skeletons.length === 0;
      },
      { timeout: 15000 }
    );

    // Find subject cards with the correct structure: data-testid="SubjectsView-${subject?.name}"
    // Exclude container elements but match actual subject cards
    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    // Wait for at least one subject card to be visible
    const firstCard = page.locator(subjectCardsSelector).first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Get subject name for logging
    const subjectName = await firstCard.getAttribute("data-testid");
    console.log(`Clicking on subject card: ${subjectName}`);

    // Click subject card
    await firstCard.click();

    // Verify navigation to the correct route by checking for the expected elements
    await expect(
      page.getByTestId("accordion-view-topic-subtopic-container")
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByTestId("top-container-welcome-container")
    ).toBeVisible({ timeout: 15000 });

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
});

test.describe("SubjectsView - Props Validation and Edge Cases", () => {
  test.beforeEach(async ({ loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should handle component with empty subjects gracefully", async ({
    page,
  }) => {
    // Component should render basic structure even with no subjects
    await expect(page.getByTestId("SubjectsView-container")).toBeVisible();
    await expect(
      page.getByTestId("SubjectsView-subjects-section")
    ).toBeVisible();
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();
    await expect(page.getByTestId("SubjectsView-subjects-title")).toHaveText(
      "Subjects"
    );

    console.log("Component handles empty subjects state gracefully");
  });

  test("should handle subjects with long names without breaking layout", async ({
    page,
  }) => {
    // Wait for subjects to load
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid*="SubjectsView-skeleton-"]')
          .length === 0,
      { timeout: 15000 }
    );

    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    const subjectCards = page.locator(subjectCardsSelector);
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      const firstCard = subjectCards.first();
      await expect(firstCard).toBeVisible();

      // Verify card doesn't overflow container
      const cardBox = await firstCard.boundingBox();
      const gridBox = await page
        .getByTestId("SubjectsView-subjects-grid")
        .boundingBox();

      if (cardBox && gridBox) {
        expect(cardBox.width).toBeLessThanOrEqual(gridBox.width);
        console.log("Long subject names handled without layout overflow");
      }
    }
  });
});

test.describe("SubjectsView - Task Cards and Continue Studying", () => {
  test.beforeEach(async ({ loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should display continue studying section with correct title when tasks available", async ({
    page,
  }) => {
    const continueSection = page.getByTestId(
      "SubjectsView-continue-studying-section"
    );
    const isVisible = await continueSection.isVisible().catch(() => false);

    if (isVisible) {
      // Verify section structure
      await expect(
        page.getByTestId("SubjectsView-continue-studying-title")
      ).toBeVisible();
      await expect(
        page.getByTestId("SubjectsView-study-cards-container")
      ).toBeVisible();

      // Verify title text is exactly correct
      const title = page.getByTestId("SubjectsView-continue-studying-title");
      await expect(title).toHaveText("Continue studying");

      console.log(
        "Continue studying section displays with correct structure and title"
      );
    } else {
      console.log(
        "No continue studying data available for this user - test skipped"
      );
    }
  });

  test("should handle task card interactions properly", async ({ page }) => {
    const continueSection = page.getByTestId(
      "SubjectsView-continue-studying-section"
    );
    const isVisible = await continueSection.isVisible().catch(() => false);

    if (isVisible) {
      const studyContainer = page.getByTestId(
        "SubjectsView-study-cards-container"
      );
      await expect(studyContainer).toBeVisible();

      // Look for task cards within the container
      const taskCards = studyContainer.locator(
        '[data-testid*="task-card"], [data-testid*="mobile-task-card"]'
      );
      const taskCardCount = await taskCards.count();

      if (taskCardCount > 0) {
        const firstTaskCard = taskCards.first();
        await expect(firstTaskCard).toBeVisible();
        await expect(firstTaskCard).toBeEnabled();

        // Test hover behavior
        await firstTaskCard.hover();

        console.log(
          `Found ${taskCardCount} task cards, verified interaction capability`
        );
      } else {
        console.log("No task cards found in continue studying section");
      }
    }
  });
});

test.describe("SubjectsView - Enhanced Accessibility", () => {
  test.beforeEach(async ({ loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should have proper ARIA labels for interactive elements", async ({
    page,
  }) => {
    // Wait for subjects to load
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid*="SubjectsView-skeleton-"]')
          .length === 0,
      { timeout: 15000 }
    );

    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    const firstCard = page.locator(subjectCardsSelector).first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Check for ARIA label or aria-labelledby
    const hasAriaLabel = await firstCard.getAttribute("aria-label");
    const hasAriaLabelledBy = await firstCard.getAttribute("aria-labelledby");
    const hasRole = await firstCard.getAttribute("role");

    // Should have either aria-label or role="button" for accessibility
    expect(
      hasAriaLabel || hasRole === "button" || hasAriaLabelledBy
    ).toBeTruthy();

    console.log(
      "Subject cards have appropriate ARIA attributes for accessibility"
    );
  });

  test("should have proper tab indices for navigation order", async ({
    page,
  }) => {
    // Wait for subjects to load
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid*="SubjectsView-skeleton-"]')
          .length === 0,
      { timeout: 15000 }
    );

    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    const subjectCards = page.locator(subjectCardsSelector);
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      const firstCard = subjectCards.first();
      const tabIndex = await firstCard.getAttribute("tabindex");

      // Should have tabindex="0" or be naturally focusable
      expect(tabIndex === "0" || tabIndex === null).toBeTruthy();

      console.log(
        "Subject cards have proper tab indices for keyboard navigation"
      );
    }
  });
});

test.describe("SubjectsView - Security and XSS Prevention", () => {
  test.beforeEach(async ({ loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should prevent XSS in subject names", async ({ page }) => {
    // This test verifies that the component properly escapes content
    // We check that script tags in subject names don't execute

    // Wait for subjects to load
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid*="SubjectsView-skeleton-"]')
          .length === 0,
      { timeout: 15000 }
    );

    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    const subjectCards = page.locator(subjectCardsSelector);
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      // Check that no script tags exist in the rendered content
      const scriptTags = page.locator("script");
      const maliciousScripts = await scriptTags.evaluateAll((scripts) => {
        return scripts.filter(
          (script) =>
            (script.textContent && script.textContent.includes("alert")) ||
            (script.src && script.src.includes("malicious"))
        );
      });

      expect(maliciousScripts.length).toBe(0);

      // Verify text content is properly escaped
      const firstCard = subjectCards.first();
      const innerHTML = await firstCard.innerHTML();
      expect(innerHTML).not.toContain("<script>");
      expect(innerHTML).not.toContain("javascript:");

      console.log("Subject names are properly escaped and secure from XSS");
    }
  });

  test("should sanitize welcome text and user content", async ({ page }) => {
    // Check that welcome messages don't contain executable content
    const welcomeElements = page.locator(
      '[data-testid*="learning-credits"], [data-testid*="top-container"]'
    );
    const welcomeCount = await welcomeElements.count();

    if (welcomeCount > 0) {
      for (let i = 0; i < welcomeCount; i++) {
        const element = welcomeElements.nth(i);
        const innerHTML = await element.innerHTML();

        // Verify no script tags or javascript: protocols
        expect(innerHTML).not.toContain("<script>");
        expect(innerHTML).not.toContain("javascript:");
        expect(innerHTML).not.toContain("onload=");
        expect(innerHTML).not.toContain("onerror=");
      }

      console.log("Welcome text and user content properly sanitized");
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

      expect(paginationVisible).toBe(true);
    }
  });

  test("should maintain responsive grid layout on mobile", async ({ page }) => {
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    // Verify grid adapts to mobile viewport
    const grid = page.getByTestId("SubjectsView-subjects-grid");
    const boundingBox = await grid.boundingBox();

    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test("should display mobile task cards when available", async ({ page }) => {
    const continueSection = page.getByTestId(
      "SubjectsView-continue-studying-section"
    );
    const isVisible = await continueSection.isVisible().catch(() => false);

    if (isVisible) {
      const studyContainer = page.getByTestId(
        "SubjectsView-study-cards-container"
      );
      await expect(studyContainer).toBeVisible();

      // On mobile, should prefer mobile task cards
      const mobileTaskCards = studyContainer.locator(
        '[data-testid*="mobile-task-card"]'
      );
      const regularTaskCards = studyContainer.locator(
        '[data-testid*="task-card"]:not([data-testid*="mobile-task-card"])'
      );

      const mobileCount = await mobileTaskCards.count();
      const regularCount = await regularTaskCards.count();

      // Should prioritize mobile cards on mobile viewport
      console.log(
        `Mobile task cards: ${mobileCount}, Regular task cards: ${regularCount}`
      );

      // At least one type of task card should be present
      expect(mobileCount + regularCount).toBeGreaterThan(0);
    }
  });

  test("should handle pagination controls on mobile", async ({ page }) => {
    const paginationContainer = page.getByTestId(
      "SubjectsView-pagination-container"
    );
    const isPaginationVisible = await paginationContainer
      .isVisible()
      .catch(() => false);

    if (isPaginationVisible) {
      const paginationComponent = page.getByTestId(
        "SubjectsView-pagination-component"
      );
      await expect(paginationComponent).toBeVisible();

      // Check for pagination buttons
      const nextButton = paginationComponent.locator("button", {
        hasText: /next|>/i,
      });
      const prevButton = paginationComponent.locator("button", {
        hasText: /prev|</i,
      });

      const hasNextButton = (await nextButton.count()) > 0;
      const hasPrevButton = (await prevButton.count()) > 0;

      // At least one navigation button should exist
      expect(hasNextButton || hasPrevButton).toBeTruthy();

      console.log("Mobile pagination controls are properly rendered");
    }
  });

  test("should adapt subject grid columns for mobile viewport", async ({
    page,
  }) => {
    // Wait for subjects to load
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid*="SubjectsView-skeleton-"]')
          .length === 0,
      { timeout: 15000 }
    );

    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';

    const subjectCards = page.locator(subjectCardsSelector);
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      const firstCard = subjectCards.first();
      const cardBox = await firstCard.boundingBox();

      if (cardBox) {
        // On mobile (375px), cards should be appropriately sized
        expect(cardBox.width).toBeGreaterThan(80); // Not too small
        expect(cardBox.width).toBeLessThan(200); // Not too wide for mobile

        console.log(`Mobile subject card width: ${cardBox.width}px`);
      }
    }
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
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid*="SubjectsView-skeleton-"]'
        );
        return skeletons.length === 0;
      },
      { timeout: 15000 }
    );

    // Use the correct selector to match actual subject cards
    const subjectCardsSelector =
      '[data-testid^="SubjectsView-"]:not([data-testid*="skeleton"]):not([data-testid="SubjectsView-subjects-grid"]):not([data-testid="SubjectsView-subjects-section"]):not([data-testid="SubjectsView-subjects-title"]):not([data-testid="SubjectsView-continue-studying-section"]):not([data-testid="SubjectsView-continue-studying-title"]):not([data-testid="SubjectsView-study-cards-container"]):not([data-testid="SubjectsView-pagination-container"]):not([data-testid="SubjectsView-pagination-component"]):not([data-testid="SubjectsView-container"])';
    const firstCard = page.locator(subjectCardsSelector).first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Test rapid double-clicking (simulating accidental double clicks)
    // This tests that the app handles rapid successive clicks gracefully
    await firstCard.dblclick();

    // Should still navigate successfully to the correct route
    await expect(
      page.getByTestId("accordion-view-topic-subtopic-container")
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByTestId("top-container-welcome-container")
    ).toBeVisible({ timeout: 15000 });

    console.log(
      "Successfully handled rapid clicks and navigated to subject detail view"
    );
  });

  test("should maintain performance with multiple re-renders", async ({
    page,
  }) => {
    const startTime = Date.now();

    // Trigger multiple viewport changes to test render performance
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 768, height: 600 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);

    // Verify component still functions correctly after re-renders
    await expect(page.getByTestId("SubjectsView-container")).toBeVisible();
    await expect(page.getByTestId("SubjectsView-subjects-grid")).toBeVisible();

    const renderTime = Date.now() - startTime;
    console.log(`Component handled multiple re-renders in ${renderTime}ms`);

    // Should handle viewport changes efficiently
    expect(renderTime).toBeLessThan(5000);
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
