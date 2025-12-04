import { logger } from '../../../utils/logger';
import { expect, test, type Page } from '@playwright/test';

test.describe('News listing block', () => {
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
