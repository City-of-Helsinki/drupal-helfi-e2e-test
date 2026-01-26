import { test } from '@playwright/test';
import { clickResultsButton, existsBeforeEach, expectResult } from '../../../common/calculators/calculatorsCommon';
import { fillHouseholdSize, fillGrossIncomePerMonth, fillMonthlyUsage } from '../../../common/calculators/calculatorsInput';
import {
  selectSafetyPhone,
  selectNoSafetyPhone,
  selectGroceryDeliveryService,
  selectNoGroceryDeliveryService,
  selectMealServiceFull,
  selectMealServicePartial,
  selectNoMealService,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '1000',
    MONTHLY_USAGE: '20',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '157,88',
      PHONE_GROCERY_MEAL_PARTIAL: '531,38',
      PHONE_GROCERY_MEAL_FULL: '655,83',
      NO_PHONE_GROCERY_NONE: '122,20',
      NO_PHONE_GROCERY_MEAL_FULL: '620,15',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '495,70',
      NO_PHONE_NO_GROCERY_NONE: '83,28',
      NO_PHONE_NO_GROCERY_MEAL_FULL: '581,23',
      NO_PHONE_NO_GROCERY_MEAL_PARTIAL: '456,78',
    },
  },
  {
    NAME: 'Medium',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '3000',
    MONTHLY_USAGE: '30',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '541,08',
      PHONE_GROCERY_MEAL_PARTIAL: '914,58',
      PHONE_GROCERY_MEAL_FULL: '1039,03',
      NO_PHONE_GROCERY_NONE: '469,72',
      NO_PHONE_GROCERY_MEAL_FULL: '967,67',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '843,22',
      NO_PHONE_NO_GROCERY_NONE: '430,80',
      NO_PHONE_NO_GROCERY_MEAL_FULL: '928,75',
      NO_PHONE_NO_GROCERY_MEAL_PARTIAL: '804,30',
    },
  },
  {
    NAME: 'High',
    HOUSEHOLD_SIZE: '4',
    GROSS_INCOME_PER_MONTH: '7000',
    MONTHLY_USAGE: '50',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '856,20',
      PHONE_GROCERY_MEAL_PARTIAL: '1229,70',
      PHONE_GROCERY_MEAL_FULL: '1354,15',
      NO_PHONE_GROCERY_NONE: '784,84',
      NO_PHONE_GROCERY_MEAL_FULL: '1282,79',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '1158,34',
      NO_PHONE_NO_GROCERY_NONE: '745,92',
      NO_PHONE_NO_GROCERY_MEAL_FULL: '1243,87',
      NO_PHONE_NO_GROCERY_MEAL_PARTIAL: '1119,42',
    },
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(
  existsBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/yhteisollisen-ja-tuetun-asumisen-asiakasmaksulaskuri',
  ),
);

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test.describe('Communal and supported housing fee', () => {
      const labelMonthlyUsage = 'Palvelun tuntimäärä kuukaudessa (tuntia)';

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

      test('With safety phone, grocery delivery service and partial meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectMealServicePartial(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.PHONE_GROCERY_MEAL_PARTIAL);
      });

      test('With safety phone, grocery delivery service and full meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectMealServiceFull(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.PHONE_GROCERY_MEAL_FULL);
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

      test('With NO safety phone, grocery delivery service and partial meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectMealServicePartial(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_GROCERY_MEAL_PARTIAL);
      });

      test('With NO safety phone, grocery delivery service and full meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectMealServiceFull(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_GROCERY_MEAL_FULL);
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

      test('With NO safety phone, NO grocery delivery service and partial meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectNoGroceryDeliveryService(page);
        await selectMealServicePartial(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_NO_GROCERY_MEAL_PARTIAL);
      });

      test('With NO safety phone, NO grocery delivery service and full meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await selectNoSafetyPhone(page);
        await selectNoGroceryDeliveryService(page);
        await selectMealServiceFull(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_NO_GROCERY_MEAL_FULL);
      });
    });
  });
});
