import { expect, type Page, test } from '@playwright/test';
import { fetchRssFeed } from '../../../../utils/fetchRssFeed';
import type { TestCase } from './newsArchiveTestCases';

const resultSelector = '.hdbt-search--react__results--title';

/**
 * Helper function for the dropdowns on news archive page.
 */
async function fillDropdown(page: Page, selector: string, values: string[]) {
  const dropdownButton = page.locator(
    `.hdbt-search--react__dropdown-filters > *:nth-child(${selector}) button[role="combobox"]`,
  );

  // Open the dropdown.
  await dropdownButton.click();
  await expect(page.getByRole('listbox')).toBeVisible();

  // Select options
  await values.reduce<Promise<void>>(
    (chain, value) =>
      chain.then(async () => {
        const option = page.locator(
          `.hdbt-search--react__dropdown-filters > *:nth-child(${selector}) li[aria-label="${value}"]`,
        );

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
const expectResult = async (page: Page, initialText: string, testCase?: TestCase) =>
  await test.step('Check the results', async () => {
    // Wait for the results to change.
    const resultLocator = page.locator(resultSelector);
    await resultLocator.waitFor({ state: 'visible' });

    // Check if all filters are null
    const areAllFiltersNull =
      testCase &&
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

// Compare news archive items on the current page against the given RSS feed URL.
async function compareNewsArchiveWithRss(
  page: Page,
  archiveResults: ReturnType<Page['locator']>,
  rssUrl: string,
  channelTitle: string = '',
) {
  const archiveItems = archiveResults.locator('.card');
  const archiveItemCount = await archiveItems.count();
  const rssItems = Array.from(await fetchRssFeed(page, rssUrl, channelTitle));

  expect(
    rssItems.length,
    `There are ${archiveItemCount} items in the news archive. The RSS feed returned ${rssItems.length} items.`,
  ).toBeGreaterThan(0);

  // Verify that each archive item title matches the corresponding RSS item title.
  const itemsToCompare = Math.min(rssItems.length, archiveItemCount);
  for (let i = 0; i < itemsToCompare; i++) {
    const archiveItemTitle = (await archiveItems.nth(i).locator('.card__link').textContent())?.trim();
    const rssItemTitle = rssItems[i].getElementsByTagName('title')[0].textContent?.trim();
    expect(
      archiveItemTitle,
      `Item ${i + 1}: archive title "${archiveItemTitle}" matches RSS title "${rssItemTitle}"`,
    ).toBe(rssItemTitle);
  }

  return archiveItemCount;
}

// Get the RSS feed URL from the page and compare news items against it.
async function matchesWithRss(page: Page, rssPage?: number) {
  const newsArchiveResults = page.locator('.react-search__results');
  await expect(newsArchiveResults).toBeVisible();

  const rssLink = page.locator('.news-archive__rss-link');
  await expect(rssLink).toBeVisible();

  let rssUrl = await rssLink.getAttribute('href');
  if (!rssUrl) throw new Error('RSS feed URL is missing');

  if (rssPage) {
    rssUrl += rssUrl.includes('?') ? `&page=${rssPage}` : `?page=${rssPage}`;
  }
  await compareNewsArchiveWithRss(page, newsArchiveResults, rssUrl, 'Uutiset');
}

const expectRss = async (page: Page) =>
  await test.step('Check that the results match with RSS', async () => {
    // Check that the news items matches the RSS items.
    await matchesWithRss(page);

    // Check if the second page exists.
    const secondPageLink = page.locator('.pager__items a[href*="page=2"]');
    const secondPageExists = await secondPageLink
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (secondPageExists) {
      await secondPageLink.click();
      await matchesWithRss(page, 1);
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
  resultSelector,
};
