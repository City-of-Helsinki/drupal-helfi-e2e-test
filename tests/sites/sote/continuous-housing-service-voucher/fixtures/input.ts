import { type Page, test } from '@playwright/test';

const fillNetIncomePerMonth = (page: Page, value: string) =>
  test.step('Fill net income per month', async () => {
    await page.getByLabel('Hakijan nettotulot kuukaudessa (euroa)').fill(String(value));
  });

export { fillNetIncomePerMonth };
