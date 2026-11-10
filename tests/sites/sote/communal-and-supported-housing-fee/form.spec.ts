import { expect, test } from '@playwright/test';
import { publishedBeforeEach, testUnfilledFields } from '../../../common/calculators/calculatorsCommon';

test.beforeEach(
  publishedBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/asiakkaan-tiedot-ja-oikeudet/maksut/yhteisollisen-ja-tuetun-asumisen-asiakasmaksulaskuri',
  ),
);

test('Test unfilled fields', async ({ page }) => {
  await testUnfilledFields(page);
});

test('Household size input must be positive, integer and in range', async ({ page }) => {
  await page.getByLabel('Talouden koko (henkilöä)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(await page.getByText('Arvon pitää olla väliltä 1 ja 6: Talouden koko.').isVisible()).toBeTruthy();

  await page.getByLabel('Talouden koko (henkilöä)').fill('0,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(await page.getByText('Kenttään on syötettävä kokonaisluku: Talouden koko.').isVisible()).toBeTruthy();

  await page.getByLabel('Talouden koko (henkilöä)').fill('100');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla väliltä 1 ja 6: Talouden koko.').isVisible()).toBeTruthy();
});

test('Gross income per month input must be positive and in range', async ({ page }) => {
  await page.getByLabel('Talouden bruttotulot kuukaudessa (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText('Arvon pitää olla 0 tai enemmän: Talouden bruttotulot kuukaudessa.').isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Talouden bruttotulot kuukaudessa (euroa)').fill('1000,10€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page.getByText('Arvon pitää olla 0 tai enemmän: Talouden bruttotulot kuukaudessa.').isVisible(),
  ).toBeFalsy();
});

test('Monthly usage input must be positive, integer and in range', async ({ page }) => {
  await page.getByLabel('Palvelun tuntimäärä kuukaudessa (tuntia)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText('Arvon pitää olla väliltä 0 ja 744: Palvelun tuntimäärä kuukaudessa.').isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Palvelun tuntimäärä kuukaudessa (tuntia)').fill('745');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText('Arvon pitää olla väliltä 0 ja 744: Palvelun tuntimäärä kuukaudessa.').isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Palvelun tuntimäärä kuukaudessa (tuntia)').fill('0,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText('Kenttään on syötettävä kokonaisluku: Palvelun tuntimäärä kuukaudessa.').isVisible(),
  ).toBeTruthy();
});

test('Safety phone input must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(await page.getByText('Valinta on pakollinen: Laske arvioon hälytyskutsupalvelu.').isVisible()).toBeTruthy();
});

test('Grocery delivery service input must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(await page.getByText('Valinta on pakollinen: Laske arvioon kauppapalvelu.').isVisible()).toBeTruthy();
});

test('Meal service input must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(await page.getByText('Valinta on pakollinen: Laske arvioon ateriapalvelu.').isVisible()).toBeTruthy();
});
