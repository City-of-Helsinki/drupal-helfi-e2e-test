import { logger } from '../../../utils/logger';
import { expect, test, type Page } from '@playwright/test';

/**
 * Navigates to the front page and .
 */
async function navigateToFrontPage(page: Page) {
  await page.goto('/fi', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.latest-news__link');
  return page.locator('.latest-news__link');
}

async function navigateToNewsArchive(page: Page) {
  const newsArchiveLink = await navigateToFrontPage(page);
  await newsArchiveLink.click();
  await page.waitForSelector('.news-archive .hdbt-search--react__form-container');
  return page.locator('.news-archive');
}

const TEST_CASES = [
  {
    NAME: 'Text filter',
    TEXT_FILTER: 'Helsinki',
    TOPICS: null,
    CITY_DISTRICTS: null,
    TARGET_GROUPS: null,
  },
];

const fillTextFilter = (page: Page, value: string) =>
  test.step('Fill text filter', async () => {
    await page.getByLabel('Hakusana').fill(String(value));
  });

const fillTopics = (page: Page, value: string) =>
  test.step('Fill topics', async () => {
    await page.getByLabel('Aihe').fill(String(value));
  });

const fillCityDistricts = (page: Page, value: string) =>
  test.step('Fill city districts', async () => {
    await page.getByLabel('Kaupunginosat').fill(String(value));
  });

const fillTargetGroups = (page: Page, value: string) =>
  test.step('Fill target groups', async () => {
    await page.getByLabel('Kohderyhmät').fill(String(value));
  });

const clickSubmitButton = (page: Page) =>
  test.step('Click submit button', async () => {
    await page.getByRole('button', { name: 'Etsi' }).click();
  });

// All the test cases expect more than one result.
const resultSelector = '.hdbt-search--react__results--title';
const expectResult = (page: Page) =>
  test.step('Check the results', async () => {
    // Get the current results text before waiting for changes
    const initialText = await page.locator(resultSelector).textContent() || '';
    
    // Wait for the results to change
    await page.waitForFunction(
      ({ selector, initialText }) => {
        const resultElement = document.querySelector(selector);
        if (!resultElement) return false;
        const currentText = resultElement.textContent || '';
        return currentText !== initialText && currentText.includes('hakutulosta');
      },
      { selector: resultSelector, initialText }
    );

    // Now get the actual result text and verify
    const resultText = await page.locator(resultSelector).textContent();
    const numberMatch = resultText?.match(/(\d+)/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1], 10);
      expect(number).toBeGreaterThan(1);
    } else {
      throw new Error('0 results or no number at all found in the result text.');
    }
  });

// test.describe.configure({ mode: 'parallel' });

test.describe('News archive', () => {
  test('should be visible on news archive page and have results', async ({ page }) => {
    const newsArchive = await navigateToNewsArchive(page);

    // Make sure the react search is visible.
    await expect(newsArchive.locator('.hdbt-search--react__form-container')).toBeVisible();
    await expect(newsArchive.locator('.react-search__results')).toBeVisible();

    // Make sure there is no error message.
    expect(
      await newsArchive.locator('.react-search__results').getByText('Sisällön lataamisessa tapahtui virhe.').isVisible(),
    ).toBeFalsy();

    // Check that there is at least one result.
    const cardCount = await newsArchive.locator('.react-search__results').locator('.card').count();
    expect(cardCount).toBeGreaterThan(1);

    logger('News archive with results has been verified.');
  });

  TEST_CASES.forEach((testCase) => {
    test.describe(testCase.NAME, () => {
      test('Fill in form and check results', async ({ page }) => {
        await navigateToNewsArchive(page);
        if (testCase.TEXT_FILTER !== null) await fillTextFilter(page, testCase.TEXT_FILTER);
        if (testCase.TOPICS !== null) await fillTopics(page, testCase.TOPICS);
        if (testCase.CITY_DISTRICTS !== null) await fillCityDistricts(page, testCase.CITY_DISTRICTS);
        if (testCase.TARGET_GROUPS !== null) await fillTargetGroups(page, testCase.TARGET_GROUPS);
        await clickSubmitButton(page);
        await expectResult(page);
      });
    });
  });
});