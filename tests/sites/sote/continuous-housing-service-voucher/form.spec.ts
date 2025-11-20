import { expect, test } from '@playwright/test';
import { clickResultsButton } from './fixtures/input';

test.beforeEach(async ({ page }) => {
  await page.goto(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/ikaantyneiden-asumispalvelut/palveluasumisen-palvelusetelilaskuri',
  );
});

test('On submit, unfilled fields give an error', async ({ page }) => {
  await clickResultsButton(page);

  // General error message should be visible.
  const errorMessage = page.getByLabel('Täytäthän puuttuvat tiedot.');
  expect(errorMessage.isVisible()).toBeTruthy();

  // Find all required fields and their error messages.
  const requiredFields = await page.locator('.input--required').all();
  const requiredFieldMessages = await page.locator('.input--required .hdbt-error-text').all();

  // Required fields should be marked as invalid.
  for (const requiredField of requiredFields) {
    await expect(requiredField).toContainClass('hds-text-input--invalid');
  }

  // Required fields should have error messages visible.
  for (const requiredFieldMessage of requiredFieldMessages) {
    await expect(requiredFieldMessage).toContainText('Kenttä on pakollinen.');
  }
});

test('Net income per month input must be positive and in range', async ({ page }) => {
  await page.getByLabel('Hakijan nettotulot kuukaudessa (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Hakijan nettotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Hakijan nettotulot kuukaudessa (euroa)').fill('10000€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Hakijan nettotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeFalsy();
});

test('Service provider price per 24h input must be positive and in range', async ({ page }) => {
  await page.getByLabel('Palveluasumisen vuorokausihinta (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Palveluasumisen vuorokausihinta.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Palveluasumisen vuorokausihinta (euroa)').fill('100€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Palveluasumisen vuorokausihinta.',
      )
      .isVisible(),
  ).toBeFalsy();
});