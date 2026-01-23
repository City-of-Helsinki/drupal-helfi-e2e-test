import { expect, type Page, test } from '@playwright/test';

const fillServiceProviderPrice = (page: Page, value: string) =>
  test.step('Fill service provider price', async () => {
    await page.getByLabel('Palveluntuottajan tuntihinta (euroa)').fill(String(value));
  });

type CalculatorResults = {
  RESULT_TOTAL_SERVICE_COST: string;
  RESULT_CITY_PAYMENT: string;
  RESULT_SERVICE_VOUCHER_VALUE: string;
  RESULT_CITY_HOME_CARE_COST: string;
};

const expectCalculatorResults = async (page: Page, results: CalculatorResults) =>
  test.step('Verify calculator subtotal results', async () => {
    const subtotalSums = page.locator('.helfi-calculator__receipt-subtotal-sum > span[aria-hidden="true"]');

    const expectedValues = [
      `${results.RESULT_TOTAL_SERVICE_COST} €/kk`,
      `${results.RESULT_CITY_PAYMENT} €/kk`,
      `${results.RESULT_SERVICE_VOUCHER_VALUE} €/tunti`,
      `${results.RESULT_CITY_HOME_CARE_COST} €/kk`,
    ];

    await Promise.all(
      expectedValues.map(async (expectedValue, index) => {
        await expect(subtotalSums.nth(index)).toHaveText(expectedValue);
      }),
    );
  });

export { fillServiceProviderPrice, expectCalculatorResults };
