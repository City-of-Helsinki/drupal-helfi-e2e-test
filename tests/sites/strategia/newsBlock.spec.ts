import { fetchJsonApiRequest, type JsonApiResponse } from '../../../utils/fetchJsonApiRequest';
import { logger } from '../../../utils/logger';
import { expect, type Page, test } from '@playwright/test';

/**
 * Type definition for news item data structure from Drupal's JSON:API.
 * Matches the structure of the news content type in Drupal.
 */
type NewsItem = {
  id: string;
  attributes: {
    langcode: string;
    status: boolean;
    title: string;
    published_at: Date;
    short_title?: string | null;
  };
  relationships: {
    tags: {
      data: {
        id: string;
        type: string;
        meta: {
          drupal_internal__target_id?: number | string;
        };
      }[];
    };
  };
};

async function findNewsListingBlock(page: Page) {
  await page.goto('/fi/paatoksenteko-ja-hallinto', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.component--news-list');

  // Find the news listing element from the page.
  await expect(page.locator('.component--news-list')).toBeVisible();
  return page.locator('.component--news-list');
}

test.describe('News listing block', () => {
  test('should be visible on the front page', async ({ page }) => {
    const newsListingBlock = await findNewsListingBlock(page);

    // Make sure there is no empty-results message.
    expect(
      await newsListingBlock.locator('.no-results').isVisible(),
    ).toBeFalsy();

    // Check that there is at least one news item.
    const newsListingItems = newsListingBlock.locator('.news-listing__item');
    const itemCount = await newsListingItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Find the news tags element from the page.
    const newsTags = newsListingBlock.locator('.content-tags');

    // Make sure the news tags element is visible.
    expect(
      await newsTags.isVisible()
    ).toBeTruthy();

    // Check that there is at least one news tag.
    const newsTagsItems = newsTags.locator('.content-tags__tags__tag');
    const tagsCount = await newsTagsItems.count();
    expect(tagsCount).toBeGreaterThan(0);
    
    logger('News listing block is visible on the front page and it has results.');
  });

  test('should have the same news items as in the API response', async ({ page }) => {
    // Construct client-side query parameters for the API request.
    const params = new URLSearchParams({
      'filter[field_news_item_tags.meta.drupal_internal__target_id][condition][path]': 'field_news_item_tags.meta.drupal_internal__target_id',
      'filter[field_news_item_tags.meta.drupal_internal__target_id][condition][operator]': 'IN',
      'sort': '-published_at',
      'page[limit]': '8'
    });

    // Append multiple values for the same parameter.
    // @todo: It would ge a good idea to add the tags 
    // to the news list block as a data-attribute and 
    // then fetch the data-attribute here instead of
    // hardcoding the values.
    params.append('filter[field_news_item_tags.meta.drupal_internal__target_id][condition][value][]', '336');
    params.append('filter[field_news_item_tags.meta.drupal_internal__target_id][condition][value][]', '384');

    // Fetch news items from Drupal's JSON:API using the created query parameters.
    const data = await fetchJsonApiRequest<JsonApiResponse<NewsItem>>(
      process.env.ETUSIVU_BASE_URL ?? 'https://www.test.hel.ninja',
      `/fi/jsonapi/node/news?${params.toString()}`
    );

    // Verify we received data from the API.
    expect(data).toHaveProperty('data');

    // Extract news items from the API response.
    const items: NewsItem[] = data?.data ?? [];

    // Skip test if no matching news items found.
    if (items.length === 0) {
      logger('No news items found in JSON:API; nothing to verify.');
      return;
    }

    logger(`Found ${items.length} news items in JSON:API; verifying visibility.`);

    // Loop through each news item and verify it is visible on the news listing block.
    await items.reduce(async (prev, item) => {
      await prev;

      // Get the title of the news item. 
      const title = item.attributes.title;

      // Skip if there is no title to verify.
      if (!title) {
        logger('No title was found for news item');
        return;
      }

      // Go to the instance front page where the news listing block is.
      await page.goto('/fi/paatoksenteko-ja-hallinto', { waitUntil: 'domcontentloaded' });

      // Verify that the news item is visible in the instance front page.
      const newsItem = page.locator('.news-listing__item')
        .filter({ has: page.getByRole('link', { name: title, exact: true }) })
        .first();
      await expect(newsItem).toBeVisible();
    }, Promise.resolve());

    logger('News listing block has the same news items as in the API response.');
  });

  test('should have a link-button on the block that takes the user to front page news listing with correct filters', async ({ page }) => {
    const newsListingBlock = await findNewsListingBlock(page);

    // Find the link-button on the block that takes the user to front page news listing.
    const linkButton = newsListingBlock.getByRole('link').filter({ hasText: 'Katso kaikki aiheen uutiset' });

    // Make sure the button is visible.
    expect(
      await linkButton.isVisible()
    ).toBeTruthy();

    // Get all news items from the listing block.
    const newsListingItems = newsListingBlock.locator('.news-listing__item');
    const newsListingCount = await newsListingItems.count();
    expect(newsListingCount).toBeGreaterThan(0);

    // Save all item titles from the listing block to an array.
    const newsListingTitles = [];

    // Loop through each of the news items and save their titles to the array.
    for (let i = 0; i < newsListingCount; i++) {
      const itemTitleElement = newsListingItems.nth(i).locator('.news-listing__link');
      await expect(itemTitleElement).toBeVisible();
      const titleText = (await itemTitleElement.textContent())?.trim();
      if (titleText) {
        newsListingTitles.push(titleText);
      }
    }

    // Click the link-button and verify that the user is taken to the front page news listing.
    await linkButton.click();
    const newsArchiveFilterResults = page.locator('.react-search__results');
    await expect(newsArchiveFilterResults).toBeVisible();

    // Get all news items from the archive listing.
    const archiveItems = newsArchiveFilterResults.locator('.card');

    // Compare the number of news items.
    const archiveItemCount = await archiveItems.count();
    expect(archiveItemCount).toBeGreaterThanOrEqual(newsListingCount);

    // Compare each item in the listing with the corresponding item in the archive.
    // To be on the safe side, check which number of items is smaller and use it for 
    // the comparison.
    const itemsToCompare = Math.min(newsListingCount, archiveItemCount);
    for (let i = 0; i < itemsToCompare; i++) {
      const archiveItemTitle = (await archiveItems.nth(i).locator('.card__link').textContent())?.trim();
      expect(archiveItemTitle).toBe(newsListingTitles[i]);
    }

    logger('Link-button on the block takes the user to front page news listing with correct filters.');
  });
});
