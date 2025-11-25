import { test, type Page } from '@playwright/test';

const fillHouseholdSize = (page: Page, value: string) =>
  test.step('Fill household size', async () => {
    await page.getByLabel('Talouden koko (henkilöä)').fill(String(value));
  });

const fillGrossIncomePerMonth = (page: Page, value: string) =>
  test.step('Fill gross income per month', async () => {
    await page
      .getByLabel('Talouden bruttotulot kuukaudessa (euroa)')
      .fill(String(value));
  });

const fillMonthlyUsage = (page: Page, value: string) =>
  test.step('Fill monthly usage', async () => {
    await page
      .getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)')
      .fill(String(value));
  });

const fillServiceProviderPrice = (page: Page, value: string) =>
  test.step('Fill service provider price', async () => {
    await page
      .getByLabel('Palveluntuottajan tuntihinta (euroa)')
      .fill(String(value));
  });

export {
  fillHouseholdSize,
  fillGrossIncomePerMonth,
  fillMonthlyUsage,
  fillServiceProviderPrice,
};
