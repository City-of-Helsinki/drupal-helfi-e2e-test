import { test } from '@playwright/test';
import { testUnfilledFields } from '../../../common/calculators/calculatorsCommon';

test.beforeEach(async ({ page }) => {
  await page.goto(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/kotihoidon-asiakkaaksi/kotihoidon-palvelusetelilaskuri',
  );
});

test('Test unfilled fields', async ({ page }) => {
  await testUnfilledFields(page);
});