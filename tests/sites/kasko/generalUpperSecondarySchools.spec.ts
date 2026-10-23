import { expect, type Locator, type Page, test } from '@playwright/test';
import { DEFAULT_LANGUAGES, type Langcode } from '../../common/types/languagesType';

// Path of the upper secondary schools page per language.
const paths: Record<Langcode, string> = {
  fi: '/fi/kasvatus-ja-koulutus/lukiokoulutus/lukiot',
  sv: '/sv/fostran-och-utbildning/gymnasieutbildning/gymnasier',
  en: '/en/childhood-and-education/general-upper-secondary-education/general-upper-secondary-schools',
};
const languages = DEFAULT_LANGUAGES.map((code: Langcode) => ({ CODE: code, PATH: paths[code] }));

// Selectors for the two searches on the page.
const highSchoolSearch = '.views--high-school-search';
const privateSchoolSearch = '.views--unit-search';
const countSelector = '.content-list-with-count__count';
const highSchoolCard = '.card--high-school-teaser';

/**
 * Open the upper secondary schools page.
 */
async function navigateToPage(page: Page, language: (typeof languages)[number]) {
  await page.goto(language.PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.locator(`${highSchoolSearch} ${countSelector}`)).toBeVisible();
}

/**
 * Get the number of results from the heading above the results.
 */
async function getResultCount(search: Locator): Promise<number> {
  const heading = (await search.locator(countSelector).textContent()) || '';
  const count = parseInt(heading, 10);
  // The heading has no number when there are no results.
  return Number.isNaN(count) ? 0 : count;
}

/**
 * Wait for a view to be refreshed by the exposed filters.
 */
function waitForView(page: Page, viewName: string) {
  return page.waitForResponse((response) => response.url().includes(`view_name=${viewName}`));
}

/**
 * Submit the exposed filters and wait for the results to be replaced.
 */
async function submitSearch(page: Page, search: Locator, viewName: string) {
  const view = waitForView(page, viewName);
  await search.locator('input[type="submit"]').click();
  await view;
}

languages.forEach((language) => {
  test.describe(`General upper secondary school search (${language.CODE})`, () => {
    test('There should be results when opening the page', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);

      const total = await getResultCount(search);
      expect(total).toBeGreaterThan(0);
      await expect(search.locator(highSchoolCard)).toHaveCount(total);
    });

    test('The special emphasis filter should show less results', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);
      const total = await getResultCount(search);

      // Pick the first emphasis after the "All" option.
      await search.locator('select[name="emphasis"]').selectOption({ index: 1 });
      await submitSearch(page, search, 'high_school_search');

      await expect.poll(() => getResultCount(search)).toBeLessThan(total);
      await expect(search.locator(highSchoolCard)).toHaveCount(await getResultCount(search));
    });

    test('The special educational task filter should show less results', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);
      const total = await getResultCount(search);

      await search.locator('select[name="mission"]').selectOption({ index: 1 });
      await submitSearch(page, search, 'high_school_search');

      await expect.poll(() => getResultCount(search)).toBeLessThan(total);
      await expect(search.locator(highSchoolCard)).toHaveCount(await getResultCount(search));
    });

    test('The upper secondary school for adults filter should show less results', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);
      const total = await getResultCount(search);

      await search.locator('select[name="type"]').selectOption('adult');
      await submitSearch(page, search, 'high_school_search');

      await expect(page).toHaveURL(/type=adult/);
      await expect.poll(() => getResultCount(search)).toBeLessThan(total);
      await expect(search.locator(highSchoolCard)).toHaveCount(await getResultCount(search));
    });

    test('The language of instruction filter should show less results', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);
      const total = await getResultCount(search);

      await search.locator('input[name="language[sv]"]').check();
      await submitSearch(page, search, 'high_school_search');

      await expect(page).toHaveURL(/language%5Bsv%5D=sv/);
      await expect.poll(() => getResultCount(search)).toBeLessThan(total);
      await expect(search.locator(highSchoolCard)).toHaveCount(await getResultCount(search));
    });

    test('Selecting a special emphasis should dim the special educational task filter', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);
      const emphasis = search.locator('select[name="emphasis"]');
      const mission = search.locator('select[name="mission"]');

      await emphasis.selectOption({ index: 1 });
      await expect(mission).toHaveAttribute('aria-disabled', 'true');
      await expect(search.locator('.js-form-item-mission .hdbt--select-wrapper')).toHaveClass(
        /hdbt--select-wrapper--disabled/,
      );

      // Reset the emphasis filter.
      await emphasis.selectOption('All');
      await expect(mission).toHaveAttribute('aria-disabled', 'false');
      await expect(search.locator('.js-form-item-mission .hdbt--select-wrapper')).not.toHaveClass(
        /hdbt--select-wrapper--disabled/,
      );
    });

    test('Filters in the url should be applied on page load', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);
      const total = await getResultCount(search);

      await page.goto(`${language.PATH}?language[sv]=sv`, { waitUntil: 'domcontentloaded' });

      await expect(search.locator('input[name="language[sv]"]')).toBeChecked();
      expect(await getResultCount(search)).toBeLessThan(total);
    });
  });

  test.describe(`General upper secondary school result tabs (${language.CODE})`, () => {
    test('The list should be shown by default', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);

      await expect(search.locator('.tab--list')).toHaveAttribute('aria-selected', 'true');
      await expect(search.locator('.tab--map')).toHaveAttribute('aria-selected', 'false');
      await expect(search.locator('.content-list-with-count__result--list')).toBeVisible();
      await expect(search.locator('.content-list-with-count__result--map')).toBeHidden();
    });

    test('The map should show the same schools as the list', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);
      const total = await getResultCount(search);

      // The map tab reloads the view.
      const view = waitForView(page, 'high_school_search');
      await search.locator('.tab--map').click();
      await view;

      await expect(search.locator('.tab--map')).toHaveAttribute('aria-selected', 'true');
      await expect(search.locator('.content-list-with-count__result--map')).toBeVisible();
      await expect(search.locator('.content-list-with-count__result--list')).toBeHidden();

      // The service map embed should have a unit for each result.
      const source = (await search.locator('.content-list-with-count__map').getAttribute('src')) ?? '';
      expect(source).toContain('palvelukartta.hel.fi');
      expect(new URL(source).searchParams.get('units')?.split(',')).toHaveLength(total);

      // The link below the map opens the same units in a larger map.
      await expect(search.locator('.content-list-with-count__map-actions a')).toHaveAttribute('href', source);
    });

    test('The list should return when selecting the list tab', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(highSchoolSearch);

      const view = waitForView(page, 'high_school_search');
      await search.locator('.tab--map').click();
      await view;
      await expect(search.locator('.content-list-with-count__result--map')).toBeVisible();

      await search.locator('.tab--list').click();

      await expect(search.locator('.tab--list')).toHaveAttribute('aria-selected', 'true');
      await expect(search.locator('.content-list-with-count__result--list')).toBeVisible();
      await expect(search.locator('.content-list-with-count__result--map')).toBeHidden();
    });
  });

  test.describe(`Private upper secondary schools (${language.CODE})`, () => {
    test('There should be results when opening the page', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(privateSchoolSearch);

      const total = await getResultCount(search);
      expect(total).toBeGreaterThan(0);

      // A pager is shown when the results do not fit on one page.
      const cards = await search.locator('.card').count();
      expect(cards).toBeGreaterThan(0);
      if (cards < total) {
        await expect(search.locator('.pager')).toBeVisible();
      }
    });

    test('The search should show less results when using a search word', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(privateSchoolSearch);

      // This search word should match  several private upper secondary schools.
      const searchWord = 'yhteiskoulu';

      await search.locator('input[name="unit_search"]').fill(searchWord);
      await submitSearch(page, search, 'unit_search');

      await expect(page).toHaveURL(new RegExp(`unit_search=${searchWord}`));
      await expect(search.locator('.card').filter({ hasNotText: searchWord })).toHaveCount(0);
      await expect(search.locator('.card')).not.toHaveCount(0);
    });

    test('A search without matches should show no results', async ({ page }) => {
      await navigateToPage(page, language);
      const search = page.locator(privateSchoolSearch);

      await search.locator('input[name="unit_search"]').fill('thisshouldfindnothing');
      await submitSearch(page, search, 'unit_search');

      await expect(search.locator('.card')).toHaveCount(0);
      expect(await getResultCount(search)).toBe(0);
    });
  });
});
