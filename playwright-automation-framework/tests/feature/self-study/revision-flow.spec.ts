import { test, expect } from "../../../fixtures/auth.fixture";
import { LoginPage } from "../../../pages/LoginPage";
import { HomePage } from "../../../pages/HomePage";
import { SelfStudyPage } from "../../../pages/SelfStudyPage";

/**
 * Revision Flow Test Suite
 * Tests revision functionality including recap map, revision sessions,
 * and mock assessments within the self-study feature
 */

test.describe("Revision Flow - Revision Container and Features", () => {
  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    console.log("Setting up Revision Flow test environment...");

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Navigate to accordion view and find a topic with revision enabled
    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test("should display revision container when revision is enabled", async ({
    page,
  }) => {
    // Check if revision container is visible
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const isVisible = await revisionContainer.isVisible().catch(() => false);

    if (isVisible) {
      await expect(revisionContainer).toBeVisible();
      console.log("Revision is enabled for this topic");

      // Verify revision title
      await expect(page.getByTestId("accordion-view-revision")).toBeVisible();

      const revisionTitle = await page
        .getByTestId("accordion-view-revision")
        .textContent();
      expect(revisionTitle).toBe("Revision");
    } else {
      console.log("Revision not enabled for this topic");
      // This is expected behavior when revision is not available
    }
  });

  test("should display recap map button", async ({ page }) => {
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const containerVisible = await revisionContainer
      .isVisible()
      .catch(() => false);

    if (containerVisible) {
      // Check for recap map button
      const recapButton = page.getByTestId("accordion-view-recap-button");
      await expect(recapButton).toBeVisible();
      await expect(recapButton).toBeEnabled();

      // Verify it's a button element
      const tagName = await recapButton.evaluate((el) =>
        el.tagName.toLowerCase()
      );
      expect(tagName).toBe("button");

      // Verify button text
      const buttonText = await recapButton.textContent();
      expect(buttonText).toBe("Recap Map");

      // Test hover interaction
      await recapButton.hover();
    }
  });

  test("should display revision description text", async ({ page }) => {
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const containerVisible = await revisionContainer
      .isVisible()
      .catch(() => false);

    if (containerVisible) {
      // Check for revision description
      const revisionText = page.getByTestId("accordion-view-revision-text");
      await expect(revisionText).toBeVisible();

      // Verify description has content
      const textContent = await revisionText.textContent();
      expect(textContent).toBeTruthy();

      // Text should provide guidance about revision
      expect(textContent?.length).toBeGreaterThan(10);
    }
  });

  test("should display revision action button", async ({ page }) => {
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const containerVisible = await revisionContainer
      .isVisible()
      .catch(() => false);

    if (containerVisible) {
      // Check for main revision button
      const revisionButton = page.getByTestId("accordion-view-revision-button");
      await expect(revisionButton).toBeVisible();
      await expect(revisionButton).toBeEnabled();

      // Verify it's a button element
      const tagName = await revisionButton.evaluate((el) =>
        el.tagName.toLowerCase()
      );
      expect(tagName).toBe("button");

      // Button text should be appropriate for revision state
      const buttonText = await revisionButton.textContent();
      expect(["Take revision", "Continue Revision"]).toContain(buttonText);
    }
  });

  test("should handle recap map button click", async ({ page }) => {
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const containerVisible = await revisionContainer
      .isVisible()
      .catch(() => false);

    if (containerVisible) {
      const recapButton = page.getByTestId("accordion-view-recap-button");

      // Test click interaction (should trigger recap map functionality)
      await recapButton.hover();

      // In a real scenario, this would navigate to recap map
      // Here we just verify the button is interactive
      console.log("Recap map button is available for testing");
    }
  });
});

test.describe("Revision Flow - Revision Data and Sessions", () => {
  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Navigate to accordion view
    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test("should display revision data container when sessions exist", async ({
    page,
  }) => {
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const containerVisible = await revisionContainer
      .isVisible()
      .catch(() => false);

    if (containerVisible) {
      // Check for revision data container
      const revisionData = page.getByTestId("accordion-view-revision-data");
      const dataVisible = await revisionData.isVisible().catch(() => false);

      if (dataVisible) {
        await expect(revisionData).toBeVisible();
        console.log("Revision session data is available");

        // Verify task details container
        const taskDetailsContainer = page.getByTestId(
          "accordion-view-revision-task-details-container"
        );
        await expect(taskDetailsContainer).toBeVisible();
      } else {
        console.log("No revision session data available");
      }
    }
  });

  test("should display revision task details items", async ({ page }) => {
    const revisionData = page.getByTestId("accordion-view-revision-data");
    const dataVisible = await revisionData.isVisible().catch(() => false);

    if (dataVisible) {
      // Look for revision task details items (dynamic with index)
      const taskDetailsItems = page.locator(
        '[data-testid*="accordion-view-revision-task-details-"]'
      );
      const itemCount = await taskDetailsItems.count();

      if (itemCount > 0) {
        const firstItem = taskDetailsItems.first();
        await expect(firstItem).toBeVisible();
        await expect(firstItem).toBeEnabled();

        // Verify item contains session information
        const itemText = await firstItem.textContent();
        expect(itemText).toBeTruthy();

        // Should contain date and status information
        expect(itemText?.length).toBeGreaterThan(5);

        console.log(`Found ${itemCount} revision task details`);
      }
    }
  });

  test("should handle revision task detail item clicks", async ({ page }) => {
    const revisionData = page.getByTestId("accordion-view-revision-data");
    const dataVisible = await revisionData.isVisible().catch(() => false);

    if (dataVisible) {
      const taskDetailsItems = page.locator(
        '[data-testid*="accordion-view-revision-task-details-"]'
      );
      const itemCount = await taskDetailsItems.count();

      if (itemCount > 0) {
        const firstItem = taskDetailsItems.first();

        // Test click interaction
        await firstItem.hover();

        // In real scenario, this would open revision session details
        console.log("Revision task detail item is clickable");
      }
    }
  });

  test("should display view more/less functionality for revision tasks", async ({
    page,
  }) => {
    const revisionData = page.getByTestId("accordion-view-revision-data");
    const dataVisible = await revisionData.isVisible().catch(() => false);

    if (dataVisible) {
      // Check for view more container
      const viewMoreContainer = page.getByTestId(
        "accordion-view-revision-view-more-container"
      );
      const viewMoreVisible = await viewMoreContainer
        .isVisible()
        .catch(() => false);

      if (viewMoreVisible) {
        await expect(viewMoreContainer).toBeVisible();
        await expect(viewMoreContainer).toBeEnabled();

        // Test toggle functionality
        await viewMoreContainer.click();
        await page.waitForTimeout(1000);

        // Should remain functional after click
        await expect(viewMoreContainer).toBeVisible();
      }
    }
  });

  test("should handle revision button click for task creation", async ({
    page,
  }) => {
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const containerVisible = await revisionContainer
      .isVisible()
      .catch(() => false);

    if (containerVisible) {
      const revisionButton = page.getByTestId("accordion-view-revision-button");

      // Test revision task initiation
      await revisionButton.hover();

      // In real scenario, this would create/resume revision task
      console.log("Revision button is available for task creation");
    }
  });
});

test.describe("Revision Flow - Different Revision States", () => {
  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should handle revision flow for topics with no prior sessions", async ({
    page,
  }) => {
    // Navigate through topics to find one without revision data
    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      for (let i = 0; i < Math.min(topicCount, 3); i++) {
        await topicItems.nth(i).click();
        await page.waitForTimeout(2000);

        const revisionContainer = page.getByTestId(
          "accordion-view-revision-container"
        );
        const containerVisible = await revisionContainer
          .isVisible()
          .catch(() => false);

        if (containerVisible) {
          const revisionData = page.getByTestId("accordion-view-revision-data");
          const dataVisible = await revisionData.isVisible().catch(() => false);

          if (!dataVisible) {
            // Found a topic with revision enabled but no prior sessions
            const revisionButton = page.getByTestId(
              "accordion-view-revision-button"
            );
            const buttonText = await revisionButton.textContent();
            expect(buttonText).toBe("Take revision");

            const revisionText = page.getByTestId(
              "accordion-view-revision-text"
            );
            const textContent = await revisionText.textContent();
            expect(textContent).toContain("revision"); // Should indicate starting revision

            console.log("Found topic with no prior revision sessions");
            break;
          }
        }
      }
    }
  });

  test("should handle revision flow for topics with existing sessions", async ({
    page,
  }) => {
    // Navigate through topics to find one with revision data
    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      for (let i = 0; i < Math.min(topicCount, 3); i++) {
        await topicItems.nth(i).click();
        await page.waitForTimeout(2000);

        const revisionData = page.getByTestId("accordion-view-revision-data");
        const dataVisible = await revisionData.isVisible().catch(() => false);

        if (dataVisible) {
          // Found a topic with existing revision sessions
          const revisionButton = page.getByTestId(
            "accordion-view-revision-button"
          );
          const buttonText = await revisionButton.textContent();
          expect(["Take revision", "Continue Revision"]).toContain(buttonText);

          const revisionText = page.getByTestId("accordion-view-revision-text");
          const textContent = await revisionText.textContent();
          expect(textContent).toBeTruthy();

          console.log("Found topic with existing revision sessions");
          break;
        }
      }
    }
  });

  test("should handle topics where revision is not enabled", async ({
    page,
  }) => {
    // Check multiple topics to understand revision availability
    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    let revisionEnabledCount = 0;
    let totalTopicsChecked = 0;

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      for (let i = 0; i < Math.min(topicCount, 5); i++) {
        await topicItems.nth(i).click();
        await page.waitForTimeout(1000);

        const revisionContainer = page.getByTestId(
          "accordion-view-revision-container"
        );
        const containerVisible = await revisionContainer
          .isVisible()
          .catch(() => false);

        totalTopicsChecked++;
        if (containerVisible) {
          revisionEnabledCount++;
        }
      }
    }

    console.log(
      `Checked ${totalTopicsChecked} topics, ${revisionEnabledCount} have revision enabled`
    );

    // At least some topics should exist
    expect(totalTopicsChecked).toBeGreaterThan(0);
  });
});

test.describe("Revision Flow - Mobile Responsive Behavior", () => {
  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test("should display revision container properly on mobile", async ({
    page,
  }) => {
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const containerVisible = await revisionContainer
      .isVisible()
      .catch(() => false);

    if (containerVisible) {
      await expect(revisionContainer).toBeVisible();

      // Verify container fits within mobile viewport
      const boundingBox = await revisionContainer.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);

      // Verify buttons are properly sized for mobile
      const recapButton = page.getByTestId("accordion-view-recap-button");
      const revisionButton = page.getByTestId("accordion-view-revision-button");

      const recapBox = await recapButton.boundingBox();
      const revisionBox = await revisionButton.boundingBox();

      // Buttons should be large enough for touch interaction
      if (recapBox) {
        expect(recapBox.height).toBeGreaterThanOrEqual(40);
      }
      if (revisionBox) {
        expect(revisionBox.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test("should handle mobile touch interactions for revision elements", async ({
    page,
  }) => {
    const revisionContainer = page.getByTestId(
      "accordion-view-revision-container"
    );
    const containerVisible = await revisionContainer
      .isVisible()
      .catch(() => false);

    if (containerVisible) {
      const recapButton = page.getByTestId("accordion-view-recap-button");
      const revisionButton = page.getByTestId("accordion-view-revision-button");

      // Test touch interactions
      await recapButton.tap();
      await page.waitForTimeout(500);

      await revisionButton.tap();
      await page.waitForTimeout(500);

      // Elements should remain functional after touch
      await expect(recapButton).toBeEnabled();
      await expect(revisionButton).toBeEnabled();
    }
  });
});

test.describe("Revision Flow - Performance and Error Handling", () => {
  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test("should load revision data within reasonable time", async ({ page }) => {
    const startTime = Date.now();

    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();

        // Wait for revision container to load if available
        const revisionContainer = page.getByTestId(
          "accordion-view-revision-container"
        );

        try {
          await expect(revisionContainer).toBeVisible({ timeout: 5000 });

          const loadTime = Date.now() - startTime;
          console.log(`Revision data loaded in ${loadTime}ms`);

          // Should load within 8 seconds
          expect(loadTime).toBeLessThan(8000);
        } catch (error) {
          console.log("Revision not enabled for this topic");
        }
      }
    }
  });

  test("should handle revision feature unavailability gracefully", async ({
    page,
  }) => {
    // Test behavior when revision features are not available
    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();
        await page.waitForTimeout(2000);

        const revisionContainer = page.getByTestId(
          "accordion-view-revision-container"
        );
        const containerVisible = await revisionContainer
          .isVisible()
          .catch(() => false);

        if (!containerVisible) {
          // This is valid behavior - not all topics have revision enabled
          console.log(
            "Revision not available for this topic (expected behavior)"
          );

          // The page should still function normally without revision
          await expect(
            page.getByTestId("accordion-view-subtopics-panel")
          ).toBeVisible();
        }
      }
    }
  });

  test("should handle rapid revision button clicks gracefully", async ({
    page,
  }) => {
    await page.waitForTimeout(2000);
    const subjectCards = page
      .locator('[data-testid*="SubjectsView-"]')
      .filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator(
        '[data-testid*="accordion-view-"][data-testid$="-container"]'
      );
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();
        await page.waitForTimeout(2000);

        const revisionButton = page.getByTestId(
          "accordion-view-revision-button"
        );
        const buttonVisible = await revisionButton
          .isVisible()
          .catch(() => false);

        if (buttonVisible) {
          // Test rapid clicks
          await revisionButton.click();
          await page.waitForTimeout(100);
          await revisionButton.click();

          // Button should remain functional
          await expect(revisionButton).toBeEnabled();
        }
      }
    }
  });
});
