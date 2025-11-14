import { logger } from '../../../utils/logger';
import { expect, test, Page } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  logger('Cleared all cookies before test');
});

// Helper functions
async function navigateToPageWithVideos(page: Page) {
  await page.goto('/fi/paatoksenteko-ja-hallinto/helfin-sisallontuottajan-opas/sivujen-rakentaminen-drupalissa/komponentit/videoupotus', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hds-cc__container');
  await expect(page.locator('.hds-cc__container')).toBeVisible();
}

test.describe('Cookie Banner', () => {
  test('should hide the remote video paragraphs content from user before accepting cookies', async ({ page, context }) => {
    await navigateToPageWithVideos(page);

    await page.waitForSelector('.components--upper');

    const videosOnPage = await page.locator('.component--remote-video').all();

    for (const video of videosOnPage) {
      await expect(video.locator('iframe')).toHaveCount(0);
    }
  });

  test('should show the remote video paragraphs content after accepting all cookies', async ({ page, context }) => {
    await navigateToPageWithVideos(page);
    const acceptAllCookiesButton = page.locator('.hds-cc__all-cookies-button');
    await acceptAllCookiesButton.click();

    await page.waitForSelector('.components--upper');

    const videosOnPage = await page.locator('.component--remote-video').all();

    for (const video of videosOnPage) {
      await expect(video.locator('iframe')).toHaveCount(1);
    }
  });
});
