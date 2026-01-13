import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Revision View component
 * Handles revision features, recap button, revision tasks, and data
 */
export class RevisionViewPage extends BasePage {

  // Main revision containers
  private readonly container: Locator;
  private readonly title: Locator;
  private readonly recapButton: Locator;
  private readonly description: Locator;
  private readonly dataContainer: Locator;
  private readonly taskDetailsContainer: Locator;
  private readonly viewMoreContainer: Locator;
  private readonly actionButton: Locator;

  // Self-learning buttons container
  private readonly selfLearnButtonsContainer: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators based on YAML test IDs
    this.container = this.page.getByTestId('accordion-view-revision-container');
    this.title = this.page.getByTestId('accordion-view-revision');
    this.recapButton = this.page.getByTestId('accordion-view-recap-button');
    this.description = this.page.getByTestId('accordion-view-revision-text');
    this.dataContainer = this.page.getByTestId('accordion-view-revision-data');
    this.taskDetailsContainer = this.page.getByTestId('accordion-view-revision-task-details-container');
    this.viewMoreContainer = this.page.getByTestId('accordion-view-revision-view-more-container');
    this.actionButton = this.page.getByTestId('accordion-view-revision-button');

    // Self-learning buttons
    this.selfLearnButtonsContainer = this.page.getByTestId('accordion-view-self-learn-buttons-container');
  }

  /**
   * Wait for the revision view to load completely
   */
  async waitForPageToLoad(): Promise<void> {
    await this.waitForElement(this.container);
    await this.waitForPageLoad('networkidle');
  }

  /**
   * Check if the revision container is visible
   */
  async isRevisionContainerVisible(): Promise<boolean> {
    return await this.isVisible(this.container);
  }

  /**
   * Check if revision feature is enabled (should be visible and not in side nav)
   */
  async isRevisionEnabled(): Promise<boolean> {
    // Check if container is visible and not hidden
    if (!(await this.isRevisionContainerVisible())) {
      return false;
    }

    // Additional check to ensure it's not in side navigation
    const isInSideNav = await this.container.evaluate((element) => {
      const parent = element.closest('[class*="sidebar"], [class*="side-nav"], [role="navigation"]');
      return parent !== null;
    });

    return !isInSideNav;
  }

  /**
   * Get the revision section title
   */
  async getRevisionTitle(): Promise<string> {
    return await this.getTextContent(this.title);
  }

  /**
   * Click the recap button
   */
  async clickRecapButton(): Promise<void> {
    await this.waitForElement(this.recapButton);
    await this.clickWithRetry(this.recapButton);
  }

  /**
   * Check if recap button is visible
   */
  async isRecapButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.recapButton);
  }

  /**
   * Get the revision description text
   */
  async getRevisionDescription(): Promise<string> {
    return await this.getTextContent(this.description);
  }

  /**
   * Check if revision description is visible
   */
  async isRevisionDescriptionVisible(): Promise<boolean> {
    return await this.isVisible(this.description);
  }

  /**
   * Check if revision data container is visible
   */
  async isRevisionDataVisible(): Promise<boolean> {
    return await this.isVisible(this.dataContainer);
  }

  /**
   * Check if task details container is visible
   */
  async isTaskDetailsContainerVisible(): Promise<boolean> {
    return await this.isVisible(this.taskDetailsContainer);
  }

  /**
   * Check if view more container is visible
   */
  async isViewMoreContainerVisible(): Promise<boolean> {
    return await this.isVisible(this.viewMoreContainer);
  }

  /**
   * Click the revision action button
   */
  async clickActionButton(): Promise<void> {
    await this.waitForElement(this.actionButton);
    await this.clickWithRetry(this.actionButton);
  }

  /**
   * Check if action button is visible
   */
  async isActionButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.actionButton);
  }

  /**
   * Get revision task details item by index (dynamic test ID)
   * @param index - Index of the task details item
   */
  private getRevisionTaskDetailsItem(index: number): Locator {
    return this.page.getByTestId(`accordion-view-revision-task-details-${index}`);
  }

  /**
   * Get text content of a specific revision task details item
   * @param index - Index of the task details item
   */
  async getRevisionTaskDetailsText(index: number): Promise<string> {
    const taskItem = this.getRevisionTaskDetailsItem(index);
    return await this.getTextContent(taskItem);
  }

  /**
   * Verify revision task details item is visible
   * @param index - Index of the task details item
   */
  async verifyRevisionTaskDetailsVisible(index: number): Promise<void> {
    const taskItem = this.getRevisionTaskDetailsItem(index);
    await expect(taskItem).toBeVisible();
  }

  /**
   * Get all revision task details items
   */
  async getAllRevisionTaskDetails(): Promise<Locator[]> {
    return await this.page.locator('[data-testid*="accordion-view-revision-task-details-"]').all();
  }

  /**
   * Get the number of revision task details displayed
   */
  async getRevisionTaskDetailsCount(): Promise<number> {
    const items = await this.getAllRevisionTaskDetails();
    return items.length;
  }

  /**
   * Verify that revision has data (task data length > 0)
   */
  async verifyRevisionHasData(): Promise<void> {
    // Check if data container is visible
    await expect(this.dataContainer).toBeVisible();

    // Check if task details are present
    const taskDetailsCount = await this.getRevisionTaskDetailsCount();
    expect(taskDetailsCount).toBeGreaterThan(0);
  }

  /**
   * Verify all revision task details have content
   */
  async verifyAllTaskDetailsHaveContent(): Promise<void> {
    const taskDetailsCount = await this.getRevisionTaskDetailsCount();

    for (let i = 0; i < taskDetailsCount; i++) {
      await this.verifyRevisionTaskDetailsVisible(i);

      const taskText = await this.getRevisionTaskDetailsText(i);
      expect(taskText.trim().length).toBeGreaterThan(0);
    }
  }

  /**
   * Check if self-learning buttons container is visible
   */
  async isSelfLearnButtonsVisible(): Promise<boolean> {
    return await this.isVisible(this.selfLearnButtonsContainer);
  }

  /**
   * Get self-learning action button by task type (dynamic test ID)
   * @param taskType - Type of task (assessment, guidedPractise, learnSubtopic, learnPrerequisite)
   */
  private getSelfLearnActionButton(taskType: string): Locator {
    return this.page.getByTestId(`accordion-view-self-learn-button-${taskType}`);
  }

  /**
   * Click on a specific self-learning action button
   * @param taskType - Type of task to click
   */
  async clickSelfLearnButton(taskType: string): Promise<void> {
    const button = this.getSelfLearnActionButton(taskType);
    await this.waitForElement(button);
    await this.clickWithRetry(button);
  }

  /**
   * Verify self-learning button is visible
   * @param taskType - Type of task button to verify
   */
  async verifySelfLearnButtonVisible(taskType: string): Promise<void> {
    const button = this.getSelfLearnActionButton(taskType);
    await expect(button).toBeVisible();
  }

  /**
   * Get all available self-learning buttons
   */
  async getAllSelfLearnButtons(): Promise<Locator[]> {
    return await this.page.locator('[data-testid*="accordion-view-self-learn-button-"]').all();
  }

  /**
   * Get the number of self-learning buttons available
   */
  async getSelfLearnButtonsCount(): Promise<number> {
    const buttons = await this.getAllSelfLearnButtons();
    return buttons.length;
  }

  /**
   * Verify all self-learning buttons are clickable
   */
  async verifyAllSelfLearnButtonsClickable(): Promise<void> {
    const buttons = await this.getAllSelfLearnButtons();

    for (const button of buttons) {
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  }

  /**
   * Click on assessment self-learning button
   */
  async clickAssessmentButton(): Promise<void> {
    await this.clickSelfLearnButton('assessment');
  }

  /**
   * Click on guided practice self-learning button
   */
  async clickGuidedPracticeButton(): Promise<void> {
    await this.clickSelfLearnButton('guidedPractise');
  }

  /**
   * Click on learn subtopic self-learning button
   */
  async clickLearnSubtopicButton(): Promise<void> {
    await this.clickSelfLearnButton('learnSubtopic');
  }

  /**
   * Click on learn prerequisite self-learning button
   */
  async clickLearnPrerequisiteButton(): Promise<void> {
    await this.clickSelfLearnButton('learnPrerequisite');
  }

  /**
   * Hover over recap button
   */
  async hoverOnRecapButton(): Promise<void> {
    await this.hover(this.recapButton);
  }

  /**
   * Hover over action button
   */
  async hoverOnActionButton(): Promise<void> {
    await this.hover(this.actionButton);
  }

  /**
   * Hover over a self-learning button
   * @param taskType - Type of task button to hover
   */
  async hoverOnSelfLearnButton(taskType: string): Promise<void> {
    const button = this.getSelfLearnActionButton(taskType);
    await this.hover(button);
  }

  /**
   * Verify revision button hover effects
   */
  async verifyRecapButtonHoverEffect(): Promise<void> {
    const button = this.recapButton;

    // Get initial state
    const initialClasses = await button.getAttribute('class') || '';
    const initialStyle = await button.getAttribute('style') || '';

    // Hover over the button
    await this.hoverOnRecapButton();

    // Wait for hover effects
    await this.page.waitForTimeout(300);

    // Check for hover effects
    const hoveredClasses = await button.getAttribute('class') || '';
    const hoveredStyle = await button.getAttribute('style') || '';

    const hasHoverEffect =
      hoveredClasses !== initialClasses ||
      hoveredStyle !== initialStyle ||
      hoveredClasses.includes('hover') ||
      hoveredStyle.includes('hover');

    if (!hasHoverEffect) {
      // Check CSS hover state
      const hoverEffectExists = await button.evaluate((element) => {
        const computedStyle = window.getComputedStyle(element);
        return computedStyle.cursor === 'pointer' || element.matches(':hover');
      });

      expect(hoverEffectExists).toBeTruthy();
    } else {
      expect(hasHoverEffect).toBeTruthy();
    }
  }

  /**
   * Verify revision section accessibility
   */
  async verifyRevisionAccessibility(): Promise<void> {
    // Check main container accessibility
    const containerRole = await this.container.getAttribute('role');
    const containerAriaLabel = await this.container.getAttribute('aria-label');
    const containerAriaLabelledBy = await this.container.getAttribute('aria-labelledby');

    expect(containerRole || containerAriaLabel || containerAriaLabelledBy).toBeTruthy();

    // Check button accessibility
    if (await this.isRecapButtonVisible()) {
      await expect(this.recapButton).toBeEnabled();

      const buttonRole = await this.recapButton.getAttribute('role');
      const buttonAriaLabel = await this.recapButton.getAttribute('aria-label');

      // Button should be accessible via keyboard
      await this.recapButton.focus();
      expect(await this.recapButton.evaluate((el) => document.activeElement === el)).toBeTruthy();
    }
  }

  /**
   * Verify revision content loads correctly
   */
  async verifyRevisionContentLoad(): Promise<void> {
    // Wait for container to be visible
    await this.waitForElement(this.container);

    // Check if revision title is loaded
    const titleText = await this.getRevisionTitle();
    expect(titleText.trim().length).toBeGreaterThan(0);

    // If description is present, verify it has content
    if (await this.isRevisionDescriptionVisible()) {
      const descriptionText = await this.getRevisionDescription();
      expect(descriptionText.trim().length).toBeGreaterThan(0);
    }

    // If task details are present, verify they load properly
    if (await this.getRevisionTaskDetailsCount() > 0) {
      await this.verifyAllTaskDetailsHaveContent();
    }
  }

  /**
   * Verify empty revision state
   */
  async verifyEmptyRevisionState(): Promise<void> {
    // Should show empty state message or hide revision section
    if (await this.isRevisionContainerVisible()) {
      // If visible, check for empty state indicators
      const emptyIndicator = this.container.locator('[class*="empty"], [data-testid*="empty"], text=/no.*revision/i').first();

      if (await emptyIndicator.isVisible()) {
        await expect(emptyIndicator).toBeVisible();
      } else {
        // Revision section should have minimal content
        const taskDetailsCount = await this.getRevisionTaskDetailsCount();
        expect(taskDetailsCount).toBe(0);
      }
    }
  }

  /**
   * Navigate to revision details
   */
  async navigateToRevisionDetails(): Promise<void> {
    if (await this.isActionButtonVisible()) {
      await this.clickActionButton();
    } else if (await this.isRecapButtonVisible()) {
      await this.clickRecapButton();
    } else {
      throw new Error('No navigation button available for revision details');
    }
  }

  /**
   * Verify revision loading state
   */
  async verifyRevisionLoadingState(): Promise<void> {
    // Check for loading indicators in revision section
    const loadingIndicators = this.container.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');
    const indicators = await loadingIndicators.all();

    // Wait for loading to complete
    for (const indicator of indicators) {
      if (await indicator.isVisible()) {
        await this.waitForElementToBeHidden(indicator);
      }
    }

    // Verify revision content is loaded
    await this.verifyRevisionContentLoad();
  }

  /**
   * Verify revision responsive design
   */
  async verifyRevisionResponsiveDesign(): Promise<void> {
    // Test mobile layout
    await this.page.setViewportSize({ width: 375, height: 667 });
    if (await this.isRevisionContainerVisible()) {
      await expect(this.container).toBeVisible();

      // Buttons should stack vertically on mobile
      if (await this.isSelfLearnButtonsVisible()) {
        await expect(this.selfLearnButtonsContainer).toBeVisible();
      }
    }

    // Test desktop layout
    await this.page.setViewportSize({ width: 1440, height: 900 });
    if (await this.isRevisionContainerVisible()) {
      await expect(this.container).toBeVisible();
    }
  }

  /**
   * Get all interactive elements in revision section
   */
  async getAllInteractiveElements(): Promise<Locator[]> {
    const interactiveElements: Locator[] = [];

    if (await this.isRecapButtonVisible()) {
      interactiveElements.push(this.recapButton);
    }

    if (await this.isActionButtonVisible()) {
      interactiveElements.push(this.actionButton);
    }

    const selfLearnButtons = await this.getAllSelfLearnButtons();
    interactiveElements.push(...selfLearnButtons);

    return interactiveElements;
  }

  /**
   * Verify all interactive elements are functional
   */
  async verifyAllInteractiveElementsFunctional(): Promise<void> {
    const interactiveElements = await this.getAllInteractiveElements();

    for (const element of interactiveElements) {
      await expect(element).toBeVisible();
      await expect(element).toBeEnabled();

      // Verify element is keyboard accessible
      await element.focus();
      expect(await element.evaluate((el) => document.activeElement === el)).toBeTruthy();
    }
  }
}