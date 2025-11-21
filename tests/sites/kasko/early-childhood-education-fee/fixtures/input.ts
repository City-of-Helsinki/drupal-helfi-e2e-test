import { type Page, test } from '@playwright/test';

const addNextChildsInformation = (page: Page) =>
  test.step('Add next child´s information', async () => {
    await page
      .getByRole('button', { name: 'Lisää seuraavan lapsen tiedot' })
      .click();
  });

const fillHouseHoldSize = (page: Page, value: string) =>
  test.step('Fill household size', async () => {
    await page.getByLabel('Perheen koko').fill(String(value));
  });

const fillRegularDaysOffPerMonth = (page: Page, value: string) =>
  test.step('Fill regular days off per month', async () => {
    await page
      .getByLabel('Säännöllisiä vapaapäiviä kuukaudessa')
      .fill(String(value));
  });

export {
  addNextChildsInformation,
  fillHouseHoldSize,
  fillRegularDaysOffPerMonth,
};
