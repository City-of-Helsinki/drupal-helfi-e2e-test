import { logger } from '../../../utils/logger';
import { expect, test, type Page } from '@playwright/test';
import { type TestCase, testCases } from './utils/newsArchiveTestCases';
import {
  fillTextFilter,
  fillTopics,
  fillCityDistricts,
  fillTargetGroups,
  clickSubmitButton,
  expectResult,
  expectRss,
  resultSelector,
} from './utils/newsArchiveInput';

/**
 * Navigates to the news archive.
 */
async function navigateToNewsArchive(page: Page) {
  // Navigate to the news archive.
  await page.goto('/fi/uutiset', { waitUntil: 'domcontentloaded' });

  // Verify that the React application has successfully loaded.
  await verifyReact(page);

  // Make sure there is no error message.
  expect(
    await page.locator('.react-search__results').getByText('Sisällön lataamisessa tapahtui virhe.').isVisible(),
  ).toBeFalsy();

  return page.locator('.news-archive');
}

/**
 * Verify that the React application has fully loaded.
 */
async function verifyReact(page: Page) {
  // Wait for the form and results container to load.
  await page.waitForSelector('.news-archive .hdbt-search--react__form-container');
  await page.waitForSelector('.news-archive .react-search__results');

  // Expect  the form and results container to be visible.
  await expect(page.locator('.news-archive .hdbt-search--react__form-container')).toBeVisible();
  await expect(page.locator('.news-archive .react-search__results')).toBeVisible();
}

test.describe('News archive', () => {
  test('should be accessible from the front page', async ({ page }) => {
    // Navigate to the front page of the instance.
    await page.goto('/fi', { waitUntil: 'domcontentloaded' });

    // Find the link to the news archive.
    await page.waitForSelector('.latest-news__link');
    const newsArchiveLink = page.locator('.latest-news__link');
    await expect(newsArchiveLink).toBeVisible();

    // Click to link.
    await newsArchiveLink.click();

    // Expect the React application to load.
    await verifyReact(page);

    logger('News archive is accessible from the front page.');
  });

  test('should have results by default', async ({ page }) => {
    // Go directly to the news archive page.
    const newsArchive = await navigateToNewsArchive(page);

    // Check that there is at least one result.
    const cardCount = await newsArchive.locator('.react-search__results').locator('.card').count();
    expect(cardCount).toBeGreaterThan(1);

    logger('News archive with results has been verified.');
  });

  testCases.forEach((testCase: TestCase) => {
    test.describe(testCase.NAME, () => {
      test('Fill in the form and check results', async ({ page }) => {
        await navigateToNewsArchive(page);
        await verifyReact(page);

        // Then chain the form filling operations
        await (async () => {
          if (testCase.TEXT_FILTER !== null) {
            await fillTextFilter(page, testCase.TEXT_FILTER);
          }
          if (testCase.TOPICS !== null) {
            await fillTopics(page, testCase.TOPICS);
          }
          if (testCase.CITY_DISTRICTS !== null) {
            await fillCityDistricts(page, testCase.CITY_DISTRICTS);
          }
          if (testCase.TARGET_GROUPS !== null) {
            await fillTargetGroups(page, testCase.TARGET_GROUPS);
          }
        })();

        // Get the initial results text.
        const initialText = await page.locator(resultSelector).textContent() || '';

        await clickSubmitButton(page);
        await expectResult(page, initialText, testCase);
        await expectRss(page);
      });
    });
  });
});
