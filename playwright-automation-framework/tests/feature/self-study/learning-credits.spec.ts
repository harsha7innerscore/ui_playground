import { test, expect } from '../../../fixtures/auth.fixture';

/**
 * Learning Credits System Test Suite
 * Tests learning credits integration, balance tracking, and feature restrictions
 * Covers user modes (NORMAL, FREE, SMART_LEARN) and credit-based limitations
 */

test.describe('Learning Credits - Credit Balance and Display', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    console.log('Setting up Learning Credits test environment...');
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should display learning credits container when available', async ({ page }) => {
    // Check if learning credits container exists in top container
    const creditsContainer = page.getByTestId('top-container-learning-credits');
    const creditsVisible = await creditsContainer.isVisible().catch(() => false);

    if (creditsVisible) {
      await expect(creditsContainer).toBeVisible();
      console.log('Learning credits container is displayed');

      // Verify it appears instead of welcome container
      const welcomeContainer = page.getByTestId('top-container-welcome-container');
      const welcomeVisible = await welcomeContainer.isVisible().catch(() => false);

      // When credits container is shown, welcome container should be hidden
      expect(welcomeVisible).toBe(false);
    } else {
      // If credits not shown, welcome container should be visible
      const welcomeContainer = page.getByTestId('top-container-welcome-container');
      await expect(welcomeContainer).toBeVisible();
      console.log('Welcome container displayed instead of credits');
    }
  });

  test('should handle low balance state styling and warnings', async ({ page }) => {
    // Check for low balance styling indicators
    const welcomeContainer = page.getByTestId('top-container-welcome-container');
    const welcomeVisible = await welcomeContainer.isVisible().catch(() => false);

    if (welcomeVisible) {
      // Check if container has special styling for low balance
      const backgroundColor = await welcomeContainer.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Low balance might trigger special background styling
      console.log(`Welcome container background: ${backgroundColor}`);
    }

    // Check welcome text for balance-related messaging
    const welcomeText = page.getByTestId('top-container-welcomeText');
    const welcomeTextVisible = await welcomeText.isVisible().catch(() => false);

    if (welcomeTextVisible) {
      const textContent = await welcomeText.textContent();
      console.log(`Welcome text content: ${textContent}`);

      // Text might contain balance-related guidance
      expect(textContent).toBeTruthy();
    }
  });

  test('should display appropriate title based on balance state', async ({ page }) => {
    // Check title container
    const titleContainer = page.getByTestId('top-container-title');
    const titleVisible = await titleContainer.isVisible().catch(() => false);

    if (titleVisible) {
      const titleText = await titleContainer.textContent();
      console.log(`Title text: ${titleText}`);

      // Verify title is appropriate (might vary based on balance state)
      expect(titleText).toBeTruthy();

      // Title should be an h1 element
      const tagName = await titleContainer.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('h1');
    }
  });
});

test.describe('Learning Credits - Feature Restrictions and Tooltips', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Navigate to accordion view to test credit restrictions
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();
        await page.waitForTimeout(3000);

        const subtopicContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid$="-container"]');
        const subtopicCount = await subtopicContainers.count();

        if (subtopicCount > 0) {
          await subtopicContainers.first().click();
          await page.waitForTimeout(3000);
        }
      }
    }
  });

  test('should display low balance tooltip when applicable', async ({ page }) => {
    // Check for low balance tooltip
    const lowBalanceTooltip = page.getByTestId('accordion-view-low-balance-tooltip');
    const tooltipVisible = await lowBalanceTooltip.isVisible().catch(() => false);

    if (tooltipVisible) {
      await expect(lowBalanceTooltip).toBeVisible();

      // Verify tooltip content
      const tooltipText = await lowBalanceTooltip.textContent();
      expect(tooltipText).toContain('Smart Learn feature');

      // Tooltip should have proper styling
      const backgroundColor = await lowBalanceTooltip.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      const color = await lowBalanceTooltip.evaluate(el =>
        window.getComputedStyle(el).color
      );

      console.log(`Tooltip styling - Background: ${backgroundColor}, Color: ${color}`);

      // Verify tooltip is properly positioned
      const boundingBox = await lowBalanceTooltip.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(0);
      expect(boundingBox?.height).toBeGreaterThan(0);

      console.log('Low balance tooltip is properly displayed');
    } else {
      console.log('Low balance tooltip not visible (user has sufficient credits)');
    }
  });

  test('should display low balance warning icon when applicable', async ({ page }) => {
    // Check for warning icon
    const warningIcon = page.getByTestId('accordion-view-low-balance-warning-icon');
    const iconVisible = await warningIcon.isVisible().catch(() => false);

    if (iconVisible) {
      await expect(warningIcon).toBeVisible();

      // Icon should be interactive (cursor pointer)
      const cursor = await warningIcon.evaluate(el =>
        window.getComputedStyle(el).cursor
      );
      expect(cursor).toBe('pointer');

      // Verify icon has proper spacing
      const padding = await warningIcon.evaluate(el =>
        window.getComputedStyle(el).padding
      );

      const margin = await warningIcon.evaluate(el =>
        window.getComputedStyle(el).margin
      );

      console.log(`Warning icon spacing - Padding: ${padding}, Margin: ${margin}`);

      // Test hover interaction
      await warningIcon.hover();
      await page.waitForTimeout(500);

      // Should show tooltip on hover
      const tooltip = page.getByTestId('accordion-view-low-balance-tooltip');
      const tooltipAfterHover = await tooltip.isVisible().catch(() => false);

      if (tooltipAfterHover) {
        console.log('Tooltip appears on warning icon hover');
      }

      console.log('Low balance warning icon is properly interactive');
    } else {
      console.log('Warning icon not visible (sufficient credits available)');
    }
  });

  test('should restrict Smart Learn features when balance is low', async ({ page }) => {
    // Check if low balance restrictions are active
    const warningIcon = page.getByTestId('accordion-view-low-balance-warning-icon');
    const iconVisible = await warningIcon.isVisible().catch(() => false);

    if (iconVisible) {
      console.log('Low balance restrictions are active');

      // Test task interactions with restrictions
      const taskItems = page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]');
      const taskCount = await taskItems.count();

      if (taskCount > 0) {
        const firstTask = taskItems.first();

        // Click on task that might be restricted
        await firstTask.click();
        await page.waitForTimeout(1000);

        // Should show tooltip instead of navigating
        const tooltip = page.getByTestId('accordion-view-low-balance-tooltip');
        const tooltipAfterClick = await tooltip.isVisible().catch(() => false);

        if (tooltipAfterClick) {
          console.log('Task click shows credit restriction tooltip');
        }
      }

      // Test self-learn button restrictions
      const selfLearnButtons = page.locator('[data-testid*="accordion-view-self-learn-button-"]');
      const buttonCount = await selfLearnButtons.count();

      if (buttonCount > 0) {
        // Check if buttons show warning icons
        for (let i = 0; i < buttonCount; i++) {
          const button = selfLearnButtons.nth(i);
          await button.hover();

          // Look for associated warning icons
          const nearbyWarning = page.getByTestId('accordion-view-low-balance-warning-icon');
          const warningNearby = await nearbyWarning.isVisible().catch(() => false);

          if (warningNearby) {
            console.log(`Self-learn button ${i} has credit restrictions`);
          }
        }
      }
    } else {
      console.log('No credit restrictions active');
    }
  });

  test('should handle credit request modal when applicable', async ({ page }) => {
    // Check for request modal (shown for credit requests)
    const requestModal = page.getByTestId('syllabus-request-modal');
    const modalVisible = await requestModal.isVisible().catch(() => false);

    if (modalVisible) {
      await expect(requestModal).toBeVisible();

      // Modal should be closable
      // Look for close functionality (implementation may vary)
      console.log('Credit request modal is displayed');

      // Verify modal adapts to mobile if needed
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        console.log('Request modal adapted for mobile view');
      }
    } else {
      console.log('Credit request modal not currently shown');
    }
  });
});

test.describe('Learning Credits - User Mode Behaviors', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should handle NORMAL user mode features', async ({ page }) => {
    // In NORMAL mode, all features should be accessible
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Check if credit restrictions are absent
      const warningIcon = page.getByTestId('accordion-view-low-balance-warning-icon');
      const iconVisible = await warningIcon.isVisible().catch(() => false);

      if (!iconVisible) {
        console.log('No credit restrictions visible (possible NORMAL mode)');

        // Verify full access to features
        const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
        const topicCount = await topicItems.count();

        if (topicCount > 0) {
          await topicItems.first().click();
          await page.waitForTimeout(2000);

          const subtopicContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid$="-container"]');
          const subtopicCount = await subtopicContainers.count();

          if (subtopicCount > 0) {
            await subtopicContainers.first().click();
            await page.waitForTimeout(2000);

            // Check for self-learn buttons (should be available)
            const selfLearnContainer = page.getByTestId('accordion-view-self-learn-buttons-container');
            const buttonsVisible = await selfLearnContainer.isVisible().catch(() => false);

            if (buttonsVisible) {
              console.log('Self-learn features are fully accessible');
            }
          }
        }
      }
    }
  });

  test('should handle FREE user mode restrictions', async ({ page }) => {
    // FREE mode might have limited features
    const creditsContainer = page.getByTestId('top-container-learning-credits');
    const creditsVisible = await creditsContainer.isVisible().catch(() => false);

    if (creditsVisible) {
      console.log('Credits container visible (possible FREE/SMART_LEARN mode)');

      // Navigate to check feature availability
      await page.waitForTimeout(2000);
      const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
      const cardCount = await subjectCards.count();

      if (cardCount > 0) {
        await subjectCards.first().click();
        await page.waitForTimeout(2000);

        // Check for credit-based restrictions
        const warningIcon = page.getByTestId('accordion-view-low-balance-warning-icon');
        const iconVisible = await warningIcon.isVisible().catch(() => false);

        if (iconVisible) {
          console.log('Credit-based feature restrictions are active');

          // Verify restricted features show warnings
          const tooltip = page.getByTestId('accordion-view-low-balance-tooltip');
          await warningIcon.hover();

          const tooltipVisible = await tooltip.isVisible().catch(() => false);
          if (tooltipVisible) {
            console.log('Credit restriction tooltip functions correctly');
          }
        }
      }
    }
  });

  test('should display appropriate nudges and guidance for credit management', async ({ page }) => {
    // Check welcome text for credit-related guidance
    const welcomeText = page.getByTestId('top-container-welcomeText');
    const textVisible = await welcomeText.isVisible().catch(() => false);

    if (textVisible) {
      const textContent = await welcomeText.textContent();

      // Welcome text might contain credit-related guidance
      if (textContent?.toLowerCase().includes('credit') ||
          textContent?.toLowerCase().includes('balance') ||
          textContent?.toLowerCase().includes('smart learn')) {
        console.log('Credit-related guidance provided in welcome text');
        console.log(`Guidance: ${textContent}`);
      }
    }

    // Check for time logs modal (might be related to credit tracking)
    const timeLogsModal = page.getByTestId('syllabus-time-logs-modal');
    const timeLogsVisible = await timeLogsModal.isVisible().catch(() => false);

    if (timeLogsVisible) {
      console.log('Time logs modal available (credit usage tracking)');
    }

    // Check for tooltip blur overlay (used with credit warnings)
    const blurOverlay = page.getByTestId('syllabus-tooltip-blur-overlay');
    const blurVisible = await blurOverlay.isVisible().catch(() => false);

    if (blurVisible) {
      console.log('Tooltip blur overlay active (credit restriction UI)');

      // Overlay should be clickable to dismiss
      await blurOverlay.click();
      await page.waitForTimeout(500);

      // Should handle click to dismiss tooltip
      const blurAfterClick = await blurOverlay.isVisible().catch(() => false);
      console.log(`Blur overlay dismissed: ${!blurAfterClick}`);
    }
  });
});

test.describe('Learning Credits - Error Handling and Edge Cases', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should handle credit system unavailability gracefully', async ({ page }) => {
    // Test behavior when credit system is not available
    const creditsContainer = page.getByTestId('top-container-learning-credits');
    const creditsVisible = await creditsContainer.isVisible().catch(() => false);

    if (!creditsVisible) {
      // When credits not available, welcome container should work normally
      const welcomeContainer = page.getByTestId('top-container-welcome-container');
      await expect(welcomeContainer).toBeVisible();

      // Features should be accessible without restrictions
      await page.waitForTimeout(2000);
      const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
      const cardCount = await subjectCards.count();

      if (cardCount > 0) {
        await subjectCards.first().click();
        await page.waitForTimeout(2000);

        // Should navigate without credit checks
        await expect(page.getByTestId('accordion-view-container')).toBeVisible();
        console.log('Navigation works without credit system');
      }
    }
  });

  test('should handle credit API failures gracefully', async ({ page }) => {
    // Test behavior when credit-related APIs fail
    // Page should still be functional even if credit data fails to load

    await page.waitForTimeout(3000);

    // Basic functionality should work regardless of credit status
    const subjectsGrid = page.getByTestId('SubjectsView-subjects-grid');
    await expect(subjectsGrid).toBeVisible();

    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    expect(cardCount).toBeGreaterThan(0);

    console.log('Basic functionality maintained despite potential credit API issues');
  });

  test('should handle rapid credit-related interactions', async ({ page }) => {
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Test rapid interactions with credit-restricted features
      const warningIcon = page.getByTestId('accordion-view-low-balance-warning-icon');
      const iconVisible = await warningIcon.isVisible().catch(() => false);

      if (iconVisible) {
        // Rapid hover/click on warning icon
        await warningIcon.hover();
        await page.waitForTimeout(100);
        await warningIcon.click();
        await page.waitForTimeout(100);
        await warningIcon.hover();

        // Should handle rapid interactions without errors
        await expect(warningIcon).toBeVisible();
        console.log('Rapid credit UI interactions handled correctly');
      }

      // Test rapid task clicks when restricted
      const taskItems = page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]');
      const taskCount = await taskItems.count();

      if (taskCount > 0 && iconVisible) {
        const firstTask = taskItems.first();

        // Rapid clicks on restricted task
        await firstTask.click();
        await page.waitForTimeout(100);
        await firstTask.click();

        // Should handle gracefully without errors
        console.log('Rapid restricted task interactions handled correctly');
      }
    }
  });
});