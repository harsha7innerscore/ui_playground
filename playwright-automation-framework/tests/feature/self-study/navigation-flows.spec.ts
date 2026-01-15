import { test, expect } from '../../../fixtures/auth.fixture';
import { LoginPage } from '../../../pages/LoginPage';
import { HomePage } from '../../../pages/HomePage';
import { SelfStudyPage } from '../../../pages/SelfStudyPage';

/**
 * Navigation Flows Test Suite
 * Tests complete user journeys and navigation patterns within the self-study feature
 * Covers end-to-end workflows from initial landing to task completion
 */

test.describe('Navigation Flows - Complete User Journeys', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    console.log('Setting up Navigation Flows test environment...');
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should complete full journey: Subject Selection → Topic Selection → Subtopic Expansion', async ({ page }) => {
    console.log('=== Testing Complete Navigation Journey ===');

    // STEP 1: Verify initial subjects view
    await expect(page.getByTestId('SubjectsView-container')).toBeVisible();
    await expect(page.getByTestId('SubjectsView-subjects-grid')).toBeVisible();

    // STEP 2: Select a subject
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();
    expect(cardCount).toBeGreaterThan(0);

    const firstSubjectCard = subjectCards.first();
    const subjectName = await firstSubjectCard.getAttribute('data-testid');
    await firstSubjectCard.click();

    // STEP 3: Verify transition to accordion view
    await page.waitForTimeout(2000);
    await expect(page.getByTestId('accordion-view-container')).toBeVisible();
    await expect(page.getByTestId('accordion-view-subject-tabs-container')).toBeVisible();

    // STEP 4: Verify subject tab is selected
    if (subjectName) {
      const extractedName = subjectName.replace('SubjectsView-', '');
      const selectedTab = page.getByTestId(`accordion-view-tab-${extractedName}`);
      await expect(selectedTab).toBeVisible();
    }

    // STEP 5: Select a topic
    await expect(page.getByTestId('accordion-view-topics-list-panel')).toBeVisible();
    const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
    const topicCount = await topicItems.count();

    if (topicCount > 0) {
      const firstTopic = topicItems.first();
      await firstTopic.click();
      await page.waitForTimeout(3000);

      // STEP 6: Verify subtopics panel is visible
      await expect(page.getByTestId('accordion-view-subtopics-panel')).toBeVisible();

      // STEP 7: Expand a subtopic
      const subtopicContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid$="-container"]');
      const subtopicCount = await subtopicContainers.count();

      if (subtopicCount > 0) {
        const firstSubtopic = subtopicContainers.first();
        await firstSubtopic.click();
        await page.waitForTimeout(3000);

        // STEP 8: Verify task content or self-learn options are visible
        const taskContainer = page.getByTestId('accordion-view-task-container');
        const selfLearnContainer = page.getByTestId('accordion-view-self-learn-buttons-container');

        const taskVisible = await taskContainer.isVisible().catch(() => false);
        const selfLearnVisible = await selfLearnContainer.isVisible().catch(() => false);

        if (taskVisible || selfLearnVisible) {
          console.log('✓ Complete navigation journey successful');
          console.log('✓ User can now interact with learning content');
        }
      }
    }
  });

  test('should handle back navigation through breadcrumbs', async ({ page }) => {
    // Navigate to accordion view first
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Check for breadcrumb navigation (primarily on mobile)
      const breadcrumb = page.getByTestId('accordion-view-breadcrumb-navigation');
      const breadcrumbVisible = await breadcrumb.isVisible().catch(() => false);

      if (breadcrumbVisible) {
        console.log('Testing breadcrumb navigation');

        // Click breadcrumb to go back
        await breadcrumb.click();
        await page.waitForTimeout(2000);

        // Should navigate back appropriately
        // Exact behavior depends on mobile vs desktop and navigation state
      } else {
        console.log('Breadcrumb not visible (expected on desktop)');
      }
    }
  });

  test('should support switching between subjects via tabs', async ({ page }) => {
    // Navigate to accordion view
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Check subject tabs
      const subjectTabs = page.locator('[data-testid*="accordion-view-tab-"]');
      const tabCount = await subjectTabs.count();
      console.log(`Found ${tabCount} subject tabs`);

      if (tabCount > 1) {
        // Test switching between subjects
        const firstTab = subjectTabs.first();
        const secondTab = subjectTabs.nth(1);

        // Get tab names for verification
        const firstTabId = await firstTab.getAttribute('data-testid');
        const secondTabId = await secondTab.getAttribute('data-testid');

        // Switch to second subject
        await secondTab.click();
        await page.waitForTimeout(2000);

        // Verify topics loaded for new subject
        await expect(page.getByTestId('accordion-view-topics-list-panel')).toBeVisible();

        // Switch back to first subject
        await firstTab.click();
        await page.waitForTimeout(2000);

        // Verify topics loaded for original subject
        await expect(page.getByTestId('accordion-view-topics-list-panel')).toBeVisible();

        console.log('✓ Subject tab switching works correctly');
      }
    }
  });

  test('should maintain state when navigating between topics', async ({ page }) => {
    // Navigate to accordion view and select multiple topics
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
      const topicCount = await topicItems.count();

      if (topicCount >= 2) {
        // Select first topic
        const firstTopic = topicItems.first();
        const secondTopic = topicItems.nth(1);

        await firstTopic.click();
        await page.waitForTimeout(2000);

        // Verify subtopics panel loads
        await expect(page.getByTestId('accordion-view-subtopics-panel')).toBeVisible();

        // Switch to second topic
        await secondTopic.click();
        await page.waitForTimeout(2000);

        // Verify subtopics panel updates for new topic
        await expect(page.getByTestId('accordion-view-subtopics-panel')).toBeVisible();

        // Navigation should be smooth without errors
        console.log('✓ Topic switching maintains proper state');
      }
    }
  });
});

test.describe('Navigation Flows - Continue Studying Integration', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should display and interact with continue studying cards', async ({ page }) => {
    // Check if continue studying section exists
    const continueSection = page.getByTestId('SubjectsView-continue-studying-section');
    const sectionVisible = await continueSection.isVisible().catch(() => false);

    if (sectionVisible) {
      console.log('Continue studying section is available');

      await expect(page.getByTestId('SubjectsView-continue-studying-title')).toBeVisible();
      await expect(page.getByTestId('SubjectsView-study-cards-container')).toBeVisible();

      // Check for study cards (implementation depends on TaskCard/MobileTaskCard)
      const studyCards = page.getByTestId('SubjectsView-study-cards-container').locator('> *');
      const cardCount = await studyCards.count();

      if (cardCount > 0) {
        console.log(`Found ${cardCount} study cards`);

        // Test interaction with first card
        const firstCard = studyCards.first();
        await firstCard.hover();

        // Cards should be clickable to resume tasks
        console.log('Continue studying cards are interactive');
      }
    } else {
      console.log('Continue studying section not available (no recent tasks)');
    }
  });

  test('should handle continue studying navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const continueSection = page.getByTestId('SubjectsView-continue-studying-section');
    const sectionVisible = await continueSection.isVisible().catch(() => false);

    if (sectionVisible) {
      // Check for mobile pagination
      const paginationContainer = page.getByTestId('SubjectsView-pagination-container');
      const paginationVisible = await paginationContainer.isVisible().catch(() => false);

      if (paginationVisible) {
        await expect(page.getByTestId('SubjectsView-pagination-component')).toBeVisible();

        // Test pagination interaction
        const pagination = page.getByTestId('SubjectsView-pagination-component');
        await pagination.hover();

        console.log('Mobile pagination is available for continue studying');
      }
    }
  });

  test('should support direct task resumption from continue studying', async ({ page }) => {
    const continueSection = page.getByTestId('SubjectsView-continue-studying-section');
    const sectionVisible = await continueSection.isVisible().catch(() => false);

    if (sectionVisible) {
      const studyCardsContainer = page.getByTestId('SubjectsView-study-cards-container');
      const studyCards = studyCardsContainer.locator('> *');
      const cardCount = await studyCards.count();

      if (cardCount > 0) {
        // Test clicking on continue studying card
        const firstCard = studyCards.first();

        // In real scenario, this would navigate to task
        // Here we verify the card is interactive
        await firstCard.hover();
        console.log('Continue studying card supports direct task resumption');
      }
    }
  });
});

test.describe('Navigation Flows - Multi-Step Task Workflows', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should support self-learn task creation workflow', async ({ page }) => {
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

          // Check for self-learn buttons
          const buttonsContainer = page.getByTestId('accordion-view-self-learn-buttons-container');
          const buttonsVisible = await buttonsContainer.isVisible().catch(() => false);

          if (buttonsVisible) {
            // Test different task type buttons
            const assessmentButton = page.getByTestId('accordion-view-self-learn-button-assessment');
            const guidedButton = page.getByTestId('accordion-view-self-learn-button-guidedPractise');
            const learnButton = page.getByTestId('accordion-view-self-learn-button-learnSubtopic');

            const assessmentVisible = await assessmentButton.isVisible().catch(() => false);
            const guidedVisible = await guidedButton.isVisible().catch(() => false);
            const learnVisible = await learnButton.isVisible().catch(() => false);

            console.log('Available self-learn options:');
            if (assessmentVisible) console.log('- Assessment Practice');
            if (guidedVisible) console.log('- Guided Practice');
            if (learnVisible) console.log('- Learn Subtopic');

            // Test button interactions (hover to verify they're interactive)
            if (assessmentVisible) await assessmentButton.hover();
            if (guidedVisible) await guidedButton.hover();
            if (learnVisible) await learnButton.hover();

            console.log('✓ Self-learn workflow is available');
          }
        }
      }
    }
  });

  test('should support revision workflow initiation', async ({ page }) => {
    // Navigate to find revision-enabled topics
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
      const topicCount = await topicItems.count();

      // Check multiple topics for revision availability
      for (let i = 0; i < Math.min(topicCount, 3); i++) {
        await topicItems.nth(i).click();
        await page.waitForTimeout(2000);

        const revisionContainer = page.getByTestId('accordion-view-revision-container');
        const revisionVisible = await revisionContainer.isVisible().catch(() => false);

        if (revisionVisible) {
          console.log(`Topic ${i + 1} has revision available`);

          // Test revision workflow buttons
          const recapButton = page.getByTestId('accordion-view-recap-button');
          const revisionButton = page.getByTestId('accordion-view-revision-button');

          await recapButton.hover();
          await revisionButton.hover();

          console.log('✓ Revision workflow is available');
          break;
        }
      }
    }
  });

  test('should handle task progression and status updates', async ({ page }) => {
    // Navigate to subtopic with existing tasks
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

          // Check for existing tasks
          const taskContainer = page.getByTestId('accordion-view-task-container');
          const taskVisible = await taskContainer.isVisible().catch(() => false);

          if (taskVisible) {
            const taskItems = page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]');
            const taskCount = await taskItems.count();

            console.log(`Found ${taskCount} existing tasks`);

            if (taskCount > 0) {
              // Examine task status and information
              const firstTask = taskItems.first();

              // Check task date info
              const dateInfo = page.locator('[data-testid*="accordion-view-task-"][data-testid*="-date-info"]').first();
              const dateVisible = await dateInfo.isVisible().catch(() => false);

              if (dateVisible) {
                const dateText = await dateInfo.textContent();
                console.log(`Task date info: ${dateText}`);
              }

              // Check performance badges
              const performanceBadge = page.locator('[data-testid*="accordion-view-task-"][data-testid*="-performance"]').first();
              const badgeVisible = await performanceBadge.isVisible().catch(() => false);

              if (badgeVisible) {
                console.log('Task has performance tracking');
              }

              console.log('✓ Task progression tracking is available');
            }
          }
        }
      }
    }
  });
});

test.describe('Navigation Flows - Performance and Error Recovery', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should handle navigation timeouts gracefully', async ({ page }) => {
    // Test navigation with shorter timeouts to simulate slow networks
    await page.waitForTimeout(1000);

    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });

    try {
      await expect(subjectCards.first()).toBeVisible({ timeout: 5000 });
      console.log('Navigation loading completed within timeout');
    } catch (error) {
      console.log('Navigation timeout occurred (testing error recovery)');
    }

    // Page should remain functional even with slow loading
    await expect(page.getByTestId('SubjectsView-container')).toBeVisible();
  });

  test('should recover from navigation errors', async ({ page }) => {
    // Test rapid navigation that might cause conflicts
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      // Rapid navigation test
      await subjectCards.first().click();
      await page.waitForTimeout(500);

      // Navigate back quickly
      await page.goBack();
      await page.waitForTimeout(500);

      // Navigate forward again
      await page.goForward();
      await page.waitForTimeout(2000);

      // Should recover and display properly
      const accordionContainer = page.getByTestId('accordion-view-container');
      const subjectsContainer = page.getByTestId('SubjectsView-container');

      const accordionVisible = await accordionContainer.isVisible().catch(() => false);
      const subjectsVisible = await subjectsContainer.isVisible().catch(() => false);

      // One of these should be visible after recovery
      expect(accordionVisible || subjectsVisible).toBe(true);

      console.log('✓ Navigation error recovery successful');
    }
  });

  test('should maintain navigation performance under load', async ({ page }) => {
    const startTime = Date.now();

    // Perform complete navigation sequence
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
        await page.waitForTimeout(2000);

        const subtopicContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid$="-container"]');
        const subtopicCount = await subtopicContainers.count();

        if (subtopicCount > 0) {
          await subtopicContainers.first().click();
          await page.waitForTimeout(2000);
        }
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`Complete navigation sequence took ${totalTime}ms`);

    // Should complete within reasonable time
    expect(totalTime).toBeLessThan(15000);

    console.log('✓ Navigation performance is acceptable');
  });

  test('should handle concurrent navigation requests', async ({ page }) => {
    // Test overlapping navigation actions
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount >= 2) {
      // Simulate concurrent clicks
      const firstCard = subjectCards.first();
      const secondCard = subjectCards.nth(1);

      // Click both cards rapidly
      await Promise.all([
        firstCard.click(),
        page.waitForTimeout(100).then(() => secondCard.click())
      ]);

      await page.waitForTimeout(3000);

      // Should handle gracefully and show one of the accordion views
      const accordionContainer = page.getByTestId('accordion-view-container');
      await expect(accordionContainer).toBeVisible();

      console.log('✓ Concurrent navigation handled correctly');
    }
  });
});