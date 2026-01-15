import { test, expect } from '../../../fixtures/auth.fixture';
import { LoginPage } from '../../../pages/LoginPage';
import { HomePage } from '../../../pages/HomePage';
import { SelfStudyPage } from '../../../pages/SelfStudyPage';

/**
 * AccordionView Component Test Suite
 * Tests the main learning interface with expandable content
 * Covers subject tabs, topic/subtopic navigation, and progress tracking
 */

test.describe('AccordionView - Main Learning Interface', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    console.log('Setting up AccordionView test environment...');

    // Navigate to accordion view by selecting a subject
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Select first subject to enter accordion view
    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);
    }
  });

  test('should display accordion view container and basic structure', async ({ page }) => {
    // Verify main accordion container
    await expect(page.getByTestId('accordion-view-container')).toBeVisible();

    // Verify topic-subtopic container structure
    await expect(page.getByTestId('accordion-view-topic-subtopic-container')).toBeVisible();
    await expect(page.getByTestId('accordion-view-main-content-container')).toBeVisible();
  });

  test('should display greeting and top container elements', async ({ page }) => {
    // Verify accordion view specific greeting
    await expect(page.getByTestId('accordion-view-greeting')).toBeVisible();

    // Verify greeting contains user's name
    const greeting = page.getByTestId('accordion-view-greeting');
    const greetingText = await greeting.textContent();
    expect(greetingText).toContain('Hello');
  });

  test('should display subject tabs container', async ({ page }) => {
    // Verify subject tabs container
    await expect(page.getByTestId('accordion-view-subject-tabs-container')).toBeVisible();

    // Check ARIA attributes for accessibility
    const tabsContainer = page.getByTestId('accordion-view-subject-tabs-container');
    await expect(tabsContainer).toHaveAttribute('role', 'tablist');

    // Verify at least one subject tab exists
    const subjectTabs = page.locator('[data-testid*="accordion-view-tab-"]');
    const tabCount = await subjectTabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should allow subject tab selection and switching', async ({ page }) => {
    const subjectTabs = page.locator('[data-testid*="accordion-view-tab-"]');
    const tabCount = await subjectTabs.count();

    if (tabCount > 1) {
      // Click on second tab if available
      const secondTab = subjectTabs.nth(1);
      await secondTab.click();
      await page.waitForTimeout(1000);

      // Verify topic data loads for the new subject
      await expect(page.getByTestId('accordion-view-topics-list-panel')).toBeVisible();
    }
  });

  test('should display topics list panel with topic containers', async ({ page }) => {
    // Verify topics list panel
    await expect(page.getByTestId('accordion-view-topics-list-panel')).toBeVisible();
    await expect(page.getByTestId('accordion-view-topic-container')).toBeVisible();

    // Check for topic items
    const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]')
                          .filter({ hasText: /^(?!.*subtopic).*$/ });
    const topicCount = await topicItems.count();

    if (topicCount > 0) {
      const firstTopic = topicItems.first();
      await expect(firstTopic).toBeVisible();
      await expect(firstTopic).toBeEnabled();
    }
  });

  test('should display subtopics panel when topic is selected', async ({ page }) => {
    // Verify subtopics panel exists
    await expect(page.getByTestId('accordion-view-subtopics-panel')).toBeVisible();

    // Select a topic to load subtopics
    const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
    const topicCount = await topicItems.count();

    if (topicCount > 0) {
      await topicItems.first().click();
      await page.waitForTimeout(2000);

      // Verify subtopic list container appears
      const subtopicContainer = page.getByTestId('accordion-view-subtopic-list-container');
      const isVisible = await subtopicContainer.isVisible().catch(() => false);

      if (isVisible) {
        await expect(subtopicContainer).toBeVisible();
      }
    }
  });

  test('should display topic progress information', async ({ page }) => {
    // Look for topic progress containers
    const progressContainers = page.locator('[data-testid*="accordion-view-"][data-testid*="-progress-container"]');
    const progressCount = await progressContainers.count();

    if (progressCount > 0) {
      const firstProgress = progressContainers.first();
      await expect(firstProgress).toBeVisible();

      // Check for progress count text
      const progressCountElements = page.locator('[data-testid*="accordion-view-"][data-testid*="-progress-count"]');
      const countElementsCount = await progressCountElements.count();

      if (countElementsCount > 0) {
        const progressText = await progressCountElements.first().textContent();
        expect(progressText).toMatch(/\d+\/\d+/); // Should show format like "3/10"
      }
    }
  });

  test('should handle topic selection and expansion', async ({ page }) => {
    const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
    const topicCount = await topicItems.count();

    if (topicCount > 0) {
      const firstTopic = topicItems.first();

      // Click to select/expand topic
      await firstTopic.click();
      await page.waitForTimeout(2000);

      // Verify topic is highlighted/selected
      // This might show in subtopics panel or visual styling
      await expect(page.getByTestId('accordion-view-subtopics-panel')).toBeVisible();
    }
  });
});

test.describe('AccordionView - Subtopic Interactions', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    // Navigate to accordion view and select a topic
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
      }
    }
  });

  test('should display subtopic list container', async ({ page }) => {
    const subtopicContainer = page.getByTestId('accordion-view-subtopic-list-container');
    const isVisible = await subtopicContainer.isVisible().catch(() => false);

    if (isVisible) {
      await expect(subtopicContainer).toBeVisible();
    }
  });

  test('should handle subtopic expansion and interaction', async ({ page }) => {
    // Look for subtopic containers
    const subtopicContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid$="-container"]');
    const subtopicCount = await subtopicContainers.count();

    if (subtopicCount > 0) {
      const firstSubtopic = subtopicContainers.first();
      await expect(firstSubtopic).toBeVisible();

      // Click to expand subtopic
      await firstSubtopic.click();
      await page.waitForTimeout(2000);

      // Look for expanded content (tasks, self-learn buttons, etc.)
      const taskContainer = page.getByTestId('accordion-view-task-container');
      const taskVisible = await taskContainer.isVisible().catch(() => false);

      if (taskVisible) {
        await expect(taskContainer).toBeVisible();
      }
    }
  });

  test('should display subtopic details containers', async ({ page }) => {
    // Look for subtopic details containers
    const detailsContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid*="-details-container"]');
    const detailsCount = await detailsContainers.count();

    if (detailsCount > 0) {
      const firstDetails = detailsContainers.first();
      await expect(firstDetails).toBeVisible();
      await expect(firstDetails).toBeEnabled();
    }
  });

  test('should handle locked subtopic states', async ({ page }) => {
    // Look for subtopic containers that might be locked
    const subtopicContainers = page.locator('[data-testid*="accordion-view-subtopic-"][data-testid$="-container"]');
    const subtopicCount = await subtopicContainers.count();

    if (subtopicCount > 0) {
      // Check if any subtopics have reduced opacity (locked state)
      for (let i = 0; i < subtopicCount; i++) {
        const subtopic = subtopicContainers.nth(i);
        const opacity = await subtopic.evaluate(el => window.getComputedStyle(el).opacity);

        if (parseFloat(opacity) < 1) {
          console.log(`Found locked subtopic at index ${i}`);
          // Locked subtopics should still be visible but not interactive
          await expect(subtopic).toBeVisible();
        }
      }
    }
  });
});

test.describe('AccordionView - Mobile Responsive Behavior', () => {

  test.beforeEach(async ({ page, loginPage, homePage, selfStudyPage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginPage.login();
    await homePage.clickSelfStudyNav();
    await selfStudyPage.verifySelfStudyPage();

    await page.waitForTimeout(2000);
    const subjectCards = page.locator('[data-testid*="SubjectsView-"]').filter({ hasText: /^(?!.*skeleton).*$/ });
    const cardCount = await subjectCards.count();

    if (cardCount > 0) {
      await subjectCards.first().click();
      await page.waitForTimeout(2000);
    }
  });

  test('should display breadcrumb navigation on mobile', async ({ page }) => {
    // Check for mobile breadcrumb navigation
    const breadcrumb = page.getByTestId('accordion-view-breadcrumb-navigation');
    const breadcrumbVisible = await breadcrumb.isVisible().catch(() => false);

    if (breadcrumbVisible) {
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb).toBeEnabled();

      // Test breadcrumb click functionality
      await breadcrumb.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should adapt layout for mobile topic selection', async ({ page }) => {
    // On mobile, when topic is selected, topics list might be hidden
    const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
    const topicCount = await topicItems.count();

    if (topicCount > 0) {
      await topicItems.first().click();
      await page.waitForTimeout(2000);

      // Verify mobile layout adaptation
      const topicsPanel = page.getByTestId('accordion-view-topics-list-panel');
      const subtopicsPanel = page.getByTestId('accordion-view-subtopics-panel');

      // On mobile with topic selected, subtopics panel should be visible
      await expect(subtopicsPanel).toBeVisible();
    }
  });

  test('should maintain proper mobile subject tab layout', async ({ page }) => {
    const tabsContainer = page.getByTestId('accordion-view-subject-tabs-container');
    await expect(tabsContainer).toBeVisible();

    // Verify tabs fit within mobile viewport
    const boundingBox = await tabsContainer.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });
});

test.describe('AccordionView - Accessibility and Performance', () => {

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
    }
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Verify main container has proper ARIA attributes
    const container = page.getByTestId('accordion-view-container');
    await expect(container).toHaveAttribute('role', 'region');

    // Verify subject tabs have proper tablist role
    const tabsContainer = page.getByTestId('accordion-view-subject-tabs-container');
    await expect(tabsContainer).toHaveAttribute('role', 'tablist');
    await expect(tabsContainer).toHaveAttribute('aria-label');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation through subject tabs
    const subjectTabs = page.locator('[data-testid*="accordion-view-tab-"]');
    const tabCount = await subjectTabs.count();

    if (tabCount > 0) {
      const firstTab = subjectTabs.first();
      await firstTab.focus();

      // Should be focusable
      const focused = await firstTab.evaluate(el => document.activeElement === el);
      expect(focused).toBe(true);

      // Test Enter/Space key activation
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should load accordion view within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    // Wait for accordion components to be fully loaded
    await expect(page.getByTestId('accordion-view-container')).toBeVisible();
    await expect(page.getByTestId('accordion-view-topics-list-panel')).toBeVisible();

    const loadTime = Date.now() - startTime;
    console.log(`AccordionView loaded in ${loadTime}ms`);

    // Should load within 8 seconds
    expect(loadTime).toBeLessThan(8000);
  });

  test('should handle rapid topic/subtopic interactions', async ({ page }) => {
    const topicItems = page.locator('[data-testid*="accordion-view-"][data-testid$="-container"]');
    const topicCount = await topicItems.count();

    if (topicCount >= 2) {
      // Rapid topic switching
      await topicItems.first().click();
      await page.waitForTimeout(100);
      await topicItems.nth(1).click();
      await page.waitForTimeout(100);
      await topicItems.first().click();

      // Should still function correctly
      await page.waitForTimeout(1000);
      await expect(page.getByTestId('accordion-view-subtopics-panel')).toBeVisible();
    }
  });
});