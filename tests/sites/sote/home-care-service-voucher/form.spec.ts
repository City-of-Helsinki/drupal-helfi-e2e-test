import { expect, test } from '@playwright/test';
import { testUnfilledFields } from '../../../common/calculators/calculatorsCommon';

test.beforeEach(async ({ page }) => {
  await page.goto(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/kotihoidon-asiakkaaksi/kotihoidon-palvelusetelilaskuri',
  );
});

test('Test unfilled fields', async ({ page }) => {
  await testUnfilledFields(page);
});

test('Household size input must be positive, integer and in range', async ({
  page,
}) => {
  await page.getByLabel('Talouden koko (henkilöä)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText('Arvon pitää olla 1 tai enemmän: Talouden koko.')
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Talouden koko (henkilöä)').fill('0,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText('Kenttään on syötettävä kokonaisluku: Talouden koko.')
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Talouden koko (henkilöä)').fill('100');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText('Arvon pitää olla 1 tai enemmän: Talouden koko.')
      .isVisible(),
  ).toBeFalsy();
});

test('Gross income per month input must be positive and in range', async ({
  page,
}) => {
  await page.getByLabel('Talouden bruttotulot kuukaudessa (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Talouden bruttotulot kuukaudessa.',
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
        'Arvon pitää olla 0 tai enemmän: Talouden bruttotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeFalsy();
});

test('Monthly usage input must be positive, integer and in range', async ({
  page,
}) => {
  await page
    .getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)')
    .fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 0 ja 744: Kotihoidon tuntimäärä kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page
    .getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)')
    .fill('745');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 0 ja 744: Kotihoidon tuntimäärä kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page
    .getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)')
    .fill('0,5');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Kenttään on syötettävä kokonaisluku: Kotihoidon tuntimäärä kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Kotihoidon tuntimäärä kuukaudessa (tuntia)').fill('2');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla väliltä 0 ja 744: Kotihoidon tuntimäärä kuukaudessa.',
      )
      .isVisible(),
  ).toBeFalsy();
});

test('Service provider price per hour input must be positive and in range', async ({
  page,
}) => {
  await page.getByLabel('Palveluntuottajan tuntihinta (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Palveluntuottajan tuntihinta.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Palveluntuottajan tuntihinta (euroa)').fill('100€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Palveluntuottajan tuntihinta.',
      )
      .isVisible(),
  ).toBeFalsy();
});
