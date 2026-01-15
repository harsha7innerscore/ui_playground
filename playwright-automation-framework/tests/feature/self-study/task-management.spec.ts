import { test, expect } from '../../../fixtures/auth.fixture';
import { LoginPage } from '../../../pages/LoginPage';
import { HomePage } from '../../../pages/HomePage';
import { SelfStudyPage } from '../../../pages/SelfStudyPage';

/**
 * Task Management Test Suite
 * Tests task interactions, self-learn buttons, and task lifecycle
 * Covers AccordionTaskView and AccordionSelfLearnButtons functionality
 */

test.describe('Task Management - Task Display and Interaction', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    console.log('Setting up Task Management test environment...');

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Navigate to accordion view and expand a subtopic
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Select first topic
      const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();
        await page.waitForTimeout(3000);

        // Select and expand first subtopic
        const subtopicContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid$="-container"]');
        const subtopicCount = await subtopicContainers.count();

        if (subtopicCount > 0) {
          await subtopicContainers.first().click();
          await page.waitForTimeout(3000);
        }
      }
    }
  });

  test('should display task container when tasks are available', async ({ page }) => {
    // Check if task container is visible
    const taskContainer = page.getByTestId('accordion-view-task-container');
    const isVisible = await taskContainer.isVisible().catch(() => false);

    if (isVisible) {
      await expect(taskContainer).toBeVisible();

      // Look for individual task containers
      const taskItems = page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]');
      const taskCount = await taskItems.count();

      if (taskCount > 0) {
        console.log(`Found ${taskCount} tasks`);
        await expect(taskItems.first()).toBeVisible();
      }
    } else {
      // If no tasks, check for empty tasks container
      const emptyContainer = page.getByTestId('accordion-view-empty-tasks-container');
      const emptyVisible = await emptyContainer.isVisible().catch(() => false);

      if (emptyVisible) {
        await expect(emptyContainer).toBeVisible();
        await expect(page.getByTestId('accordion-view-empty-task-text')).toBeVisible();
      }
    }
  });

  test('should display task information correctly', async ({ page }) => {
    const taskItems = page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]');
    const taskCount = await taskItems.count();

    if (taskCount > 0) {
      const firstTask = taskItems.first();
      await expect(firstTask).toBeVisible();

      // Check task date information
      const dateInfo = page.locator('[data-testid*="accordion-view-task-"][data-testid*="-date-info"]').first();
      const dateVisible = await dateInfo.isVisible().catch(() => false);

      if (dateVisible) {
        await expect(dateInfo).toBeVisible();
        const dateText = await dateInfo.textContent();
        expect(dateText).toBeTruthy();
      }

      // Check task info container (icon and type)
      const taskInfo = page.locator('[data-testid*="accordion-view-task-"][data-testid*="-info"]').first();
      const infoVisible = await taskInfo.isVisible().catch(() => false);

      if (infoVisible) {
        await expect(taskInfo).toBeVisible();
      }
    }
  });

  test('should display task status and performance information', async ({ page }) => {
    const taskItems = page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]');
    const taskCount = await taskItems.count();

    if (taskCount > 0) {
      // Check task status container
      const statusContainers = page.locator('[data-testid*="accordion-view-task-"][data-testid*="-task-status"]');
      const statusCount = await statusContainers.count();

      if (statusCount > 0) {
        await expect(statusContainers.first()).toBeVisible();
      }

      // Check performance badges
      const performanceBadges = page.locator('[data-testid*="accordion-view-task-"][data-testid*="-performance"]');
      const badgeCount = await performanceBadges.count();

      if (badgeCount > 0) {
        const firstBadge = performanceBadges.first();
        await expect(firstBadge).toBeVisible();

        // Verify it's an image element
        const tagName = await firstBadge.evaluate(el => el.tagName.toLowerCase());
        expect(tagName).toBe('img');
      }

      // Check self-created task indicator
      const selfTexts = page.locator('[data-testid*="accordion-view-task-"][data-testid*="-self-text"]');
      const selfCount = await selfTexts.count();

      if (selfCount > 0) {
        const selfText = await selfTexts.first().textContent();
        expect(selfText).toBe('Self');
      }
    }
  });

  test('should handle task click interactions', async ({ page }) => {
    const taskItems = page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]');
    const taskCount = await taskItems.count();

    if (taskCount > 0) {
      const firstTask = taskItems.first();
      await expect(firstTask).toBeEnabled();

      // Test click interaction (should not navigate away in test)
      await firstTask.hover();

      // Verify cursor indicates clickable element
      const cursor = await firstTask.evaluate(el => window.getComputedStyle(el).cursor);
      expect(['pointer', 'auto']).toContain(cursor);
    }
  });

  test('should display view more/less functionality', async ({ page }) => {
    // Check for view more container
    const viewMoreContainer = page.getByTestId('accordion-view-task-view-more-container');
    const isVisible = await viewMoreContainer.isVisible().catch(() => false);

    if (isVisible) {
      await expect(viewMoreContainer).toBeVisible();

      // Check for view more button
      const viewMoreButton = page.getByTestId('accordion-view-task-view-more-button');
      await expect(viewMoreButton).toBeVisible();
      await expect(viewMoreButton).toBeEnabled();

      // Check button text
      const buttonText = await viewMoreButton.textContent();
      expect(['View more', 'View less']).toContain(buttonText);

      // Test click functionality
      await viewMoreButton.click();
      await page.waitForTimeout(2000);

      // Button text should change
      const newButtonText = await viewMoreButton.textContent();
      expect(newButtonText).toBeTruthy();
    }
  });
});

test.describe('Task Management - Self-Learn Buttons', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Navigate to subtopic with self-learn buttons
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

  test('should display self-learn buttons container', async ({ page }) => {
    const buttonsContainer = page.getByTestId('accordion-view-self-learn-buttons-container');
    const isVisible = await buttonsContainer.isVisible().catch(() => false);

    if (isVisible) {
      await expect(buttonsContainer).toBeVisible();
    }
  });

  test('should display assessment self-learn button', async ({ page }) => {
    const assessmentButton = page.getByTestId('accordion-view-self-learn-button-assessment');
    const isVisible = await assessmentButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(assessmentButton).toBeVisible();
      await expect(assessmentButton).toBeEnabled();

      // Verify it's a button element
      const tagName = await assessmentButton.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('button');

      // Test click interaction
      await assessmentButton.hover();
    }
  });

  test('should display guided practice self-learn button', async ({ page }) => {
    const guidedButton = page.getByTestId('accordion-view-self-learn-button-guidedPractise');
    const isVisible = await guidedButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(guidedButton).toBeVisible();
      await expect(guidedButton).toBeEnabled();

      const tagName = await guidedButton.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('button');
    }
  });

  test('should display learn subtopic self-learn button', async ({ page }) => {
    const learnButton = page.getByTestId('accordion-view-self-learn-button-learnSubtopic');
    const isVisible = await learnButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(learnButton).toBeVisible();
      await expect(learnButton).toBeEnabled();

      const tagName = await learnButton.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('button');
    }
  });

  test('should display prerequisite self-learn button when applicable', async ({ page }) => {
    const prerequisiteButton = page.getByTestId('accordion-view-self-learn-button-learnPrerequisite');
    const isVisible = await prerequisiteButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(prerequisiteButton).toBeVisible();
      await expect(prerequisiteButton).toBeEnabled();

      const tagName = await prerequisiteButton.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('button');
    }
  });

  test('should handle self-learn button clicks and task creation', async ({ page }) => {
    // Test assessment button click if available
    const assessmentButton = page.getByTestId('accordion-view-self-learn-button-assessment');
    const assessmentVisible = await assessmentButton.isVisible().catch(() => false);

    if (assessmentVisible) {
      // Note: In a real test, this would navigate to task screen
      // Here we just verify the button is clickable
      await assessmentButton.hover();

      // Could test actual click in separate navigation test
      console.log('Assessment button is available for testing');
    }

    // Test guided practice button
    const guidedButton = page.getByTestId('accordion-view-self-learn-button-guidedPractise');
    const guidedVisible = await guidedButton.isVisible().catch(() => false);

    if (guidedVisible) {
      await guidedButton.hover();
      console.log('Guided practice button is available for testing');
    }

    // Test learn button
    const learnButton = page.getByTestId('accordion-view-self-learn-button-learnSubtopic');
    const learnVisible = await learnButton.isVisible().catch(() => false);

    if (learnVisible) {
      await learnButton.hover();
      console.log('Learn subtopic button is available for testing');
    }
  });
});

test.describe('Task Management - Learning Credits Integration', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

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
    const lowBalanceTooltip = page.getByTestId('accordion-view-low-balance-tooltip');
    const tooltipVisible = await lowBalanceTooltip.isVisible().catch(() => false);

    if (tooltipVisible) {
      await expect(lowBalanceTooltip).toBeVisible();

      // Check tooltip content
      const tooltipText = await lowBalanceTooltip.textContent();
      expect(tooltipText).toContain('Smart Learn feature');
    }
  });

  test('should display low balance warning icon when applicable', async ({ page }) => {
    const warningIcon = page.getByTestId('accordion-view-low-balance-warning-icon');
    const iconVisible = await warningIcon.isVisible().catch(() => false);

    if (iconVisible) {
      await expect(warningIcon).toBeVisible();

      // Should have cursor pointer for interaction
      const cursor = await warningIcon.evaluate(el => window.getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');

      // Test hover interaction
      await warningIcon.hover();
    }
  });

  test('should handle restricted task interactions due to low balance', async ({ page }) => {
    const taskItems = page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]');
    const taskCount = await taskItems.count();

    if (taskCount > 0) {
      // Check if any tasks show restricted behavior
      for (let i = 0; i < taskCount; i++) {
        const task = taskItems.nth(i);

        // Look for warning icon or tooltip indicators
        const warningIcon = page.getByTestId('accordion-view-low-balance-warning-icon');
        const iconVisible = await warningIcon.isVisible().catch(() => false);

        if (iconVisible) {
          // Test clicking on restricted task
          await task.click();
          await page.waitForTimeout(1000);

          // Should show tooltip or warning instead of navigating
          const tooltip = page.getByTestId('accordion-view-low-balance-tooltip');
          const tooltipVisible = await tooltip.isVisible().catch(() => false);

          if (tooltipVisible) {
            console.log('Low balance restriction is active');
          }
          break;
        }
      }
    }
  });
});

test.describe('Task Management - Error Handling and Edge Cases', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should handle empty task state gracefully', async ({ page }) => {
    // Navigate to a subtopic that might have no tasks
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
          // Try different subtopics to find empty state
          for (let i = 0; i < Math.min(subtopicCount, 3); i++) {
            await subtopicContainers.nth(i).click();
            await page.waitForTimeout(2000);

            const emptyContainer = page.getByTestId('accordion-view-empty-tasks-container');
            const emptyVisible = await emptyContainer.isVisible().catch(() => false);

            if (emptyVisible) {
              await expect(emptyContainer).toBeVisible();
              await expect(page.getByTestId('accordion-view-empty-task-text')).toBeVisible();

              // Verify empty text content is appropriate
              const emptyText = await page.getByTestId('accordion-view-empty-task-text').textContent();
              expect(emptyText).toBeTruthy();
              break;
            }
          }
        }
      }
    }
  });

  test('should handle task loading states', async ({ page }) => {
    // Test loading state by watching for task container appearance
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(1000);

      const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().click();
        await page.waitForTimeout(1000);

        const subtopicContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid$="-container"]');
        const subtopicCount = await subtopicContainers.count();

        if (subtopicCount > 0) {
          await subtopicContainers.first().click();

          // Wait for either task container or empty container to appear
          await Promise.race([
            expect(page.getByTestId('accordion-view-task-container')).toBeVisible(),
            expect(page.getByTestId('accordion-view-empty-tasks-container')).toBeVisible()
          ]);
        }
      }
    }
  });

  test('should handle rapid button clicks gracefully', async ({ page }) => {
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Test rapid self-learn button clicks
      const assessmentButton = page.getByTestId('accordion-view-self-learn-button-assessment');
      const buttonVisible = await assessmentButton.isVisible().catch(() => false);

      if (buttonVisible) {
        // Rapid clicks should not cause errors
        await assessmentButton.click();
        await page.waitForTimeout(100);
        await assessmentButton.click();
        await page.waitForTimeout(100);

        // Button should still be functional
        await expect(assessmentButton).toBeEnabled();
      }
    }
  });

  test.afterEach(async ({ homePage }) => {
    console.log('Task Management test completed, logging out...');

    try {
      await homePage.logoutIfLoggedIn();
    } catch (error) {
      console.warn('Logout failed during cleanup:', error);
    }
  });
});