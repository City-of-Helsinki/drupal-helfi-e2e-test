import { expect, test } from '@playwright/test';
import { testUnfilledFields } from '../../../common/calculators/calculatorsCommon';

test.beforeEach(async ({ page }) => {
  await page.goto(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/ikaantyneiden-asumispalvelut/palveluasumisen-palvelusetelilaskuri',
  );
});

test('Test unfilled fields', async ({ page }) => {
  await testUnfilledFields(page);
});

test('Net income per month input must be positive and in range', async ({
  page,
}) => {
  await page.getByLabel('Hakijan nettotulot kuukaudessa (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Hakijan nettotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeTruthy();

  await page
    .getByLabel('Hakijan nettotulot kuukaudessa (euroa)')
    .fill('10000€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page
      .getByText(
        'Arvon pitää olla 0 tai enemmän: Hakijan nettotulot kuukaudessa.',
      )
      .isVisible(),
  ).toBeFalsy();
});

test('Service provider price per 24h input must be positive and in range', async ({
  page,
}) => {
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
