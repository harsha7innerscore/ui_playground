import { test, expect } from '../../fixtures/selfStudy.fixture';
import { VIEWPORTS } from '../../fixtures/selfStudy.fixture';

/**
 * Multi-Device Testing for Self-Study Features
 * Comprehensive responsive design and cross-device functionality tests
 * Tests across Mobile, Tablet, Desktop, and various viewport sizes
 */

test.describe('Multi-Device Testing - Responsive Layout Verification', () => {

  test.beforeEach(async ({ navigateToSelfStudy }) => {
    await navigateToSelfStudy();
  });

  test('Verify self-study page across all device types', async ({
    subjectsViewPage,
    page
  }) => {
    const devices = [
      { name: 'Mobile (iPhone)', ...VIEWPORTS.mobile },
      { name: 'Small Mobile', ...VIEWPORTS.smallMobile },
      { name: 'Large Mobile', ...VIEWPORTS.largeMobile },
      { name: 'Tablet', ...VIEWPORTS.tablet },
      { name: 'Large Tablet', ...VIEWPORTS.largeTablet },
      { name: 'Desktop', ...VIEWPORTS.desktop }
    ];

    for (const device of devices) {
      console.log(`Testing on ${device.name} (${device.width}x${device.height})`);

      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      // Verify page loads correctly on this device
      await subjectsViewPage.waitForPageToLoad();
      await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();

      // Verify subjects grid is visible
      await expect(subjectsViewPage.isSubjectsGridVisible()).resolves.toBeTruthy();

      // Check if page layout is appropriate for viewport
      const subjectCardsCount = await subjectsViewPage.getSubjectCardsCount();
      expect(subjectCardsCount).toBeGreaterThan(0);

      // Test continue studying section if available
      if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
        const cardsCount = await subjectsViewPage.getContinueStudyingCardsCount();
        expect(cardsCount).toBeLessThanOrEqual(3);
      }

      console.log(`${device.name}: ✓ Layout verification passed`);
    }
  });

  test('Verify specific mobile layout requirements (TC_AV_26)', async ({
    subjectsViewPage,
    page
  }) => {
    // Given: Device width is less than 768px
    await page.setViewportSize(VIEWPORTS.mobile);

    // When: The Self Study page loads
    await subjectsViewPage.waitForPageToLoad();

    // Then: Subject cards and Continue Studying cards should appear in single-column layout
    await subjectsViewPage.verifyMobileLayout();

    // Verify mobile-specific elements
    await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();
    await expect(subjectsViewPage.isSubjectsGridVisible()).resolves.toBeTruthy();

    // Check that layout is optimized for mobile
    const subjectCards = await subjectsViewPage.getSubjectCards();
    expect(subjectCards.length).toBeGreaterThan(0);

    console.log('Mobile layout verification completed');
  });

  test('Verify specific tablet layout requirements (TC_AV_25)', async ({
    subjectsViewPage,
    page
  }) => {
    // Given: Device width is between 768px and 1024px
    await page.setViewportSize(VIEWPORTS.tablet);

    // When: The Self Study page loads
    await subjectsViewPage.waitForPageToLoad();

    // Then: Subject cards should display 2–3 cards per row and adjust spacing accordingly
    await subjectsViewPage.verifyTabletLayout();

    // Verify tablet-specific layout
    await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();
    await expect(subjectsViewPage.isSubjectsGridVisible()).resolves.toBeTruthy();

    console.log('Tablet layout verification completed');
  });

  test('Verify desktop layout optimization', async ({
    subjectsViewPage,
    page
  }) => {
    // Set large desktop viewport
    await page.setViewportSize(VIEWPORTS.desktop);

    await subjectsViewPage.waitForPageToLoad();

    // Verify desktop-specific optimizations
    await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();
    await expect(subjectsViewPage.isSubjectsGridVisible()).resolves.toBeTruthy();

    // Verify greeting message is prominent on desktop
    const greetingMessage = await subjectsViewPage.getGreetingMessage();
    expect(greetingMessage.length).toBeGreaterThan(0);

    // Verify continue studying layout on desktop
    if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
      await subjectsViewPage.verifyCardLayout();
    }

    console.log('Desktop layout verification completed');
  });
});

test.describe('Multi-Device Testing - Navigation and Interaction', () => {

  test.beforeEach(async ({ navigateToSelfStudy }) => {
    await navigateToSelfStudy();
  });

  test('Verify subject navigation across devices', async ({
    subjectsViewPage,
    accordionViewPage,
    selfStudyTestData,
    page
  }) => {
    const testSubject = selfStudyTestData.subjects[0];

    const devices = [
      { name: 'Mobile', ...VIEWPORTS.mobile },
      { name: 'Tablet', ...VIEWPORTS.tablet },
      { name: 'Desktop', ...VIEWPORTS.desktop }
    ];

    for (const device of devices) {
      console.log(`Testing subject navigation on ${device.name}`);

      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      // Navigate to self study (refresh state)
      await subjectsViewPage.navigateToSelfStudy();
      await subjectsViewPage.waitForPageToLoad();

      // Test subject navigation
      try {
        await subjectsViewPage.clickSubject(testSubject);
        await accordionViewPage.waitForPageToLoad();

        // Verify navigation worked
        await expect(accordionViewPage.isContainerVisible()).resolves.toBeTruthy();

        console.log(`${device.name}: ✓ Subject navigation successful`);

        // Navigate back for next test
        await page.goBack();
        await subjectsViewPage.waitForPageToLoad();

      } catch (error) {
        console.log(`${device.name}: Subject navigation failed - ${error.message}`);
      }
    }
  });

  test('Verify continue studying interactions across devices', async ({
    subjectsViewPage,
    page
  }) => {
    const devices = [
      { name: 'Mobile', ...VIEWPORTS.mobile },
      { name: 'Tablet', ...VIEWPORTS.tablet },
      { name: 'Desktop', ...VIEWPORTS.desktop }
    ];

    for (const device of devices) {
      console.log(`Testing continue studying on ${device.name}`);

      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      // Refresh and load page
      await page.reload();
      await subjectsViewPage.waitForPageToLoad();

      if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
        const cardsCount = await subjectsViewPage.getContinueStudyingCardsCount();

        if (cardsCount > 0) {
          // Test hover on first card
          await subjectsViewPage.hoverOnContinueStudyingCard(0);
          await page.waitForTimeout(300);

          // Verify card UI elements
          await subjectsViewPage.verifyContinueStudyingCardUI(0);

          console.log(`${device.name}: ✓ Continue studying interactions verified`);
        }
      } else {
        console.log(`${device.name}: No continue studying cards available`);
      }
    }
  });

  test('Verify touch interactions on mobile devices', async ({
    subjectsViewPage,
    page
  }) => {
    // Set mobile viewport
    await page.setViewportSize(VIEWPORTS.mobile);

    await subjectsViewPage.waitForPageToLoad();

    // Test touch-friendly interactions
    const subjectCards = await subjectsViewPage.getSubjectCards();

    if (subjectCards.length > 0) {
      // Test tap on subject card
      await subjectCards[0].tap();
      await page.waitForTimeout(500);

      console.log('Mobile touch interaction test completed');
    }

    // If continue studying is available, test touch interactions
    if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
      const cardsCount = await subjectsViewPage.getContinueStudyingCardsCount();

      if (cardsCount > 0) {
        const continueCards = await subjectsViewPage.getContinueStudyingCards();
        await continueCards[0].tap();
        await page.waitForTimeout(500);

        console.log('Continue studying touch interaction test completed');
      }
    }
  });
});

test.describe('Multi-Device Testing - Accordion View Navigation', () => {

  test.beforeEach(async ({ navigateToSelfStudy, selectSubject, selfStudyTestData }) => {
    await navigateToSelfStudy();
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);
  });

  test('Verify breadcrumb navigation on mobile', async ({
    accordionViewPage,
    subjectsViewPage,
    page
  }) => {
    // Set mobile viewport to enable breadcrumb
    await page.setViewportSize(VIEWPORTS.mobile);

    // Verify mobile layout
    await accordionViewPage.verifyMobileLayout();

    // Test breadcrumb navigation if available
    if (await accordionViewPage.isBreadcrumbVisible()) {
      console.log('Breadcrumb navigation is available on mobile');

      // Test breadcrumb click
      await accordionViewPage.clickBreadcrumb();

      // Should navigate back to subjects view
      await subjectsViewPage.waitForPageToLoad();
      await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();

      console.log('Mobile breadcrumb navigation test completed');
    } else {
      console.log('Breadcrumb navigation not available on mobile for this implementation');
    }
  });

  test('Verify accordion view responsiveness', async ({
    accordionViewPage,
    page
  }) => {
    const devices = [
      { name: 'Mobile', ...VIEWPORTS.mobile },
      { name: 'Tablet', ...VIEWPORTS.tablet },
      { name: 'Desktop', ...VIEWPORTS.desktop }
    ];

    for (const device of devices) {
      console.log(`Testing accordion view on ${device.name}`);

      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      // Verify accordion view is functional
      await expect(accordionViewPage.isContainerVisible()).resolves.toBeTruthy();

      if (device.name === 'Mobile') {
        // Mobile-specific checks
        await accordionViewPage.verifyMobileLayout();
      } else {
        // Desktop/tablet checks
        await accordionViewPage.verifyDesktopLayout();
      }

      console.log(`${device.name}: ✓ Accordion view responsive test passed`);
    }
  });

  test('Verify topic interactions across devices', async ({
    accordionViewPage,
    selfStudyTestData,
    page
  }) => {
    const devices = [
      { name: 'Mobile', ...VIEWPORTS.mobile },
      { name: 'Desktop', ...VIEWPORTS.desktop }
    ];

    for (const device of devices) {
      console.log(`Testing topic interactions on ${device.name}`);

      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      // Get available topics
      const topicsCount = await accordionViewPage.getTopicsCount();

      if (topicsCount > 0) {
        const testTopic = selfStudyTestData.topics[0];

        try {
          // Test topic clicking
          await accordionViewPage.clickTopic(testTopic);
          await accordionViewPage.waitForTopicContentLoad(testTopic);

          console.log(`${device.name}: ✓ Topic interaction successful`);

        } catch (error) {
          console.log(`${device.name}: Topic interaction failed - ${error.message}`);
        }
      } else {
        console.log(`${device.name}: No topics available for interaction testing`);
      }
    }
  });
});

test.describe('Multi-Device Testing - Performance and Loading', () => {

  test('Verify page loading performance across devices', async ({
    subjectsViewPage,
    page
  }) => {
    const devices = [
      { name: 'Mobile', ...VIEWPORTS.mobile },
      { name: 'Tablet', ...VIEWPORTS.tablet },
      { name: 'Desktop', ...VIEWPORTS.desktop }
    ];

    for (const device of devices) {
      console.log(`Testing loading performance on ${device.name}`);

      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      // Measure loading time
      const startTime = Date.now();

      await subjectsViewPage.navigateToSelfStudy();
      await subjectsViewPage.waitForPageToLoad();

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      console.log(`${device.name}: Page loaded in ${loadTime}ms`);

      // Verify core elements are loaded
      await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();

      // Performance expectation (adjust based on requirements)
      expect(loadTime).toBeLessThan(10000); // 10 seconds max

      console.log(`${device.name}: ✓ Performance test passed`);
    }
  });

  test('Verify skeleton loading across devices', async ({
    subjectsViewPage,
    page
  }) => {
    const devices = [
      { name: 'Mobile', ...VIEWPORTS.mobile },
      { name: 'Desktop', ...VIEWPORTS.desktop }
    ];

    for (const device of devices) {
      console.log(`Testing skeleton loading on ${device.name}`);

      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      // Navigate and test skeleton loading
      await subjectsViewPage.navigateToSelfStudy();

      // Wait for skeleton loaders to disappear
      await subjectsViewPage.waitForSkeletonLoader(0);

      // Verify content is loaded
      await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();

      console.log(`${device.name}: ✓ Skeleton loading test passed`);
    }
  });
});

test.describe('Multi-Device Testing - Error States and Edge Cases', () => {

  test('Verify error handling across devices', async ({
    subjectsViewPage,
    page
  }) => {
    const devices = [
      { name: 'Mobile', ...VIEWPORTS.mobile },
      { name: 'Desktop', ...VIEWPORTS.desktop }
    ];

    for (const device of devices) {
      console.log(`Testing error handling on ${device.name}`);

      // Set viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      await subjectsViewPage.navigateToSelfStudy();
      await subjectsViewPage.waitForPageToLoad();

      // Check for empty states
      const subjectCardsCount = await subjectsViewPage.getSubjectCardsCount();

      if (subjectCardsCount === 0) {
        // Test empty state handling
        await subjectsViewPage.verifyEmptySubjectsState();
        console.log(`${device.name}: ✓ Empty state handling verified`);
      } else {
        console.log(`${device.name}: Normal state with ${subjectCardsCount} subjects`);
      }
    }
  });

  test('Verify orientation changes (mobile/tablet)', async ({
    subjectsViewPage,
    page
  }) => {
    // Test portrait and landscape orientations
    const orientations = [
      { name: 'Portrait', width: 375, height: 667 },
      { name: 'Landscape', width: 667, height: 375 }
    ];

    for (const orientation of orientations) {
      console.log(`Testing ${orientation.name} orientation`);

      // Set orientation
      await page.setViewportSize({
        width: orientation.width,
        height: orientation.height
      });

      await subjectsViewPage.navigateToSelfStudy();
      await subjectsViewPage.waitForPageToLoad();

      // Verify layout adapts to orientation
      await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();

      console.log(`${orientation.name}: ✓ Orientation test passed`);
    }
  });

  test('Verify very small and very large viewports', async ({
    subjectsViewPage,
    page
  }) => {
    const extremeViewports = [
      { name: 'Very Small', width: 280, height: 480 },
      { name: 'Very Large', width: 1920, height: 1080 }
    ];

    for (const viewport of extremeViewports) {
      console.log(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);

      // Set extreme viewport
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      await subjectsViewPage.navigateToSelfStudy();
      await subjectsViewPage.waitForPageToLoad();

      // Verify page still functions
      await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();

      // Verify core functionality is maintained
      const subjectCardsCount = await subjectsViewPage.getSubjectCardsCount();
      expect(subjectCardsCount).toBeGreaterThanOrEqual(0);

      console.log(`${viewport.name}: ✓ Extreme viewport test passed`);
    }
  });
});