import { test } from '@playwright/test';

/**
 * Tests for Hakuvahti form submission (activate and delete).
 */
test.describe('Hakuvahti forms', () => {
  test('Activate form', async ({ page }) => {
    await page.goto('/fi/avoimet-tyopaikat/hakuvahti/confirm?hash=e2e&subscription=test');

    // Form should be submitted automatically, but the submitting
    // will fail since the test subscription does not exist.
    // @todo UHF-12540: Create a way to test hakuvahti with e2e tests
    await page.getByRole('heading', { name: 'Hakuvahdin vahvistus epäonnistui' }).waitFor({ timeout: 5000 });
  });

  test('Delete form', async ({ page }) => {
    await page.goto('/fi/avoimet-tyopaikat/hakuvahti/unsubscribe?hash=e2e&subscription=test');

    // Form should be submitted automatically, but the submitting
    // will fail since the test subscription does not exist.
    // @todo UHF-12540: Create a way to test hakuvahti with e2e tests
    await page.getByRole('heading', { name: 'Hakuvahtia ei löytynyt' }).waitFor({ timeout: 5000 });
  });
});
