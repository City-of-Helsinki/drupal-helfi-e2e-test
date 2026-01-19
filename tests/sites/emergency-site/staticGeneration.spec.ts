import { expect, test } from '@playwright/test';
import { login, logout } from '../../../utils/authentication';
import { logger } from '../../../utils/logger';

test('Static generation test', async ({ page }) => {
  // Timeout for the test. Azure purge process might take up to 45 minutes to
  // finish, but content should be visible much sooner. So let's start with 15
  // minutes.
  const timeout = 15 * 60 * 1000;
  test.setTimeout(timeout);

  // Log in.
  await login(page);

  // Random string with a timestamp suffix.
  const randomString = Math.random().toString(36).substring(2, 15) + Date.now().toString();

  // Add new news item.
  await page.goto('/en/node/add/news_item');
  await page.locator('#edit-langcode-0-value').selectOption('en');
  await page.locator('#edit-title-0-value').fill(`Test news ${randomString}`);
  await page.locator('#edit-status-value').check();
  await page.locator('#gin-sticky-edit-submit').click();

  // Verify that the news item is created.
  await expect(page.locator(`h1:has-text("Test news ${randomString}")`)).toBeVisible();

  // Save announcement url for cleanup.
  const announcementUrl = page.url();
  logger(`Drupal news item URL: ${announcementUrl}`);

  // Generate static news item URL.
  const drupalUrlObject = new URL(announcementUrl);
  const staticSiteUrl = process.env.EMERGENCY_SITE_STATIC_URL ?? 'https://poikkeustilanne.stage.hel.ninja';
  const staticUrlObject = new URL(staticSiteUrl);
  staticUrlObject.pathname = drupalUrlObject.pathname;
  const staticNewsItemUrl = `${staticUrlObject.toString()}.html`;
  logger(`Static news item URL: ${staticNewsItemUrl}`);

  // Verify that news item is visible in static version. It might take
  // up to 45 mins for the azure purge process to finish, but content should
  // be visible much sooner.
  const staticPage = await page.context().newPage();
  await expect.poll(async () => {
    const response = await staticPage.request.get(staticNewsItemUrl);
    return response.status();
  }, {
    message: 'Make sure news item is eventually visible in static version.',
    // Poll every 10 seconds.
    intervals: [10 * 1000],
    // Use the same timeout as the test.
    timeout: timeout,
  }).toBe(200);

  // Remove test content.
  await page.goto(announcementUrl);
  await page.getByRole('link', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();

  // Verify test content no longer exists.
  const response = await page.goto(announcementUrl);
  expect(response?.status()).toBe(404);

  // Log out.
  await logout(page);
});
