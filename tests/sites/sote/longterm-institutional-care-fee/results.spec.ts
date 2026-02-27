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
  selectSocialWelfareActYes,
  selectSocialWelfareActNo,
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
    },
    SPOUSE: {
      EARNED: '3000',
      BENEFITS: '600',
      CAPITAL: '0',
      FOREST: '1000',
      GUARDIANSHIP: '0',
      FORECLOSURE: '500',
      COMPENSATION: '0',
      MAINTENANCE: '500',
    },
    RESULT: {
      SOCIAL_WELFARE_YES_SPOUSE_YES: '1181,50',
      SOCIAL_WELFARE_NO_SPOUSE_YES: '1181,50',
      SOCIAL_WELFARE_YES_SPOUSE_NO: '1181,50',
      SOCIAL_WELFARE_NO_SPOUSE_NO: '1181,50',
    },
  },
  {
    NAME: 'Same income',
    CLIENT: {
      EARNED: '2000',
      BENEFITS: '300',
      CAPITAL: '0',
      FOREST: '1200',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
    },
    SPOUSE: {
      EARNED: '2000',
      BENEFITS: '300',
      CAPITAL: '0',
      FOREST: '1200',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
    },
    RESULT: {
      SOCIAL_WELFARE_YES_SPOUSE_YES: '1606,50',
      SOCIAL_WELFARE_NO_SPOUSE_YES: '1606,50',
      SOCIAL_WELFARE_YES_SPOUSE_NO: '1606,50',
      SOCIAL_WELFARE_NO_SPOUSE_NO: '1606,50',
    },
  },
  {
    NAME: 'Client high income',
    CLIENT: {
      EARNED: '20000',
      BENEFITS: '600',
      CAPITAL: '0',
      FOREST: '1000',
      GUARDIANSHIP: '0',
      FORECLOSURE: '0',
      COMPENSATION: '0',
      MAINTENANCE: '500',
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
    },
    RESULT: {
      SOCIAL_WELFARE_YES_SPOUSE_YES: '7656,00',
      SOCIAL_WELFARE_NO_SPOUSE_YES: '9073,75',
      SOCIAL_WELFARE_YES_SPOUSE_NO: '7656,00',
      SOCIAL_WELFARE_NO_SPOUSE_NO: '12045,00',
    },
  },
];

test.describe.configure({ mode: 'parallel' });

test.beforeEach(existsBeforeEach('/fi/sosiaali-ja-terveyspalvelut/pitkaaikaisen-laitoshoidon-asiakasmaksulaskuri'));

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
      }

      test('Social welfare act YES + spouse YES', async ({ page }) => {
        await fillClient(page);
        await selectSocialWelfareActYes(page);
        await selectHasSpouseYes(page);
        await fillSpouse(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.RESULT.SOCIAL_WELFARE_YES_SPOUSE_YES);
      });

      test('Social welfare act NO + spouse YES', async ({ page }) => {
        await fillClient(page);
        await selectSocialWelfareActNo(page);
        await selectHasSpouseYes(page);
        await fillSpouse(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.RESULT.SOCIAL_WELFARE_NO_SPOUSE_YES);
      });

      test('Social welfare act YES + spouse NO', async ({ page }) => {
        await fillClient(page);
        await selectSocialWelfareActYes(page);
        await selectHasSpouseNo(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.RESULT.SOCIAL_WELFARE_YES_SPOUSE_NO);
      });

      test('Social welfare act NO + spouse NO', async ({ page }) => {
        await fillClient(page);
        await selectSocialWelfareActNo(page);
        await selectHasSpouseNo(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.RESULT.SOCIAL_WELFARE_NO_SPOUSE_NO);
      });
    });
  });
});
