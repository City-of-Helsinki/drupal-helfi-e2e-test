import { expect, test } from '@playwright/test';
import { publishedBeforeEach, testUnfilledFields } from '../../../common/calculators/calculatorsCommon';

test.beforeEach(publishedBeforeEach(
  '/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/tukea-lapselle-nuorelle-ja-perheelle/varhaisen-tuen-sosiaalipalvelut/lapsiperheiden-kotipalvelu/lapsiperheiden-kotipalvelun-asiakasmaksulaskuri',
));

test('Test unfilled fields', async ({ page }) => {
  await testUnfilledFields(page);
});

test('Household size input must be positive, integer and in range', async ({
  page,
}) => {
  await page.getByLabel('Perheen koko (henkilöä)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText('Arvon pitää olla väliltä 1 ja 6: Perheen koko.')
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Perheen koko (henkilöä)').fill('7');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText('Arvon pitää olla väliltä 1 ja 6: Perheen koko.')
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Perheen koko (henkilöä)').fill('0,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText('Kenttään on syötettävä kokonaisluku: Perheen koko.')
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Perheen koko (henkilöä)').fill('6');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText('Arvon pitää olla väliltä 1 ja 6: Perheen koko.')
      .isVisible(),
  ).toBeFalsy();
});

test('Gross income per month input must be positive and in range', async ({
  page,
}) => {
  await page.getByLabel('Perheen bruttotulot kuukaudessa (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Perheen bruttotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page
    .getByLabel('Talouden bruttotulot kuukaudessa (euroa)')
    .fill('1000,10€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Perheen bruttotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeFalsy();
});

test('Monthly usage input must be positive, integer and in range', async ({
  page,
}) => {
  await page.getByLabel('Palvelutunteja kuukaudessa (tuntia)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 0 ja 744: Palvelutunteja kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Palvelutunteja kuukaudessa (tuntia)').fill('745');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 0 ja 744: Palvelutunteja kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Palvelutunteja kuukaudessa (tuntia)').fill('0,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Kenttään on syötettävä kokonaisluku: Palvelutunteja kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Palvelutunteja kuukaudessa (tuntia)').fill('2');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 0 ja 744: Palvelutunteja kuukaudessa.',
      )
      .isVisible(),
  ).toBeFalsy();
});
