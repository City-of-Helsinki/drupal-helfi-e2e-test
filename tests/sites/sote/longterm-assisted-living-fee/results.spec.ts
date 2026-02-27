import { type Page, test } from '@playwright/test';
import { clickResultsButton, existsBeforeEach, expectResult } from '../../../common/calculators/calculatorsCommon';
import {
  fillEarnedIncome,
  fillClientBenefits,
  fillCapitalIncome,
  fillAnnualForestIncome,
  fillGuardianshipFees,
  fillClientForeclosure,
  fillCompensationOrLifeAnnuity,
  fillMaintenancePayments,
  fillMedicationCosts,
  fillShareOfHousingCosts,
  selectHasSpouseYes,
  selectHasSpouseNo,
  fillSpouseEarnedIncome,
  fillSpouseClientBenefits,
  fillSpouseCapitalIncome,
  fillSpouseAnnualForestIncome,
  fillSpouseGuardianshipFees,
  fillSpouseClientForeclosure,
  fillSpouseCompensationOrLifeAnnuity,
  fillSpouseMaintenancePayments,
  fillSpouseMedicationCosts,
  fillSpouseShareOfHousingCosts,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Client low income',
    CLIENT: {
      EARNED: '1500',
      BENEFITS: '300',
      CAPITAL: '0',
      FOREST: '1200',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
      MEDICATION: '100',
      HOUSING: '200',
    },
    SPOUSE: {
      EARNED: '8000',
      BENEFITS: '600',
      CAPITAL: '0',
      FOREST: '1000',
      GUARDIANSHIP: '0',
      FORECLOSURE: '500',
      COMPENSATION: '0',
      MAINTENANCE: '500',
      MEDICATION: '200',
      HOUSING: '300',
    },
    RESULT: {
      SPOUSE_YES: '841,99',
      SPOUSE_NO: '841,99',
    },
  },
  {
    NAME: 'Same income',
    CLIENT: {
      EARNED: '3000',
      BENEFITS: '300',
      CAPITAL: '0',
      FOREST: '1200',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
      MEDICATION: '100',
      HOUSING: '200',
    },
    SPOUSE: {
      EARNED: '3000',
      BENEFITS: '300',
      CAPITAL: '0',
      FOREST: '1200',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
      MEDICATION: '100',
      HOUSING: '200',
    },
    RESULT: {
      SPOUSE_YES: '2156,44',
      SPOUSE_NO: '2156,44',
    },
  },
  {
    NAME: 'Client high income',
    CLIENT: {
      EARNED: '3000',
      BENEFITS: '600',
      CAPITAL: '0',
      FOREST: '1000',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
      MEDICATION: '200',
      HOUSING: '300',
    },
    SPOUSE: {
      EARNED: '1000',
      BENEFITS: '600',
      CAPITAL: '0',
      FOREST: '1000',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
      MEDICATION: '200',
      HOUSING: '300',
    },
    RESULT: {
      SPOUSE_YES: '1401,22',
      SPOUSE_NO: '2228,69',
    },
  },
  {
    NAME: 'Spouse no income',
    CLIENT: {
      EARNED: '1500',
      BENEFITS: '300',
      CAPITAL: '0',
      FOREST: '1200',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
      MEDICATION: '100',
      HOUSING: '200',
    },
    SPOUSE: {
      EARNED: '0',
      BENEFITS: '0',
      CAPITAL: '0',
      FOREST: '0',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '0',
      MEDICATION: '0',
      HOUSING: '0',
    },
    RESULT: {
      SPOUSE_YES: '263,56',
      SPOUSE_NO: '841,99',
    },
  },
];

test.describe.configure({ mode: 'parallel' });

test.beforeEach(
  existsBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/pitkaaikaisen-ymparivuorokautisen-palveluasumisen-asiakasmaksun-laskuri',
  ),
);

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test.describe('Long-term institutional care client fee', () => {
      async function fillClient(page: Page) {
        await fillEarnedIncome(page, testCase.CLIENT.EARNED);
        await fillClientBenefits(page, testCase.CLIENT.BENEFITS);
        await fillCapitalIncome(page, testCase.CLIENT.CAPITAL);
        await fillAnnualForestIncome(page, testCase.CLIENT.FOREST);
        await fillGuardianshipFees(page, testCase.CLIENT.GUARDIANSHIP);
        await fillClientForeclosure(page, testCase.CLIENT.FORECLOSURE);
        await fillCompensationOrLifeAnnuity(page, testCase.CLIENT.COMPENSATION);
        await fillMaintenancePayments(page, testCase.CLIENT.MAINTENANCE);
        await fillMedicationCosts(page, testCase.CLIENT.MEDICATION);
        await fillShareOfHousingCosts(page, testCase.CLIENT.HOUSING);
      }

      async function fillSpouse(page: Page) {
        await fillSpouseEarnedIncome(page, testCase.SPOUSE.EARNED);
        await fillSpouseClientBenefits(page, testCase.SPOUSE.BENEFITS);
        await fillSpouseCapitalIncome(page, testCase.SPOUSE.CAPITAL);
        await fillSpouseAnnualForestIncome(page, testCase.SPOUSE.FOREST);
        await fillSpouseGuardianshipFees(page, testCase.SPOUSE.GUARDIANSHIP);
        await fillSpouseClientForeclosure(page, testCase.SPOUSE.FORECLOSURE);
        await fillSpouseCompensationOrLifeAnnuity(page, testCase.SPOUSE.COMPENSATION);
        await fillSpouseMaintenancePayments(page, testCase.SPOUSE.MAINTENANCE);
        await fillSpouseMedicationCosts(page, testCase.SPOUSE.MEDICATION);
        await fillSpouseShareOfHousingCosts(page, testCase.SPOUSE.HOUSING);
      }

      test('spouse YES', async ({ page }) => {
        await fillClient(page);
        await selectHasSpouseYes(page);
        await fillSpouse(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.RESULT.SPOUSE_YES);
      });

      test('spouse NO', async ({ page }) => {
        await fillClient(page);
        await selectHasSpouseNo(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.RESULT.SPOUSE_NO);
      });
    });
  });
});
