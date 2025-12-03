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
} from './utils/newsArchiveInput';

/**
 * Navigates to the front page and from there to the news archive.
 */
async function navigateToArchiveFromFrontPage(page: Page) {
  await page.goto('/fi', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('.latest-news__link');
  const newsArchiveLink = page.locator('.latest-news__link');
  await expect(newsArchiveLink).toBeVisible();
  await newsArchiveLink.click();
  
  await verifyReact(page);
  
  logger('News archive is accessible from the front page.');
}

/**
 * Navigates to the news archive.
 */
async function navigateToNewsArchive(page: Page) {
  await page.goto('/fi/uutiset', { waitUntil: 'domcontentloaded' });
  return page.locator('.news-archive');
}

/**
 * Verify that the React application has fully loaded.
 */
async function verifyReact(page: Page) {
  await page.waitForSelector('.news-archive .hdbt-search--react__form-container');
  await page.waitForSelector('.news-archive .react-search__results');

  expect(page.locator('.news-archive .hdbt-search--react__form-container')).toBeVisible();
  expect(page.locator('.news-archive .react-search__results')).toBeVisible();
}

test.describe('News archive', () => {
  test('should be accessible from the front page', async ({ page }) => {
    await navigateToArchiveFromFrontPage(page);
  });
  
  test('should have results by default', async ({ page }) => {
    const newsArchive = await navigateToNewsArchive(page);

    await verifyReact(page);

    // Make sure there is no error message.
    expect(
      await newsArchive.locator('.react-search__results').getByText('Sisällön lataamisessa tapahtui virhe.').isVisible(),
    ).toBeFalsy();

    // Check that there is at least one result.
    const cardCount = await newsArchive.locator('.react-search__results').locator('.card').count();
    expect(cardCount).toBeGreaterThan(1);

    logger('News archive with results has been verified.');
  });

  testCases.forEach((testCase: TestCase) => {
    test.describe(testCase.NAME, () => {
      test('Fill in the form and check results', async ({ page }) => {
        await navigateToNewsArchive(page);
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
        await clickSubmitButton(page);
        await expectResult(page);
      });
    });
  });
});