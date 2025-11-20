import { expect, test, type Page } from '@playwright/test';

const fillNetIncomePerMonth = (page: Page, value: string) =>
  test.step('Fill net income per month', async () => {
    await page
      .getByLabel('Hakijan nettotulot kuukaudessa (euroa)')
      .fill(String(value));
  });

const fillServiceProviderPrice = (page: Page, value: string) =>
  test.step('Fill service provider price', async () => {
    await page
      .getByLabel('Palveluasumisen vuorokausihinta (euroa)')
      .fill(String(value));
  });

const clickResultsButton = (page: Page) =>
  test.step('Click results button', async () => {
    await page.getByRole('button', { name: 'Laske arvio' }).click();
  });

const resultSelector = '.helfi-calculator__receipt-total__value';
const expectResult = (page: Page, result: string) =>
  test.step('Click results button', async () => {
    expect(await page.locator(resultSelector).textContent()).toBe(result);
  });

export {
  fillNetIncomePerMonth,
  fillServiceProviderPrice,
  clickResultsButton,
  expectResult,
};
