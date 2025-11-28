import { test, type Page } from '@playwright/test';

const fillHouseholdSize = (page: Page, value: string) =>
  test.step('Fill household size', async () => {
    await page.getByLabel('Perheen koko (henkilöä)').fill(String(value));
  });

const fillGrossIncomePerMonth = (page: Page, value: string) =>
  test.step('Fill gross income per month', async () => {
    await page.getByLabel('Perheen bruttotulot kuukaudessa (euroa)').fill(String(value));
  });

const fillMonthlyUsage = (page: Page, value: string) =>
  test.step('Fill monthly usage', async () => {
    await page.getByLabel('Palvelutunteja kuukaudessa (tuntia)').fill(String(value));
  });

export { fillHouseholdSize, fillGrossIncomePerMonth, fillMonthlyUsage };
