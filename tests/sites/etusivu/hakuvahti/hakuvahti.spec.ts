import { expect, test } from '@playwright/test';
import { cookieHandler, dialogHandler } from '../../../../utils/handlers';
import {
  createTestEmail,
  deleteMessages,
  getMessage,
  isMailpitConfigured,
  searchMessages,
  waitForMessage,
} from '../../../../utils/mailpit';
import { clickSubmitButton, fillTextFilter, resultSelector } from '../utils/newsArchiveInput';

/**
 * Tests for subscribing to news Hakuvahti.
 */
test.describe('News hakuvahti subscription', () => {
  test.skip(!isMailpitConfigured(), 'MAILPIT_URL is not set');

  const email = createTestEmail('uutiset-hakuvahti-e2e');
  const keyword = 'kirjasto';

  test.afterEach(async () => {
    const messages = await searchMessages(email);
    await deleteMessages(messages.map((message) => message.ID));
  });

  test('Subscribe and confirm via email', async ({ page }) => {
    await page.goto('/fi/uutiset');
    await cookieHandler(page);
    await dialogHandler(page);

    // Wait for the search results to load.
    const root = page.locator('#helfi-etusivu-news-search');
    const results = root.locator(resultSelector);
    await expect(results).toBeVisible({ timeout: 15_000 });
    const initialText = (await results.textContent()) ?? '';

    // Filter the news so that the subscription has search criteria.
    await fillTextFilter(page, keyword);
    await clickSubmitButton(page);
    await expect(results).not.toHaveText(initialText);

    // Open the search monitor dialog and subscribe.
    await root.locator('button.hdbt-search__search-monitor__button').click();
    const dialog = page.locator('#hdbt-search__search-monitor__content');
    await expect(dialog.locator('.hdbt-search__search-monitor__selections')).toContainText(keyword);
    await expect(dialog.locator('.hdbt-search__search-monitor__no-selections')).not.toBeAttached();
    await dialog.locator('#hdbt-search__search-monitor__email').fill(email);
    await dialog.locator('#hdbt-search__search-monitor__terms').check();
    await dialog.locator('#hdbt-search__search-monitor__submit-button').click();

    await expect(dialog.locator('#hdbt-search__search-monitor__header')).toHaveText(
      'Hakuvahdin tilaus melkein valmis',
      { timeout: 15_000 },
    );
    await expect(dialog.locator('.hdbt-search__search-monitor__error')).not.toBeAttached();

    const summary = await waitForMessage(email);
    const message = await getMessage(summary.ID);
    expect(message.Subject).toBe('Vahvista uutisten hakuvahdin tilaus');
    expect(message.Text).toContain(`"${keyword}"`);

    // Open the email and click the confirm button.
    await page.setContent(message.HTML);
    const confirmLink = page.getByRole('link', { name: 'Vahvista hakuvahti' });
    await expect(confirmLink).toHaveAttribute('href', /\/hakuvahti\/confirm\?/);
    const confirmUrl = new URL((await confirmLink.getAttribute('href')) as string);
    await confirmLink.click();

    // The confirm page submits the confirmation automatically.
    await expect(page.getByRole('heading', { name: 'Hakuvahdin tilaus onnistui' })).toBeVisible({
      timeout: 15_000,
    });

    // The unsubscribe link uses the same query parameters as the confirm link.
    const unsubscribeUrl = new URL(confirmUrl);
    unsubscribeUrl.pathname = unsubscribeUrl.pathname.replace(/\/confirm$/, '/unsubscribe');
    await page.goto(unsubscribeUrl.toString());

    await expect(page.getByRole('heading', { name: 'Hakuvahti on poistettu' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
