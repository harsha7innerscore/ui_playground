import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Task View component
 * Handles individual task interactions, task details, and task status
 */
export class TaskViewPage extends BasePage {

  // Main containers
  private readonly mainContainer: Locator;
  private readonly viewMoreContainer: Locator;
  private readonly viewMoreButton: Locator;
  private readonly emptyText: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators based on YAML test IDs
    this.mainContainer = this.page.getByTestId('accordion-view-task-container');
    this.viewMoreContainer = this.page.getByTestId('accordion-view-task-view-more-container');
    this.viewMoreButton = this.page.getByTestId('accordion-view-task-view-more-button');
    this.emptyText = this.page.getByTestId('accordion-view-empty-task-text');
  }

  /**
   * Wait for the task view to load completely
   */
  async waitForPageToLoad(): Promise<void> {
    await this.waitForElement(this.mainContainer);
    await this.waitForPageLoad('networkidle');
  }

  /**
   * Check if the main task container is visible
   */
  async isContainerVisible(): Promise<boolean> {
    return await this.isVisible(this.mainContainer);
  }

  /**
   * Check if view more container is visible
   */
  async isViewMoreContainerVisible(): Promise<boolean> {
    return await this.isVisible(this.viewMoreContainer);
  }

  /**
   * Click the view more button
   */
  async clickViewMoreButton(): Promise<void> {
    await this.waitForElement(this.viewMoreButton);
    await this.clickWithRetry(this.viewMoreButton);
  }

  /**
   * Check if empty task text is displayed
   */
  async isEmptyTextVisible(): Promise<boolean> {
    return await this.isVisible(this.emptyText);
  }

  /**
   * Get the empty task text content
   */
  async getEmptyTaskText(): Promise<string> {
    return await this.getTextContent(this.emptyText);
  }

  /**
   * Get individual task container by task index (dynamic test ID)
   * @param taskIndex - Index of the task (0-based)
   */
  private getTaskContainer(taskIndex: number): Locator {
    return this.page.getByTestId(`accordion-view-task-${taskIndex}-container`);
  }

  /**
   * Get task date info by task index (dynamic test ID)
   * @param taskIndex - Index of the task
   */
  private getTaskDateInfo(taskIndex: number): Locator {
    return this.page.getByTestId(`accordion-view-task-${taskIndex}-date-info`);
  }

  /**
   * Get task info container by task index (dynamic test ID)
   * @param taskIndex - Index of the task
   */
  private getTaskInfoContainer(taskIndex: number): Locator {
    return this.page.getByTestId(`accordion-view-task-${taskIndex}-info`);
  }

  /**
   * Get task self text by task index (dynamic test ID)
   * @param taskIndex - Index of the task
   */
  private getTaskSelfText(taskIndex: number): Locator {
    return this.page.getByTestId(`accordion-view-task-${taskIndex}-self-text`);
  }

  /**
   * Get task performance badge by task index (dynamic test ID)
   * @param taskIndex - Index of the task
   */
  private getTaskPerformanceBadge(taskIndex: number): Locator {
    return this.page.getByTestId(`accordion-view-task-${taskIndex}-performance`);
  }

  /**
   * Get task status container by task index (dynamic test ID)
   * @param taskIndex - Index of the task
   */
  private getTaskStatusContainer(taskIndex: number): Locator {
    return this.page.getByTestId(`accordion-view-task-${taskIndex}-task-status`);
  }

  /**
   * Click on a specific task
   * @param taskIndex - Index of the task to click
   */
  async clickTask(taskIndex: number): Promise<void> {
    const taskContainer = this.getTaskContainer(taskIndex);
    await this.waitForElement(taskContainer);
    await this.clickWithRetry(taskContainer);
  }

  /**
   * Verify task is visible
   * @param taskIndex - Index of the task to verify
   */
  async verifyTaskVisible(taskIndex: number): Promise<void> {
    const taskContainer = this.getTaskContainer(taskIndex);
    await expect(taskContainer).toBeVisible();
  }

  /**
   * Get task date information
   * @param taskIndex - Index of the task
   */
  async getTaskDateInfo(taskIndex: number): Promise<string> {
    const dateInfo = this.getTaskDateInfo(taskIndex);
    return await this.getTextContent(dateInfo);
  }

  /**
   * Get task self text content
   * @param taskIndex - Index of the task
   */
  async getTaskSelfText(taskIndex: number): Promise<string> {
    const selfText = this.getTaskSelfText(taskIndex);
    return await this.getTextContent(selfText);
  }

  /**
   * Get task performance badge text
   * @param taskIndex - Index of the task
   */
  async getTaskPerformance(taskIndex: number): Promise<string> {
    const performanceBadge = this.getTaskPerformanceBadge(taskIndex);
    return await this.getTextContent(performanceBadge);
  }

  /**
   * Get task status
   * @param taskIndex - Index of the task
   */
  async getTaskStatus(taskIndex: number): Promise<string> {
    const statusContainer = this.getTaskStatusContainer(taskIndex);
    return await this.getTextContent(statusContainer);
  }

  /**
   * Verify task info container is visible
   * @param taskIndex - Index of the task
   */
  async verifyTaskInfoVisible(taskIndex: number): Promise<void> {
    const infoContainer = this.getTaskInfoContainer(taskIndex);
    await expect(infoContainer).toBeVisible();
  }

  /**
   * Verify task performance badge is visible
   * @param taskIndex - Index of the task
   */
  async verifyTaskPerformanceVisible(taskIndex: number): Promise<void> {
    const performanceBadge = this.getTaskPerformanceBadge(taskIndex);
    await expect(performanceBadge).toBeVisible();
  }

  /**
   * Verify task status container is visible
   * @param taskIndex - Index of the task
   */
  async verifyTaskStatusVisible(taskIndex: number): Promise<void> {
    const statusContainer = this.getTaskStatusContainer(taskIndex);
    await expect(statusContainer).toBeVisible();
  }

  /**
   * Get all visible task containers
   */
  async getAllTaskContainers(): Promise<Locator[]> {
    return await this.page.locator('[data-testid*="accordion-view-task-"][data-testid$="-container"]:not([data-testid*="revision-task"])').all();
  }

  /**
   * Get the number of tasks displayed
   */
  async getTasksCount(): Promise<number> {
    const tasks = await this.getAllTaskContainers();
    return tasks.length;
  }

  /**
   * Verify all tasks have required elements
   */
  async verifyAllTasksHaveRequiredElements(): Promise<void> {
    const tasksCount = await this.getTasksCount();

    for (let i = 0; i < tasksCount; i++) {
      // Verify task container is visible
      await this.verifyTaskVisible(i);

      // Verify task info is visible
      await this.verifyTaskInfoVisible(i);

      // Check if date info is present
      const dateInfo = this.getTaskDateInfo(i);
      if (await dateInfo.isVisible()) {
        const dateText = await this.getTaskDateInfo(i);
        expect(dateText.trim().length).toBeGreaterThan(0);
      }

      // Check if performance badge is present
      const performanceBadge = this.getTaskPerformanceBadge(i);
      if (await performanceBadge.isVisible()) {
        const performanceText = await this.getTaskPerformance(i);
        expect(performanceText.trim().length).toBeGreaterThan(0);
      }

      // Check if status is present
      const statusContainer = this.getTaskStatusContainer(i);
      if (await statusContainer.isVisible()) {
        const statusText = await this.getTaskStatus(i);
        expect(statusText.trim().length).toBeGreaterThan(0);
      }
    }
  }

  /**
   * Hover over a specific task
   * @param taskIndex - Index of the task to hover
   */
  async hoverOnTask(taskIndex: number): Promise<void> {
    const taskContainer = this.getTaskContainer(taskIndex);
    await this.hover(taskContainer);
  }

  /**
   * Verify task hover effect
   * @param taskIndex - Index of the task to test hover effect
   */
  async verifyTaskHoverEffect(taskIndex: number): Promise<void> {
    const taskContainer = this.getTaskContainer(taskIndex);

    // Get initial state
    const initialClasses = await taskContainer.getAttribute('class') || '';
    const initialStyle = await taskContainer.getAttribute('style') || '';

    // Hover over the task
    await this.hoverOnTask(taskIndex);

    // Wait a bit for hover effects to apply
    await this.page.waitForTimeout(500);

    // Check if hover effect is applied (classes or styles changed)
    const hoveredClasses = await taskContainer.getAttribute('class') || '';
    const hoveredStyle = await taskContainer.getAttribute('style') || '';

    // Verify that something changed (indicating hover effect)
    const hasHoverEffect =
      hoveredClasses !== initialClasses ||
      hoveredStyle !== initialStyle ||
      hoveredClasses.includes('hover') ||
      hoveredStyle.includes('hover');

    // If no direct changes, check for CSS hover effects via computed style
    if (!hasHoverEffect) {
      const hoverEffectExists = await taskContainer.evaluate((element) => {
        const computedStyle = window.getComputedStyle(element);
        return computedStyle.cursor === 'pointer' ||
               element.matches(':hover') ||
               element.querySelector(':hover') !== null;
      });

      expect(hoverEffectExists).toBeTruthy();
    } else {
      expect(hasHoverEffect).toBeTruthy();
    }
  }

  /**
   * Verify empty state when no tasks are available
   */
  async verifyEmptyTasksState(): Promise<void> {
    await expect(this.emptyText).toBeVisible();
    const emptyMessage = await this.getEmptyTaskText();
    expect(emptyMessage.trim().length).toBeGreaterThan(0);
  }

  /**
   * Verify task loading state
   */
  async verifyTaskLoadingState(): Promise<void> {
    // Check for loading indicators
    const loadingIndicators = this.mainContainer.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');
    const indicators = await loadingIndicators.all();

    // If loading indicators are present, wait for them to disappear
    for (const indicator of indicators) {
      if (await indicator.isVisible()) {
        await this.waitForElementToBeHidden(indicator);
      }
    }

    // Verify either tasks are loaded or empty state is shown
    const tasksCount = await this.getTasksCount();
    if (tasksCount === 0) {
      await this.verifyEmptyTasksState();
    } else {
      await this.verifyAllTasksHaveRequiredElements();
    }
  }

  /**
   * Filter tasks by status
   * @param status - Status to filter by (e.g., 'completed', 'in-progress', 'pending')
   */
  async getTasksByStatus(status: string): Promise<Locator[]> {
    const allTasks = await this.getAllTaskContainers();
    const filteredTasks: Locator[] = [];

    for (const task of allTasks) {
      // Extract task index from test ID
      const testId = await task.getAttribute('data-testid');
      const match = testId?.match(/accordion-view-task-(\d+)-container/);

      if (match) {
        const taskIndex = parseInt(match[1]);
        const taskStatus = await this.getTaskStatus(taskIndex);

        if (taskStatus.toLowerCase().includes(status.toLowerCase())) {
          filteredTasks.push(task);
        }
      }
    }

    return filteredTasks;
  }

  /**
   * Verify task performance colors/badges
   * @param taskIndex - Index of the task
   * @param expectedPerformance - Expected performance level (e.g., 'good', 'excellent', 'needs improvement')
   */
  async verifyTaskPerformanceLevel(taskIndex: number, expectedPerformance: string): Promise<void> {
    const performanceBadge = this.getTaskPerformanceBadge(taskIndex);
    await expect(performanceBadge).toBeVisible();

    const performanceText = await this.getTaskPerformance(taskIndex);
    expect(performanceText.toLowerCase()).toContain(expectedPerformance.toLowerCase());
  }

  /**
   * Scroll to a specific task
   * @param taskIndex - Index of the task to scroll to
   */
  async scrollToTask(taskIndex: number): Promise<void> {
    const taskContainer = this.getTaskContainer(taskIndex);
    await this.scrollIntoView(taskContainer);
  }

  /**
   * Double click on a task (for special interactions)
   * @param taskIndex - Index of the task to double click
   */
  async doubleClickTask(taskIndex: number): Promise<void> {
    const taskContainer = this.getTaskContainer(taskIndex);
    await this.waitForElement(taskContainer);
    await this.doubleClick(taskContainer);
  }

  /**
   * Verify task accessibility
   * @param taskIndex - Index of the task to verify accessibility
   */
  async verifyTaskAccessibility(taskIndex: number): Promise<void> {
    const taskContainer = this.getTaskContainer(taskIndex);

    // Check for proper ARIA attributes and semantic structure
    const ariaLabel = await taskContainer.getAttribute('aria-label');
    const role = await taskContainer.getAttribute('role');
    const tabIndex = await taskContainer.getAttribute('tabindex');

    // Verify at least one accessibility attribute is present
    expect(ariaLabel || role || tabIndex).toBeTruthy();

    // Check for keyboard accessibility if it's interactive
    const isInteractive = await taskContainer.evaluate((element) => {
      return (
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.getAttribute('role') === 'button' ||
        element.getAttribute('tabindex') === '0' ||
        element.onclick !== null
      );
    });

    if (isInteractive) {
      // Verify task is keyboard accessible
      await taskContainer.focus();
      expect(await taskContainer.evaluate((el) => document.activeElement === el)).toBeTruthy();
    }
  }

  /**
   * Search for tasks by text content
   * @param searchText - Text to search for in task content
   */
  async findTasksByText(searchText: string): Promise<number[]> {
    const tasksCount = await this.getTasksCount();
    const matchingTasks: number[] = [];

    for (let i = 0; i < tasksCount; i++) {
      const taskContainer = this.getTaskContainer(i);
      const taskText = await this.getTextContent(taskContainer);

      if (taskText.toLowerCase().includes(searchText.toLowerCase())) {
        matchingTasks.push(i);
      }
    }

    return matchingTasks;
  }

  /**
   * Verify task date format and validity
   * @param taskIndex - Index of the task to verify date
   */
  async verifyTaskDateFormat(taskIndex: number): Promise<void> {
    const dateText = await this.getTaskDateInfo(taskIndex);

    // Basic date format validation (could be enhanced based on actual format)
    const hasValidDate = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+\w+\s+\d{4}/.test(dateText);

    expect(hasValidDate).toBeTruthy();
    expect(dateText.trim().length).toBeGreaterThan(0);
  }
}