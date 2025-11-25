import { test } from '@playwright/test';
import { cookieHandler } from "../../../../utils/handlers";
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import {
  addNextChildsInformation,
  fillGrossIncome,
  fillHouseHoldSize,
  fillRegularDaysOffPerMonth,
  selectDaycareTime,
  selectDaycareType, selectDaycareTypeExtra,
} from './fixtures/input';
import { type ChildDetails, type TestCase, testCases } from './fixtures/testCases';

test.beforeEach(
  publishedBeforeEach(
  '/fi/kasvatus-ja-koulutus/varhaiskasvatus/varhaiskasvatusmaksut/varhaiskasvatusmaksun-laskuri',
));

test.beforeEach(async ({page}) => {
  await cookieHandler(page);
});

testCases.forEach((testCase: TestCase) => {
  test.describe('Early childhood education fee', () => {
    test.describe(testCase.NAME, () => {
      test('Fill in form and check results', async ({ page }) => {
        await fillHouseHoldSize(page, testCase.HOUSEHOLD_SIZE);
        await fillGrossIncome(page, testCase.INCOME);
        Object.values(testCase.CHILDREN).forEach((child:ChildDetails, index: number) => {
          if (index > 0) {
            addNextChildsInformation(page);
          }
          selectDaycareType(page, index + 1, child.DAYCARE_TYPE);
          selectDaycareTime(page, index + 1, child.DAYCARE_TYPE, child.DAYCARE_CARE_TIME);

          // Other daycare types have regular days off.
          if (child.DAYCARE_TYPE < 4) {
            fillRegularDaysOffPerMonth(page, index + 1, child.DAYCARE_TYPE, child.DAYCARE_FREE_DAYS);
          }
          // Only daycare type 4 has extra preschool flag.
          if (child.DAYCARE_TYPE === 4 && child.DAYCARE_TYPE_4_EXTRA !== undefined) {
            selectDaycareTypeExtra(page, index + 1, child.DAYCARE_TYPE, child.DAYCARE_TYPE_4_EXTRA);
          }
        });
        await clickResultsButton(page);
        await expectResult(page, testCase.PAYMENT);
      });
    });
  });
});
