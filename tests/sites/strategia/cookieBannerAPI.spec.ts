import { expect, type Page, test } from '@playwright/test';
import { sites } from '../../../sites.config';
import { fetchJsonApiRequest } from '../../../utils/fetchJsonApiRequest';
import { logger } from '../../../utils/logger';

// Type definitions based on the example response
type Language = { code: string; name: string; direction: 'ltr' | 'rtl' };

type Cookie = {
  name: string;
  host: string;
  storageType: number;
  description: Record<string, string>;
  expiration: Record<string, string>;
};

type CookieGroup = {
  groupId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  cookies: Cookie[];
};

type CookieBannerResponse = {
  languages: Language[];
  siteName: string;
  cookieName: string;
  monitorInterval: number;
  remove: boolean;
  fallbackLanguage: string;
  requiredGroups: CookieGroup[];
  robotCookies: Array<{ name: string; storageType: number }>;
  groupsWhitelistedForApi: string[];
  translations: Record<string, Record<string, string>>;
};

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  logger('Cleared all cookies before test');
});

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
 * Returns cookie banner API response.
 */
async function apiResponse() {
  // Get the Etusivu site configuration
  const etusivuConfig = sites.find((site) => site.name === 'etusivu');
  if (!etusivuConfig) {
    throw new Error('Etusivu site configuration not found');
  }

  // Get the base URL from environment variable or use default
  const baseURL = process.env[`${etusivuConfig.envPrefix}_BASE_URL`] || etusivuConfig.defaultBaseURL;

  if (!baseURL) {
    throw new Error('Base URL for Etusivu is not defined');
  }

  // Make the API request to the cookie banner endpoint
  let response: CookieBannerResponse;
  try {
    response = await fetchJsonApiRequest<CookieBannerResponse>(baseURL, '/fi/api/cookie-banner');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch cookie banner data from ${baseURL}/fi/api/cookie-banner. The API might be down or the endpoint is not accessible. Error: ${error.message}`,
      );
    }
    throw new Error(`Unknown error occurred while fetching cookie banner data from ${baseURL}/fi/api/cookie-banner`);
  }

  return response;
}

test.describe('Cookie Banner', () => {
  test('should receive valid cookie banner API response', async () => {
    const response = await apiResponse();

    // Verify the response structure.
    expect(response).toBeDefined();

    // Check required top-level properties.
    expect(response).toHaveProperty('languages');
    expect(Array.isArray(response.languages)).toBe(true);
    expect(response).toHaveProperty('siteName');
    expect(response).toHaveProperty('cookieName');
    expect(response).toHaveProperty('monitorInterval');
    expect(response).toHaveProperty('remove');
    expect(response).toHaveProperty('fallbackLanguage');
    expect(response).toHaveProperty('requiredGroups');
    expect(Array.isArray(response.requiredGroups)).toBe(true);
    expect(Array.isArray(response.robotCookies)).toBe(true);
    expect(Array.isArray(response.groupsWhitelistedForApi)).toBe(true);
    expect(response).toHaveProperty('translations');

    // Check at least one language is defined.
    expect(response.languages.length).toBeGreaterThan(0);

    response.languages.forEach((language) => {
      expect(language).toHaveProperty('code');
      expect(language).toHaveProperty('name');
      expect(language).toHaveProperty('direction');
      expect(['ltr', 'rtl']).toContain(language.direction);
    });

    // Check required groups.
    expect(response.requiredGroups.length).toBeGreaterThan(0);
    response.requiredGroups.forEach((group) => {
      expect(group).toHaveProperty('groupId');
      expect(group).toHaveProperty('title');
      expect(group).toHaveProperty('description');
      expect(Array.isArray(group.cookies)).toBe(true);

      // Check translations for required languages.
      ['fi', 'sv', 'en'].forEach((lang) => {
        expect(group.title).toHaveProperty(lang);
        expect(group.description).toHaveProperty(lang);
      });
    });

    // Check robot cookies.
    response.robotCookies.forEach((cookie) => {
      expect(cookie).toHaveProperty('name');
      expect(cookie).toHaveProperty('storageType');
    });

    // Log API information for debugging.
    logger(`Found ${response.requiredGroups.length} cookie groups`);
    logger(`Site name: ${response.siteName}`);
    logger(`Cookie name: ${response.cookieName}`);
    logger(`Fallback language: ${response.fallbackLanguage}`);
  });

  test('should not allow any cookies before accepting cookies', async ({ page, context }) => {
    await navigateToTestPage(page);

    // Make sure all cookies have time to load.
    await page.waitForTimeout(1000);
    const cookies = await context.cookies();

    const response = await apiResponse();

    // Get all essential cookie names from the requiredGroups
    const essentialCookies = response.requiredGroups
      .filter((group) => group.groupId === 'essential')
      .flatMap((group) => group.cookies.map((cookie) => cookie.name));

    const robotCookies = response.robotCookies.flatMap((cookie) => cookie.name);

    // MD5 pattern for auto-generated cookie names
    const md5Pattern = /^[0-9a-f]{32}$/;

    // Filter out any essential cookies and MD5-named cookies.
    const nonEssentialCookies = cookies.filter(
      (cookie) =>
        !essentialCookies.includes(cookie.name) && !md5Pattern.test(cookie.name) && !robotCookies.includes(cookie.name),
    );

    expect(nonEssentialCookies).toHaveLength(0);
  });

  test('should allow statistics cookie after accepting all cookies', async ({ page, context }) => {
    await navigateToTestPage(page);

    let cookies = await context.cookies();
    let hasConsentsCookie = cookies.some((cookie) => cookie.name === 'helfi-cookie-consents');
    let hasMatomoCookie = cookies.some((cookie) => cookie.name.match(/^_pk_id\./));

    expect(
      hasConsentsCookie,
      'Expected that no cookie called "helfi-cookie-consents" is set before accepting statistics cookies',
    ).toBeFalsy();
    expect(
      hasMatomoCookie,
      'Expected that no cookie matching "_pk_id.*" is set before accepting statistics cookies',
    ).toBeFalsy();

    const acceptAllCookiesButton = page.locator('.hds-cc__all-cookies-button');
    await acceptAllCookiesButton.click();
    await page.waitForLoadState('domcontentloaded');

    // Select the example YouTube iframe.
    const frame = page.frameLocator('iframe[title="Video: Esimerkki videoupotuksesta Youtubesta."]');

    // Wait for the iframe to be loaded.
    const iframeBody = frame.locator('html');
    await expect(iframeBody).toBeVisible();

    // The cookie setting might still take a while so here is another additional wait.
    await page.waitForTimeout(1000);

    cookies = await context.cookies();
    hasConsentsCookie = cookies.some((cookie) => cookie.name === 'helfi-cookie-consents');
    hasMatomoCookie = cookies.some((cookie) => cookie.name.match(/^_pk_id\./));

    expect(
      hasConsentsCookie,
      'Expected a cookie called "helfi-cookie-consents" to be set after accepting statistics cookies',
    ).toBeTruthy();
    expect(
      hasMatomoCookie,
      'Expected a cookie matching "_pk_id.*" to be set after accepting statistics cookies',
    ).toBeTruthy();
  });
});
