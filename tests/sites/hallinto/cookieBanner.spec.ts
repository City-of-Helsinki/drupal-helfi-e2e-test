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

    // Open the cookie settings and select statistics cookies and accept them.
    const toggleCookiePreferencesButton = page.locator('.hds-cc__accordion-button--details');
    const acceptStatisticsCookiesCheckbox = page.locator('input#statistics-cookies');
    const acceptPreferencesCookiesCheckbox = page.locator('input#preferences-cookies');
    const acceptSelectedCookiesButton = page.locator('.hds-cc__selected-cookies-button');
    await toggleCookiePreferencesButton.click();
    await acceptStatisticsCookiesCheckbox.click();
    await acceptPreferencesCookiesCheckbox.click();
    await acceptSelectedCookiesButton.click();

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

    // Open the cookie settings and select statistics cookies and accept them.
    const toggleCookiePreferencesButton = page.locator('.hds-cc__accordion-button--details');
    const acceptStatisticsCookiesCheckbox = page.locator('input#statistics-cookies');
    const acceptSelectedCookiesButton = page.locator('.hds-cc__selected-cookies-button');
    await toggleCookiePreferencesButton.click();
    await acceptStatisticsCookiesCheckbox.click();
    await acceptSelectedCookiesButton.click();

    // Make sure the Askem banner is now visible.
    await expect(askemBanner.locator('.askem')).toHaveCount(1);
    await expect(askemBanner.locator('.askem')).not.toBeEmpty();
  });
});
