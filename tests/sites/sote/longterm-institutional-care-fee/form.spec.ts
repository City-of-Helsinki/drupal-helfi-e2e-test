import { expect, test } from '@playwright/test';
import { existsBeforeEach, testUnfilledFields } from '../../../common/calculators/calculatorsCommon';

test.beforeEach(
  existsBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/pitkaaikaisen-laitoshoidon-asiakasmaksulaskuri',
  ),
);

test('Test unfilled fields', async ({ page }) => {
  await testUnfilledFields(page);
});

test('Earned income input must be positive', async ({ page }) => {
  await page.getByLabel('Ansiotulot (euroa)').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla 0 tai enemmän: Ansiotulot.').isVisible()).toBeTruthy();

  await page.getByLabel('Ansiotulot (euroa)').fill('1500,50€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla 0 tai enemmän: Ansiotulot.').isVisible()).toBeFalsy();
});

test('Annual forest income input must be positive', async ({ page }) => {
  await page.getByLabel('Metsän vuotuinen tuotto (euroa)').fill('-10');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla 0 tai enemmän: Metsän vuotuinen tuotto.').isVisible()).toBeTruthy();
});

test('Social welfare act selection must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Valinta on pakollinen: Kyseessä on sosiaalihuoltolain mukainen palvelu.').isVisible()).toBeTruthy();
});

test('Has spouse selection must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Valinta on pakollinen: Onko asiakkaalla puolisoa.').isVisible()).toBeTruthy();
});

test('Spouse earned income must be positive when spouse is selected', async ({ page }) => {
  const group = page.getByRole('group', {name: 'Onko asiakkaalla puolisoa'});

  await group.locator('label', { hasText: 'Kyllä' }).click();

  await page.getByLabel('Puolison ansiotulot (euroa)').fill('-100');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla 0 tai enemmän: Ansiotulot.').isVisible(),).toBeTruthy();
});

test('Valid inputs produce a result receipt', async ({ page }) => {
  await page.getByRole('group', { name: 'Sovelletaanko sosiaalihuoltolakia' })
    .locator('label', { hasText: 'Kyllä' })
    .click();

  await page.getByLabel('Ansiotulot (euroa)').fill('2000');
  await page.getByLabel('Etuudet (euroa)').fill('500');
  await page.getByLabel('Pääomatulot (euroa)').fill('0');
  await page.getByLabel('Metsätulot vuodessa (euroa)').fill('1200');

  await page.getByRole('group', { name: 'Onko asiakkaalla puoliso' })
    .locator('label', { hasText: 'Ei' })
    .click();

  await page.getByRole('button', { name: 'Laske arvio' }).click();

  await expect(
    page.getByText('Arvoitu asiakasmaksu on yhteensä'),
  ).toBeVisible();
});
