import { test } from '@playwright/test';
import {
  clickResultsButton,
  expectResult,
} from '../../../common/calculators/calculatorsCommon';
import {
  fillHouseholdSize,
  fillGrossIncomePerMonth,
  fillMonthlyUsage,
  fillServiceProviderPrice,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '0',
    MONTHLY_USAGE: '1',
    SERVICE_PROVIDER_PRICE: '52',
    RESULT: '11,20',
  },
  {
    NAME: 'Medium',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '3300,10',
    MONTHLY_USAGE: '22',
    SERVICE_PROVIDER_PRICE: '48',
    RESULT: '361,24',
  },
  {
    NAME: 'High',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '5975,51',
    MONTHLY_USAGE: '62',
    SERVICE_PROVIDER_PRICE: '49',
    RESULT: '2517,20',
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(async ({ page }) => {
  await page.goto(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/kotihoidon-asiakkaaksi/kotihoidon-palvelusetelilaskuri',
  );
});

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test('Fill in form and check results', async ({ page }) => {
      await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
      await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
      await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
      await fillServiceProviderPrice(page, testCase.SERVICE_PROVIDER_PRICE);
      await clickResultsButton(page);
      await expectResult(page, testCase.RESULT);
    });
  });
});
