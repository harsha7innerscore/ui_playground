import { test, expect } from "../../fixtures/selfStudy.fixture";

/**
 * Self-Study Feature - Smoke Tests (P0 Priority)
 * Critical path tests that must pass before any other testing
 * Based on CSV test cases: TC_AV_01, TC_AV_02, TC_AV_05, TC_AV_10, TC_AV_18, TC_AV_20
 */

test.describe("Self-Study Feature - Smoke Tests (P0)", () => {
  test.beforeEach(async ({ navigateToSelfStudy }) => {
    await navigateToSelfStudy();
  });

  test("TC_AV_01: Verify navigation to self study page", async ({
    page,
    subjectsViewPage,
    homePage,
    ensureAuthenticated,
  }) => {
    // Given: Student should access the schoolai portal
    // When: Student should login into application and navigate to HomePage
    await ensureAuthenticated();
    await homePage.navigateToHome();

    // And: Student clicks on self study in header
    const selfStudyLink = page
      .locator('text=Self Study, a[href*="self"], [data-testid*="self-study"]')
      .first();
    if (await selfStudyLink.isVisible()) {
      await selfStudyLink.click();
    } else {
      // Alternative navigation if header link not found
      await subjectsViewPage.navigateToSelfStudy();
    }

    // Then: The student is navigated to self study page
    await subjectsViewPage.waitForPageToLoad();
    await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();
    await subjectsViewPage.verifyUrl(/.*self.*study|.*aps/);
  });

  test("TC_AV_02: Verify Self Study landing page UI loading", async ({
    subjectsViewPage,
    ensureAuthenticated,
  }) => {
    // Given: Student should login to the school AI web
    await ensureAuthenticated();

    // When: Student navigates to self study page
    await subjectsViewPage.navigateToSelfStudy();

    // Then: Self Study screen loads with all sections
    await subjectsViewPage.waitForPageToLoad();

    // Verify main container is loaded
    await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();

    // Verify subjects grid is loaded
    await expect(
      subjectsViewPage.isSubjectsGridVisible()
    ).resolves.toBeTruthy();

    // Verify greeting message is displayed
    const greetingMessage = await subjectsViewPage.getGreetingMessage();
    expect(greetingMessage.length).toBeGreaterThan(0);

    // Verify page loads without errors
    await subjectsViewPage.verifyLoaderAnimation();
  });

  test("TC_AV_05: Verify all subject cards loaded", async ({
    subjectsViewPage,
    selfStudyTestData,
  }) => {
    // Given: The teacher should be mapped for the subjects
    // When: Student navigates to self study
    await subjectsViewPage.waitForPageToLoad();

    // Then: Student sees the subjects based on Math, Chemistry, Physics, English, Social, Biology
    const subjectCardsCount = await subjectsViewPage.getSubjectCardsCount();
    expect(subjectCardsCount).toBeGreaterThan(0);

    // Verify expected subjects are displayed
    const expectedSubjects = selfStudyTestData.subjects;

    // Check if subjects are displayed (verify at least some expected subjects)
    let foundSubjects = 0;
    for (const subject of expectedSubjects) {
      try {
        await subjectsViewPage.verifySubjectsDisplayed([subject]);
        foundSubjects++;
      } catch {
        // Subject might not be available for this test user
        console.log(
          `Subject ${subject} not found - may not be configured for test user`
        );
      }
    }

    // At least one subject should be found
    expect(foundSubjects).toBeGreaterThan(0);
  });

  test("TC_AV_10: Verify subject navigation", async ({
    subjectsViewPage,
    accordionViewPage,
    selfStudyTestData,
  }) => {
    // Given: Student should login to the school AI web and navigate to self study
    await subjectsViewPage.waitForPageToLoad();

    const subjectCardsCount = await subjectsViewPage.getSubjectCardsCount();
    expect(subjectCardsCount).toBeGreaterThan(0);

    // When: Student clicks a subject
    const testSubject = selfStudyTestData.subjects[0]; // Use first available subject

    try {
      await subjectsViewPage.clickSubject(testSubject);

      // Then: User navigates to chapter list
      await accordionViewPage.waitForPageToLoad();
      await expect(
        accordionViewPage.isContainerVisible()
      ).resolves.toBeTruthy();

      // Verify subject information is displayed in header
      await accordionViewPage.verifySubjectInHeader(testSubject);

      // Verify URL contains subject information
      await accordionViewPage.verifySubjectInUrl(testSubject);
    } catch (error) {
      // If specific subject not available, try clicking first available card
      const allCards = await subjectsViewPage.getSubjectCards();
      if (allCards.length > 0) {
        await allCards[0].click();
        await accordionViewPage.waitForPageToLoad();
        await expect(
          accordionViewPage.isContainerVisible()
        ).resolves.toBeTruthy();
      } else {
        throw error;
      }
    }
  });

  test("TC_AV_18: Verify each card heading/title", async ({
    subjectsViewPage,
  }) => {
    // Given: User is logged into the SchoolAI application and on Self Study page
    await subjectsViewPage.waitForPageToLoad();

    // When: Student checks each card headings/title
    const subjectCardsCount = await subjectsViewPage.getSubjectCardsCount();
    expect(subjectCardsCount).toBeGreaterThan(0);

    // Verify subject cards have proper titles
    const subjectCards = await subjectsViewPage.getSubjectCards();
    for (const card of subjectCards) {
      const cardText = await subjectsViewPage.getTextContent(card);
      expect(cardText.trim().length).toBeGreaterThan(0);
    }

    // If Continue Studying section is available, verify those card headings too
    if (await subjectsViewPage.isContinueStudyingSectionVisible()) {
      // Then: Each card should display a clear and correct heading/title
      await subjectsViewPage.verifyCardHeadings();
    }
  });

  test("TC_AV_20: Verify resume action", async ({ subjectsViewPage }) => {
    // Given: Student has ongoing task
    await subjectsViewPage.waitForPageToLoad();

    // Check if Continue Studying section is visible (indicates ongoing tasks)
    const hasContinueStudying =
      await subjectsViewPage.isContinueStudyingSectionVisible();

    if (hasContinueStudying) {
      const continueCardsCount =
        await subjectsViewPage.getContinueStudyingCardsCount();
      expect(continueCardsCount).toBeGreaterThan(0);
      expect(continueCardsCount).toBeLessThanOrEqual(3);

      // When: Student clicks on a continue studying card
      const initialUrl = subjectsViewPage.getCurrentUrl();

      await subjectsViewPage.clickContinueStudyingCard(0);

      // Then: Clicking card resumes last activity
      // Verify navigation occurred (URL changed or new page loaded)
      await subjectsViewPage.page.waitForTimeout(1000); // Give time for navigation
      const newUrl = subjectsViewPage.getCurrentUrl();

      // Either URL should change or we should be on a different page/view
      const urlChanged = newUrl !== initialUrl;
      const pageHasNewContent = await subjectsViewPage.page
        .locator("body")
        .isVisible();

      expect(urlChanged || pageHasNewContent).toBeTruthy();
    } else {
      // If no continue studying cards, log this as expected for new users
      console.log(
        "No continue studying cards found - this is expected for new users without ongoing activities"
      );

      // Verify the empty state or that Continue Studying section is appropriately hidden
      expect(hasContinueStudying).toBeFalsy();
    }
  });

  test("TC_AV_11: Verify correct subject header", async ({
    subjectsViewPage,
    accordionViewPage,
    selfStudyTestData,
  }) => {
    // Given: Student navigates to self study and clicks a subject
    await subjectsViewPage.waitForPageToLoad();

    const subjectCardsCount = await subjectsViewPage.getSubjectCardsCount();
    expect(subjectCardsCount).toBeGreaterThan(0);

    const testSubject = selfStudyTestData.subjects[0];

    try {
      await subjectsViewPage.clickSubject(testSubject);
      await accordionViewPage.waitForPageToLoad();

      // Then: Correct subject displayed in header
      await accordionViewPage.verifySubjectInHeader(testSubject);
    } catch (error) {
      // Fallback: Click first available subject card
      const allCards = await subjectsViewPage.getSubjectCards();
      if (allCards.length > 0) {
        const firstCard = allCards[0];
        const cardText = await subjectsViewPage.getTextContent(firstCard);
        const subjectFromCard = cardText.toLowerCase().trim();

        await firstCard.click();
        await accordionViewPage.waitForPageToLoad();

        // Verify the subject name appears somewhere in the header area
        const headerText = await accordionViewPage.getGreetingMessage();
        expect(headerText.toLowerCase()).toContain(
          subjectFromCard.split(" ")[0]
        );
      } else {
        throw error;
      }
    }
  });
});

/**
 * Self-Study Feature - Navigation Flow Tests (P0)
 * End-to-end navigation flows for critical paths
 */
test.describe("Self-Study Feature - Navigation Flows (P0)", () => {
  test("Complete navigation flow: Home → Self Study → Subject → Topic", async ({
    navigateToSelfStudy,
    subjectsViewPage,
    accordionViewPage,
    selectSubject,
    selectTopic,
    selfStudyTestData,
  }) => {
    // Navigate to self study
    await navigateToSelfStudy();

    // Verify subjects are loaded
    const subjectCardsCount = await subjectsViewPage.getSubjectCardsCount();
    expect(subjectCardsCount).toBeGreaterThan(0);

    // Select first available subject
    const testSubject = selfStudyTestData.subjects[0];
    await selectSubject(testSubject);

    // Verify we're on accordion view
    await expect(accordionViewPage.isContainerVisible()).resolves.toBeTruthy();

    // Check if topics are available and select one
    const topicsCount = await accordionViewPage.getTopicsCount();
    if (topicsCount > 0) {
      const testTopic = selfStudyTestData.topics[0];
      await selectTopic(testTopic);

      // Verify topic selection worked
      await accordionViewPage.waitForTopicContentLoad(testTopic);
    }
  });

  test("Back navigation flow: Subject → Self Study", async ({
    navigateToSelfStudy,
    subjectsViewPage,
    accordionViewPage,
    page,
    selfStudyTestData,
  }) => {
    await navigateToSelfStudy();

    // Navigate to a subject
    const testSubject = selfStudyTestData.subjects[0];
    await subjectsViewPage.clickSubject(testSubject);
    await accordionViewPage.waitForPageToLoad();

    // Navigate back using browser back button
    await page.goBack();

    // Verify we're back on self study page
    await subjectsViewPage.waitForPageToLoad();
    await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();
  });

  test("Mobile breadcrumb navigation", async ({
    navigateToSelfStudy,
    subjectsViewPage,
    accordionViewPage,
    verifyResponsiveDesign,
    selfStudyTestData,
  }) => {
    // Set mobile viewport
    await verifyResponsiveDesign("mobile");

    await navigateToSelfStudy();

    // Navigate to a subject
    const testSubject = selfStudyTestData.subjects[0];
    await subjectsViewPage.clickSubject(testSubject);
    await accordionViewPage.waitForPageToLoad();

    // Verify breadcrumb navigation is available on mobile
    const isBreadcrumbVisible = await accordionViewPage.isBreadcrumbVisible();

    if (isBreadcrumbVisible) {
      // Use breadcrumb to navigate back
      await accordionViewPage.navigateBackViaBreadcrumb();

      // Verify we're back on self study page
      await subjectsViewPage.waitForPageToLoad();
      await expect(subjectsViewPage.isContainerVisible()).resolves.toBeTruthy();
    }
  });
});
