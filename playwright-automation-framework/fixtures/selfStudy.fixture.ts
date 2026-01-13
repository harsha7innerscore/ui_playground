import { test as authTest, AuthFixture, expect } from './auth.fixture';
import { SubjectsViewPage } from '../pages/SubjectsViewPage';
import { AccordionViewPage } from '../pages/AccordionViewPage';
import { TaskViewPage } from '../pages/TaskViewPage';
import { RevisionViewPage } from '../pages/RevisionViewPage';

/**
 * Self-Study fixture for comprehensive self-study UI testing
 * Extends auth fixture with self-study specific page objects and utilities
 */

export interface SelfStudyTestData {
  subjects: string[];
  topics: string[];
  chapters: string[];
  subtopics: string[];
  taskTypes: string[];
}

export interface SelfStudyFixture extends AuthFixture {
  // Page Objects
  subjectsViewPage: SubjectsViewPage;
  accordionViewPage: AccordionViewPage;
  taskViewPage: TaskViewPage;
  revisionViewPage: RevisionViewPage;

  // Test Data
  selfStudyTestData: SelfStudyTestData;

  // Utilities
  navigateToSelfStudy: () => Promise<void>;
  selectSubject: (subjectName: string) => Promise<void>;
  selectTopic: (topicName: string) => Promise<void>;
  startContinueStudying: (cardIndex?: number) => Promise<void>;
  accessRevision: () => Promise<void>;
  verifyResponsiveDesign: (viewportType: 'mobile' | 'tablet' | 'desktop') => Promise<void>;
  waitForSelfStudyPageLoad: () => Promise<void>;
  verifySubjectNavigation: (subjectName: string) => Promise<void>;
  verifyContinueStudyingFlow: () => Promise<void>;
  verifyEmptyStates: () => Promise<void>;
}

// Default test data for self-study features
const DEFAULT_SELF_STUDY_DATA: SelfStudyTestData = {
  subjects: ['math', 'chemistry', 'physics', 'english', 'social', 'biology'],
  topics: ['algebra', 'geometry', 'calculus', 'statistics', 'trigonometry'],
  chapters: ['chapter-1', 'chapter-2', 'chapter-3', 'introduction', 'fundamentals'],
  subtopics: ['linear-equations', 'quadratic-equations', 'functions', 'derivatives', 'integrals'],
  taskTypes: ['assessment', 'guidedPractise', 'learnSubtopic', 'learnPrerequisite']
};

export const test = authTest.extend<SelfStudyFixture>({
  subjectsViewPage: async ({ page }, use) => {
    const subjectsViewPage = new SubjectsViewPage(page);
    await use(subjectsViewPage);
  },

  accordionViewPage: async ({ page }, use) => {
    const accordionViewPage = new AccordionViewPage(page);
    await use(accordionViewPage);
  },

  taskViewPage: async ({ page }, use) => {
    const taskViewPage = new TaskViewPage(page);
    await use(taskViewPage);
  },

  revisionViewPage: async ({ page }, use) => {
    const revisionViewPage = new RevisionViewPage(page);
    await use(revisionViewPage);
  },

  selfStudyTestData: async ({}, use) => {
    await use(DEFAULT_SELF_STUDY_DATA);
  },

  navigateToSelfStudy: async ({ subjectsViewPage, homePage, ensureAuthenticated }, use) => {
    const navigateToSelfStudy = async () => {
      await ensureAuthenticated();
      await homePage.navigateToHome();
      await homePage.verifyOnHomePage();
      await homePage.navigateToSelfStudy();
      await subjectsViewPage.waitForPageToLoad();
    };

    await use(navigateToSelfStudy);
  },

  selectSubject: async ({ subjectsViewPage, accordionViewPage }, use) => {
    const selectSubject = async (subjectName: string) => {
      await subjectsViewPage.clickSubject(subjectName);
      await accordionViewPage.waitForPageToLoad();
      await accordionViewPage.verifySubjectInHeader(subjectName);
    };

    await use(selectSubject);
  },

  selectTopic: async ({ accordionViewPage }, use) => {
    const selectTopic = async (topicName: string) => {
      await accordionViewPage.clickTopic(topicName);
      await accordionViewPage.waitForTopicContentLoad(topicName);
    };

    await use(selectTopic);
  },

  startContinueStudying: async ({ subjectsViewPage }, use) => {
    const startContinueStudying = async (cardIndex: number = 0) => {
      const continueStudyingCardsCount = await subjectsViewPage.getContinueStudyingCardsCount();

      if (continueStudyingCardsCount > 0) {
        await subjectsViewPage.clickContinueStudyingCard(cardIndex);
      } else {
        throw new Error('No continue studying cards available');
      }
    };

    await use(startContinueStudying);
  },

  accessRevision: async ({ revisionViewPage }, use) => {
    const accessRevision = async () => {
      if (await revisionViewPage.isRevisionEnabled()) {
        await revisionViewPage.navigateToRevisionDetails();
        await revisionViewPage.waitForPageToLoad();
      } else {
        throw new Error('Revision feature is not enabled or not available');
      }
    };

    await use(accessRevision);
  },

  verifyResponsiveDesign: async ({ page, subjectsViewPage }, use) => {
    const verifyResponsiveDesign = async (viewportType: 'mobile' | 'tablet' | 'desktop') => {
      switch (viewportType) {
        case 'mobile':
          await page.setViewportSize({ width: 375, height: 667 });
          await subjectsViewPage.verifyMobileLayout();
          break;
        case 'tablet':
          await page.setViewportSize({ width: 768, height: 1024 });
          await subjectsViewPage.verifyTabletLayout();
          break;
        case 'desktop':
          await page.setViewportSize({ width: 1440, height: 900 });
          break;
      }

      // Verify page is still functional
      await subjectsViewPage.isContainerVisible();
    };

    await use(verifyResponsiveDesign);
  },

  waitForSelfStudyPageLoad: async ({ subjectsViewPage }, use) => {
    const waitForSelfStudyPageLoad = async () => {
      await subjectsViewPage.waitForPageToLoad();

      // Wait for skeleton loaders to disappear
      await subjectsViewPage.waitForSkeletonLoader(0);

      // Verify core elements are loaded
      await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();
    };

    await use(waitForSelfStudyPageLoad);
  },

  verifySubjectNavigation: async ({ subjectsViewPage, accordionViewPage, selfStudyTestData }, use) => {
    const verifySubjectNavigation = async (subjectName: string) => {
      // Verify subject is displayed on the subjects page
      await subjectsViewPage.verifySubjectsDisplayed([subjectName]);

      // Click on the subject
      await subjectsViewPage.clickSubject(subjectName);

      // Verify navigation to accordion view
      await accordionViewPage.waitForPageToLoad();
      await accordionViewPage.verifySubjectInHeader(subjectName);
      await accordionViewPage.verifySubjectInUrl(subjectName);
    };

    await use(verifySubjectNavigation);
  },

  verifyContinueStudyingFlow: async ({ subjectsViewPage }, use) => {
    const verifyContinueStudyingFlow = async () => {
      if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
        // Verify continue studying section elements
        const title = await subjectsViewPage.getContinueStudyingTitle();
        expect(title.trim().length).toBeGreaterThan(0);

        // Verify card limit (max 3 cards)
        await subjectsViewPage.verifyContinueStudyingCardsLimit();

        // Verify card UI elements
        const cardsCount = await subjectsViewPage.getContinueStudyingCardsCount();
        if (cardsCount > 0) {
          // Test first card
          await subjectsViewPage.verifyContinueStudyingCardUI(0);
          await subjectsViewPage.verifyCardIcons();
          await subjectsViewPage.verifyAPGPTextOnInProgressCards();
          await subjectsViewPage.verifyCardHeadings();

          // Test hover effect
          await subjectsViewPage.hoverOnContinueStudyingCard(0);
        }
      }
    };

    await use(verifyContinueStudyingFlow);
  },

  verifyEmptyStates: async ({ subjectsViewPage, taskViewPage }, use) => {
    const verifyEmptyStates = async () => {
      // Check for empty subjects state
      const subjectsCount = await subjectsViewPage.getSubjectCardsCount();
      if (subjectsCount === 0) {
        await subjectsViewPage.verifyEmptySubjectsState();
      }

      // Check for empty tasks state
      if (await taskViewPage.isContainerVisible()) {
        const tasksCount = await taskViewPage.getTasksCount();
        if (tasksCount === 0) {
          await taskViewPage.verifyEmptyTasksState();
        }
      }
    };

    await use(verifyEmptyStates);
  }
});

/**
 * Helper functions for self-study test scenarios
 */

/**
 * Create test data for specific subjects
 * @param subjects Array of subject names
 * @returns SelfStudyTestData
 */
export function createTestDataForSubjects(subjects: string[]): SelfStudyTestData {
  return {
    ...DEFAULT_SELF_STUDY_DATA,
    subjects
  };
}

/**
 * Viewport configurations for responsive testing
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  smallMobile: { width: 320, height: 568 },
  largeMobile: { width: 414, height: 896 },
  smallTablet: { width: 768, height: 1024 },
  largeTablet: { width: 1024, height: 1366 }
} as const;

/**
 * Test data scenarios for different self-study states
 */
export const TEST_SCENARIOS = {
  newStudent: {
    hasContinueStudying: false,
    hasRevision: false,
    subjects: ['math', 'english']
  },
  activeStudent: {
    hasContinueStudying: true,
    hasRevision: true,
    subjects: ['math', 'chemistry', 'physics', 'english']
  },
  completedStudent: {
    hasContinueStudying: false,
    hasRevision: true,
    subjects: ['math', 'chemistry', 'physics', 'english', 'social', 'biology']
  }
} as const;

/**
 * Priority-based test execution helpers
 */
export class TestPriorityHelper {
  /**
   * Get P0 (critical/smoke) test scenarios
   */
  static getP0Scenarios(): string[] {
    return [
      'Navigate to self-study page',
      'Verify self-study page loads successfully',
      'Verify all subject cards loaded',
      'Verify subject navigation',
      'Verify card heading/title',
      'Verify resume action'
    ];
  }

  /**
   * Get P1 (high priority) test scenarios
   */
  static getP1Scenarios(): string[] {
    return [
      'Verify subjects order',
      'Verify correct subject header',
      'Verify Continue Studying visibility',
      'Verify Continue Studying card UI',
      'Verify AP/GP text on In-Progress cards',
      'Verify card icons on In-Progress cards',
      'Verify card hover effect on In-Progress tasks'
    ];
  }

  /**
   * Get P2 (medium priority) test scenarios
   */
  static getP2Scenarios(): string[] {
    return [
      'Verify subject card alignment',
      'Verify subject card icons',
      'Verify number of Continue cards',
      'Verify Continue card layout',
      'Handle empty subject response'
    ];
  }

  /**
   * Get P3 (low priority) test scenarios
   */
  static getP3Scenarios(): string[] {
    return [
      'Verify greeting static message',
      'Verify helper description text',
      'Verify subject card hover',
      'Verify loader during slow API'
    ];
  }
}

/**
 * Test data factory for generating dynamic test scenarios
 */
export class SelfStudyTestDataFactory {
  /**
   * Generate test data for a specific subject
   */
  static forSubject(subjectName: string): SelfStudyTestData {
    return {
      subjects: [subjectName],
      topics: [`${subjectName}-topic-1`, `${subjectName}-topic-2`],
      chapters: [`${subjectName}-chapter-1`, `${subjectName}-chapter-2`],
      subtopics: [`${subjectName}-subtopic-1`, `${subjectName}-subtopic-2`],
      taskTypes: DEFAULT_SELF_STUDY_DATA.taskTypes
    };
  }

  /**
   * Generate test data for multiple subjects
   */
  static forSubjects(subjects: string[]): SelfStudyTestData {
    const topics: string[] = [];
    const chapters: string[] = [];
    const subtopics: string[] = [];

    subjects.forEach(subject => {
      topics.push(`${subject}-topic-1`, `${subject}-topic-2`);
      chapters.push(`${subject}-chapter-1`, `${subject}-chapter-2`);
      subtopics.push(`${subject}-subtopic-1`, `${subject}-subtopic-2`);
    });

    return {
      subjects,
      topics,
      chapters,
      subtopics,
      taskTypes: DEFAULT_SELF_STUDY_DATA.taskTypes
    };
  }

  /**
   * Generate minimal test data for smoke tests
   */
  static forSmokeTests(): SelfStudyTestData {
    return {
      subjects: ['math'],
      topics: ['algebra'],
      chapters: ['chapter-1'],
      subtopics: ['linear-equations'],
      taskTypes: ['assessment']
    };
  }
}

// Re-export expect for convenience
export { expect } from '@playwright/test';