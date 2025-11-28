import { expect, test, type Page, type Locator } from '@playwright/test';

async function selectRadioOption(group: Locator, option: 'yes' | 'no') {
  await group.waitFor({ state: 'visible' });

  const labelText = option === 'yes' ? 'Kyllä, laske arvioon.' : 'Ei';
  const label = group.locator('label', { hasText: labelText });

  await expect(label).toBeVisible();
  await label.click();

  const input =
    option === 'yes' ? group.locator('input[type="radio"]').first() : group.locator('input[type="radio"]').last();

  await expect(input).toBeChecked();
}

const fillHouseholdSize = (page: Page, value: string) =>
  test.step('Fill household size', async () => {
    await page.getByLabel('Talouden koko (henkilöä)').fill(String(value));
  });

const fillGrossIncomePerMonth = (page: Page, value: string) =>
  test.step('Fill gross income per month', async () => {
    await page.getByLabel('Talouden bruttotulot kuukaudessa (euroa)').fill(String(value));
  });

const fillMonthlyUsage = (page: Page, value: string) =>
  test.step('Fill monthly usage', async () => {
    await page.getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)').fill(String(value));
  });

const selectSafetyPhone = async (page: Page) =>
  test.step('Select safety phone option', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon turvapuhelin ja turvaranneke',
    });

    await selectRadioOption(group, 'yes');
  });

const selectNoSafetyPhone = (page: Page) =>
  test.step('Select no safety phone option', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon turvapuhelin ja turvaranneke',
    });

    await selectRadioOption(group, 'no');
  });

const selectGroceryDeliveryService = (page: Page) =>
  test.step('Select grocery delivery service', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon kauppapalvelu',
    });

    await selectRadioOption(group, 'yes');
  });

const selectNoGroceryDeliveryService = (page: Page) =>
  test.step('Select grocery delivery service', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon kauppapalvelu',
    });

    await selectRadioOption(group, 'no');
  });

const selectMealService = (page: Page) =>
  test.step('Select meal service', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon ateriapalvelu',
    });

    await selectRadioOption(group, 'yes');
  });

const selectNoMealService = (page: Page) =>
  test.step('Select meal service', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon ateriapalvelu',
    });

    await selectRadioOption(group, 'no');
  });

const fillMealServicePerWeek = (page: Page, value: string) =>
  test.step('Fill meal service per week', async () => {
    await page.getByLabel('Aterioiden määrä viikossa (kpl)').fill(String(value));
  });

export {
  fillHouseholdSize,
  fillGrossIncomePerMonth,
  fillMonthlyUsage,
  selectSafetyPhone,
  selectNoSafetyPhone,
  selectGroceryDeliveryService,
  selectNoGroceryDeliveryService,
  selectMealService,
  selectNoMealService,
  fillMealServicePerWeek,
};
