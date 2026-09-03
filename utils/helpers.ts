import { expect, type Page } from '@playwright/test';

/**
 * Verify that a React search has fully loaded.
 *
 * @param page - Playwright Page object representing the browser page.
 * @param root - Selector of the element wrapping the search.
 * @param results - Selector of the results container.
 */
const verifyReact = async (page: Page, root: string, results: string = '.react-search__results') => {
  // Expect the form and results container to be visible.
  await expect(page.locator(`${root} .hdbt-search--react__form-container`)).toBeVisible();
  await expect(page.locator(`${root} ${results}`)).toBeVisible();

  // Wait for the loading skeleton to be replaced with the results.
  await expect(page.locator(`${root} .card--ghost`)).toHaveCount(0);
};

export { verifyReact };