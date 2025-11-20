import { test } from '@playwright/test';
import {
  fillNetIncomePerMonth,
  fillServiceProviderPrice,
  clickResultsButton,
  expectResult,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    NET_INCOME_PER_MONTH: '0',
    SERVICE_PROVIDER_PRICE: '180',
    RESULT: '2175,00',
  },
  {
    NAME: 'Medium',
    NET_INCOME_PER_MONTH: '2000',
    SERVICE_PROVIDER_PRICE: '180',
    RESULT: '3275,00',
  },
  {
    NAME: 'High',
    NET_INCOME_PER_MONTH: '9000',
    SERVICE_PROVIDER_PRICE: '180',
    RESULT: '4975,00',
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(async ({ page }) => {
  await page.goto(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/ikaantyneiden-asumispalvelut/palveluasumisen-palvelusetelilaskuri',
  );
});

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test('Fill in form and check results', async ({ page }) => {
      await fillNetIncomePerMonth(page, testCase.NET_INCOME_PER_MONTH);
      await fillServiceProviderPrice(page, testCase.SERVICE_PROVIDER_PRICE);
      await clickResultsButton(page);
      await expectResult(page, testCase.RESULT);
    });
  });
});
