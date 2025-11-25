import { logger } from '../../../utils/logger';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  logger('Cleared all cookies before test');
});

/**
 * Navigates to the front page and waits for the cookie banner to be visible.
 */
async function navigateToFrontPage(page: Page) {
  await page.goto('/fi', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hds-cc__container');
  return page.locator('.hds-cc__container');
}

/**
 * Verifies the cookie settings on the cookie settings page.
 */
async function verifyCookieSettings(
  page: Page,
  expectedStates: Record<string, boolean>,
) {
  await page.goto('/fi/evasteasetukset', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hds-cc__groups');

  const cookieSettingsGroups = await page.locator('.hds-cc__group').all();

  for (const group of cookieSettingsGroups) {
    const groupId = await group.getAttribute('data-group-id');
    if (!groupId) {
      throw new Error(
        'Found a cookie group without required data-group-id attribute.',
      );
    }

    const groupAcceptanceState = group.locator('input[type="checkbox"]');
    const expectedState =
      expectedStates[groupId as keyof typeof expectedStates];

    expectedState
      ? await expect(groupAcceptanceState).toBeChecked()
      : await expect(groupAcceptanceState).not.toBeChecked();

    logger(`Cookie group ${groupId} has been verified.`);
  }
}

test.describe('Cookie Banner', () => {
  test('should be visible on initial page load', async ({ page }) => {
    const cookieBanner = await navigateToFrontPage(page);
    await expect(cookieBanner).toBeVisible();
  });

  test('should hide when accepting required cookies', async ({
    page,
    context,
  }) => {
    const cookieBanner = await navigateToFrontPage(page);
    await page.locator('.hds-cc__required-cookies-button').click();

    // Wait for the page to fully load.
    await page.waitForLoadState('domcontentloaded');

    // Verify that a cookie containing the cookie consent settings is set.
    const cookies = await context.cookies();
    const consentCookie = cookies.find(
      (cookie) => cookie.name === 'helfi-cookie-consents',
    );
    expect(consentCookie).toBeDefined();
    expect(consentCookie?.value).toBeDefined();

    await expect(cookieBanner).not.toBeVisible();
  });

  test('should set correct cookie settings when accepting required cookies', async ({
    page,
  }) => {
    await navigateToFrontPage(page);
    await page.locator('.hds-cc__required-cookies-button').click();

    await verifyCookieSettings(page, {
      essential: true,
      admin: true,
      preferences: false,
      statistics: false,
      chat: false,
    });
  });

  test('should set all cookie groups when accepting all cookies', async ({
    page,
  }) => {
    await navigateToFrontPage(page);
    await page.locator('.hds-cc__all-cookies-button').click();

    await verifyCookieSettings(page, {
      essential: true,
      admin: true,
      preferences: true,
      statistics: true,
      chat: true,
    });
  });
});
