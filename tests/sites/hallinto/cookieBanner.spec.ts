import { logger } from '../../../utils/logger';
import { expect, test, Page } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  logger('Cleared all cookies before test');
});

test.describe('Cookie Banner', () => {
  test('should be visible on initial page load', async ({ page }) => {
    await page.goto('/fi/paatoksenteko-ja-hallinto/helfin-sisallontuottajan-opas/sivujen-rakentaminen-drupalissa/koulutusvideot', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.hds-cc__container')).toBeVisible();
  });
});
