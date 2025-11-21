import { test } from '@playwright/test';
import { clickResultsButton, expectResult } from '../../../common/calculators/calculatorsCommon';
import {
  fillHouseholdSize,
  fillGrossIncomePerMonth,
  fillMonthlyUsage,
  selectSafetyPhone,
  selectNoSafetyPhone,
  selectGroceryDeliveryService,
  selectNoGroceryDeliveryService,
  selectMealService,
  selectNoMealService,
  fillMealServicePerWeek,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    HOUSEHOLD_SIZE: '1',
    GROSS_INCOME_PER_MONTH: '1000',
    MONTHLY_USAGE: '20',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '157,88',
      PHONE_GROCERY_4: '297,08',
      PHONE_GROCERY_7: '357,08',
      NO_PHONE_GROCERY_NONE: '122,20',
      NO_PHONE_GROCERY_4: '261,40',
      NO_PHONE_GROCERY_7: '321,40',
      NO_PHONE_NO_GROCERY_NONE: '83,28',
      NO_PHONE_NO_GROCERY_4: '222,48',
      NO_PHONE_NO_GROCERY_7: '282,48',
    },
  },
  {
    NAME: 'Medium',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '3000',
    MONTHLY_USAGE: '30',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '541,08',
      PHONE_GROCERY_4: '680,28',
      PHONE_GROCERY_7: '740,28',
      NO_PHONE_GROCERY_NONE: '469,72',
      NO_PHONE_GROCERY_4: '608,92',
      NO_PHONE_GROCERY_7: '668,92',
      NO_PHONE_NO_GROCERY_NONE: '430,80',
      NO_PHONE_NO_GROCERY_4: '570,00',
      NO_PHONE_NO_GROCERY_7: '630,00',
    },
  },{
    NAME: 'High',
    HOUSEHOLD_SIZE: '4',
    GROSS_INCOME_PER_MONTH: '7000',
    MONTHLY_USAGE: '50',
    MEAL_SERVICE: {
      PHONE_GROCERY_NONE: '856,20',
      PHONE_GROCERY_4: '995,40',
      PHONE_GROCERY_7: '1055,40',
      NO_PHONE_GROCERY_NONE: '784,84',
      NO_PHONE_GROCERY_4: '924,04',
      NO_PHONE_GROCERY_7: '984,04',
      NO_PHONE_NO_GROCERY_NONE: '745,92',
      NO_PHONE_NO_GROCERY_4: '885,12',
      NO_PHONE_NO_GROCERY_7: '945,12',
    },
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(async ({ page }) => {
  await page.goto(
    'fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/kotihoidon-asiakkaaksi/kotihoidon-asiakasmaksun-laskuri',
  );
});

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test.describe('Home care client fee', () => {
      test('With safety phone, grocery delivery service and NO meal service', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
        await selectSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectNoMealService(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.PHONE_GROCERY_NONE);
      });

      test('With safety phone, grocery delivery service and 4 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
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
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
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
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
        await selectNoSafetyPhone(page);
        await selectGroceryDeliveryService(page);
        await selectNoMealService(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_GROCERY_NONE);
      });

      test('With NO safety phone, grocery delivery service and 4 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
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
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
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
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
        await selectNoSafetyPhone(page);
        await selectNoGroceryDeliveryService(page);
        await selectNoMealService(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.MEAL_SERVICE.NO_PHONE_NO_GROCERY_NONE);
      });

      test('With NO safety phone, NO grocery delivery service and 4 meal services', async ({ page }) => {
        await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
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
        await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
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
