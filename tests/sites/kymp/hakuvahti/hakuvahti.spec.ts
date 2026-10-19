import { expect } from '@playwright/test';
import { hakuvahtiTest } from '../../../../utils/hakuvahti';

/**
 * Tests for subscribing to Vehicle Removal Alert.
 */
hakuvahtiTest({
  title: 'Vehicle Removal Alert subscription',
  emailPrefix: 'siirtovahti-e2e',
  path: '/en/urban-environment-and-traffic/parking/vehicle-removal/vehicle-removal-requests',
  rootSelector: '#helfi-vehicle-removal-search',
  waitForResults: async (root) => {
    await expect(root.locator('.hdbt-search--react__results--title')).toBeVisible({ timeout: 15_000 });
  },
  fillDialog: async (dialog) => {
    // Subscribe with email only. The radio input is covered by its label, so click the label instead.
    await dialog.locator('label[for="hdbt-search__search-monitor__method-email"]').click();
    await expect(dialog.locator('#hdbt-search__search-monitor__method-email')).toBeChecked();
    await expect(dialog.locator('#hdbt-search__search-monitor__phone')).toBeHidden();
  },
  texts: {
    almostDone: 'Your Vehicle Removal Alert Service subscription is almost ready',
    subject: 'Confirm your Vehicle Removal Alert Service subscription',
    confirmLink: 'Confirm your Vehicle Removal Alert',
    confirmed: 'Subscription to the Vehicle Removal Alert Service successful',
    removed: 'The Vehicle Removal Alert has been removed',
  },
});
