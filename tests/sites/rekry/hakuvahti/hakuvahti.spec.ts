import { expect } from '@playwright/test';
import { hakuvahtiTest } from '../../../../utils/hakuvahti';

/**
 * Tests for subscribing to Hakuvahti.
 */
hakuvahtiTest({
  title: 'Hakuvahti subscription',
  emailPrefix: 'hakuvahti-e2e',
  path: '/en/open-jobs/find-open-jobs',
  rootSelector: '#helfi-rekry-job-search',
  waitForResults: async (root) => {
    // Wait for the loading skeleton to be replaced with the results.
    await expect(root.locator('.job-search__results')).toBeVisible({ timeout: 15_000 });
    await expect(root.locator('.card--ghost')).toHaveCount(0);
  },
  texts: {
    almostDone: 'You are almost done subscribing to search alert',
    subject: 'Confirm job search alert subscription',
    confirmLink: 'Confirm search alert subscription',
    confirmed: 'Search alert subscription successful',
    removed: 'The search alert has been removed',
  },
});
