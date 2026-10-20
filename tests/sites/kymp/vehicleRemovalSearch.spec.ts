import { expect, type Page, test } from '@playwright/test';
import { verifyReact } from '../../../utils/helpers';

const searchPath = '/fi/kaupunkiymparisto-ja-liikenne/pysakointi/ajoneuvojen-siirrot/ajoneuvojen-siirtokehotukset';
const rootSelector = '#helfi-vehicle-removal-search';
const resultSelector = '.hdbt-search--react__results--title';

/**
 * Navigate to the vehicle removal search.
 */
async function navigateToSearch(page: Page) {
  await page.goto(searchPath, { waitUntil: 'domcontentloaded' });

  // Verify that the React application has successfully loaded.
  await verifyReact(page, rootSelector, '.hdbt-search--react__results');

  // Make sure there is no error message.
  await expect(page.locator(`${rootSelector} .hds-notification--error`)).toHaveCount(0);

  return page.locator(rootSelector);
}

/**
 * Parse the result count from the results heading.
 */
async function getResultCount(page: Page) {
  const resultText = (await page.locator(resultSelector).textContent()) || '';
  const numberMatch = resultText.match(/(\d+)/);
  return numberMatch ? parseInt(numberMatch[1], 10) : 0;
}

/**
 * Get the street name from an address, e.g. "Tarkk'ampujankatu 6" -> "Tarkkampujankatu".
 */
const streetFromAddress = (address: string) => (address.match(/^[^\d]+/)?.[0] ?? address).trim().replace(/'/g, '');

test.describe('Vehicle removal search', () => {
  test('Searching with a street name should filter the results', async ({ page }) => {
    const search = await navigateToSearch(page);

    const initialTotal = await test.step('The search should show results', async () => {
      const cards = search.locator('.card');
      await expect(cards.first()).toBeVisible();

      const total = await getResultCount(page);
      expect(total).toBeGreaterThan(0);
      return total;
    });

    const address = (await search.locator('.card .card__title').first().textContent())?.trim() || '';

    const street = await test.step('The street name field should autocomplete the street names', async () => {
      const streetName = streetFromAddress(address);
      expect(streetName).toBeTruthy();

      // Open the street name dropdown and type the street name.
      const dropdownButton = search.locator('#streets-main-button');
      await dropdownButton.click();

      const searchInput = search.locator('#streets-input-element');
      await searchInput.fill(streetName);

      // The street should be among the suggestions.
      const option = search.locator(`#streets-list li[role="option"][aria-label="${streetName}"]`);
      await expect(option).toBeVisible();

      await option.click();
      await expect(option).toHaveAttribute('aria-selected', 'true');

      // Close the dropdown.
      await page.keyboard.press('Escape');
      await expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');

      return streetName;
    });

    await test.step('The results should be filtered by the street name', async () => {
      await search.locator('.hdbt-search--react__submit-button').click();
      await expect(page).toHaveURL(/streets=/);

      // The selected street should be shown as a selection tag.
      await expect(search.locator('.hdbt-search__remove-selection-button', { hasText: street })).toBeVisible();

      // Wait for the loading skeleton to be replaced with the results.
      await expect(search.locator('.card--ghost')).toHaveCount(0);

      // The filtered results should be a subset of all the results.
      await expect.poll(() => getResultCount(page), { timeout: 15_000 }).toBeLessThan(initialTotal);
      expect(await getResultCount(page)).toBeGreaterThan(0);

      // The result the street name was picked from should still be shown.
      await expect(search.locator('.card .card__title', { hasText: address }).first()).toBeVisible();
    });
  });
});
