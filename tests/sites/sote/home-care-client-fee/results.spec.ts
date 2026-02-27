import { test } from '@playwright/test';
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import {
  fillGrossIncomePerMonth,
  fillHouseholdSize,
  fillMonthlyUsage,
} from '../../../common/calculators/calculatorsInput';
import {
  fillMealServicePerWeek,
  selectGroceryDeliveryService,
  selectMealService,
  selectNoGroceryDeliveryService,
  selectNoMealService,
  selectNoSafetyPhone,
  selectSafetyPhone,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '1000',
    MONTHLY_USAGE: '20',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '149,52',
      PHONE_GROCERY_4: '233,52',
      PHONE_GROCERY_7: '296,52',
      NO_PHONE_GROCERY_NONE: '113,84',
      NO_PHONE_GROCERY_4: '197,84',
      NO_PHONE_GROCERY_7: '260,84',
      NO_PHONE_NO_GROCERY_NONE: '72,24',
      NO_PHONE_NO_GROCERY_4: '156,24',
      NO_PHONE_NO_GROCERY_7: '219,24',
    },
  },
  {
    NAME: 'Medium',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '3000',
    MONTHLY_USAGE: '30',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '523,36',
      PHONE_GROCERY_4: '607,36',
      PHONE_GROCERY_7: '670,36',
      NO_PHONE_GROCERY_NONE: '452,00',
      NO_PHONE_GROCERY_4: '536,00',
      NO_PHONE_GROCERY_7: '599,00',
      NO_PHONE_NO_GROCERY_NONE: '410,40',
      NO_PHONE_NO_GROCERY_4: '494,40',
      NO_PHONE_NO_GROCERY_7: '557,40',
    },
  },
  {
    NAME: 'High',
    HOUSEHOLD_SIZE: '4',
    GROSS_INCOME_PER_MONTH: '7000',
    MONTHLY_USAGE: '50',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '832,48',
      PHONE_GROCERY_4: '916,48',
      PHONE_GROCERY_7: '979,48',
      NO_PHONE_GROCERY_NONE: '761,12',
      NO_PHONE_GROCERY_4: '845,12',
      NO_PHONE_GROCERY_7: '908,12',
      NO_PHONE_NO_GROCERY_NONE: '719,52',
      NO_PHONE_NO_GROCERY_4: '803,52',
      NO_PHONE_NO_GROCERY_7: '866,52',
    },
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(
  publishedBeforeEach(
    'fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/kotihoidon-asiakkaaksi/kotihoidon-asiakasmaksun-laskuri',
  ),
);

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test.describe('Home care client fee', () => {
      const labelMonthlyUsage = 'Kotihoidon tuntimäärä kuukaudessa (tuntia)';
      test('With safety phone, grocery delivery service and NO meal service', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectNoMealService(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.PHONE_GROCERY_NONE);
      });

      test('With safety phone, grocery delivery service and 4 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectMealService(page);
        await fillMealServicePerWeek(page, '4');
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.PHONE_GROCERY_4);
      });

      test('With safety phone, grocery delivery service and 7 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectMealService(page);
        await fillMealServicePerWeek(page, '7');
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.PHONE_GROCERY_7);
      });

      test('With NO safety phone, grocery delivery service and NO meal service', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectNoMealService(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_GROCERY_NONE);
      });

      test('With NO safety phone, grocery delivery service and 4 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectMealService(page);
        await fillMealServicePerWeek(page, '4');
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_GROCERY_4);
      });

      test('With NO safety phone, grocery delivery service and 7 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectMealService(page);
        await fillMealServicePerWeek(page, '7');
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_GROCERY_7);
      });

      test('With NO safety phone, NO grocery delivery service and NO meal service', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectNoGroceryDeliveryService(page);
        await selectNoMealService(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_NO_GROCERY_NONE);
      });

      test('With NO safety phone, NO grocery delivery service and 4 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectNoGroceryDeliveryService(page);
        await selectMealService(page);
        await fillMealServicePerWeek(page, '4');
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_NO_GROCERY_4);
      });

      test('With NO safety phone, NO grocery delivery service and 7 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectNoGroceryDeliveryService(page);
        await selectMealService(page);
        await fillMealServicePerWeek(page, '7');
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_NO_GROCERY_7);
      });
    });
  });
});
