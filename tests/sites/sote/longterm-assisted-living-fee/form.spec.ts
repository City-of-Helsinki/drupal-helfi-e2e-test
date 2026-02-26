import { expect, test } from '@playwright/test';
import { existsBeforeEach, testUnfilledFields } from '../../../common/calculators/calculatorsCommon';

test.beforeEach(
  existsBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/pitkaaikaisen-ymparivuorokautisen-palveluasumisen-asiakasmaksun-laskuri',
  ),
);

test('Test unfilled fields', async ({ page }) => {
  await testUnfilledFields(page);
});

test('Earned income input must be positive', async ({ page }) => {
  await page.getByLabel('Ansiotulot (euroa)', { exact: true }).fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla 0 tai enemmän: Ansiotulot.').isVisible()).toBeTruthy();

  await page.getByLabel('Ansiotulot (euroa)', { exact: true }).fill('1500,50€');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla 0 tai enemmän: Ansiotulot.').isVisible()).toBeFalsy();
});

test('Annual forest income input must be positive', async ({ page }) => {
  await page.getByLabel('Metsän vuotuinen tuotto (euroa)', { exact: true }).fill('-10');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla 0 tai enemmän: Metsän vuotuinen tuotto.').isVisible()).toBeTruthy();
});

test('Has spouse selection must be selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Valinta on pakollinen: Onko asiakkaalla puolisoa?').isVisible()).toBeTruthy();
});

test('Spouse earned income must be positive when spouse is selected', async ({ page }) => {
  const group = page.getByRole('group', {name: 'Onko asiakkaalla puolisoa'});

  await group.locator('label', { hasText: 'Kyllä' }).click();

  await page.getByLabel('Puolison ansiotulot (euroa)').fill('-100');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla 0 tai enemmän: Puolison ansiotulot.').isVisible(),).toBeTruthy();
});

test('Valid inputs produce a result receipt', async ({ page }) => {

  await page.getByLabel('Ansiotulot (euroa)', { exact: true }).fill('2000');
  await page.getByLabel('Etuudet (euroa)', { exact: true }).fill('500');
  await page.getByLabel('Pääomatulot (euroa)', { exact: true }).fill('0');
  await page.getByLabel('Metsän vuotuinen tuotto (euroa)', { exact: true }).fill('1200');

  await page.getByRole('group', { name: 'Onko asiakkaalla puolisoa' })
    .locator('label', { hasText: 'Ei' })
    .click();

  await page.getByRole('button', { name: 'Laske arvio' }).click();

  await expect(
    page.getByText('Arvoitu asiakasmaksu on yhteensä'),
  ).toBeVisible();
});

test('Guardianship fees input must be positive, integer and in range', async ({ page }) => {
  await page.getByLabel('Edunvalvontamaksut (euroa)', { exact: true }).fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(await page.getByText('Arvon pitää olla väliltä 0 ja 43.34: Edunvalvontamaksut.').isVisible()).toBeTruthy();

  await page.getByLabel('Edunvalvontamaksut (euroa)', { exact: true }).fill('100');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(await page.getByText('Arvon pitää olla väliltä 0 ja 43.34: Edunvalvontamaksut.').isVisible()).toBeTruthy();
});