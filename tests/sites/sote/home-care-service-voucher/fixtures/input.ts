import { test, type Page } from '@playwright/test';

const fillServiceProviderPrice = (page: Page, value: string) =>
  test.step('Fill service provider price', async () => {
    await page.getByLabel('Palveluntuottajan tuntihinta (euroa)').fill(String(value));
  });

export { fillServiceProviderPrice };
