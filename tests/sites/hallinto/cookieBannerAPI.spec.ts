import { fetchJsonApiRequest } from '../../../utils/fetchJsonApiRequest';
import { expect, test } from '@playwright/test';
import { sites } from '../../../sites.config';
import { logger } from '../../../utils/logger';

// Type definitions based on the example response
type Language = {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
};

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
  robotCookies: Array<{
    name: string;
    storageType: number;
  }>;
  groupsWhitelistedForApi: string[];
  translations: Record<string, Record<string, string>>;
};

test('should receive valid cookie banner API response', async () => {
  // Get the Etusivu site configuration
  const etusivuConfig = sites.find(site => site.name === 'etusivu');
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
    response = await fetchJsonApiRequest<CookieBannerResponse>(
      baseURL,
      '/fi/api/cookie-banner'
    );
} catch (error) {
  if (error instanceof Error) {
    throw new Error(`Failed to fetch cookie banner data from ${baseURL}/fi/api/cookie-banner. The API might be down or the endpoint is not accessible. Error: ${error.message}`);
  }
  throw new Error(`Unknown error occurred while fetching cookie banner data from ${baseURL}/fi/api/cookie-banner`);
}

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
  
  response.languages.forEach(language => {
    expect(language).toHaveProperty('code');
    expect(language).toHaveProperty('name');
    expect(language).toHaveProperty('direction');
    expect(['ltr', 'rtl']).toContain(language.direction);
  });

  // Check required groups.
  expect(response.requiredGroups.length).toBeGreaterThan(0);
  response.requiredGroups.forEach(group => {
    expect(group).toHaveProperty('groupId');
    expect(group).toHaveProperty('title');
    expect(group).toHaveProperty('description');
    expect(Array.isArray(group.cookies)).toBe(true);
    
    // Check translations for required languages.
    ['fi', 'sv', 'en'].forEach(lang => {
      expect(group.title).toHaveProperty(lang);
      expect(group.description).toHaveProperty(lang);
    });
  });

  // Check robot cookies.
  response.robotCookies.forEach(cookie => {
    expect(cookie).toHaveProperty('name');
    expect(cookie).toHaveProperty('storageType');
  });

  // Log API information for debugging.
  logger(`Found ${response.requiredGroups.length} cookie groups`);
  logger(`Site name: ${response.siteName}`);
  logger(`Cookie name: ${response.cookieName}`);
  logger(`Fallback language: ${response.fallbackLanguage}`);
});
