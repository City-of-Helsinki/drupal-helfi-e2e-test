import { expect, test } from '@playwright/test';
import { clickResultsButton } from './fixtures/input';

test.beforeEach(async ({ page }) => {
  await page.goto(
    '/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/ikaantyneiden-asumispalvelut/palveluasumisen-palvelusetelilaskuri',
  );
});

test('On submit, unfilled fields give an error', async ({ page }) => {
  await clickResultsButton(page);

  expect(await page.getByLabel('Virheilmoitus').isVisible());
  expect(
    await page
      .getByRole('link', { name: 'Hakijan nettotulot kuukaudessa (euroa)' })
      .isVisible(),
  );
  expect(
    await page
      .getByRole('link', { name: 'Palveluasumisen vuorokausihinta (euroa)' })
      .isVisible(),
  );
});
