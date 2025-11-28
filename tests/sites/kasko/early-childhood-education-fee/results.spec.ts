import { test } from '@playwright/test';
import { cookieHandler } from '../../../../utils/handlers';
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import {
  addNextChildsInformation,
  fillGrossIncome,
  fillHouseHoldSize,
  fillRegularDaysOffPerMonth,
  selectDaycareTime,
  selectDaycareType,
  selectDaycareTypeExtra,
} from './fixtures/input';
import { type ChildDetails, type TestCase, testCases } from './fixtures/testCases';

test.beforeEach(
  publishedBeforeEach('/fi/kasvatus-ja-koulutus/varhaiskasvatus/varhaiskasvatusmaksut/varhaiskasvatusmaksun-laskuri'),
);

test.beforeEach(async ({ page }) => {
  await cookieHandler(page);
});

test.describe('Early childhood education fee', () => {
  testCases.forEach((testCase: TestCase) => {
    test.describe(testCase.NAME, () => {
      test('Fill in form and check results', async ({ page }) => {
        const children = Object.values(testCase.CHILDREN) as ChildDetails[];

        // Fill in household size and gross income.
        await fillHouseHoldSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncome(page, testCase.INCOME);

        // Fill in children information.
        await children.reduce<Promise<void>>(
          (chain, child, index) =>
            chain.then(async () => {
              if (index > 0) {
                await addNextChildsInformation(page);
              }
              await selectDaycareType(page, index + 1, child.DAYCARE_TYPE);
              await selectDaycareTime(page, index + 1, child.DAYCARE_TYPE, child.DAYCARE_CARE_TIME);

              // Other daycare types have regular days off.
              if (child.DAYCARE_TYPE < 4) {
                await fillRegularDaysOffPerMonth(page, index + 1, child.DAYCARE_TYPE, child.DAYCARE_FREE_DAYS);
              }
              // Only daycare type 4 has extra preschool flag.
              if (child.DAYCARE_TYPE === 4 && child.DAYCARE_TYPE_4_EXTRA !== undefined) {
                await selectDaycareTypeExtra(page, index + 1, child.DAYCARE_TYPE, child.DAYCARE_TYPE_4_EXTRA);
              }
            }),
          Promise.resolve(),
        );

        // Click on results button and check that results match with test cases.
        await clickResultsButton(page);
        await expectResult(page, testCase.PAYMENT);
      });
    });
  });
});
