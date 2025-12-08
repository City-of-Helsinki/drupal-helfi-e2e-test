import { expect, type Page, test } from '@playwright/test';
import { DOMParser } from '@xmldom/xmldom';
import type {TestCase } from './newsArchiveTestCases';

/**
 * Helper function for the dropdowns on news archive page.
 */
async function fillDropdown(page: Page, selector: string, values: string[]) {
  const dropdownButton = page.locator(`.hdbt-search--react__dropdown-filters > *:nth-child(${selector}) button[role="combobox"]`);

  // Open the dropdown.
  await dropdownButton.click();
  await expect(page.getByRole('listbox')).toBeVisible();

  // Select options
  await values.reduce<Promise<void>>(
    (chain, value) =>
      chain.then(async () => {
        const option = page.locator(`.hdbt-search--react__dropdown-filters > *:nth-child(${selector}) li[aria-label="${value}"]`);

        // As playwright click won't work for this case, we use evaluate to click the element.
        await option.evaluate((el) => {
          (el as HTMLElement).click();
        });

        await expect(option).toHaveAttribute('aria-selected', 'true');
      }),
    Promise.resolve(),
  );

  // Close the dropdown.
  await dropdownButton.click();
  await expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
}

const fillTextFilter = async (page: Page, value: string) =>
  await test.step('Fill text filter', async () => {
    await page.getByLabel('Hakusana').fill(String(value));
  });

const fillTopics = async (page: Page, values: string[]) =>
  await test.step('Fill topics', async () => {
    await fillDropdown(page, '1', values);
  });

const fillCityDistricts = async (page: Page, values: string[]) =>
  await test.step('Fill city districts', async () => {
    await fillDropdown(page, '2', values);
  });

const fillTargetGroups = async (page: Page, values: string[]) =>
  await test.step('Fill target groups', async () => {
    await fillDropdown(page, '3', values);
  });

const clickSubmitButton = async (page: Page) =>
  await test.step('Click submit button', async () => {
    await page.getByRole('button', { name: 'Etsi' }).click();
  });

// All the test cases expect more than one result.
const resultSelector = '.hdbt-search--react__results--title';
const expectResult = async (page: Page, testCase?: TestCase) =>
  await test.step('Check the results', async () => {
    // Get the current results text before waiting for changes.
    const initialText = await page.locator(resultSelector).textContent() || '';

    // Wait for the results to change.
    const resultLocator = page.locator(resultSelector);
    await resultLocator.waitFor({ state: 'visible' });

    // Check if all filters are null
    const areAllFiltersNull = testCase &&
      testCase.TEXT_FILTER === null &&
      testCase.TOPICS === null &&
      testCase.CITY_DISTRICTS === null &&
      testCase.TARGET_GROUPS === null;

    if (areAllFiltersNull) {
      // If all filters are null, the results should not change
      await expect(resultLocator).toHaveText(initialText, { timeout: 5000 });
      return;
    }

    // Wait for the text to change from initial and contain 'hakutulosta'.
    await expect(resultLocator).not.toHaveText(initialText, { timeout: 5000 });
    await expect(resultLocator).toContainText('hakutulosta', { timeout: 5000 });

    // Now get the actual result text and verify.
    const resultText = await page.locator(resultSelector).textContent();
    const numberMatch = resultText?.match(/(\d+)/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1], 10);
      expect(number).toBeGreaterThan(1);
    } else {
      throw new Error('0 results or no number at all found in the result text.');
    }
  });

const expectRss = async (page: Page) =>
  await test.step('Check that the results match with RSS', async () => {
    // Get the results container from the news archive.
    const newsArchiveFilterResults = page.locator('.react-search__results');
    await expect(newsArchiveFilterResults).toBeVisible();

    // Save all news items from the news archive.
    const archiveItems = newsArchiveFilterResults.locator('.card');

    // Find the rss-link.
    const rssLink = page.locator('.news-archive__rss-link');

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

      // Use DOMParser to parse the RSS feed.
      const rssElement = rssXml.getElementsByTagName('rss')[0];
      const channelElement = rssXml.getElementsByTagName('channel')[0];
      const channelTitle = channelElement.getElementsByTagName('title')[0].textContent?.trim();

      // Verify basic RSS structure.
      expect(rssElement).toBeDefined();
      expect(channelElement).toBeDefined();
      expect(channelTitle).toContain('Uutiset');

      // Get all items from the RSS feed.
      const rssItems = rssXml.getElementsByTagName('item');

      // Compare the number of news items.
      const archiveItemCount = await archiveItems.count();
      expect(archiveItemCount).toBeGreaterThanOrEqual(rssItems.length);

      // Compare the news item titles so that they match in the results and RSS feed.
      const itemsToCompare = Math.min(rssItems.length, archiveItemCount);
      for (let i = 0; i < itemsToCompare; i++) {
        const archiveItemTitle = (await archiveItems.nth(i).locator('.card__link').textContent())?.trim();
        const rssItemTitle = rssItems[i].getElementsByTagName('title')[0].textContent?.trim();
        expect(archiveItemTitle).toBe(rssItemTitle);
      }
    }
  });

export {
  fillTextFilter,
  fillTopics,
  fillCityDistricts,
  fillTargetGroups,
  clickSubmitButton,
  expectResult,
  expectRss,
};
