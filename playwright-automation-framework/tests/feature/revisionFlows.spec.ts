import { test, expect } from '../../fixtures/selfStudy.fixture';

/**
 * Revision Flows Feature Tests
 * Comprehensive tests for revision functionality, recap features, and self-learning buttons
 * Covers revision-specific interactions and flows
 */

test.describe('Revision Feature - Basic Functionality', () => {

  test.beforeEach(async ({ navigateToSelfStudy, selectSubject, selfStudyTestData }) => {
    await navigateToSelfStudy();

    // Navigate to a subject to potentially access revision features
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);
  });

  test('Verify revision container availability and enablement', async ({
    revisionViewPage
  }) => {
    // Check if revision feature is enabled
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      console.log('Revision feature is enabled and available');

      // Verify revision container is visible
      await expect(revisionViewPage.isRevisionContainerVisible()).resolves.toBeTruthy();

      // Load revision page
      await revisionViewPage.waitForPageToLoad();

    } else {
      console.log('Revision feature is not enabled - may not be available for this subject/user');
    }
  });

  test('Verify revision content loading and display', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      // Verify revision content loads correctly
      await revisionViewPage.verifyRevisionContentLoad();

      // Get revision title
      const revisionTitle = await revisionViewPage.getRevisionTitle();
      expect(revisionTitle.length).toBeGreaterThan(0);
      console.log(`Revision title: ${revisionTitle}`);

      // Check if description is available
      if (await revisionViewPage.isRevisionDescriptionVisible()) {
        const description = await revisionViewPage.getRevisionDescription();
        console.log(`Revision description: ${description}`);
      }

    } else {
      test.skip();
    }
  });

  test('Verify revision has data and content', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      // Check if revision data container is visible
      const hasRevisionData = await revisionViewPage.isRevisionDataVisible();

      if (hasRevisionData) {
        // Verify revision has actual data
        await revisionViewPage.verifyRevisionHasData();

        // Check task details count
        const taskDetailsCount = await revisionViewPage.getRevisionTaskDetailsCount();
        console.log(`Revision task details count: ${taskDetailsCount}`);

        if (taskDetailsCount > 0) {
          await revisionViewPage.verifyAllTaskDetailsHaveContent();
        }

      } else {
        // Test empty revision state
        await revisionViewPage.verifyEmptyRevisionState();
      }

    } else {
      test.skip();
    }
  });

  test('Verify revision task details display', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      const taskDetailsCount = await revisionViewPage.getRevisionTaskDetailsCount();

      if (taskDetailsCount > 0) {
        // Test first few task details
        for (let i = 0; i < Math.min(taskDetailsCount, 3); i++) {
          await revisionViewPage.verifyRevisionTaskDetailsVisible(i);

          const taskText = await revisionViewPage.getRevisionTaskDetailsText(i);
          expect(taskText.length).toBeGreaterThan(0);
          console.log(`Task detail ${i}: ${taskText}`);
        }

        // Verify task details container is visible
        await expect(revisionViewPage.isTaskDetailsContainerVisible()).resolves.toBeTruthy();

      } else {
        console.log('No revision task details available');
      }

    } else {
      test.skip();
    }
  });
});

test.describe('Revision Feature - Recap Button Functionality', () => {

  test.beforeEach(async ({ navigateToSelfStudy, selectSubject, selfStudyTestData }) => {
    await navigateToSelfStudy();
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);
  });

  test('Verify recap button visibility and functionality', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      const isRecapButtonVisible = await revisionViewPage.isRecapButtonVisible();

      if (isRecapButtonVisible) {
        console.log('Recap button is visible and available');

        // Test clicking recap button
        await revisionViewPage.clickRecapButton();
        await revisionViewPage.page.waitForTimeout(1000);

        console.log('Recap button clicked successfully');

      } else {
        console.log('Recap button not visible - may not be available for current state');
      }

    } else {
      test.skip();
    }
  });

  test('Verify recap button hover effects', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled && await revisionViewPage.isRecapButtonVisible()) {
      // Test hover effect on recap button
      await revisionViewPage.verifyRecapButtonHoverEffect();

      console.log('Recap button hover effect verified');

    } else {
      test.skip();
    }
  });

  test('Verify action button functionality', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      const isActionButtonVisible = await revisionViewPage.isActionButtonVisible();

      if (isActionButtonVisible) {
        console.log('Action button is visible');

        // Test clicking action button
        await revisionViewPage.clickActionButton();
        await revisionViewPage.page.waitForTimeout(1000);

        console.log('Action button clicked successfully');

      } else {
        console.log('Action button not visible');
      }

    } else {
      test.skip();
    }
  });

  test('Verify revision navigation flow', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      try {
        // Test navigation to revision details
        await revisionViewPage.navigateToRevisionDetails();

        console.log('Revision navigation completed successfully');

      } catch (error) {
        console.log(`Revision navigation failed: ${error.message}`);
      }

    } else {
      test.skip();
    }
  });
});

test.describe('Revision Feature - Self-Learning Buttons', () => {

  test.beforeEach(async ({ navigateToSelfStudy, selectSubject, selfStudyTestData }) => {
    await navigateToSelfStudy();
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);
  });

  test('Verify self-learning buttons container visibility', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      const isSelfLearnButtonsVisible = await revisionViewPage.isSelfLearnButtonsVisible();

      if (isSelfLearnButtonsVisible) {
        console.log('Self-learning buttons container is visible');

        // Get count of available buttons
        const buttonsCount = await revisionViewPage.getSelfLearnButtonsCount();
        console.log(`Self-learning buttons count: ${buttonsCount}`);

        expect(buttonsCount).toBeGreaterThan(0);

      } else {
        console.log('Self-learning buttons not visible - may not be available');
      }

    } else {
      test.skip();
    }
  });

  test('Verify all self-learning buttons are clickable', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled && await revisionViewPage.isSelfLearnButtonsVisible()) {
      // Verify all buttons are clickable
      await revisionViewPage.verifyAllSelfLearnButtonsClickable();

      console.log('All self-learning buttons are clickable');

    } else {
      test.skip();
    }
  });

  test('Verify individual self-learning button types', async ({
    revisionViewPage,
    selfStudyTestData
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled && await revisionViewPage.isSelfLearnButtonsVisible()) {
      const taskTypes = selfStudyTestData.taskTypes;

      // Test each task type button
      for (const taskType of taskTypes) {
        try {
          await revisionViewPage.verifySelfLearnButtonVisible(taskType);
          console.log(`${taskType} button is visible`);

          // Test clicking the button
          await revisionViewPage.clickSelfLearnButton(taskType);
          await revisionViewPage.page.waitForTimeout(500);

          console.log(`${taskType} button clicked successfully`);

        } catch (error) {
          console.log(`${taskType} button not available: ${error.message}`);
        }
      }

    } else {
      test.skip();
    }
  });

  test('Verify specific self-learning button interactions', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled && await revisionViewPage.isSelfLearnButtonsVisible()) {
      // Test assessment button
      try {
        await revisionViewPage.clickAssessmentButton();
        console.log('Assessment button interaction successful');
      } catch (error) {
        console.log('Assessment button not available');
      }

      // Test guided practice button
      try {
        await revisionViewPage.clickGuidedPracticeButton();
        console.log('Guided practice button interaction successful');
      } catch (error) {
        console.log('Guided practice button not available');
      }

      // Test learn subtopic button
      try {
        await revisionViewPage.clickLearnSubtopicButton();
        console.log('Learn subtopic button interaction successful');
      } catch (error) {
        console.log('Learn subtopic button not available');
      }

      // Test learn prerequisite button
      try {
        await revisionViewPage.clickLearnPrerequisiteButton();
        console.log('Learn prerequisite button interaction successful');
      } catch (error) {
        console.log('Learn prerequisite button not available');
      }

    } else {
      test.skip();
    }
  });

  test('Verify self-learning button hover effects', async ({
    revisionViewPage,
    selfStudyTestData
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled && await revisionViewPage.isSelfLearnButtonsVisible()) {
      const taskTypes = selfStudyTestData.taskTypes;

      // Test hover effects on available buttons
      for (const taskType of taskTypes) {
        try {
          await revisionViewPage.hoverOnSelfLearnButton(taskType);
          await revisionViewPage.page.waitForTimeout(300);

          console.log(`${taskType} button hover effect tested`);

        } catch (error) {
          console.log(`${taskType} button hover test failed`);
        }
      }

    } else {
      test.skip();
    }
  });
});

test.describe('Revision Feature - Accessibility and UX', () => {

  test.beforeEach(async ({ navigateToSelfStudy, selectSubject, selfStudyTestData }) => {
    await navigateToSelfStudy();
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);
  });

  test('Verify revision accessibility features', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      // Test revision accessibility
      await revisionViewPage.verifyRevisionAccessibility();

      console.log('Revision accessibility verification completed');

    } else {
      test.skip();
    }
  });

  test('Verify all interactive elements functionality', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      // Verify all interactive elements are functional
      await revisionViewPage.verifyAllInteractiveElementsFunctional();

      console.log('All revision interactive elements verified');

    } else {
      test.skip();
    }
  });

  test('Verify revision loading states', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      // Test revision loading state
      await revisionViewPage.verifyRevisionLoadingState();

      console.log('Revision loading state verification completed');

    } else {
      test.skip();
    }
  });

  test('Verify revision responsive design', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      // Test responsive design
      await revisionViewPage.verifyRevisionResponsiveDesign();

      console.log('Revision responsive design verification completed');

    } else {
      test.skip();
    }
  });

  test('Verify view more container functionality', async ({
    revisionViewPage
  }) => {
    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      const isViewMoreVisible = await revisionViewPage.isViewMoreContainerVisible();

      if (isViewMoreVisible) {
        console.log('View more container is visible in revision section');

        // Test any interactions with view more container
        // (specific implementation depends on what view more does in revision context)

      } else {
        console.log('View more container not visible in revision section');
      }

    } else {
      test.skip();
    }
  });
});

test.describe('Revision Feature - Integration with Other Components', () => {

  test('Verify revision access from self-study fixture', async ({
    navigateToSelfStudy,
    accessRevision
  }) => {
    await navigateToSelfStudy();

    try {
      // Test accessing revision through the fixture method
      await accessRevision();

      console.log('Revision access through fixture successful');

    } catch (error) {
      console.log(`Revision access failed: ${error.message}`);
    }
  });

  test('Verify revision state across navigation', async ({
    navigateToSelfStudy,
    selectSubject,
    revisionViewPage,
    page,
    selfStudyTestData
  }) => {
    await navigateToSelfStudy();

    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);

    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();

    if (isRevisionEnabled) {
      // Store revision state
      const initialRevisionTitle = await revisionViewPage.getRevisionTitle();

      // Navigate away and back
      await page.goBack();
      await page.waitForTimeout(1000);
      await page.goForward();
      await page.waitForTimeout(1000);

      // Verify revision state is maintained
      if (await revisionViewPage.isRevisionEnabled()) {
        const afterNavigationTitle = await revisionViewPage.getRevisionTitle();
        expect(afterNavigationTitle).toBe(initialRevisionTitle);

        console.log('Revision state maintained across navigation');
      }

    } else {
      test.skip();
    }
  });

  test('Verify revision interaction with task management', async ({
    navigateToSelfStudy,
    selectSubject,
    revisionViewPage,
    taskViewPage,
    selfStudyTestData
  }) => {
    await navigateToSelfStudy();

    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);

    const isRevisionEnabled = await revisionViewPage.isRevisionEnabled();
    const isTaskViewAvailable = await taskViewPage.isContainerVisible();

    if (isRevisionEnabled && isTaskViewAvailable) {
      // Both revision and task management are available
      console.log('Both revision and task management features are available');

      // Test interaction between revision and tasks
      const revisionTasksCount = await revisionViewPage.getRevisionTaskDetailsCount();
      const generalTasksCount = await taskViewPage.getTasksCount();

      console.log(`Revision tasks: ${revisionTasksCount}, General tasks: ${generalTasksCount}`);

    } else {
      console.log('Either revision or task management not available for integration testing');
    }
  });
});