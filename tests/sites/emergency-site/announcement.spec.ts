import { type APIRequestContext, expect, test } from '@playwright/test';
import { login, logout } from '../../../utils/authentication';
import { logger } from '../../../utils/logger';

/**
 * Checks whether the announcement JSON contains any non-empty announcement.
 *
 * @param data - The parsed announcement JSON
 */
const hasActiveAnnouncement = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return Object.values(data).some((entry) => {
    if (typeof entry === 'string') {
      return entry.trim() !== '';
    }
    if (!entry || typeof entry !== 'object') {
      return false;
    }
    const { title, body } = entry as { title?: unknown; body?: unknown };
    return [title, body].some((value) => typeof value === 'string' && value.trim() !== '');
  });
};

/**
 * Fetches the announcement JSON.
 *
 * Note: the CDN ignores query parameters, so the cache cannot be bypassed.
 * The JSON is cached for up to 2 minutes (max-age=120, must-revalidate).
 *
 * @param request - Playwright API request context
 * @param url - The announcement JSON URL
 */
const fetchAnnouncements = async (request: APIRequestContext, url: string) => {
  const response = await request.get(url);
  expect(response.ok()).toBeTruthy();

  return {
    etag: response.headers().etag,
    data: (await response.json()) as unknown,
  };
};

test('Announcement form updates the kopio.hel.fi announcement JSON', async ({ page }) => {
  // The CDN caches the JSON for up to 2 minutes.
  const timeout = 6 * 60 * 1000;
  test.setTimeout(timeout);

  const jsonUrl = 'https://kopio.hel.fi/emergency_announcement.json';

  const before = await fetchAnnouncements(page.request, jsonUrl);
  logger(`Announcement JSON ETag before: ${before.etag}`);

  // Never touch the announcement if there is a real emergency going on.
  test.skip(hasActiveAnnouncement(before.data), 'An announcement is active, not touching it.');

  await login(page);
  await page.goto('/en/admin/content/announcement-message');

  const title = page.locator('#edit-title');
  const announcement = page.locator('#edit-announcement');
  await expect(title).toBeVisible();
  await expect(announcement).toBeVisible();

  // The form reads the blob directly, so double-check in case the CDN
  // served a stale JSON.
  const formHasContent = (await title.inputValue()).trim() !== '' || (await announcement.inputValue()).trim() !== '';
  if (formHasContent) {
    await logout(page);
  }
  test.skip(formHasContent, 'An announcement is active, not touching it.');

  // Save the empty announcement.
  await page.locator('#edit-submit').click();
  await expect(page.getByText('Announcement saved')).toBeVisible();
  await expect(page.locator('.messages--error')).toHaveCount(0);

  // Verify that the public JSON eventually gets updated once the CDN cache
  // expires. Every write gets a new ETag, even if the content stays the same.
  await expect
    .poll(async () => (await fetchAnnouncements(page.request, jsonUrl)).etag, {
      message: 'Make sure the announcement JSON is eventually updated.',
      intervals: [10 * 1000],
      timeout: 5 * 60 * 1000,
    })
    .not.toBe(before.etag);

  // Verify that the announcement is still empty.
  const after = await fetchAnnouncements(page.request, jsonUrl);
  logger(`Announcement JSON ETag after: ${after.etag}`);
  expect(hasActiveAnnouncement(after.data)).toBe(false);

  await logout(page);
});
