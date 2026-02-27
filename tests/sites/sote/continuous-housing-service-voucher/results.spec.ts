import { test } from '@playwright/test';
import { clickResultsButton, expectResult, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import { fillServiceProviderPrice } from '../../../common/calculators/calculatorsInput';
import { fillNetIncomePerMonth } from './fixtures/input';

const TEST_CASES = [
  {
    NAME: 'Low',
    NET_INCOME_PER_MONTH: '0',
    SERVICE_PROVIDER_PRICE: '120',
    RESULT: '119,00',
  },
  {
    NAME: 'Medium',
    NET_INCOME_PER_MONTH: '2000',
    SERVICE_PROVIDER_PRICE: '180',
    RESULT: '3121,00',
  },
  {
    NAME: 'High',
    NET_INCOME_PER_MONTH: '9000',
    SERVICE_PROVIDER_PRICE: '210',
    RESULT: '5852,50',
  },
];

test.describe.configure({ mode: 'parallel' });
test.beforeEach(
  publishedBeforeEach(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/ikaantyneiden-asumispalvelut/palveluasumisen-palvelusetelilaskuri',
  ),
);

TEST_CASES.forEach((testCase) => {
  test.describe(testCase.NAME, () => {
    test('Fill in form and check results', async ({ page }) => {
      await fillNetIncomePerMonth(page, testCase.NET_INCOME_PER_MONTH);
      await fillServiceProviderPrice(page, testCase.SERVICE_PROVIDER_PRICE, 'Palveluasumisen vuorokausihinta (euroa)');
      await clickResultsButton(page);
      await expectResult(page, testCase.RESULT);
    });
  });
});
