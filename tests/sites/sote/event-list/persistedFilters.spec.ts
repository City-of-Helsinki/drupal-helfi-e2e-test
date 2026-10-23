import { expect, type Page, test } from '@playwright/test';
import { verifyReact } from '../../../../utils/helpers';

const SEARCH_PATH = '/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/lapsiperheiden-helsinki';
const root = '.helfi-events-search';
const resultSelector = `${root} .hdbt-search--react__results--title`;
const resultsContainer = '.react-search__list-container';

/**
 * Navigate to the event list.
 */
async function navigateToSearch(page: Page) {
  await page.goto(SEARCH_PATH, { waitUntil: 'domcontentloaded' });

  // Verify that the React application has successfully loaded.
  await verifyReact(page, root, resultsContainer);

  return page.locator(root);
}

test.describe('Event list', () => {
  test('should restore the filters when returning to the page', async ({ page }) => {
    const search = await navigateToSearch(page);
    const topicsButton = search.locator('.event-form__filter--topics button[role="combobox"]');
    const eventsCheckbox = search.getByLabel('Tapahtumat', { exact: true });
    await expect(page.locator(resultSelector)).toContainText('hakutulosta');
    const initialText = (await page.locator(resultSelector).textContent()) || '';

    // Select the first topic.
    await topicsButton.click();
    const topic = search.locator('.event-form__filter--topics li[role="option"]').first();
    const topicLabel = (await topic.getAttribute('aria-label')) || '';
    await topic.click();
    await expect(topic).toHaveAttribute('aria-selected', 'true');
    await expect(topicsButton).toHaveAttribute('aria-label', /1 valittu vaihtoehto/);

    // Close the dropdown.
    await expect(async () => {
      await topicsButton.press('Escape');
      await expect(topicsButton).toHaveAttribute('aria-expanded', 'false', { timeout: 1_000 });
    }).toPass();

    // Limit the results to events.
    await eventsCheckbox.check();

    // Submit the search and wait for the results to change.
    await search.getByRole('button', { name: 'Etsi' }).click();
    await expect(page.locator(resultSelector)).not.toHaveText(initialText);
    await expect(page.locator(resultSelector)).toContainText('hakutulosta');
    const filteredText = (await page.locator(resultSelector).textContent()) || '';

    // Open an event and come back with the back button. The event pages are on an external
    // site, so only wait for the navigation to start.
    const eventLink = search.locator('.card__link').first();
    const eventUrl = (await eventLink.getAttribute('href')) || '';
    await eventLink.click();
    await page.waitForURL(eventUrl, { waitUntil: 'commit' });
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await verifyReact(page, root, resultsContainer);

    // The filters and the results should be the same as before leaving the page.
    await expect(topicsButton).toHaveAttribute('aria-label', /1 valittu vaihtoehto/);
    await expect(topicsButton).toContainText(topicLabel);
    await expect(eventsCheckbox).toBeChecked();
    await expect(page.locator(resultSelector)).toHaveText(filteredText);
  });
});
