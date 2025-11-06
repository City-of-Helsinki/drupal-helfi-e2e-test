import { expect, test } from '@playwright/test';
import { clickResultsButton } from "./fixtures/input";

test.beforeEach(async ({ page }) => {
  await page.goto('/fi/yritykset-ja-tyo/tyonantajat/taloudellista-tukea-tyonantajalle/helsinki-lisan-laskuri');
});

test('On submit, unfilled fields give an error', async ({ page }) => {
  await clickResultsButton(page);

  expect(await page.getByLabel('Virheilmoitus').isVisible());
  expect(await page.getByRole('link', { name: 'Työntekijän tuleva bruttopalkka' }).isVisible());
  expect(await page.getByRole('link', { name: 'Työnantajan muoto' }).isVisible());
  expect(await page.getByRole('link', { name: 'Työsuhteeseen myönnetyt tai haetut muut tuet, kuten palkkatuki' }).isVisible());
});

test('Monthly pay input must be positive and in range', async ({ page }) => {
  await page.getByLabel('Työntekijän tuleva bruttopalkka').fill('10001');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText(`Arvon pitää olla väliltä 0 ja 10000: Työntekijän tuleva bruttopalkka.`).isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Työntekijän tuleva bruttopalkka').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText(`Arvon pitää olla väliltä 0 ja 10000: Työntekijän tuleva bruttopalkka.`).isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Työntekijän tuleva bruttopalkka').fill('10000');
  await page.getByRole('button', { name: 'Laske arvio' }).click();

  expect(
    await page.getByText(`Arvon pitää olla väliltä 0 ja 10000: Työntekijän tuleva bruttopalkka.`).isVisible(),
  ).toBeFalsy();
});

test('Vacation money input must be positive and in range, or empty', async ({ page }) => {
  await page.getByLabel('Työntekijän tuleva bruttopalkka').fill('2000');

  await page.getByLabel('Lomaraha').fill('91');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText(`Arvon pitää olla väliltä 0 ja 90: Lomaraha.`).isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Lomaraha').fill('-1');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText(`Arvon pitää olla väliltä 0 ja 90: Lomaraha.`).isVisible(),
  ).toBeTruthy();

  await page.getByLabel('Lomaraha').fill('90');
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText(`Arvon pitää olla väliltä 0 ja 90: Lomaraha.`).isVisible(),
  ).toBeFalsy();

  await page.getByLabel('Lomaraha').clear();
  await page.getByRole('button', { name: 'Laske arvio' }).click();
  expect(
    await page.getByText(`Arvon pitää olla väliltä 0 ja 90: Lomaraha.`).isVisible(),
  ).toBeFalsy();
});
