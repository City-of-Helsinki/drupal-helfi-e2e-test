import { expect, type Page, test } from '@playwright/test';
import { verifyReact } from '../../../../utils/helpers';
import { logger } from '../../../../utils/logger';
import { type Language, languages, type TestCase, testCases } from './fixtures/testCases';
import {
  fetchEventCount,
  fetchEvents,
  fetchSubEvents,
  getEventId,
  getEventsApiUrl,
  pickRandomEvent,
} from './utils/linkedEventsApi';

const resultSelector = '.hdbt-search--react__results--title';
const filterSelector = '.event-form__filter-section-container';

// Position of each dropdown in the filter section.
const filterPosition = {
  startTime: 1,
  learningMode: 2,
  instructionLanguage: 3,
};

/**
 * Navigate to the cross-institutional studies search.
 */
async function navigateToSearch(page: Page, language: Language) {
  // Navigate to the search page.
  await page.goto(language.SEARCH_PATH, { waitUntil: 'domcontentloaded' });

  // Verify that the React application has successfully loaded.
  await verifyReact(page, '#helfi-events-search', '.react-search__list-container');

  // Make sure there is no error message.
  expect(await page.locator('.react-search__list-container .hds-notification--error').isVisible()).toBeFalsy();

  return page.locator('#helfi-events-search');
}

/**
 * Helper function for the dropdowns on cross-institutional studies search.
 */
async function selectDropdownOption(page: Page, position: number, value: number | string) {
  const dropdown = page.locator(`${filterSelector} > *:nth-child(${position})`);
  const dropdownButton = dropdown.locator('button[role="combobox"]');
  const initialLabel = (await dropdownButton.textContent()) || '';

  // Open the dropdown and select an option by its label or position.
  await dropdownButton.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  const option =
    typeof value === 'string'
      ? dropdown.locator(`li[role="option"][aria-label="${value}"]`)
      : dropdown.locator('li[role="option"]').nth(value);

  // Evaluate the option click as Playwright click won't work for this case.
  await option.evaluate((el) => {
    (el as HTMLElement).click();
  });

  // Single select dropdowns remove the options when one of them is selected.
  if ((await dropdownButton.getAttribute('aria-expanded')) === 'true') {
    await expect(option).toHaveAttribute('aria-selected', 'true');
    await dropdownButton.click();
  }

  // The dropdown button should show the selected option.
  await expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
  await expect(dropdownButton).not.toHaveText(initialLabel);
}

/**
 * Check that the search shows as many courses as the API returns.
 *
 * @param page - Playwright Page object representing the browser page.
 * @param expectedCount - Amount of courses the API returns.
 */
const expectResult = async (page: Page, expectedCount: number) =>
  await test.step('Check the results', async () => {
    // An empty search shows a message instead of the result count.
    if (expectedCount === 0) {
      logger(`The API returned no courses for the search: ${page.url()}`);
      await expect(page.locator('.event-list__no-results')).toBeVisible();
      return;
    }

    const resultLocator = page.locator(resultSelector);
    await resultLocator.waitFor({ state: 'visible' });

    // As the result count is the only number in the heading,
    // we can use that for a matching count.
    await expect
      .poll(
        async () => {
          const resultText = (await resultLocator.textContent()) || '';
          const numberMatch = resultText.match(/(\d+)/);
          return numberMatch ? parseInt(numberMatch[1], 10) : 0;
        },
        { timeout: 15_000 },
      )
      .toBe(expectedCount);
  });

languages.forEach((language: Language) => {
  test.describe(`Cross-institutional studies search (${language.CODE})`, () => {
    test('There should be results shown when viewing the search page for the first time', async ({ page }) => {
      const search = await navigateToSearch(page, language);
      const cardCount = await search.locator('.card').count();
      expect(cardCount).toBeGreaterThan(1);
    });

    test('The focus should be moved to the first result item when clicking pagination', async ({ page }) => {
      await navigateToSearch(page, language);

      const secondPageLink = page.locator('.pager__items a[href*="page=2"]');
      await secondPageLink.waitFor({ state: 'visible' });
      await secondPageLink.click();

      const firstCardLink = page.locator('.react-search__list-container .card__link').first();
      await expect(firstCardLink).toBeFocused();
    });

    // Run the search with the filter combinations of each test case.
    testCases.forEach((testCase: TestCase) => {
      test(testCase.NAME, async ({ page }) => {
        await navigateToSearch(page, language);
        const apiUrl = await getEventsApiUrl(page);

        // Search word matches the course names.
        if (testCase.SEARCH_WORD !== null) {
          const searchInput = page.locator('.hdbt-search__search-input input[type="search"]');
          await searchInput.fill(testCase.SEARCH_WORD);

          // Close the suggestion list that covers the filters.
          await page.keyboard.press('Escape');
          await expect(searchInput).toHaveValue(testCase.SEARCH_WORD);
        }

        // Start time limits the results to one semester.
        if (testCase.START_TIME !== null) {
          await selectDropdownOption(page, filterPosition.startTime, testCase.START_TIME);
        }

        // Mode of learning and language of instruction accept several selections.
        if (testCase.LEARNING_MODE !== null) {
          await selectDropdownOption(page, filterPosition.learningMode, testCase.LEARNING_MODE);
        }
        if (testCase.INSTRUCTION_LANGUAGE !== null) {
          await selectDropdownOption(page, filterPosition.instructionLanguage, testCase.INSTRUCTION_LANGUAGE);
        }

        // Submit the form and wait for the selections to be in the url.
        await page.locator('.hdbt-search--react__submit-button').click();
        await expect(page).toHaveURL(/\?/);

        // Ask the API how many courses the selections should return.
        const expectedCount = await fetchEventCount(page, apiUrl, new URL(page.url()).searchParams);
        await expectResult(page, expectedCount);
      });
    });
  });

  test.describe(`Cross-institutional studies course page (${language.CODE})`, () => {
    test('The course page should show the same information as the LinkedEvents API', async ({ page }) => {
      await navigateToSearch(page, language);

      // Select a random course from the API.
      const apiUrl = await getEventsApiUrl(page);
      const events = await fetchEvents(page, apiUrl);
      const event = pickRandomEvent(events, language.CODE);

      // The API has no courses for every langcode.
      test.skip(!event, `There are no courses with langcode ${language.CODE} in the LinkedEvents API`);
      if (!event) return;

      const title = (event.name[language.CODE] as string).trim();
      await page.goto(`${language.COURSE_PATH}/${event.id}`, { waitUntil: 'domcontentloaded' });

      // The title and the study unit details should match the API.
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(page.locator('.course-unit-details__item').first()).toContainText(title);

      // Lead-in should have a description.
      const shortDescription = event.short_description?.[language.CODE]?.trim();
      if (shortDescription) {
        await expect(page.locator('.lead-in')).toContainText(shortDescription);
      }

      // The sibling courses of the same study unit should be listed.
      if (event.super_event) {
        const subEvents = await fetchSubEvents(page, apiUrl, getEventId(event.super_event['@id']));
        const siblings = subEvents.filter((subEvent) => subEvent.id !== event.id && subEvent.name[language.CODE]);

        await expect(page.locator('.card--cross-institutional-course')).toHaveCount(siblings.length);
      }
    });
  });
});
