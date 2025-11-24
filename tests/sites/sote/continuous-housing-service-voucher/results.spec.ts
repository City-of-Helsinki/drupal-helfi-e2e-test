import { test } from '@playwright/test';
import {
  clickResultsButton,
  expectResult,
  publishedBeforeEach,
} from '../../../common/calculators/calculatorsCommon';
import {
  fillNetIncomePerMonth,
  fillServiceProviderPrice,
} from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    NET_INCOME_PER_MONTH: '0',
    SERVICE_PROVIDER_PRICE: '120',
    RESULT: '350,00',
  },
  {
    NAME: 'Medium',
    NET_INCOME_PER_MONTH: '2000',
    SERVICE_PROVIDER_PRICE: '180',
    RESULT: '3275,00',
  },
  {
    NAME: 'High',
    NET_INCOME_PER_MONTH: '9000',
    SERVICE_PROVIDER_PRICE: '210',
    RESULT: '5887,50',
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(publishedBeforeEach(
  '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/ikaantyneiden-asumispalvelut/palveluasumisen-palvelusetelilaskuri',
));

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test('Fill in form and check results', async ({ page }) => {
      await fillNetIncomePerMonth(page, testCase.NET_INCOME_PER_MONTH);
      await fillServiceProviderPrice(page, testCase.SERVICE_PROVIDER_PRICE);
      await clickResultsButton(page);
      await expectResult(page, testCase.RESULT);
    });
  });
});
