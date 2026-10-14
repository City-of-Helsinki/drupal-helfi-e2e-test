import { expect, type Locator, type Page, test } from '@playwright/test';

/**
 * Structure test case data.
 */
type TestCase = {
  langcode: string;
  headerSearchFormLabel: string;
  heroSearchFormLabel: string;
  submitButtonLabel: string;
  searchPhrase: string;
  searchUrlPath: string;
};

/**
 * Test cases for different language versions.
 */
const TEST_CASES: TestCase[] = [
  {
    langcode: 'fi',
    headerSearchFormLabel: 'Hakusana tai kysymys',
    heroSearchFormLabel: 'Mitä etsit?',
    submitButtonLabel: 'Hae',
    searchPhrase: 'Hyvää elämää Helsingissä',
    searchUrlPath: '/fi/haku',
  },
  {
    langcode: 'sv',
    headerSearchFormLabel: 'Sökord eller fråga',
    heroSearchFormLabel: 'Vad söker du?',
    submitButtonLabel: 'Sök',
    searchPhrase: 'Livet är bra i Helsingfors',
    searchUrlPath: '/sv/sok',
  },
  {
    langcode: 'en',
    headerSearchFormLabel: 'Search term or question',
    heroSearchFormLabel: 'What are you looking for?',
    submitButtonLabel: 'Search',
    searchPhrase: 'Life is good in Helsinki',
    searchUrlPath: '/en/search',
  },
];

/**
 * Fills out the search form with test data.
 *
 * @param searchFormWrapper - Locator for the search form container.
 * @param testCase - Test case data.
 * @param searchFormLabel - Label of the search input.
 */
const fillSearchForm = (searchFormWrapper: Locator, testCase: TestCase, searchFormLabel: string) =>
  test.step('Fill and submit search form', async () => {
    const searchForm = searchFormWrapper.locator('.helfi-search__form');
    await expect(searchForm).toBeVisible();

    // Find and verify search input.
    const searchInput = searchForm.getByLabel(searchFormLabel);
    await expect(searchInput).toBeVisible();

    // Fill in search phrase and submit.
    await searchInput.fill(testCase.searchPhrase);
    const submitButton = searchForm.getByRole('button', { name: testCase.submitButtonLabel, exact: true });
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
  test.step('Assert search results URL and query', async () => {
    // Wait for navigation to search results page.
    await page.waitForURL(`**${testCase.searchUrlPath}**`);

    // Verify URL structure.
    const currentUrl = page.url();
    const url = new URL(currentUrl);
    expect(url.pathname).toBe(testCase.searchUrlPath);
    expect(url.searchParams.get('s')).toBe(testCase.searchPhrase);
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
    await fillSearchForm(headerBranding.locator('.header-search-wrapper'), testCase, testCase.headerSearchFormLabel);
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
    await fillSearchForm(page.locator('.hero--with-search'), testCase, testCase.heroSearchFormLabel);
    await testSearchPage(page, testCase);
  });

TEST_CASES.forEach((testCase) => {
  test(`Search forms - ${testCase.langcode.toUpperCase()}`, async ({ page }) => {
    await testHeaderBrandingSearch(page, testCase);
    await testHeroBlockSearch(page, testCase);
  });
});
