import { test } from '@playwright/test';
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import {
  fillGrossIncomePerMonth,
  fillHouseholdSize,
  fillMonthlyUsage,
  fillServiceProviderPrice,
} from '../../../common/calculators/calculatorsInput';
import { expectCalculatorResults } from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low (1, 500€, 10h, 34€/h)',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '500',
    MONTHLY_USAGE: '10',
    SERVICE_PROVIDER_PRICE: '34',
    RESULT: '0,00',
    RESULT_TOTAL_SERVICE_COST: '340,00',
    RESULT_CITY_PAYMENT: '340,00',
    RESULT_SERVICE_VOUCHER_VALUE: '40,80',
    RESULT_CITY_HOME_CARE_COST: '0,00',
  },
  {
    NAME: 'Low (1, 800€, 10h, 38€/h)',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '800',
    MONTHLY_USAGE: '10',
    SERVICE_PROVIDER_PRICE: '38',
    RESULT: '0,00',
    RESULT_TOTAL_SERVICE_COST: '380,00',
    RESULT_CITY_PAYMENT: '380,00',
    RESULT_SERVICE_VOUCHER_VALUE: '40,09',
    RESULT_CITY_HOME_CARE_COST: '17,17',
  },
  {
    NAME: 'Low (1, 2000€, 10h, 34€/h)',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '2000',
    MONTHLY_USAGE: '10',
    SERVICE_PROVIDER_PRICE: '34',
    RESULT: '23,10',
    RESULT_TOTAL_SERVICE_COST: '340,00',
    RESULT_CITY_PAYMENT: '316,90',
    RESULT_SERVICE_VOUCHER_VALUE: '31,69',
    RESULT_CITY_HOME_CARE_COST: '221,17',
  },
  {
    NAME: 'Medium (2, 4000€, 10h, 34€/h)',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '4400,00',
    MONTHLY_USAGE: '10',
    SERVICE_PROVIDER_PRICE: '34',
    RESULT: '68,80',
    RESULT_TOTAL_SERVICE_COST: '340,00',
    RESULT_CITY_PAYMENT: '271,20',
    RESULT_SERVICE_VOUCHER_VALUE: '27,12',
    RESULT_CITY_HOME_CARE_COST: '435,40',
  },
  {
    NAME: 'Medium (2, 3300,10€, 22h, 48€/h)',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '3300,10',
    MONTHLY_USAGE: '22',
    SERVICE_PROVIDER_PRICE: '48',
    RESULT: '352,88',
    RESULT_TOTAL_SERVICE_COST: '1056,00',
    RESULT_CITY_PAYMENT: '703,12',
    RESULT_SERVICE_VOUCHER_VALUE: '31,96',
    RESULT_CITY_HOME_CARE_COST: '442,22',
  },
  {
    NAME: 'High (1, 5975,51€, 62h, 49€/h)',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '5975,51',
    MONTHLY_USAGE: '62',
    SERVICE_PROVIDER_PRICE: '49',
    RESULT: '2517,20',
    RESULT_TOTAL_SERVICE_COST: '3038,00',
    RESULT_CITY_PAYMENT: '520,80',
    RESULT_SERVICE_VOUCHER_VALUE: '8,40',
    RESULT_CITY_HOME_CARE_COST: '1846,78',
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(
  publishedBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/kotihoidon-asiakkaaksi/kotihoidon-palvelusetelilaskuri',
  ),
);

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test('Fill in form and check results', async ({ page }) => {
      await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
      await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
      await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
      await fillServiceProviderPrice(page, testCase.SERVICE_PROVIDER_PRICE);
      await clickResultsButton(page);
      await expectResult(page, testCase.RESULT);
      await expectCalculatorResults(page, {
        RESULT_TOTAL_SERVICE_COST: testCase.RESULT_TOTAL_SERVICE_COST,
        RESULT_CITY_PAYMENT: testCase.RESULT_CITY_PAYMENT,
        RESULT_SERVICE_VOUCHER_VALUE: testCase.RESULT_SERVICE_VOUCHER_VALUE,
        RESULT_CITY_HOME_CARE_COST: testCase.RESULT_CITY_HOME_CARE_COST,
      });
    });
  });
});
