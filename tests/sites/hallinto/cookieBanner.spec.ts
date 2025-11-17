import { logger } from '../../../utils/logger';
import { expect, test, Page } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  logger('Cleared all cookies before test');
});

// Helper functions
async function navigateToTestPage(page: Page) {
  await page.goto('/fi/paatoksenteko-ja-hallinto/helfin-sisallontuottajan-opas/sivujen-rakentaminen-drupalissa/komponentit/videoupotus', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hds-cc__container');
  await expect(page.locator('.hds-cc__container')).toBeVisible();
}

async function allVideosOnPage(page: Page) {
  await navigateToTestPage(page);
  await page.waitForSelector('.components--upper');
  const videosOnPage = await page.locator('.component--remote-video').all();

  return videosOnPage;
}

async function askemBannerOnPage(page: Page) {
  await navigateToTestPage(page);
  const askemBanner = page.locator('[data-hdbt-selector="askem"]');
  await expect(askemBanner).toHaveCount(1);

  return askemBanner;
}

type cookieTypes = 'preferences' | 'statistics' | 'chat';

async function acceptCookieType(page: Page, cookieTypes: cookieTypes[]) {
  // Set up a promise that resolves when the page reloads
  const reloadPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded' });

  // Open the cookie settings.
  const toggleCookiePreferencesButton = page.locator('.hds-cc__accordion-button--details');
  await toggleCookiePreferencesButton.click();
  
  // Select the cookie types.
  for (const cookieType of cookieTypes) {
    const acceptCookieTypeButton = page.locator(`input#${cookieType}-cookies`);
    await acceptCookieTypeButton.click();
  }

  // Accept the selected cookie types.
  const acceptSelectedCookiesButton = page.locator('.hds-cc__selected-cookies-button');
  await acceptSelectedCookiesButton.click();

  // Wait for the navigation to complete
  await reloadPromise;

  // Add assertions to verify the page state after reload
  await expect(page).toHaveURL('/fi/paatoksenteko-ja-hallinto/helfin-sisallontuottajan-opas/sivujen-rakentaminen-drupalissa/komponentit/videoupotus');
}

async function acceptAllCookies(page: Page) {
  const acceptAllCookiesButton = page.locator('.hds-cc__all-cookies-button');
  await acceptAllCookiesButton.click();
}

test.describe('Cookie Banner', () => {
  test('should hide the remote video paragraphs content from user before accepting cookies', async ({ page, context }) => {
    const videosOnPage = await allVideosOnPage(page);

    // The videos should not be visible before accepting cookies.
    // There should be a button to edit cookie settings however.
    for (const video of videosOnPage) {
      await expect(video.locator('iframe')).toHaveCount(0);

      // Check for the edit cookie preferences button with specific onclick attribute.
      const editCookiePreferencesButton = video.locator('a[onclick*="window.hdsCookieConsentClickEvent(event, this)"]');
      await expect(editCookiePreferencesButton).toBeVisible();
    }
  });

  test('should show the remote video paragraphs content after accepting all cookies', async ({ page }) => {
    const videosOnPage = await allVideosOnPage(page);

    await acceptAllCookies(page);

    // Make sure the videos are now visible.
    for (const video of videosOnPage) {
      await expect(video.locator('iframe')).toHaveCount(1);
    }
  });

  test('should show the remote video paragraphs content after accepting statistics and preferences cookies', async ({ page }) => {
    const videosOnPage = await allVideosOnPage(page);

    await acceptCookieType(page, ['statistics', 'preferences']);
    // Make sure the videos are now visible.
    for (const video of videosOnPage) {
      await expect(video.locator('iframe')).toHaveCount(1);
    }
  });

  test('should hide the Askem banner before accepting cookies', async ({ page }) => {
    const askemBanner = await askemBannerOnPage(page);

    // The Askem banner should not be visible before accepting cookies.
    // There should be a button to edit cookie settings however.
    await expect(askemBanner.locator('.askem')).toHaveCount(1);
    await expect(askemBanner.locator('.askem')).toBeEmpty();    
  });

  test('should show the Askem banner after accepting all cookies', async ({ page }) => {
    const askemBanner = await askemBannerOnPage(page);

    await acceptAllCookies(page);

    // Make sure the Askem banner is now visible.
    await expect(askemBanner.locator('.askem')).toHaveCount(1);
    await expect(askemBanner.locator('.askem')).not.toBeEmpty();
  });

  test('should show the Askem banner after accepting statistics cookies', async ({ page }) => {
    const askemBanner = await askemBannerOnPage(page);

    await acceptCookieType(page, ['statistics']);

    // Make sure the Askem banner is now visible.
    await expect(askemBanner.locator('.askem')).toHaveCount(1);
    await expect(askemBanner.locator('.askem')).not.toBeEmpty();
  });

  test('should not allow any cookies before accepting cookies', async ({ page, context }) => {
    await navigateToTestPage(page);
 
    const cookies = await context.cookies();
 
    expect(cookies).toHaveLength(0);
  });
  
  test('should allow cookie consent cookie after accepting all cookies', async ({ page, context }) => {
    await navigateToTestPage(page);

    let cookies = await context.cookies();
    let hasConsentsCookie = cookies.some(cookie => cookie.name.match('helfi-cookie-consents'));
    
    expect(hasConsentsCookie, 'Expected that no cookie called "helfi-cookie-consents" is be set before accepting statistics cookies').toBeFalsy();

    await acceptAllCookies(page);
    await page.waitForLoadState('domcontentloaded');
    
    cookies = await context.cookies();
    hasConsentsCookie = cookies.some(cookie => cookie.name.match('helfi-cookie-consents'));

    expect(hasConsentsCookie, 'Expected a cookie called "helfi-cookie-consents" to be set after accepting statistics cookies').toBeTruthy();
  });
});
