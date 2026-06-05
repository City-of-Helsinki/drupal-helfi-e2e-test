import { expect, test } from '@playwright/test';
import { fetchRssFeed } from '../../../utils/fetchRssFeed';

test.describe('List of plans paragraph', () => {
  test('should be visible on the page', async ({ page }) => {
    await page.goto(
      '/fi/kaupunkiymparisto-ja-liikenne/kaupunkisuunnittelu-ja-rakentaminen/osallistu-kaupungin-suunnitteluun',
      { waitUntil: 'domcontentloaded' },
    );

    // Get the results container from the list of plans.
    const listOfPlans = page.locator('.component--list-of-plans');
    await expect(listOfPlans).toBeVisible();

    // Store all plan items.
    const planItems = listOfPlans.locator('.card--list-of-plans');

    // Get the URL of the RSS feed from the list of plans feed link.
    const rssFeedUrl = listOfPlans.locator('.feed-link');

    await expect(rssFeedUrl).toBeVisible();
    const rssUrl = await rssFeedUrl.getAttribute('href');
    expect(rssUrl).toBeTruthy();

    if (rssUrl) {
      const rssItems = await fetchRssFeed(page, rssUrl);

      // Verify the displayed total count matches the RSS feed item count.
      // Skipped when there are 0 items as the count container doesn't have
      // the number of items written out.
      if (rssItems.length > 0) {
        const countContainer = listOfPlans.locator('.list-of-plans__count-container');
        const countText = await countContainer.textContent();
        const displayedCount = parseInt(countText?.match(/\d+/)?.[0] ?? '', 10);
        expect(displayedCount).toBe(rssItems.length);
      }

      // The page may show fewer items than the RSS feed due to paging.
      const planCount = await planItems.count();
      expect(rssItems.length).toBeGreaterThanOrEqual(planCount);

      // If there are more than 10 RSS items, the block should show a pager.
      if (rssItems.length > 10) {
        await expect(listOfPlans.locator('.pager')).toBeVisible();
      }

      // Compare the plan titles so that they match in the results and RSS feed.
      const itemsToCompare = Math.min(rssItems.length, planCount);
      for (let i = 0; i < itemsToCompare; i++) {
        const planTitle = (await planItems.nth(i).locator('.card__link').textContent())?.trim();
        const rssItemTitle = rssItems[i].getElementsByTagName('title')[0].textContent?.trim();
        expect(planTitle).toContain(rssItemTitle);
      }
    }
  });
});
