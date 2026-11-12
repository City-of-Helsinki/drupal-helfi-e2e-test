import { type Page, test } from '@playwright/test';

const addNextChildsInformation = (page: Page) =>
  test.step('Add next child´s information', async () => {
    await page.getByRole('button', { name: 'Lisää seuraavan lapsen tiedot' }).click();
  });

export { addNextChildsInformation };
