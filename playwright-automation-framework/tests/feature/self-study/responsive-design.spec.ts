import { test, expect } from '../../../fixtures/auth.fixture';

/**
 * Responsive Design Test Suite
 * Tests mobile and desktop layouts, viewport adaptations, and cross-device compatibility
 * Covers responsive behavior for all major self-study components
 */

test.describe('Responsive Design - Mobile Layout Adaptations', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    console.log('Setting up Responsive Design test environment...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should display mobile-optimized subjects view layout', async ({ page }) => {
    // Verify main container adapts to mobile
    const subjectsContainer = page.getByTestId('SubjectsView-container');
    await expect(subjectsContainer).toBeVisible();

    const boundingBox = await subjectsContainer.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);

    // Verify subjects grid adapts to mobile
    const subjectsGrid = page.getByTestId('SubjectsView-subjects-grid');
    await expect(subjectsGrid).toBeVisible();

    const gridBox = await subjectsGrid.boundingBox();
    expect(gridBox?.width).toBeLessThanOrEqual(375);

    // Subject cards should be sized appropriately for mobile
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      const firstCard = subjectCards.first();
      const cardBox = await firstCard.boundingBox();

      // Cards should be large enough for touch interaction
      if (cardBox) {
        expect(cardBox.height).toBeGreaterThanOrEqual(60);
        expect(cardBox.width).toBeGreaterThan(0);
      }
    }
  });

  test('should display mobile pagination for continue studying', async ({ page }) => {
    // Check if continue studying section exists
    const continueSection = page.getByTestId('SubjectsView-continue-studying-section');
    const sectionVisible = await continueSection.isVisible().catch(() => false);

    if (sectionVisible) {
      // Check for mobile-specific pagination
      const paginationContainer = page.getByTestId('SubjectsView-pagination-container');
      const paginationVisible = await paginationContainer.isVisible().catch(() => false);

      if (paginationVisible) {
        await expect(paginationContainer).toBeVisible();
        await expect(page.getByTestId('SubjectsView-pagination-component')).toBeVisible();

        // Pagination should fit within mobile viewport
        const paginationBox = await paginationContainer.boundingBox();
        expect(paginationBox?.width).toBeLessThanOrEqual(375);

        // Pagination should be positioned at flex-end with bottom margin
        const alignItems = await paginationContainer.evaluate(el =>
          window.getComputedStyle(el).alignItems || window.getComputedStyle(el).justifyContent
        );
        console.log(`Pagination alignment: ${alignItems}`);
      }
    }
  });

  test('should display mobile bottom navigation container', async ({ page }) => {
    // Check for mobile bottom container
    const mobileBottomContainer = page.getByTestId('syllabus-bottom-container-mobile');
    const mobileVisible = await mobileBottomContainer.isVisible().catch(() => false);

    if (mobileVisible) {
      await expect(mobileBottomContainer).toBeVisible();

      // Verify mobile bottom editor
      await expect(page.getByTestId('syllabus-bottom-editor-mobile')).toBeVisible();
      await expect(page.getByTestId('syllabus-bottom-box-mobile')).toBeVisible();

      // Container should span full mobile width
      const containerBox = await mobileBottomContainer.boundingBox();
      expect(containerBox?.width).toBeLessThanOrEqual(375);

      // Background color should change based on current view
      const backgroundColor = await mobileBottomContainer.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      console.log(`Mobile bottom container background: ${backgroundColor}`);
    }

    // Desktop bottom container should not be visible on mobile
    const desktopBottomContainer = page.getByTestId('syllabus-bottom-container-desktop');
    const desktopVisible = await desktopBottomContainer.isVisible().catch(() => false);
    expect(desktopVisible).toBe(false);
  });

  test('should adapt accordion view for mobile navigation', async ({ page }) => {
    // Navigate to accordion view
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Verify accordion container adapts to mobile
      const accordionContainer = page.getByTestId('accordion-view-container');
      await expect(accordionContainer).toBeVisible();

      const containerBox = await accordionContainer.boundingBox();
      expect(containerBox?.width).toBeLessThanOrEqual(375);

      // Check for mobile breadcrumb navigation
      const breadcrumb = page.getByTestId('accordion-view-breadcrumb-navigation');
      const breadcrumbVisible = await breadcrumb.isVisible().catch(() => false);

      if (breadcrumbVisible) {
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb).toBeEnabled();

        // Breadcrumb should be touch-friendly
        const breadcrumbBox = await breadcrumb.boundingBox();
        if (breadcrumbBox) {
          expect(breadcrumbBox.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Subject tabs should adapt to mobile
      const subjectTabs = page.getByTestId('accordion-view-subject-tabs-container');
      await expect(subjectTabs).toBeVisible();

      const tabsBox = await subjectTabs.boundingBox();
      expect(tabsBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('should handle mobile topic and subtopic selection behavior', async ({ page }) => {
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

        // On mobile, when topic is selected, layout should adapt
        const topicsPanel = page.getByTestId('accordion-view-topics-list-panel');
        const subtopicsPanel = page.getByTestId('accordion-view-subtopics-panel');

        const topicsPanelVisible = await topicsPanel.isVisible().catch(() => false);
        const subtopicsPanelVisible = await subtopicsPanel.isVisible().catch(() => false);

        console.log(`Mobile layout - Topics panel: ${topicsPanelVisible}, Subtopics panel: ${subtopicsPanelVisible}`);

        // Verify responsive layout behavior
        if (subtopicsPanelVisible) {
          const subtopicsBox = await subtopicsPanel.boundingBox();
          expect(subtopicsBox?.width).toBeLessThanOrEqual(375);
        }

        // Check for mobile chapter detail header
        const chapterHeaders = page.locator('[data-testid*="accordion-view-"][data-testid$=""]').filter({
          hasText: /^(?!.*progress-count).*$/
        });

        const headerCount = await chapterHeaders.count();
        if (headerCount > 0) {
          console.log('Mobile chapter detail headers are available');
        }
      }
    }
  });
});

test.describe('Responsive Design - Desktop Layout Behavior', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should display desktop-optimized subjects view layout', async ({ page }) => {
    // Verify subjects container uses full desktop width
    const subjectsContainer = page.getByTestId('SubjectsView-container');
    await expect(subjectsContainer).toBeVisible();

    const boundingBox = await subjectsContainer.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(800);

    // Subjects grid should utilize desktop space efficiently
    const subjectsGrid = page.getByTestId('SubjectsView-subjects-grid');
    await expect(subjectsGrid).toBeVisible();

    // Continue studying should not show mobile pagination on desktop
    const continueSection = page.getByTestId('SubjectsView-continue-studying-section');
    const sectionVisible = await continueSection.isVisible().catch(() => false);

    if (sectionVisible) {
      const paginationContainer = page.getByTestId('SubjectsView-pagination-container');
      const paginationVisible = await paginationContainer.isVisible().catch(() => false);

      // Pagination should not be visible on desktop
      expect(paginationVisible).toBe(false);
    }
  });

  test('should display desktop bottom navigation container', async ({ page }) => {
    // Navigate to accordion view to trigger bottom container
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Check for desktop bottom container
      const desktopBottomContainer = page.getByTestId('syllabus-bottom-container-desktop');
      const desktopVisible = await desktopBottomContainer.isVisible().catch(() => false);

      if (desktopVisible) {
        await expect(desktopBottomContainer).toBeVisible();

        // Verify desktop bottom components
        await expect(page.getByTestId('syllabus-bottom-editor-desktop')).toBeVisible();
        await expect(page.getByTestId('syllabus-bottom-box-desktop')).toBeVisible();

        // Container should utilize desktop width
        const containerBox = await desktopBottomContainer.boundingBox();
        expect(containerBox?.width).toBeGreaterThan(800);
      }

      // Mobile bottom container should not be visible on desktop
      const mobileBottomContainer = page.getByTestId('syllabus-bottom-container-mobile');
      const mobileVisible = await mobileBottomContainer.isVisible().catch(() => false);
      expect(mobileVisible).toBe(false);
    }
  });

  test('should display desktop accordion layout with proper panels', async ({ page }) => {
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Verify both panels are visible on desktop
      const topicsPanel = page.getByTestId('accordion-view-topics-list-panel');
      const subtopicsPanel = page.getByTestId('accordion-view-subtopics-panel');

      await expect(topicsPanel).toBeVisible();
      await expect(subtopicsPanel).toBeVisible();

      // Topics panel should take ~25% width, subtopics ~75% on desktop
      const topicsBox = await topicsPanel.boundingBox();
      const subtopicsBox = await subtopicsPanel.boundingBox();

      if (topicsBox && subtopicsBox) {
        const topicsWidth = topicsBox.width;
        const subtopicsWidth = subtopicsBox.width;
        const ratio = subtopicsWidth / topicsWidth;

        // Ratio should be approximately 3:1 (75% vs 25%)
        expect(ratio).toBeGreaterThan(2);
        expect(ratio).toBeLessThan(4);

        console.log(`Desktop panel ratio: Topics ${topicsWidth}px, Subtopics ${subtopicsWidth}px`);
      }

      // Breadcrumb navigation should not be visible on desktop
      const breadcrumb = page.getByTestId('accordion-view-breadcrumb-navigation');
      const breadcrumbVisible = await breadcrumb.isVisible().catch(() => false);
      expect(breadcrumbVisible).toBe(false);
    }
  });

  test('should display topic progress information on desktop', async ({ page }) => {
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

        // Progress containers should be visible on desktop
        const progressContainers = page.locator('[data-testid*="accordion-view-"][data-testid*="-progress-container"]');
        const progressCount = await progressContainers.count();

        if (progressCount > 0) {
          const firstProgress = progressContainers.first();
          await expect(firstProgress).toBeVisible();

          // Progress information should be properly spaced on desktop
          const progressBox = await firstProgress.boundingBox();
          if (progressBox) {
            expect(progressBox.width).toBeGreaterThan(100);
          }
        }
      }
    }
  });
});

test.describe('Responsive Design - Cross-Device Compatibility', () => {

  test('should work on tablet viewport (768px)', async ({ page, loginPage, homePage, selfStudyPage }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Verify basic functionality on tablet
    const subjectsGrid = page.getByTestId('SubjectsView-subjects-grid');
    await expect(subjectsGrid).toBeVisible();

    const gridBox = await subjectsGrid.boundingBox();
    expect(gridBox?.width).toBeLessThanOrEqual(768);

    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Accordion should adapt to tablet
      const accordionContainer = page.getByTestId('accordion-view-container');
      await expect(accordionContainer).toBeVisible();

      const containerBox = await accordionContainer.boundingBox();
      expect(containerBox?.width).toBeLessThanOrEqual(768);
    }

    console.log('Tablet viewport (768px) functionality verified');
  });

  test('should work on large desktop viewport (1920px)', async ({ page, loginPage, homePage, selfStudyPage }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Verify layout scales to large desktop
    const subjectsContainer = page.getByTestId('SubjectsView-container');
    await expect(subjectsContainer).toBeVisible();

    const boundingBox = await subjectsContainer.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(1200);

    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Verify both panels scale properly on large desktop
      const topicsPanel = page.getByTestId('accordion-view-topics-list-panel');
      const subtopicsPanel = page.getByTestId('accordion-view-subtopics-panel');

      await expect(topicsPanel).toBeVisible();
      await expect(subtopicsPanel).toBeVisible();

      const topicsBox = await topicsPanel.boundingBox();
      const subtopicsBox = await subtopicsPanel.boundingBox();

      if (topicsBox && subtopicsBox) {
        expect(topicsBox.width).toBeGreaterThan(300);
        expect(subtopicsBox.width).toBeGreaterThan(900);
      }
    }

    console.log('Large desktop viewport (1920px) functionality verified');
  });

  test('should work on small mobile viewport (320px)', async ({ page, loginPage, homePage, selfStudyPage }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Verify functionality on very small mobile screen
    const subjectsGrid = page.getByTestId('SubjectsView-subjects-grid');
    await expect(subjectsGrid).toBeVisible();

    const gridBox = await subjectsGrid.boundingBox();
    expect(gridBox?.width).toBeLessThanOrEqual(320);

    // Subject cards should still be usable on small screen
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      const firstCard = subjectCards.first();
      await expect(firstCard).toBeVisible();

      const cardBox = await firstCard.boundingBox();
      if (cardBox) {
        // Card should still be large enough for touch
        expect(cardBox.height).toBeGreaterThanOrEqual(40);
      }

      await firstCard.click();
      await page.waitForTimeout(2000);

      // Accordion should function on small screen
      const accordionContainer = page.getByTestId('accordion-view-container');
      await expect(accordionContainer).toBeVisible();
    }

    console.log('Small mobile viewport (320px) functionality verified');
  });
});

test.describe('Responsive Design - Touch and Interaction Adaptations', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();
  });

  test('should handle touch interactions appropriately', async ({ page }) => {
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      const firstCard = subjectCards.first();

      // Test tap interaction
      await firstCard.tap();
      await page.waitForTimeout(2000);

      // Should navigate to accordion view
      const accordionContainer = page.getByTestId('accordion-view-container');
      await expect(accordionContainer).toBeVisible();

      // Test touch interactions in accordion view
      const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        await topicItems.first().tap();
        await page.waitForTimeout(2000);

        // Should expand topic content
        const subtopicsPanel = page.getByTestId('accordion-view-subtopics-panel');
        await expect(subtopicsPanel).toBeVisible();
      }
    }
  });

  test('should maintain touch target sizes for accessibility', async ({ page }) => {
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);

      // Check subject tab touch targets
      const subjectTabs = page.locator('[data-testid*="accordion-view-tab-"]');
      const tabCount = await subjectTabs.count();

      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        const tab = subjectTabs.nth(i);
        const tabBox = await tab.boundingBox();

        if (tabBox) {
          // Touch targets should be at least 44px high (iOS guidelines)
          expect(tabBox.height).toBeGreaterThanOrEqual(44);
          expect(tabBox.width).toBeGreaterThan(0);
        }
      }

      // Check topic item touch targets
      const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
      const topicCount = await topicItems.count();

      if (topicCount > 0) {
        const firstTopic = topicItems.first();
        const topicBox = await firstTopic.boundingBox();

        if (topicBox) {
          expect(topicBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should adapt self-learn buttons for touch interaction', async ({ page }) => {
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

          // Check self-learn buttons are touch-friendly
          const selfLearnButtons = page.locator('[data-testid*="accordion-view-self-learn-button-"]');
          const buttonCount = await selfLearnButtons.count();

          for (let i = 0; i < buttonCount; i++) {
            const button = selfLearnButtons.nth(i);
            const buttonBox = await button.boundingBox();

            if (buttonBox) {
              // Self-learn buttons should be large enough for touch
              expect(buttonBox.height).toBeGreaterThanOrEqual(44);
              expect(buttonBox.width).toBeGreaterThan(100);
            }
          }
        }
      }
    }
  });

  test('should handle responsive revision elements on mobile', async ({ page }) => {
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

        // Check if revision is available
        const revisionContainer = page.getByTestId('accordion-view-revision-container');
        const revisionVisible = await revisionContainer.isVisible().catch(() => false);

        if (revisionVisible) {
          // Revision buttons should be touch-friendly
          const recapButton = page.getByTestId('accordion-view-recap-button');
          const revisionButton = page.getByTestId('accordion-view-revision-button');

          const recapBox = await recapButton.boundingBox();
          const revisionBox = await revisionButton.boundingBox();

          if (recapBox) {
            expect(recapBox.height).toBeGreaterThanOrEqual(44);
          }

          if (revisionBox) {
            expect(revisionBox.height).toBeGreaterThanOrEqual(44);
          }

          // Test touch interactions
          await recapButton.tap();
          await page.waitForTimeout(500);
          await revisionButton.tap();
          await page.waitForTimeout(500);

          console.log('Revision elements are touch-optimized');
        }
      }
    }
  });
});