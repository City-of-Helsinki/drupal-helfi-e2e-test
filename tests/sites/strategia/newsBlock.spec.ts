import { fetchJsonApiRequest, type JsonApiResponse } from '../../../utils/fetchJsonApiRequest';
import { logger } from '../../../utils/logger';
import { expect, test } from '@playwright/test';

/**
 * Type definition for news item data structure from Drupal's JSON:API
 * Matches the structure of the news content type in Drupal
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

test.describe('News listing block', () => {
  test('Externally published news items are visible', async ({ page }) => {
    // Fetch news items from Drupal's JSON:API.
    const data = await fetchJsonApiRequest<JsonApiResponse<NewsItem>>(
      process.env.ETUSIVU_BASE_URL ?? 'https://www.test.hel.ninja',
      '/fi/jsonapi/node/news?filter[tags.meta][value]=336&filter[tags.meta][value]=384&sort=-published_at&page[limit]=8',
    );

    // Verify we received data from the API.
    expect(data).toHaveProperty('data');

    const items = data.data;

    // Skip test if no matching news items found.
    if (items.length === 0) {
      logger('No news items found in JSON:API; nothing to verify.');
      return;
    }

    // Verify we received data from the API.
    expect(items).toHaveProperty('length');

    logger(`Found ${items.length} news items in JSON:API; verifying visibility.`);

    await data.data.reduce(async (prev, item) => {
      await prev;

      const title = item.attributes.title;

      console.log(title);
      // Skip if no title to verify.
      if (!title) {
        logger('No title was found for news item');
        return;
      }

      await page.goto('/fi', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(title, { exact: true })).toBeVisible();
    }, Promise.resolve());

  });

  test('should be visible on the front page', async ({ page }) => {
    await page.goto('/fi', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.component--news-list');
 
    // Find the news listing element from the page.
    await expect(page.locator('.component--news-list .news-listing')).toBeVisible();
    const newsListing = page.locator('.component--news-list .news-listing');

    // Find the news tags element from the page.
    await expect(page.locator('.component--news-list .content-tags')).toBeVisible();
    const newsTags = page.locator('.component--news-list .content-tags');

    // Make sure there is no empty-results message.
    expect(
      await newsListing.locator('.no-results').isVisible(),
    ).toBeFalsy();

    // Check that there is at least one news item.
    const newsListingItems = newsListing.locator('.news-listing__item');
    const itemCount = await newsListingItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Check that there is at least one news tag.
    const newsTagsItems = newsTags.locator('.content-tags__tags__tag');
    const tagsCount = await newsTagsItems.count();
    expect(tagsCount).toBeGreaterThan(0);
    
    logger('News listing block is visible on the front page and it has results.');
  });
});


// https://www.hel.fi/fi/jsonapi/node/news?filter[tags.meta][value]=336&filter[tags.meta][value]=384&page[limit]=8