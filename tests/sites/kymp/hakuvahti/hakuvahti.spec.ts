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
 * Tests for subscribing to Vehicle Removal Alert.
 */
test.describe('Vehicle Removal Alert subscription', () => {
  test.skip(!isMailpitConfigured(), 'MAILPIT_URL is not set');

  const email = createTestEmail('siirtovahti-e2e');

  test.afterEach(async () => {
    const messages = await searchMessages(email);
    await deleteMessages(messages.map((message) => message.ID));
  });

  test('Subscribe and confirm via email', async ({ page }) => {
    await page.goto('/en/urban-environment-and-traffic/parking/vehicle-removal/vehicle-removal-requests');
    await cookieHandler(page);
    await dialogHandler(page);

    // Wait for the search results to load.
    const root = page.locator('#helfi-vehicle-removal-search');
    await expect(root.locator('.hdbt-search--react__results--title')).toBeVisible({ timeout: 15_000 });

    // Open the search monitor dialog and subscribe with email only.
    await root.locator('button.hdbt-search__search-monitor__button').click();
    const dialog = page.locator('#hdbt-search__search-monitor__content');
    // The radio input is covered by its label, so click the label instead.
    await dialog.locator('label[for="hdbt-search__search-monitor__method-email"]').click();
    await expect(dialog.locator('#hdbt-search__search-monitor__method-email')).toBeChecked();
    await expect(dialog.locator('#hdbt-search__search-monitor__phone')).toBeHidden();
    await dialog.locator('#hdbt-search__search-monitor__email').fill(email);
    await dialog.locator('#hdbt-search__search-monitor__terms').check();
    await dialog.locator('#hdbt-search__search-monitor__submit-button').click();

    await expect(dialog.locator('#hdbt-search__search-monitor__header')).toHaveText(
      'Your Vehicle Removal Alert Service subscription is almost ready',
      { timeout: 15_000 },
    );
    await expect(dialog.locator('.hdbt-search__search-monitor__error')).not.toBeAttached();

    const summary = await waitForMessage(email);
    const message = await getMessage(summary.ID);
    expect(message.Subject).toBe('Confirm your Vehicle Removal Alert Service subscription');

    // Open the email and click the confirm button.
    await page.setContent(message.HTML);
    const confirmLink = page.getByRole('link', { name: 'Confirm your Vehicle Removal Alert' });
    await expect(confirmLink).toHaveAttribute('href', /\/hakuvahti\/confirm\?/);
    const confirmUrl = new URL((await confirmLink.getAttribute('href')) as string);
    await confirmLink.click();

    // The confirm page submits the confirmation automatically.
    await expect(
      page.getByRole('heading', { name: 'Subscription to the Vehicle Removal Alert Service successful' }),
    ).toBeVisible({ timeout: 15_000 });

    // The unsubscribe link uses the same query parameters as the confirm link.
    const unsubscribeUrl = new URL(confirmUrl);
    unsubscribeUrl.pathname = unsubscribeUrl.pathname.replace(/\/confirm$/, '/unsubscribe');
    await page.goto(unsubscribeUrl.toString());

    await expect(page.getByRole('heading', { name: 'The Vehicle Removal Alert has been removed' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
