import { test } from '@playwright/test';

/**
 * Test to verify that announcements marked for external publishing are visible
 * on their respective language home pages
 */
test.describe('Hakuvahti forms', () => {
  test('Activate form', async ({ page }) => {
    await page.goto(
      '/fi/avoimet-tyopaikat/hakuvahti/confirm?hash=e2e&subscription=test',
    );

    // Form should be submitted automatically, but the submitting
    // will fail since the test subscription does not exist.
    // @todo create a way to test hakuvahti with e2e tests
    await page
      .getByText('Hakuvahdin vahvistus epäonnistui')
      .waitFor({ timeout: 5000 });
  });

  test('Delete form', async ({ page }) => {
    await page.goto(
      '/fi/avoimet-tyopaikat/hakuvahti/unsubscribe?hash=e2e&subscription=test',
    );

    // Form should be submitted automatically, but the submitting
    // will fail since the test subscription does not exist.
    // @todo create a way to test hakuvahti with e2e tests
    await page
      .getByText('Hakuvahdin poisto epäonnistui')
      .waitFor({ timeout: 5000 });
  });
});
