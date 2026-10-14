import { expect } from '@playwright/test';
import { hakuvahtiTest } from '../../../../utils/hakuvahti';
import { clickSubmitButton, fillTextFilter, resultSelector } from '../utils/newsArchiveInput';

const keyword = 'kirjasto';

/**
 * Tests for subscribing to news Hakuvahti.
 */
hakuvahtiTest({
  title: 'News hakuvahti subscription',
  emailPrefix: 'uutiset-hakuvahti-e2e',
  path: '/fi/uutiset',
  rootSelector: '#helfi-etusivu-news-search',
  waitForResults: async (root) => {
    await expect(root.locator(resultSelector)).toBeVisible({ timeout: 15_000 });
  },
  beforeSubscribe: async (page, root) => {
    // Filter the news so that the subscription has search criteria.
    const results = root.locator(resultSelector);
    const initialText = (await results.textContent()) ?? '';
    await fillTextFilter(page, keyword);
    await clickSubmitButton(page);
    await expect(results).not.toHaveText(initialText);
  },
  fillDialog: async (dialog) => {
    await expect(dialog.locator('.hdbt-search__search-monitor__selections')).toContainText(keyword);
    await expect(dialog.locator('.hdbt-search__search-monitor__no-selections')).not.toBeAttached();
  },
  checkEmail: (message) => {
    expect(message.Text).toContain(`"${keyword}"`);
  },
  texts: {
    almostDone: 'Hakuvahdin tilaus melkein valmis',
    subject: 'Vahvista uutisten hakuvahdin tilaus',
    confirmLink: 'Vahvista hakuvahti',
    confirmed: 'Hakuvahdin tilaus onnistui',
    removed: 'Hakuvahti on poistettu',
  },
});
