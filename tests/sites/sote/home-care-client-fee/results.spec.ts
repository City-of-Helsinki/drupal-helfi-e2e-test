import { test } from '@playwright/test';
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import { fillGrossIncomePerMonth, fillHouseholdSize, fillMonthlyUsage } from '../../../common/calculators/calculatorsInput';
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
      PHONE_GROCERY_NONE: '160,56',
      PHONE_GROCERY_4: '244,56',
      PHONE_GROCERY_7: '307,56',
      NO_PHONE_GROCERY_NONE: '124,88',
      NO_PHONE_GROCERY_4: '208,88',
      NO_PHONE_GROCERY_7: '271,88',
      NO_PHONE_NO_GROCERY_NONE: '83,28',
      NO_PHONE_NO_GROCERY_4: '167,28',
      NO_PHONE_NO_GROCERY_7: '230,28',
    },
  },
  {
    NAME: 'Medium',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '3000',
    MONTHLY_USAGE: '30',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '543,76',
      PHONE_GROCERY_4: '627,76',
      PHONE_GROCERY_7: '690,76',
      NO_PHONE_GROCERY_NONE: '472,40',
      NO_PHONE_GROCERY_4: '556,40',
      NO_PHONE_GROCERY_7: '619,40',
      NO_PHONE_NO_GROCERY_NONE: '430,80',
      NO_PHONE_NO_GROCERY_4: '514,80',
      NO_PHONE_NO_GROCERY_7: '577,80',
    },
  },
  {
    NAME: 'High',
    HOUSEHOLD_SIZE: '4',
    GROSS_INCOME_PER_MONTH: '7000',
    MONTHLY_USAGE: '50',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '858,88',
      PHONE_GROCERY_4: '942,88',
      PHONE_GROCERY_7: '1005,88',
      NO_PHONE_GROCERY_NONE: '787,52',
      NO_PHONE_GROCERY_4: '871,52',
      NO_PHONE_GROCERY_7: '934,52',
      NO_PHONE_NO_GROCERY_NONE: '745,92',
      NO_PHONE_NO_GROCERY_4: '829,92',
      NO_PHONE_NO_GROCERY_7: '892,92',
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
