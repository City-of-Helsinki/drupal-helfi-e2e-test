import { expect, test } from '@playwright/test';
import {
  createTestEmail,
  deleteMessages,
  getMessage,
  isMailpitConfigured,
  searchMessages,
  waitForMessage,
} from '../../../../utils/mailpit';
import {cookieHandler, dialogHandler} from "../../../../utils/handlers";

/**
 * Tests for subscribing to Hakuvahti.
 */
test.describe('Hakuvahti subscription', () => {
  test.skip(!isMailpitConfigured(), 'MAILPIT_URL is not set');

  const email = createTestEmail('hakuvahti-e2e');

  test.afterEach(async () => {
    const messages = await searchMessages(email);
    await deleteMessages(messages.map((message) => message.ID));
  });

  test('Subscribe and confirm via email', async ({ page }) => {
    await page.goto('/en/open-jobs/find-open-jobs');
    await cookieHandler(page);
    await dialogHandler(page);

    // Wait for the loading skeleton to be replaced with the results.
    const root = page.locator('#helfi-rekry-job-search');
    await expect(root.locator('.job-search__results')).toBeVisible({ timeout: 15_000 });
    await expect(root.locator('.card--ghost')).toHaveCount(0);

    // Open the search monitor dialog and subscribe.
    await root.locator('button.hdbt-search__search-monitor__button').click();
    const dialog = page.locator('#hdbt-search__search-monitor__content');
    await dialog.locator('#hdbt-search__search-monitor__email').fill(email);
    await dialog.locator('#hdbt-search__search-monitor__terms').check();
    await dialog.locator('#hdbt-search__search-monitor__submit-button').click();

    await expect(dialog.locator('#hdbt-search__search-monitor__header')).toHaveText(
      'You are almost done subscribing to search alert',
      { timeout: 15_000 },
    );
    await expect(dialog.locator('.hdbt-search__search-monitor__error')).not.toBeAttached();

    const summary = await waitForMessage(email);
    const message = await getMessage(summary.ID);
    expect(message.Subject).toBe('Confirm job search alert subscription');

    // Open the email and click the confirm button.
    await page.setContent(message.HTML);
    const confirmLink = page.getByRole('link', { name: 'Confirm search alert subscription ' });
    await expect(confirmLink).toHaveAttribute('href', /\/hakuvahti\/confirm\?/);
    const confirmUrl = new URL((await confirmLink.getAttribute('href')) as string);
    await confirmLink.click();

    // The confirm page submits the confirmation automatically.
    await expect(page.getByRole('heading', { name: 'Search alert subscription successful' })).toBeVisible({
      timeout: 15_000,
    });

    // The unsubscribe link uses the same query parameters as the confirm link.
    const unsubscribeUrl = new URL(confirmUrl);
    unsubscribeUrl.pathname = unsubscribeUrl.pathname.replace(/\/confirm$/, '/unsubscribe');
    await page.goto(unsubscribeUrl.toString());

    await expect(page.getByRole('heading', { name: 'The search alert has been removed' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
