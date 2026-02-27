import { test } from '@playwright/test';
import { clickResultsButton, existsBeforeEach, expectResult } from '../../../common/calculators/calculatorsCommon';
import {
  fillHouseholdSize,
  fillGrossIncomePerMonth,
  fillMonthlyUsage,
} from '../../../common/calculators/calculatorsInput';
import {
  selectSafetyPhone,
  selectNoSafetyPhone,
  selectGroceryDeliveryService,
  selectNoGroceryDeliveryService,
  selectMealServiceFull,
  selectMealServicePartial,
  selectNoMealService,
  fillGuardianshipFees,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '1000',
    MONTHLY_USAGE: '20',
    GUARDIANSHIP_FEES: '20',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '146,84',
      PHONE_GROCERY_MEAL_PARTIAL: '546,24',
      PHONE_GROCERY_MEAL_FULL: '679,24',
      NO_PHONE_GROCERY_NONE: '111,16',
      NO_PHONE_GROCERY_NONE_GUARDIANSHIP: '106,36',
      NO_PHONE_GROCERY_MEAL_FULL: '643,56',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '510,56',
      NO_PHONE_NO_GROCERY_NONE: '72,24',
      NO_PHONE_NO_GROCERY_MEAL_FULL: '604,64',
      NO_PHONE_NO_GROCERY_MEAL_PARTIAL: '471,64',
    },
  },
  {
    NAME: 'Medium',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '3000',
    MONTHLY_USAGE: '30',
    GUARDIANSHIP_FEES: '40',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '520,68',
      PHONE_GROCERY_MEAL_PARTIAL: '920,08',
      PHONE_GROCERY_MEAL_FULL: '1053,08',
      NO_PHONE_GROCERY_NONE: '449,32',
      NO_PHONE_GROCERY_NONE_GUARDIANSHIP: '439,72',
      NO_PHONE_GROCERY_MEAL_FULL: '981,72',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '848,72',
      NO_PHONE_NO_GROCERY_NONE: '410,40',
      NO_PHONE_NO_GROCERY_MEAL_FULL: '942,80',
      NO_PHONE_NO_GROCERY_MEAL_PARTIAL: '809,80',
    },
  },
  {
    NAME: 'High',
    HOUSEHOLD_SIZE: '4',
    GROSS_INCOME_PER_MONTH: '7000',
    MONTHLY_USAGE: '50',
    GUARDIANSHIP_FEES: '30',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '829,80',
      PHONE_GROCERY_MEAL_PARTIAL: '1229,20',
      PHONE_GROCERY_MEAL_FULL: '1362,20',
      NO_PHONE_GROCERY_NONE: '758,44',
      NO_PHONE_GROCERY_NONE_GUARDIANSHIP: '753,64',
      NO_PHONE_GROCERY_MEAL_FULL: '1290,84',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '1157,84',
      NO_PHONE_NO_GROCERY_NONE: '719,52',
      NO_PHONE_NO_GROCERY_MEAL_FULL: '1251,92',
      NO_PHONE_NO_GROCERY_MEAL_PARTIAL: '1118,92',
    },
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(
  existsBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/yhteisollisen-ja-tuetun-asumisen-asiakasmaksun-laskuri',
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

      test('With NO safety phone, grocery delivery service and NO meal service and guardianship fees', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE, labelMonthlyUsage);
        await fillGuardianshipFees(page, testCase.GUARDIANSHIP_FEES);
        await selectNoSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectNoMealService(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_GROCERY_NONE_GUARDIANSHIP);
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
