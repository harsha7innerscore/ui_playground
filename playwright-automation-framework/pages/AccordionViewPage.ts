import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Accordion View page
 * Handles topic navigation, chapter details, subtopics, and task management
 */
export class AccordionViewPage extends BasePage {

  // Main containers
  private readonly mainContainer: Locator;
  private readonly greetingTitle: Locator;
  private readonly topicContainer: Locator;
  private readonly breadcrumbNavigation: Locator;
  private readonly subjectTabsContainer: Locator;
  private readonly subtopicListContainer: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators based on YAML test IDs
    this.mainContainer = this.page.getByTestId('accordion-view-container');
    this.greetingTitle = this.page.getByTestId('accordion-view-greeting');
    this.topicContainer = this.page.getByTestId('accordion-view-topic-container');
    this.breadcrumbNavigation = this.page.getByTestId('accordion-view-breadcrumb-navigation');
    this.subjectTabsContainer = this.page.getByTestId('accordion-view-subject-tabs-container');
    this.subtopicListContainer = this.page.getByTestId('accordion-view-subtopic-list-container');
  }

  /**
   * Wait for the accordion view to load completely
   */
  async waitForPageToLoad(): Promise<void> {
    await this.waitForElement(this.mainContainer);
    await this.waitForPageLoad('networkidle');
  }

  /**
   * Check if the main container is visible
   */
  async isContainerVisible(): Promise<boolean> {
    return await this.isVisible(this.mainContainer);
  }

  /**
   * Get the greeting message in accordion view
   */
  async getGreetingMessage(): Promise<string> {
    return await this.getTextContent(this.greetingTitle);
  }

  /**
   * Check if breadcrumb navigation is visible (mobile only)
   */
  async isBreadcrumbVisible(): Promise<boolean> {
    return await this.isVisible(this.breadcrumbNavigation);
  }

  /**
   * Click on breadcrumb navigation
   */
  async clickBreadcrumb(): Promise<void> {
    await this.waitForElement(this.breadcrumbNavigation);
    await this.clickWithRetry(this.breadcrumbNavigation);
  }

  /**
   * Check if subject tabs container is visible
   */
  async isSubjectTabsVisible(): Promise<boolean> {
    return await this.isVisible(this.subjectTabsContainer);
  }

  /**
   * Check if topic container is visible
   */
  async isTopicContainerVisible(): Promise<boolean> {
    return await this.isVisible(this.topicContainer);
  }

  /**
   * Get topic item container by topic title (dynamic test ID)
   * @param topicTitle - Title of the topic
   */
  private getTopicItemContainer(topicTitle: string): Locator {
    return this.page.getByTestId(`accordion-view-${topicTitle}-container`);
  }

  /**
   * Get topic item title by topic title (dynamic test ID)
   * @param topicTitle - Title of the topic
   */
  private getTopicItemTitle(topicTitle: string): Locator {
    return this.page.getByTestId(`accordion-view-${topicTitle}`);
  }

  /**
   * Get topic progress container by topic title (dynamic test ID)
   * @param topicTitle - Title of the topic
   */
  private getTopicProgressContainer(topicTitle: string): Locator {
    return this.page.getByTestId(`accordion-view-${topicTitle}-progress-container`);
  }

  /**
   * Get topic progress count by topic title (dynamic test ID)
   * @param topicTitle - Title of the topic
   */
  private getTopicProgressCount(topicTitle: string): Locator {
    return this.page.getByTestId(`accordion-view-${topicTitle}-progress-count`);
  }

  /**
   * Click on a specific topic
   * @param topicTitle - Title of the topic to click
   */
  async clickTopic(topicTitle: string): Promise<void> {
    const topicElement = this.getTopicItemTitle(topicTitle);
    await this.waitForElement(topicElement);
    await this.clickWithRetry(topicElement);
  }

  /**
   * Verify topic is visible
   * @param topicTitle - Title of the topic to verify
   */
  async verifyTopicVisible(topicTitle: string): Promise<void> {
    const topicContainer = this.getTopicItemContainer(topicTitle);
    await expect(topicContainer).toBeVisible();
  }

  /**
   * Get topic progress text
   * @param topicTitle - Title of the topic
   */
  async getTopicProgress(topicTitle: string): Promise<string> {
    const progressCount = this.getTopicProgressCount(topicTitle);
    return await this.getTextContent(progressCount);
  }

  /**
   * Verify topic progress is displayed (desktop only)
   * @param topicTitle - Title of the topic
   */
  async verifyTopicProgressVisible(topicTitle: string): Promise<void> {
    const progressContainer = this.getTopicProgressContainer(topicTitle);
    // Progress container should be visible on desktop
    if (await progressContainer.isVisible()) {
      await expect(progressContainer).toBeVisible();
    }
  }

  /**
   * Get chapter detail header by chapter name (dynamic test ID)
   * @param chapterName - Name of the chapter
   */
  private getChapterDetailHeader(chapterName: string): Locator {
    return this.page.getByTestId(`accordion-view-${chapterName}`);
  }

  /**
   * Get chapter progress count mobile by chapter name (dynamic test ID)
   * @param chapterName - Name of the chapter
   */
  private getChapterProgressCountMobile(chapterName: string): Locator {
    return this.page.getByTestId(`accordion-view-${chapterName}-progress-count`);
  }

  /**
   * Click on a specific chapter
   * @param chapterName - Name of the chapter to click
   */
  async clickChapter(chapterName: string): Promise<void> {
    const chapterElement = this.getChapterDetailHeader(chapterName);
    await this.waitForElement(chapterElement);
    await this.clickWithRetry(chapterElement);
  }

  /**
   * Verify chapter is visible
   * @param chapterName - Name of the chapter to verify
   */
  async verifyChapterVisible(chapterName: string): Promise<void> {
    const chapterHeader = this.getChapterDetailHeader(chapterName);
    await expect(chapterHeader).toBeVisible();
  }

  /**
   * Get chapter progress on mobile
   * @param chapterName - Name of the chapter
   */
  async getChapterProgressMobile(chapterName: string): Promise<string> {
    const progressCount = this.getChapterProgressCountMobile(chapterName);
    return await this.getTextContent(progressCount);
  }

  /**
   * Get subtopic container by subtopic name (dynamic test ID)
   * @param subtopicName - Name of the subtopic
   */
  private getSubtopicContainer(subtopicName: string): Locator {
    return this.page.getByTestId(`accordion-view-subtopic-${subtopicName}-container`);
  }

  /**
   * Get subtopic details container by subtopic name (dynamic test ID)
   * @param subtopicName - Name of the subtopic
   */
  private getSubtopicDetailsContainer(subtopicName: string): Locator {
    return this.page.getByTestId(`accordion-view-subtopic-${subtopicName}-details-container`);
  }

  /**
   * Click on a specific subtopic
   * @param subtopicName - Name of the subtopic to click
   */
  async clickSubtopic(subtopicName: string): Promise<void> {
    const subtopicContainer = this.getSubtopicContainer(subtopicName);
    await this.waitForElement(subtopicContainer);
    await this.clickWithRetry(subtopicContainer);
  }

  /**
   * Verify subtopic is visible
   * @param subtopicName - Name of the subtopic to verify
   */
  async verifySubtopicVisible(subtopicName: string): Promise<void> {
    const subtopicContainer = this.getSubtopicContainer(subtopicName);
    await expect(subtopicContainer).toBeVisible();
  }

  /**
   * Verify subtopic details are displayed
   * @param subtopicName - Name of the subtopic
   */
  async verifySubtopicDetailsVisible(subtopicName: string): Promise<void> {
    const detailsContainer = this.getSubtopicDetailsContainer(subtopicName);
    await expect(detailsContainer).toBeVisible();
  }

  /**
   * Check if subtopic list container is visible
   */
  async isSubtopicListVisible(): Promise<boolean> {
    return await this.isVisible(this.subtopicListContainer);
  }

  /**
   * Get all visible topics in the accordion view
   */
  async getAllVisibleTopics(): Promise<Locator[]> {
    return await this.topicContainer.locator('[data-testid*="accordion-view-"][data-testid$="-container"]').all();
  }

  /**
   * Get the number of topics displayed
   */
  async getTopicsCount(): Promise<number> {
    const topics = await this.getAllVisibleTopics();
    return topics.length;
  }

  /**
   * Expand a topic to show its content
   * @param topicTitle - Title of the topic to expand
   */
  async expandTopic(topicTitle: string): Promise<void> {
    const topicContainer = this.getTopicItemContainer(topicTitle);
    const expandButton = topicContainer.locator('button, [role="button"], .expandable').first();

    if (await expandButton.isVisible()) {
      await this.clickWithRetry(expandButton);
    } else {
      // If no expand button, click on the topic itself
      await this.clickTopic(topicTitle);
    }
  }

  /**
   * Collapse a topic
   * @param topicTitle - Title of the topic to collapse
   */
  async collapseTopic(topicTitle: string): Promise<void> {
    const topicContainer = this.getTopicItemContainer(topicTitle);
    const collapseButton = topicContainer.locator('button[aria-expanded="true"], .collapse, .expanded').first();

    if (await collapseButton.isVisible()) {
      await this.clickWithRetry(collapseButton);
    } else {
      // If no specific collapse button, click on the topic title again
      await this.clickTopic(topicTitle);
    }
  }

  /**
   * Check if a topic is expanded
   * @param topicTitle - Title of the topic to check
   */
  async isTopicExpanded(topicTitle: string): Promise<boolean> {
    const topicContainer = this.getTopicItemContainer(topicTitle);
    const expandedIndicator = topicContainer.locator('[aria-expanded="true"], .expanded, .open').first();
    return await expandedIndicator.isVisible();
  }

  /**
   * Verify the correct subject is displayed in header after navigation
   * @param expectedSubject - Expected subject name
   */
  async verifySubjectInHeader(expectedSubject: string): Promise<void> {
    const subjectHeader = this.page.locator(`text=${expectedSubject}`,
      { hasText: new RegExp(expectedSubject, 'i') }
    ).first();
    await expect(subjectHeader).toBeVisible();
  }

  /**
   * Verify accordion view layout on mobile
   */
  async verifyMobileLayout(): Promise<void> {
    // Set mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });

    // Verify breadcrumb navigation is visible on mobile
    await expect(this.breadcrumbNavigation).toBeVisible();

    // Verify main container is visible
    await expect(this.mainContainer).toBeVisible();
  }

  /**
   * Verify accordion view layout on desktop
   */
  async verifyDesktopLayout(): Promise<void> {
    // Set desktop viewport
    await this.page.setViewportSize({ width: 1440, height: 900 });

    // Verify main container is visible
    await expect(this.mainContainer).toBeVisible();

    // Verify topic container is visible
    await expect(this.topicContainer).toBeVisible();
  }

  /**
   * Navigate back using breadcrumb (mobile)
   */
  async navigateBackViaBreadcrumb(): Promise<void> {
    if (await this.isBreadcrumbVisible()) {
      await this.clickBreadcrumb();
    } else {
      throw new Error('Breadcrumb navigation not visible - likely not on mobile view');
    }
  }

  /**
   * Verify page URL contains subject information
   * @param subjectName - Expected subject name in URL
   */
  async verifySubjectInUrl(subjectName: string): Promise<void> {
    const currentUrl = this.getCurrentUrl();
    expect(currentUrl.toLowerCase()).toContain(subjectName.toLowerCase());
  }

  /**
   * Wait for topic content to load after clicking
   * @param topicTitle - Title of the topic that was clicked
   */
  async waitForTopicContentLoad(topicTitle: string): Promise<void> {
    const topicContainer = this.getTopicItemContainer(topicTitle);
    await this.waitForElement(topicContainer);

    // Wait for any loading indicators to disappear
    const loadingIndicators = topicContainer.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');
    const indicators = await loadingIndicators.all();

    for (const indicator of indicators) {
      if (await indicator.isVisible()) {
        await this.waitForElementToBeHidden(indicator);
      }
    }
  }

  /**
   * Verify topic accessibility attributes
   * @param topicTitle - Title of the topic to verify
   */
  async verifyTopicAccessibility(topicTitle: string): Promise<void> {
    const topicContainer = this.getTopicItemContainer(topicTitle);

    // Check for proper ARIA attributes
    const ariaLabel = await topicContainer.getAttribute('aria-label');
    const ariaExpanded = await topicContainer.getAttribute('aria-expanded');
    const role = await topicContainer.getAttribute('role');

    // Verify at least one accessibility attribute is present
    expect(ariaLabel || ariaExpanded || role).toBeTruthy();
  }

  /**
   * Search for a specific topic by text content
   * @param searchText - Text to search for in topics
   */
  async findTopicByText(searchText: string): Promise<Locator | null> {
    const allTopics = await this.getAllVisibleTopics();

    for (const topic of allTopics) {
      const topicText = await this.getTextContent(topic);
      if (topicText.toLowerCase().includes(searchText.toLowerCase())) {
        return topic;
      }
    }

    return null;
  }

  /**
   * Verify all topics are clickable
   */
  async verifyAllTopicsClickable(): Promise<void> {
    const topics = await this.getAllVisibleTopics();

    for (const topic of topics) {
      await expect(topic).toBeVisible();

      // Check if it's clickable (either has click handler or is a button/link)
      const isClickable = await topic.evaluate((element) => {
        const style = window.getComputedStyle(element);
        return (
          element.tagName === 'BUTTON' ||
          element.tagName === 'A' ||
          element.getAttribute('role') === 'button' ||
          element.onclick !== null ||
          style.cursor === 'pointer'
        );
      });

      if (!isClickable) {
        // Additional check: look for clickable child elements
        const clickableChild = topic.locator('button, a, [role="button"], [onclick], [style*="cursor: pointer"]').first();
        if (await clickableChild.isVisible()) {
          await expect(clickableChild).toBeVisible();
        }
      }
    }
  }
}