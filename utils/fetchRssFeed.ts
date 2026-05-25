import { expect, type Page } from '@playwright/test';
import { DOMParser } from '@xmldom/xmldom';

/**
 * Fetch an RSS feed and return the items.
 * @param page - Playwright Page object representing the browser page
 * @param rssUrl - URL of the RSS feed.
 * @param title - Optional title of the RSS feed.
 * @returns Array of RSS feed items or empty array if no items are found.
 */
export async function fetchRssFeed(page: Page, rssUrl: string, title: string = ''): Promise<HTMLCollectionOf<Element>> {
  const response = await page.request.get(rssUrl, {
    ignoreHTTPSErrors: true,
  });
  expect(response.status()).toBe(200);

  const rssContent = await response.text();
  const rssXml = new DOMParser().parseFromString(rssContent, 'text/xml');

  // Use DOMParser to parse the RSS feed.
  const rssElement = rssXml.getElementsByTagName('rss')[0];
  const channelElement = rssXml.getElementsByTagName('channel')[0];
  const channelTitle = channelElement.getElementsByTagName('title')[0].textContent?.trim();

  // Verify basic RSS structure.
  expect(rssElement).toBeDefined();
  expect(channelElement).toBeDefined();
  expect(channelTitle).toBeDefined();
  if (title) {
    expect(channelTitle).toContain(title);
  }

  return channelElement.getElementsByTagName('item');
}
