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

async function selectRadioOptionMultiple(group: Locator, option: 'yes_full_service' | 'yes_partial_service' | 'no') {
  await group.waitFor({ state: 'visible' });

  let labelText = '';
  if (option === 'yes_full_service') {
    labelText = 'Kyllä, laske arvioon täysihoito.';
  } else if (option === 'yes_partial_service') {
    labelText = 'Kyllä, laske arvioon puolihoito.';
  } else {
    labelText = 'Ei';
  }
  const label = group.locator('label', { hasText: labelText });

  await expect(label).toBeVisible();
  await label.click();

  const input =
    option === 'yes_full_service' ? group.locator('input[type="radio"]').first() : option === 'yes_partial_service' ? group.locator('input[type="radio"]').nth(1) : group.locator('input[type="radio"]').last();

  await expect(input).toBeChecked();
}

const selectSafetyPhone = async (page: Page) =>
  test.step('Select safety phone option', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon hälytyskutsupalvelu',
    });

    await selectRadioOption(group, 'yes');
  });

const selectNoSafetyPhone = (page: Page) =>
  test.step('Select no safety phone option', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon hälytyskutsupalvelu',
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

const selectMealServiceFull = (page: Page) =>
  test.step('Select meal service', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon ateriapalvelu',
    });

    await selectRadioOptionMultiple(group, 'yes_full_service');
  });

const selectMealServicePartial = (page: Page) =>
  test.step('Select meal service', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon ateriapalvelu',
    });

  await selectRadioOptionMultiple(group, 'yes_partial_service');
});

const selectNoMealService = (page: Page) =>
  test.step('Select meal service', async () => {
    const group = page.getByRole('group', {
      name: 'Laske arvioon ateriapalvelu',
    });

  await selectRadioOptionMultiple(group, 'no');
});

const fillGuardianshipFees = (page: Page, value: string) =>
  test.step('Fill guardianship fees', async () => {
    await page.getByLabel('Edunvalvontamaksut (euroa)', { exact: true }).fill(String(value));
  });


export {
  selectSafetyPhone,
  selectNoSafetyPhone,
  selectGroceryDeliveryService,
  selectNoGroceryDeliveryService,
  selectMealServiceFull,
  selectMealServicePartial,
  selectNoMealService,
  fillGuardianshipFees,
};
