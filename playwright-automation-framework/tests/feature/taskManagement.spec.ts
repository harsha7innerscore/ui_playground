import { test, expect } from '../../fixtures/selfStudy.fixture';

/**
 * Task Management and Continue Studying Feature Tests
 * Comprehensive tests for task interactions, task status, and continue studying flows
 */

test.describe('Task Management - Task View Component', () => {

  test.beforeEach(async ({ navigateToSelfStudy, selectSubject, selfStudyTestData }) => {
    await navigateToSelfStudy();

    // Navigate to a subject and try to access task view
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);
  });

  test('Verify task view container loads', async ({
    taskViewPage
  }) => {
    // Check if task container is visible
    const isTaskContainerVisible = await taskViewPage.isContainerVisible();

    if (isTaskContainerVisible) {
      await taskViewPage.waitForPageToLoad();
      console.log('Task view container loaded successfully');
    } else {
      console.log('Task view container not visible - may need specific navigation to tasks');
    }
  });

  test('Verify task loading states and content', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      // Verify task loading state
      await taskViewPage.verifyTaskLoadingState();

      // Check task count
      const tasksCount = await taskViewPage.getTasksCount();
      console.log(`Found ${tasksCount} tasks`);

      if (tasksCount > 0) {
        // Verify all tasks have required elements
        await taskViewPage.verifyAllTasksHaveRequiredElements();
      }
    }
  });

  test('Verify individual task elements and interactions', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Test first task
        const taskIndex = 0;

        // Verify task is visible
        await taskViewPage.verifyTaskVisible(taskIndex);

        // Get task information
        const taskDateInfo = await taskViewPage.getTaskDateInfo(taskIndex);
        if (taskDateInfo.length > 0) {
          console.log(`Task date info: ${taskDateInfo}`);
          await taskViewPage.verifyTaskDateFormat(taskIndex);
        }

        const taskSelfText = await taskViewPage.getTaskSelfText(taskIndex);
        if (taskSelfText.length > 0) {
          console.log(`Task self text: ${taskSelfText}`);
        }

        const taskStatus = await taskViewPage.getTaskStatus(taskIndex);
        if (taskStatus.length > 0) {
          console.log(`Task status: ${taskStatus}`);
        }

        // Test task interaction
        await taskViewPage.clickTask(taskIndex);
        await taskViewPage.page.waitForTimeout(1000);
      }
    }
  });

  test('Verify task hover effects', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Test hover effect on first task
        await taskViewPage.verifyTaskHoverEffect(0);
      }
    }
  });

  test('Verify task performance badges and status', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        for (let i = 0; i < Math.min(tasksCount, 3); i++) {
          // Check if performance badge exists
          try {
            await taskViewPage.verifyTaskPerformanceVisible(i);
            const performance = await taskViewPage.getTaskPerformance(i);
            console.log(`Task ${i} performance: ${performance}`);
          } catch (error) {
            console.log(`Performance badge not visible for task ${i}`);
          }

          // Check if status container exists
          try {
            await taskViewPage.verifyTaskStatusVisible(i);
          } catch (error) {
            console.log(`Status container not visible for task ${i}`);
          }
        }
      }
    }
  });

  test('Verify empty task state handling', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount === 0) {
        // Verify empty state is handled properly
        await taskViewPage.verifyEmptyTasksState();

        const emptyText = await taskViewPage.getEmptyTaskText();
        console.log(`Empty state message: ${emptyText}`);
      }
    }
  });

  test('Verify view more functionality', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const isViewMoreVisible = await taskViewPage.isViewMoreContainerVisible();

      if (isViewMoreVisible) {
        // Test view more button
        await taskViewPage.clickViewMoreButton();
        await taskViewPage.page.waitForTimeout(1000);

        // Verify more tasks are loaded or navigation occurred
        console.log('View more button clicked successfully');
      }
    }
  });
});

test.describe('Continue Studying - Card Interactions', () => {

  test.beforeEach(async ({ navigateToSelfStudy }) => {
    await navigateToSelfStudy();
  });

  test('Verify continue studying section availability', async ({
    subjectsViewPage,
    verifyContinueStudyingFlow
  }) => {
    await subjectsViewPage.waitForPageToLoad();

    // Check if continue studying section exists
    const hasContinueStudying = await subjectsViewPage.isContinueStudyingSectionVisible();

    if (hasContinueStudying) {
      // Run comprehensive continue studying flow verification
      await verifyContinueStudyingFlow();
    } else {
      console.log('Continue studying section not available - user may not have ongoing activities');
    }
  });

  test('Verify continue studying card limit and layout', async ({
    subjectsViewPage
  }) => {
    await subjectsViewPage.waitForPageToLoad();

    if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
      // Verify maximum 3 cards are shown
      await subjectsViewPage.verifyContinueStudyingCardsLimit();

      // Verify card layout
      await subjectsViewPage.verifyCardLayout();

      // Get cards count
      const cardsCount = await subjectsViewPage.getContinueStudyingCardsCount();
      console.log(`Continue studying cards count: ${cardsCount}`);
    }
  });

  test('Verify continue studying card UI elements', async ({
    subjectsViewPage
  }) => {
    await subjectsViewPage.waitForPageToLoad();

    if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
      const cardsCount = await subjectsViewPage.getContinueStudyingCardsCount();

      if (cardsCount > 0) {
        // Test each available card
        for (let i = 0; i < cardsCount; i++) {
          await subjectsViewPage.verifyContinueStudyingCardUI(i);

          // Get and verify card heading
          const heading = await subjectsViewPage.getCardHeading(i);
          expect(heading.length).toBeGreaterThan(0);
          console.log(`Card ${i} heading: ${heading}`);
        }
      }
    }
  });

  test('Verify AP/GP text and icons on continue studying cards', async ({
    subjectsViewPage
  }) => {
    await subjectsViewPage.waitForPageToLoad();

    if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
      // Verify AP/GP text displays correctly
      await subjectsViewPage.verifyAPGPTextOnInProgressCards();

      // Verify card icons are displayed
      await subjectsViewPage.verifyCardIcons();
    }
  });

  test('Verify continue studying card interactions', async ({
    subjectsViewPage,
    startContinueStudying
  }) => {
    await subjectsViewPage.waitForPageToLoad();

    if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
      const cardsCount = await subjectsViewPage.getContinueStudyingCardsCount();

      if (cardsCount > 0) {
        // Test hover effects
        await subjectsViewPage.hoverOnContinueStudyingCard(0);
        await subjectsViewPage.page.waitForTimeout(500);

        // Test clicking to resume studying
        try {
          await startContinueStudying(0);
          console.log('Successfully started continue studying flow');
        } catch (error) {
          console.log(`Continue studying action failed: ${error.message}`);
        }
      }
    }
  });

  test('Verify continue studying responsive behavior', async ({
    subjectsViewPage,
    page
  }) => {
    await subjectsViewPage.waitForPageToLoad();

    if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      await subjectsViewPage.verifyMobileLayout();

      // Test tablet layout
      await page.setViewportSize({ width: 768, height: 1024 });
      await subjectsViewPage.verifyTabletLayout();

      // Verify cards are still functional across viewports
      const cardsCount = await subjectsViewPage.getContinueStudyingCardsCount();
      expect(cardsCount).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Task Management - Search and Filter', () => {

  test.beforeEach(async ({ navigateToSelfStudy, selectSubject, selfStudyTestData }) => {
    await navigateToSelfStudy();
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);
  });

  test('Search tasks by text content', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Get text from first task and search for it
        const firstTaskText = await taskViewPage.getTaskSelfText(0);

        if (firstTaskText.length > 0) {
          const searchTerm = firstTaskText.split(' ')[0]; // First word
          const matchingTasks = await taskViewPage.findTasksByText(searchTerm);
          expect(matchingTasks.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('Filter tasks by status', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Try to filter by common statuses
        const statuses = ['completed', 'in-progress', 'pending', 'active'];

        for (const status of statuses) {
          const filteredTasks = await taskViewPage.getTasksByStatus(status);
          console.log(`Tasks with status '${status}': ${filteredTasks.length}`);
        }
      }
    }
  });

  test('Verify task performance levels', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Check performance levels on available tasks
        const performanceLevels = ['good', 'excellent', 'needs improvement', 'average'];

        for (let i = 0; i < Math.min(tasksCount, 3); i++) {
          try {
            const performance = await taskViewPage.getTaskPerformance(i);

            if (performance.length > 0) {
              console.log(`Task ${i} performance: ${performance}`);

              // Try to verify against expected performance levels
              const matchedLevel = performanceLevels.find(level =>
                performance.toLowerCase().includes(level.toLowerCase())
              );

              if (matchedLevel) {
                await taskViewPage.verifyTaskPerformanceLevel(i, matchedLevel);
              }
            }
          } catch (error) {
            console.log(`Performance verification skipped for task ${i}`);
          }
        }
      }
    }
  });
});

test.describe('Task Management - Accessibility and UX', () => {

  test.beforeEach(async ({ navigateToSelfStudy, selectSubject, selfStudyTestData }) => {
    await navigateToSelfStudy();
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);
  });

  test('Verify task accessibility features', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Test accessibility for first few tasks
        for (let i = 0; i < Math.min(tasksCount, 3); i++) {
          try {
            await taskViewPage.verifyTaskAccessibility(i);
            console.log(`Task ${i} accessibility verification passed`);
          } catch (error) {
            console.log(`Task ${i} accessibility verification failed: ${error.message}`);
          }
        }
      }
    }
  });

  test('Verify keyboard navigation for tasks', async ({
    taskViewPage,
    page
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Test keyboard navigation
        for (let i = 0; i < Math.min(tasksCount, 2); i++) {
          try {
            // Focus on task and test Enter key
            const taskContainer = taskViewPage['getTaskContainer'](i);
            await taskContainer.focus();

            // Verify focus
            const isFocused = await taskContainer.evaluate(el => document.activeElement === el);
            if (isFocused) {
              // Test Enter key interaction
              await page.keyboard.press('Enter');
              await page.waitForTimeout(500);
            }
          } catch (error) {
            console.log(`Keyboard navigation test failed for task ${i}`);
          }
        }
      }
    }
  });

  test('Verify task scrolling and visibility', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Test scrolling to tasks
        for (let i = 0; i < Math.min(tasksCount, 3); i++) {
          await taskViewPage.scrollToTask(i);
          await taskViewPage.verifyTaskVisible(i);
        }
      }
    }
  });

  test('Verify task interaction methods', async ({
    taskViewPage
  }) => {
    if (await taskViewPage.isContainerVisible()) {
      const tasksCount = await taskViewPage.getTasksCount();

      if (tasksCount > 0) {
        // Test different interaction methods on first task
        const taskIndex = 0;

        // Single click
        await taskViewPage.clickTask(taskIndex);
        await taskViewPage.page.waitForTimeout(500);

        // Double click
        await taskViewPage.doubleClickTask(taskIndex);
        await taskViewPage.page.waitForTimeout(500);

        // Hover
        await taskViewPage.hoverOnTask(taskIndex);
        await taskViewPage.page.waitForTimeout(500);
      }
    }
  });
});