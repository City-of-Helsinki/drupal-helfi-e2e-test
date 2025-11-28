import { expect, type Locator, type Page, test } from '@playwright/test';

/**
 * Structure test case data.
 */
type TestCase = {
  langcode: string;
  searchFormLabel: string;
  searchPhrase: string;
  searchUrlPath: string;
};

/**
 * Test cases for different language versions.
 */
const TEST_CASES: TestCase[] = [
  {
    langcode: 'fi',
    searchFormLabel: 'Mitä haet?',
    searchPhrase: 'Hyvää elämää Helsingissä',
    searchUrlPath: '/haku',
  },
  {
    langcode: 'sv',
    searchFormLabel: 'Vad söker du?',
    searchPhrase: 'Livet är bra i Helsingfors',
    searchUrlPath: '/sok',
  },
  {
    langcode: 'en',
    searchFormLabel: 'What are you looking for?',
    searchPhrase: 'Life is good in Helsinki',
    searchUrlPath: '/search',
  },
];

/**
 * Fills out the search form with test data.
 *
 * @param searchFormWrapper - Locator for the search form container.
 * @param testCase - Test case data.
 */
const fillSearchForm = (searchFormWrapper: Locator, testCase: TestCase) =>
  test.step('Test the search page with search phrase', async () => {
    const searchForm = searchFormWrapper.locator('.helfi-search__form');
    await expect(searchForm).toBeVisible();

    // Find and verify search input.
    const searchInput = searchForm.getByLabel(testCase.searchFormLabel);
    await expect(searchInput).toBeVisible();

    // Fill in search phrase and submit.
    await searchInput.fill(testCase.searchPhrase);
    const submitButton = searchForm.locator('.helfi-search__submit-button');
    await expect(submitButton).toBeVisible();
    await submitButton.click();
  });

/**
 * Verifies the search results page.
 *
 * @param page - Playwright page object.
 * @param testCase - Test case data.
 */
const testSearchPage = (page: Page, testCase: TestCase) =>
  test.step('Test the search page with search phrase', async () => {
    // Wait for navigation to search results page.
    await page.waitForURL(`**${testCase.searchUrlPath}**`);

    // Verify URL structure.
    const currentUrl = page.url();
    const url = new URL(currentUrl);
    expect(url.pathname).toBe(testCase.searchUrlPath);
    expect(url.searchParams.get('q')).toBe(testCase.searchPhrase);
  });

/**
 * Tests the header branding search functionality.
 */
const testHeaderBrandingSearch = (page: Page, testCase: TestCase) =>
  test.step(`Test header branding search: ${testCase.langcode}: ${testCase.searchPhrase}`, async () => {
    await page.goto(`/${testCase.langcode}`, { waitUntil: 'domcontentloaded' });

    // Search dropdown is hidden by default.
    const searchDropdown = page.locator('#search-dropdown');
    await expect(searchDropdown).not.toBeVisible();

    // Header branding and search toggle button should be visible.
    const headerBranding = page.locator('.header-branding');
    await expect(headerBranding).toBeVisible();
    const toggleButton = headerBranding.locator('.nav-toggle--search .nav-toggle__button');
    await expect(toggleButton).toBeVisible();

    // Toggle button should be collapsed by default.
    await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    // Click toggle button to expand the search dropdown.
    await toggleButton.click();
    await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    await expect(searchDropdown).toBeVisible();

    // Fill search form and navigate to search results page.
    await fillSearchForm(headerBranding.locator('.header-search-wrapper'), testCase);
    await testSearchPage(page, testCase);
  });

/**
 * Tests the hero block search functionality
 */
const testHeroBlockSearch = (page: Page, testCase: TestCase) =>
  test.step(`Test hero search (${testCase.langcode})`, async () => {
    // Navigate to the front page and verify the search input is visible.
    await page.goto(`/${testCase.langcode}`, { waitUntil: 'domcontentloaded' });

    // Fill search form and navigate to search results page.
    await fillSearchForm(page.locator('.hero--with-search'), testCase);
    await testSearchPage(page, testCase);
  });

TEST_CASES.forEach((testCase) => {
  test(`Search forms - ${testCase.langcode.toUpperCase()}`, async ({ page }) => {
    await testHeaderBrandingSearch(page, testCase);
    await testHeroBlockSearch(page, testCase);
  });
});
