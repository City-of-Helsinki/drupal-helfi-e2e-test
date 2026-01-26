import { type Page, test } from '@playwright/test';

const fillHouseholdSize = (page: Page, value: string, label: string = 'Talouden koko (henkilöä)') =>
  test.step('Fill household size', async () => {
    await page.getByLabel(label).fill(String(value));
  });

const fillGrossIncomePerMonth = (page: Page, value: string, label: string = 'Talouden bruttotulot kuukaudessa (euroa)') =>
  test.step('Fill gross income per month', async () => {
    await page.getByLabel(label).fill(String(value));
  });

const fillMonthlyUsage = (page: Page, value: string, label: string = 'Kotihoidon tuntimäärä kuukaudessa (tuntia)') =>
  test.step('Fill monthly usage', async () => {
    await page.getByLabel(label).fill(String(value));
  });

const fillServiceProviderPrice = (page: Page, value: string, label: string = 'Palveluntuottajan tuntihinta (euroa)') =>
  test.step('Fill service provider price', async () => {
    await page.getByLabel(label).fill(String(value));
  });

export { fillHouseholdSize, fillGrossIncomePerMonth, fillMonthlyUsage, fillServiceProviderPrice };
