import { logger } from '../../../utils/logger';
import { expect, type Locator, test, type Page } from '@playwright/test';

/**
 * Cookie types that can be accepted.
 */
type cookieTypes = 'preferences' | 'statistics' | 'chat';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  logger('Cleared all cookies before test');
});

// Helper functions

/**
 * Navigates to the test page and waits for the cookie banner to be visible.
 */
async function navigateToTestPage(page: Page) {
  await page.goto(
    '/fi/paatoksenteko-ja-hallinto/helfin-sisallontuottajan-opas/sivujen-rakentaminen-drupalissa/komponentit/videoupotus',
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForSelector('.hds-cc__container');
  await expect(page.locator('.hds-cc__container')).toBeVisible();
}

/**
 * Returns all videos on the page.
 */
async function allVideosOnPage(page: Page) {
  await navigateToTestPage(page);
  await page.waitForSelector('.components--upper');

  return await page.locator('.component--remote-video').all();
}

/**
 * Returns the askem banner on the page.
 */
async function askemBannerOnPage(page: Page) {
  await navigateToTestPage(page);
  const askemBanner = page.locator('[data-hdbt-selector="askem"]');
  await expect(askemBanner).toHaveCount(1);

  return askemBanner;
}

/**
 * Checks that the askem banner is visible.
 */
async function askemBannerIsVisible(askemBanner: Locator) {
  await expect(askemBanner.locator('.askem')).toHaveCount(1);
  await expect(askemBanner.locator('.askem')).not.toBeEmpty();
  await expect(askemBanner.locator('.askem-header-text')).toHaveText(
    'Löysitkö etsimäsi tiedon tältä sivulta?',
  );
}

/**
 * Checks that the askem banner is empty.
 */
async function askemBannerIsEmpty(askemBanner: Locator, page: Page) {
  await expect(askemBanner.locator('.askem')).toHaveCount(1);
  await expect(askemBanner.locator('.askem')).toBeEmpty();
  await expect(page.locator('.askem-cookie-compliance .message h2')).toHaveText(
    'Haluatko antaa meille palautetta tästä sivusta?',
  );
}

/**
 * Accepts the given cookie types.
 */
async function acceptCookieType(page: Page, cookieTypes: cookieTypes[]) {
  // Set up a promise that resolves when the page reloads
  const reloadPromise = page.waitForLoadState('domcontentloaded');

  // Open the cookie settings.
  const toggleCookiePreferencesButton = page.locator(
    '.hds-cc__accordion-button--details',
  );
  await toggleCookiePreferencesButton.click();

  // Select the cookie types.
  for (const cookieType of cookieTypes) {
    const acceptCookieTypeButton = page.locator(`input#${cookieType}-cookies`);
    await acceptCookieTypeButton.click();
  }

  // Accept the selected cookie types.
  const acceptSelectedCookiesButton = page.locator(
    '.hds-cc__selected-cookies-button',
  );
  await acceptSelectedCookiesButton.click();

  // Wait for the navigation to complete
  await reloadPromise;

  // Add assertions to verify the page state after reload
  await expect(page).toHaveURL(
    '/fi/paatoksenteko-ja-hallinto/helfin-sisallontuottajan-opas/sivujen-rakentaminen-drupalissa/komponentit/videoupotus',
  );
}

/**
 * Accepts all cookies.
 */
async function acceptAllCookies(page: Page) {
  const acceptAllCookiesButton = page.locator('.hds-cc__all-cookies-button');
  await acceptAllCookiesButton.click();
}

test.describe('Cookie Wall', () => {
  test('should hide the remote video paragraphs content from user before accepting cookies', async ({
    page,
  }) => {
    const videosOnPage = await allVideosOnPage(page);

    // The videos should not be visible before accepting cookies.
    // There should be a button to edit cookie settings however.
    for (const video of videosOnPage) {
      await expect(video.locator('iframe')).toHaveCount(0);

      // Check for the edit cookie preferences button with specific onclick attribute.
      const editCookiePreferencesButton = video.locator(
        'a[onclick*="window.hdsCookieConsentClickEvent(event, this)"]',
      );
      await expect(editCookiePreferencesButton).toBeVisible();
    }
  });

  test('should show the remote video paragraphs content after accepting all cookies', async ({
    page,
  }) => {
    const videosOnPage = await allVideosOnPage(page);

    await acceptAllCookies(page);

    // Make sure the videos are now visible.
    for (const video of videosOnPage) {
      await expect(video.locator('iframe')).toHaveCount(1);
    }
  });

  test('should show the remote video paragraphs content after accepting statistics and preferences cookies', async ({
    page,
  }) => {
    const videosOnPage = await allVideosOnPage(page);

    await acceptCookieType(page, ['statistics', 'preferences']);
    // Make sure the videos are now visible.
    for (const video of videosOnPage) {
      await expect(video.locator('iframe')).toHaveCount(1);
    }
  });

  test('should hide the Askem banner before accepting cookies', async ({
    page,
  }) => {
    const askemBanner = await askemBannerOnPage(page);

    // The Askem banner should not be visible before accepting cookies.
    // There should be a button to edit cookie settings however.
    await askemBannerIsEmpty(askemBanner, page);
  });

  test('should show the Askem banner after accepting all cookies', async ({
    page,
  }) => {
    const askemBanner = await askemBannerOnPage(page);

    await acceptAllCookies(page);

    await askemBannerIsVisible(askemBanner);
  });

  test('should show the Askem banner after accepting statistics cookies', async ({
    page,
  }) => {
    const askemBanner = await askemBannerOnPage(page);

    await acceptCookieType(page, ['statistics']);

    await askemBannerIsVisible(askemBanner);
  });
});
