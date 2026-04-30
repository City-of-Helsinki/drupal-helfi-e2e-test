import { test } from '@playwright/test';
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import {
  checkAssociationHasBusinessActivities,
  fillMonthlyPay,
  fillVacationMoney,
  selectCompanyTypeAssociation,
  selectCompanyTypeBusiness,
  selectPaySubsidyNotGranted,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    MONTLY_PAY: '400',
    VACATION_MONEY: '16',
    BUSINESS_ACTIVITIES: {
      NONE: '252,00',
    },
    ASSOCIATION: {
      NONE: '504,00',
    },
  },
  {
    NAME: 'Medium',
    MONTLY_PAY: '1000',
    VACATION_MONEY: '42',
    BUSINESS_ACTIVITIES: {
      NONE: '631,00',
    },
    ASSOCIATION: {
      NONE: '1262,00',
    },
  },
  {
    NAME: 'High',
    MONTLY_PAY: '2000',
    VACATION_MONEY: '88',
    BUSINESS_ACTIVITIES: {
      NONE: '1264,00',
    },
    ASSOCIATION: {
      NONE: '1500,00',
    },
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(
  publishedBeforeEach('/fi/yritykset-ja-tyo/tyonantajat/taloudellista-tukea-tyonantajalle/helsinki-lisan-laskuri'),
);

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test.describe('Business', () => {
      test('Fill in form and check results (none)', async ({ page }) => {
        await fillMonthlyPay(page, testCase.MONTLY_PAY);
        await fillVacationMoney(page, testCase.VACATION_MONEY);
        await selectCompanyTypeBusiness(page);
        await selectPaySubsidyNotGranted(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.BUSINESS_ACTIVITIES.NONE);
      });
    });

    test.describe('Association: business', () => {
      test('Fill in form and check results (none)', async ({ page }) => {
        await fillMonthlyPay(page, testCase.MONTLY_PAY);
        await fillVacationMoney(page, testCase.VACATION_MONEY);
        await selectCompanyTypeAssociation(page);
        await checkAssociationHasBusinessActivities(page);
        await selectPaySubsidyNotGranted(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.BUSINESS_ACTIVITIES.NONE);
      });
    });

    test.describe('Association', () => {
      test('Fill in form and check results (none)', async ({ page }) => {
        await fillMonthlyPay(page, testCase.MONTLY_PAY);
        await fillVacationMoney(page, testCase.VACATION_MONEY);
        await selectCompanyTypeAssociation(page);
        await selectPaySubsidyNotGranted(page);
        await clickResultsButton(page);
        await expectResult(page, testCase.ASSOCIATION.NONE);
      });
    });
  });
});
