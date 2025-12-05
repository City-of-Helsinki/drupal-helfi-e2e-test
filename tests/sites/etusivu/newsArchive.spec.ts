import { logger } from '../../../utils/logger';
import { expect, test, type Page } from '@playwright/test';
import { DOMParser } from 'xmldom';
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

  await expect(page.locator('.news-archive .hdbt-search--react__form-container')).toBeVisible();
  await expect(page.locator('.news-archive .react-search__results')).toBeVisible();
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

  test('should have RSS-link that includes the same ten news items as the archive', async ({ page }) => {
    const newsArchive = await navigateToNewsArchive(page);

    await verifyReact(page);

    // Make sure there is no error message.
    expect(
      await newsArchive.locator('.react-search__results').getByText('Sisällön lataamisessa tapahtui virhe.').isVisible(),
    ).toBeFalsy();

    const newsArchiveFilterResults = page.locator('.react-search__results');
    await expect(newsArchiveFilterResults).toBeVisible();

    // Save all news items from the news archive.
    const archiveItems = newsArchive.locator('.card');

    // Find the rss-link.
    const rssLink = newsArchive.locator('.news-archive__rss-link');

    // Make sure the link is visible.
    expect(
      await rssLink.isVisible()
    ).toBeTruthy();

    // Get the url of the RSS feed from the link.
    const rssUrl = await rssLink.getAttribute('href');
    expect(rssUrl).toBeTruthy();

    // Fetch the RSS feed.
    if (rssUrl) {
      const response = await page.request.get(rssUrl, {
        ignoreHTTPSErrors: true
      });
      expect(response.status()).toBe(200);
      
      const rssContent = await response.text();
      const rssXml = new DOMParser().parseFromString(rssContent, 'text/xml');

      // Use getElementsByTagName instead of querySelector
      const rssElement = rssXml.getElementsByTagName('rss')[0];
      const channelElement = rssXml.getElementsByTagName('channel')[0];
      const channelTitle = channelElement.getElementsByTagName('title')[0].textContent?.trim();

      // Verify basic RSS structure
      expect(rssElement).toBeDefined();
      expect(channelElement).toBeDefined();
      expect(channelTitle).toContain('Uutiset');

      // Get all items
      const rssItems = rssXml.getElementsByTagName('item');

      // Compare the number of news items.
      const archiveItemCount = await archiveItems.count();
      expect(archiveItemCount).toBeGreaterThanOrEqual(rssItems.length);

      const itemsToCompare = Math.min(rssItems.length, archiveItemCount);
      for (let i = 0; i < itemsToCompare; i++) {
        const archiveItemTitle = (await archiveItems.nth(i).locator('.card__link').textContent())?.trim();
        const rssItemTitle = rssItems[i].getElementsByTagName('title')[0].textContent?.trim();
        expect(archiveItemTitle).toBe(rssItemTitle);
      }
    }
    logger('News archive has RSS-link that includes the same news items as the archive.');
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
        
        await clickSubmitButton(page);
        await expectResult(page);
      });
    });
  });
});