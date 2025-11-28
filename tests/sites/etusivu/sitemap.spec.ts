import { type APIRequestContext, type APIResponse, expect, test} from '@playwright/test';
import { sites } from '../../../sites.config';
import { logger } from "../../../utils/logger";
import { mapSitemaps } from './utils/mappers';

/**
 * Picks a random subset of 1-5 items from an array.
 *
 * @param items - The array of items to pick from.
 * @returns Array containing 1-5 randomly selected items.
 */
const pickRandomItems = <T>(items: T[]): T[] => {
  if (items.length === 0) {
    return [];
  }
  // Shuffle array and pick first 1-5 items.
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.floor(Math.random() * Math.min(5, items.length)) + 1);
};

/**
 * Extracts URL strings from <loc> elements in sitemap XML.
 *
 * @param xml - The XML content of the sitemap.
 * @returns Array of URL strings found in <loc> elements.
 */
const extractLocs = (xml: string): string[] => {
  const locRegex = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  return [...xml.matchAll(locRegex)].map((match) => match[1].trim());
};

/**
 * Tests a sample of URLs from a sitemap to ensure they return 200 status.
 *
 * @param request - Playwright API request context.
 * @param pageUrls - Array of URLs to test.
 * @param path - The sitemap path being tested.
 */
const testUrls = (
  request: APIRequestContext,
  pageUrls: string[],
  path: string
) =>
  test.step(`Testing URLs for sitemap: ${path}`, async () => {
    const sampleUrls = pickRandomItems(pageUrls);

    await Promise.all(
      sampleUrls.map(async (url) => {
        await test.step(`URL: ${url} should return 200`, async () => {
          const response = await request.get(url);
          const status = response.status();
          expect(status, `Expected 200, got ${status}`).toBe(200);
        });
      }),
    );
  });

/**
 * Tests a multipage sitemap.
 *
 * @param request - Playwright API request context.
 * @param response - Response containing the sitemap XML.
 * @param path - The sitemap path being tested.
 */
const testMultiPageSitemap = (
  request: APIRequestContext,
  response: APIResponse,
  path: string
) =>
  test.step(`Testing the multipage sitemap: ${path}`, async () => {
    const sitemapXml = await response.text();
    const pageUrls = extractLocs(sitemapXml);
    expect(
      pageUrls.length,
      `Expected more than one sitemap page, got ${pageUrls.length}`
    ).toBeGreaterThan(1);

    await pageUrls.reduce<Promise<void>>(
      (chain, item) =>
        chain.then(async () => {
          const response = await request.get(item);
          expect(response.ok()).toBeTruthy();
          const pageUrls = extractLocs(await response.text());
          await testUrls(request, pageUrls, path);
        }),
      Promise.resolve(),
    );
  });

/**
 * Verify the sitemap structure and URL accessibility.
 */
test('Sitemap', async ({ request }) => {
  // Get the Etusivu site configuration.
  const etusivuConfig = sites.find((site) => site.name === 'etusivu');
  if (!etusivuConfig) {
    throw new Error('Etusivu site configuration not found');
  }

  // Determine the base URL from environment or config.
  const baseURL =
    process.env[`${etusivuConfig.envPrefix}_BASE_URL`] ||
    etusivuConfig.defaultBaseURL || '';

  // Skip the test on local environments as all URLs point to test.hel.ninja.
  if (baseURL?.toLowerCase().includes('docker') || !baseURL) {
    const message = 'Skipping the sitemap test for local environments.';
    logger(message);
    test.skip(true, message);
    return;
  }

  // Fetch and verify the main sitemap.
  const response = await request.get(`${baseURL}/sitemap.xml`);
  expect(response.ok()).toBeTruthy();

  const xml = await response.text();
  const allSitemaps = mapSitemaps(xml, baseURL);

  // Process each sitemap in parallel.
  await Promise.all(
    allSitemaps.map(async ({ mappedUrl, isFrontPage, path }) => {
      const response = await request.get(mappedUrl);
      expect(response.ok()).toBeTruthy();

      // Handle front page separately, as it's a multipage sitemap.
      if (isFrontPage) {
        await testMultiPageSitemap(request, response, path);
        return;
      }

      // Handle normal sitemap.
      const pageUrls = extractLocs(await response.text());

      expect(
        pageUrls.length,
        `Sitemap ${path} does not contain any <loc> entries`
      ).toBeGreaterThan(0);

      await testUrls(request, pageUrls, path);
    }),
  );
});
