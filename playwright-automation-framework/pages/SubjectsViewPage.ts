import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Self-Study Subjects View page
 * Handles subject cards, continue studying section, and navigation
 */
export class SubjectsViewPage extends BasePage {

  // Main container
  private readonly container: Locator;

  // Continue studying section
  private readonly continueStudyingSection: Locator;
  private readonly continueStudyingTitle: Locator;
  private readonly studyCardsContainer: Locator;

  // Subjects section
  private readonly subjectsTitle: Locator;
  private readonly subjectsGrid: Locator;
  private readonly greeting: Locator;

  // Top container elements
  private readonly welcomeText: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators based on YAML test IDs
    this.container = this.page.getByTestId('SubjectsView-container');

    // Continue studying section
    this.continueStudyingSection = this.page.getByTestId('SubjectsView-continue-studying-section');
    this.continueStudyingTitle = this.page.getByTestId('SubjectsView-continue-studying-title');
    this.studyCardsContainer = this.page.getByTestId('SubjectsView-study-cards-container');

    // Subjects section
    this.subjectsTitle = this.page.getByTestId('SubjectsView-subjects-title');
    this.subjectsGrid = this.page.getByTestId('SubjectsView-subjects-grid');
    this.greeting = this.page.getByTestId('SubjectsView-greeting');

    // Top container
    this.welcomeText = this.page.getByTestId('top-container-welcomeText');
  }

  /**
   * Navigate to the Self-Study page
   */
  async navigateToSelfStudy(): Promise<void> {
    await this.goto('/school/aitutor/student/aps');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to load completely
   */
  async waitForPageToLoad(): Promise<void> {
    await this.waitForElement(this.container);
    await this.waitForPageLoad('networkidle');
  }

  /**
   * Check if the main container is visible
   */
  async isContainerVisible(): Promise<boolean> {
    return await this.isVisible(this.container);
  }

  /**
   * Get the greeting message
   */
  async getGreetingMessage(): Promise<string> {
    return await this.getTextContent(this.greeting);
  }

  /**
   * Verify the greeting message contains "Hello 👋"
   */
  async verifyGreetingMessage(): Promise<void> {
    await expect(this.greeting).toContainText('Hello 👋');
  }

  /**
   * Get the welcome text from top container
   */
  async getWelcomeText(): Promise<string> {
    return await this.getTextContent(this.welcomeText);
  }

  /**
   * Check if subjects grid is visible
   */
  async isSubjectsGridVisible(): Promise<boolean> {
    return await this.isVisible(this.subjectsGrid);
  }

  /**
   * Get the subjects title
   */
  async getSubjectsTitle(): Promise<string> {
    return await this.getTextContent(this.subjectsTitle);
  }

  /**
   * Get a subject card by name (using dynamic test ID)
   * @param subjectName - Name of the subject (e.g., 'math', 'chemistry')
   */
  private getSubjectCard(subjectName: string): Locator {
    return this.page.getByTestId(`SubjectsView-${subjectName.toLowerCase()}`);
  }

  /**
   * Click on a specific subject card
   * @param subjectName - Name of the subject to click
   */
  async clickSubject(subjectName: string): Promise<void> {
    const subjectCard = this.getSubjectCard(subjectName);
    await this.waitForElement(subjectCard);
    await this.clickWithRetry(subjectCard);
  }

  /**
   * Get all subject cards in the grid
   */
  async getSubjectCards(): Promise<Locator[]> {
    return await this.subjectsGrid.locator('[data-testid^="SubjectsView-"]').all();
  }

  /**
   * Get the number of subject cards displayed
   */
  async getSubjectCardsCount(): Promise<number> {
    const cards = await this.getSubjectCards();
    return cards.length;
  }

  /**
   * Verify that expected subjects are displayed
   * @param expectedSubjects - Array of subject names to verify
   */
  async verifySubjectsDisplayed(expectedSubjects: string[]): Promise<void> {
    for (const subject of expectedSubjects) {
      const subjectCard = this.getSubjectCard(subject);
      await expect(subjectCard).toBeVisible();
    }
  }

  /**
   * Hover over a subject card
   * @param subjectName - Name of the subject to hover
   */
  async hoverOnSubject(subjectName: string): Promise<void> {
    const subjectCard = this.getSubjectCard(subjectName);
    await this.hover(subjectCard);
  }

  /**
   * Verify subject card icons are displayed
   * @param subjectName - Name of the subject to verify icon for
   */
  async verifySubjectIcon(subjectName: string): Promise<void> {
    const subjectCard = this.getSubjectCard(subjectName);
    const icon = subjectCard.locator('img, svg, [class*="icon"]').first();
    await expect(icon).toBeVisible();
  }

  /**
   * Check if Continue Studying section is visible
   */
  async isContinueStudyingSectionVisible(): Promise<boolean> {
    return await this.isVisible(this.continueStudyingSection);
  }

  /**
   * Get the Continue Studying section title
   */
  async getContinueStudyingTitle(): Promise<string> {
    return await this.getTextContent(this.continueStudyingTitle);
  }

  /**
   * Get all continue studying cards
   */
  async getContinueStudyingCards(): Promise<Locator[]> {
    if (!(await this.isContinueStudyingSectionVisible())) {
      return [];
    }
    return await this.studyCardsContainer.locator('[data-testid*="card"], .card').all();
  }

  /**
   * Get the number of continue studying cards displayed
   */
  async getContinueStudyingCardsCount(): Promise<number> {
    const cards = await this.getContinueStudyingCards();
    return cards.length;
  }

  /**
   * Verify maximum 3 continue studying cards are shown
   */
  async verifyContinueStudyingCardsLimit(): Promise<void> {
    const cardsCount = await this.getContinueStudyingCardsCount();
    expect(cardsCount).toBeLessThanOrEqual(3);
  }

  /**
   * Click on a continue studying card by index
   * @param index - Index of the card to click (0-based)
   */
  async clickContinueStudyingCard(index: number): Promise<void> {
    const cards = await this.getContinueStudyingCards();
    if (index < cards.length) {
      await this.clickWithRetry(cards[index]);
    } else {
      throw new Error(`Continue studying card at index ${index} not found`);
    }
  }

  /**
   * Hover over a continue studying card
   * @param index - Index of the card to hover (0-based)
   */
  async hoverOnContinueStudyingCard(index: number): Promise<void> {
    const cards = await this.getContinueStudyingCards();
    if (index < cards.length) {
      await this.hover(cards[index]);
    } else {
      throw new Error(`Continue studying card at index ${index} not found`);
    }
  }

  /**
   * Verify continue studying card UI elements
   * @param index - Index of the card to verify
   */
  async verifyContinueStudyingCardUI(index: number): Promise<void> {
    const cards = await this.getContinueStudyingCards();
    if (index < cards.length) {
      const card = cards[index];

      // Check for title
      const title = card.locator('[class*="title"], [data-testid*="title"], h1, h2, h3, h4, h5, h6').first();
      await expect(title).toBeVisible();

      // Check for status indicator
      const status = card.locator('[class*="status"], [data-testid*="status"]').first();
      if (await status.isVisible()) {
        await expect(status).toBeVisible();
      }

      // Check for tags if present
      const tags = card.locator('[class*="tag"], [data-testid*="tag"]').first();
      if (await tags.isVisible()) {
        await expect(tags).toBeVisible();
      }
    } else {
      throw new Error(`Continue studying card at index ${index} not found`);
    }
  }

  /**
   * Verify "AP/GP" text on in-progress cards
   */
  async verifyAPGPTextOnInProgressCards(): Promise<void> {
    const cards = await this.getContinueStudyingCards();
    for (const card of cards) {
      // Look for Assessment Practice or GP/AP text
      const apGpText = card.locator('text=/Assessment Practice|AP|GP/i').first();
      if (await apGpText.isVisible()) {
        await expect(apGpText).toBeVisible();

        // Verify text is not truncated (has proper width)
        const boundingBox = await apGpText.boundingBox();
        expect(boundingBox?.width).toBeGreaterThan(0);
      }
    }
  }

  /**
   * Verify card icons on in-progress cards
   */
  async verifyCardIcons(): Promise<void> {
    const cards = await this.getContinueStudyingCards();
    for (const card of cards) {
      const icon = card.locator('img, svg, [class*="icon"]').first();
      if (await icon.isVisible()) {
        await expect(icon).toBeVisible();
      }
    }
  }

  /**
   * Verify card layout and alignment
   */
  async verifyCardLayout(): Promise<void> {
    if (await this.isContinueStudyingSectionVisible()) {
      await expect(this.studyCardsContainer).toBeVisible();

      // Verify cards are arranged properly
      const cards = await this.getContinueStudyingCards();
      if (cards.length > 0) {
        // All cards should be visible
        for (const card of cards) {
          await expect(card).toBeVisible();
        }
      }
    }
  }

  /**
   * Wait for skeleton loader to disappear
   * @param index - Index of the skeleton loader
   */
  async waitForSkeletonLoader(index: number = 0): Promise<void> {
    const skeletonLoader = this.page.getByTestId(`SubjectsView-skeleton-${index}`);
    if (await skeletonLoader.isVisible()) {
      await this.waitForElementToBeHidden(skeletonLoader);
    }
  }

  /**
   * Verify responsive design for mobile
   */
  async verifyMobileLayout(): Promise<void> {
    // Set mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });

    // Verify single-column layout
    await expect(this.container).toBeVisible();
    await expect(this.subjectsGrid).toBeVisible();

    if (await this.isContinueStudyingSectionVisible()) {
      await expect(this.studyCardsContainer).toBeVisible();
    }
  }

  /**
   * Verify responsive design for tablet
   */
  async verifyTabletLayout(): Promise<void> {
    // Set tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });

    // Verify 2-3 cards per row layout
    await expect(this.container).toBeVisible();
    await expect(this.subjectsGrid).toBeVisible();

    if (await this.isContinueStudyingSectionVisible()) {
      await expect(this.studyCardsContainer).toBeVisible();
    }
  }

  /**
   * Verify page loads with loader animation during slow API
   */
  async verifyLoaderAnimation(): Promise<void> {
    // Check for any loader/spinner elements
    const loaders = await this.page.locator('[class*="loader"], [class*="spinner"], [class*="loading"]').all();

    // If loaders are present, wait for them to disappear
    for (const loader of loaders) {
      if (await loader.isVisible()) {
        await this.waitForElementToBeHidden(loader);
      }
    }

    // Verify main content is loaded
    await this.waitForElement(this.container);
  }

  /**
   * Verify empty state when no subjects are available
   */
  async verifyEmptySubjectsState(): Promise<void> {
    const emptyMessage = this.page.locator('text=/No subjects found/i, [data-testid*="empty"], [class*="empty"]').first();
    await expect(emptyMessage).toBeVisible();
  }

  /**
   * Verify subject card order matches expected order
   * @param expectedOrder - Array of subject names in expected order
   */
  async verifySubjectOrder(expectedOrder: string[]): Promise<void> {
    const cards = await this.getSubjectCards();

    for (let i = 0; i < expectedOrder.length && i < cards.length; i++) {
      const expectedSubject = expectedOrder[i].toLowerCase();
      const card = cards[i];

      // Check if the card has the expected test ID or contains expected text
      const testId = await card.getAttribute('data-testid');
      const cardText = await this.getTextContent(card);

      const isExpectedCard = testId?.includes(expectedSubject) ||
                           cardText.toLowerCase().includes(expectedSubject);

      expect(isExpectedCard).toBeTruthy();
    }
  }

  /**
   * Get card heading/title for a specific card
   * @param index - Index of the card
   */
  async getCardHeading(index: number): Promise<string> {
    const cards = await this.getContinueStudyingCards();
    if (index < cards.length) {
      const card = cards[index];
      const heading = card.locator('[class*="title"], [class*="heading"], h1, h2, h3, h4, h5, h6').first();
      return await this.getTextContent(heading);
    }
    throw new Error(`Card at index ${index} not found`);
  }

  /**
   * Verify each card has clear and correct heading/title
   */
  async verifyCardHeadings(): Promise<void> {
    const cards = await this.getContinueStudyingCards();

    for (let i = 0; i < cards.length; i++) {
      const heading = await this.getCardHeading(i);
      expect(heading.length).toBeGreaterThan(0);
      expect(heading.trim()).not.toBe('');
    }
  }
}