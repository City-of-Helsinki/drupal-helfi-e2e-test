import { type Page, test } from '@playwright/test';

const fillHouseholdSize = (page: Page, value: string, label: string = 'Talouden koko (henkilöä)') =>
  test.step('Fill household size', async () => {
    await page.getByLabel(label).fill(String(value));
  });

export { fillHouseholdSize };
