import { test } from '@playwright/test';
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import { fillHouseholdSize, fillGrossIncomePerMonth, fillMonthlyUsage } from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    HOUSEHOLD_SIZE: '2',
    GROSS_INCOME_PER_MONTH: '2000',
    MONTHLY_USAGE: '5',
    RESULT: '15,90',
  },
  {
    NAME: 'Medium',
    HOUSEHOLD_SIZE: '3',
    GROSS_INCOME_PER_MONTH: '4500',
    MONTHLY_USAGE: '10',
    RESULT: '78,27',
  },
  {
    NAME: 'High',
    HOUSEHOLD_SIZE: '6',
    GROSS_INCOME_PER_MONTH: '8000',
    MONTHLY_USAGE: '23',
    RESULT: '284,94',
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(
  publishedBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/tukea-lapselle-nuorelle-ja-perheelle/varhaisen-tuen-sosiaalipalvelut/lapsiperheiden-kotipalvelu/lapsiperheiden-kotipalvelun-asiakasmaksulaskuri',
  ),
);

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test('Fill in form and check results', async ({ page }) => {
      await fillHouseholdSize(page, testCase.HOUSEHOLD_SIZE);
      await fillGrossIncomePerMonth(page, testCase.GROSS_INCOME_PER_MONTH);
      await fillMonthlyUsage(page, testCase.MONTHLY_USAGE);
      await clickResultsButton(page);
      await expectResult(page, testCase.RESULT);
    });
  });
});
