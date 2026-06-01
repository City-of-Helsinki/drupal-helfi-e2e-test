import { test } from '@playwright/test';
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
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
      PHONE_GROCERY_NONE: '149,52',
      PHONE_GROCERY_MEAL_PARTIAL: '548,92',
      PHONE_GROCERY_MEAL_FULL: '681,92',
      NO_PHONE_GROCERY_NONE: '113,84',
      NO_PHONE_GROCERY_NONE_GUARDIANSHIP: '109,04',
      NO_PHONE_GROCERY_MEAL_FULL: '646,24',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '513,24',
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
      PHONE_GROCERY_NONE: '523,36',
      PHONE_GROCERY_MEAL_PARTIAL: '922,76',
      PHONE_GROCERY_MEAL_FULL: '1055,76',
      NO_PHONE_GROCERY_NONE: '452,00',
      NO_PHONE_GROCERY_NONE_GUARDIANSHIP: '442,40',
      NO_PHONE_GROCERY_MEAL_FULL: '984,40',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '851,40',
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
      PHONE_GROCERY_NONE: '832,48',
      PHONE_GROCERY_MEAL_PARTIAL: '1231,88',
      PHONE_GROCERY_MEAL_FULL: '1364,88',
      NO_PHONE_GROCERY_NONE: '761,12',
      NO_PHONE_GROCERY_NONE_GUARDIANSHIP: '756,32',
      NO_PHONE_GROCERY_MEAL_FULL: '1293,52',
      NO_PHONE_GROCERY_MEAL_PARTIAL: '1160,52',
      NO_PHONE_NO_GROCERY_NONE: '719,52',
      NO_PHONE_NO_GROCERY_MEAL_FULL: '1251,92',
      NO_PHONE_NO_GROCERY_MEAL_PARTIAL: '1118,92',
    },
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(
  publishedBeforeEach('/fi/sosiaali-ja-terveyspalvelut/asiakkaan-tiedot-ja-oikeudet/maksut/yhteisollisen-ja-tuetun-asumisen-asiakasmaksulaskuri'),
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

      test('With NO safety phone, grocery delivery service and NO meal service and guardianship fees', async ({
        page,
      }) => {
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
