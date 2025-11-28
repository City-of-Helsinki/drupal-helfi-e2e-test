import { test, type Page } from '@playwright/test';

const fillNetIncomePerMonth = (page: Page, value: string) =>
  test.step('Fill net income per month', async () => {
    await page.getByLabel('Hakijan nettotulot kuukaudessa (euroa)').fill(String(value));
  });

const fillServiceProviderPrice = (page: Page, value: string) =>
  test.step('Fill service provider price', async () => {
    await page.getByLabel('Palveluasumisen vuorokausihinta (euroa)').fill(String(value));
  });

export { fillNetIncomePerMonth, fillServiceProviderPrice };
