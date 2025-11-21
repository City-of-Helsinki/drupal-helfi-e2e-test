import { expect, test } from '@playwright/test';
import { testUnfilledFields } from '../../../common/calculators/calculatorsCommon';

test.beforeEach(async ({ page }) => {
  await page.goto(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/kotihoidon-asiakkaaksi/kotihoidon-asiakasmaksun-laskuri',
  );
});

test('Test unfilled fields', async ({ page }) => {
  await testUnfilledFields(page);
});

test('Household size input must be positive, integer and in range', async ({ page }) => {
  await page.getByLabel('Talouden koko (henkilöä)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla 1 tai enemmän: Talouden koko.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Talouden koko (henkilöä)').fill('0,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Kenttään on syötettävä kokonaisluku: Talouden koko.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Talouden koko (henkilöä)').fill('100');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla 1 tai enemmän: Talouden koko.',
      )
      .isVisible(),
  ).toBeFalsy();
});

test('Gross income per month input must be positive and in range', async ({ page }) => {
  await page.getByLabel('Talouden bruttotulot kuukaudessa (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Talouden bruttotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Talouden bruttotulot kuukaudessa (euroa)').fill('1000,10€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Talouden bruttotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeFalsy();
});

test('Monthly usage input must be positive, integer and in range', async ({ page }) => {
  await page.getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 0 ja 744: Kotihoidon tuntimäärä kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)').fill('745');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 0 ja 744: Kotihoidon tuntimäärä kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)').fill('0,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Kenttään on syötettävä kokonaisluku: Kotihoidon tuntimäärä kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();
});

test('Safety phone input must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Valinta on pakollinen: Laske arvioon turvapuhelin ja turvaranneke.',
      )
      .isVisible(),
  ).toBeTruthy();
});

test('If safety phone is selected, a helper text must become visible', async ({ page }) => {
  const group = page.getByRole('group', { 
    name: 'Laske arvioon turvapuhelin ja turvaranneke' 
  });

  await group.waitFor({ state: 'visible' });

  const labelText = 'Kyllä, laske arvioon.';
  const label = group.locator('label', { hasText: labelText });

  await expect(label).toBeVisible();
  await label.click();

  const input = group.locator('input[type="radio"]').first();

  await expect(input).toBeChecked();
  
  expect(page.getByText('Huomiothan, että turvapalveluiden hälytyskäynti maksaa 23,25 € tai 46,50 € kerta tulorajoistasi riippuen. Kuukausittain laskutamme enintään 5 hälytyskäyntiä, eli tulorajoistasi riippuen enintään 116,25 € tai 232,50 € kuukaudessa.')).toBeVisible();
});

test('Grocery delivery service input must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Valinta on pakollinen: Laske arvioon kauppapalvelu.',
      )
      .isVisible(),
  ).toBeTruthy();
});

test('Meal service input must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Valinta on pakollinen: Laske arvioon ateriapalvelu.',
      )
      .isVisible(),
  ).toBeTruthy();
});

test('If meal service is selected, a new input must become visible and it should be required, integer and in range', async ({ page }) => {
  const group = page.getByRole('group', { 
    name: 'Laske arvioon ateriapalvelu' 
  });
  await group.waitFor({ state: 'visible' });

  // Find the option to calculate the meal service on the calculator.
  const label = group.locator('label', { hasText: 'Kyllä, laske arvioon.' });

  // Select to calculate the meal service on the calculator.
  await expect(label).toBeVisible();
  await label.click();

  // Make sure the option gets checked.
  const input = group.locator('input[type="radio"]').first();
  await expect(input).toBeChecked();
  
  // Now we should see a new input for the amount of meals per week.
  expect(page.getByText('Aterioiden määrä viikossa (kpl)')).toBeVisible();
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  // We should get an error message saying that the input is required.
  expect(
    await page
      .getByText(
        'Kenttä on pakollinen: Aterioiden määrä viikossa.',
      )
      .isVisible(),
  ).toBeTruthy();

  // Fill the input with a negative number.
  await page.getByLabel('Aterioiden määrä viikossa (kpl)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  // The error message should say that the value is out of range.
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 1 ja 7: Aterioiden määrä viikossa.',
      )
      .isVisible(),
  ).toBeTruthy();

  // Fill the input with too big number.
  await page.getByLabel('Aterioiden määrä viikossa (kpl)').fill('8');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  // The error message should say that the value is out of range.
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 1 ja 7: Aterioiden määrä viikossa.',
      )
      .isVisible(),
  ).toBeTruthy();

  // Fill the input with a decimal number.
  await page.getByLabel('Aterioiden määrä viikossa (kpl)').fill('6,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  // The error message should say that the value needs to be an integer.
  expect(
    await page
      .getByText(
        'Kenttään on syötettävä kokonaisluku: Aterioiden määrä viikossa.',
      )
      .isVisible(),
  ).toBeTruthy();

  // Fill in a valid number.
  await page.getByLabel('Aterioiden määrä viikossa (kpl)').fill('1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  // There shouln't be any more error messages.
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 1 ja 7: Aterioiden määrä viikossa.',
      )
      .isVisible(),
  ).toBeFalsy();

});