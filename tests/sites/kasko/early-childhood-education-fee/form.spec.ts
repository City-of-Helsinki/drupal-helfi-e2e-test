import { expect, type Locator, type Page, test } from '@playwright/test';
import { clickResultsButton, publishedBeforeEach } from '../../../common/calculators/calculatorsCommon';
import { fillHouseholdSize } from '../../../common/calculators/calculatorsInput';
import { addNextChildsInformation } from './fixtures/input';

const expectVisible = async (locator: Locator) => {
  expect(locator.isVisible()).toBeTruthy();
};

const expectNotVisible = async (locator: Locator) => {
  await expect(locator).toBeHidden();
};

const fillRegularDaysOffPerMonth = (page: Page, value: string) => {
  test.step('Fill regular days off per month with off range value', async () => {
    // Get all the input fields within the selection groups.
    const inputs = page.locator('[data-slot-number] .hds-selection-group__items [name*="free_days"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      await input.waitFor({ state: 'visible' });
      await input.fill(value);
      // Add a small delay to ensure the form processes the input.
      await page.waitForTimeout(50);
    }
  });
};

test.beforeEach(
  publishedBeforeEach('/fi/kasvatus-ja-koulutus/varhaiskasvatus/varhaiskasvatusmaksut/varhaiskasvatusmaksun-laskuri'),
);

test('On submit, unfilled fields give an error', async ({ page }) => {
  // Add three child´s information sub forms.
  await addNextChildsInformation(page);
  await addNextChildsInformation(page);
  await addNextChildsInformation(page);

  // Submit the form to trigger the error messages.
  await clickResultsButton(page);

  // Check that all error links are visible.
  await expectVisible(page.getByLabel('Täytäthän puuttuvat tiedot'));
  await expectVisible(page.getByRole('link', { name: 'Perheen koko' }));
  const formsOfChildhoodEducation = page.getByRole('link', {
    name: 'Varhaiskasvatuksen muoto',
  });
  await expect(formsOfChildhoodEducation).toHaveCount(4);

  // Check that all error messages in sub forms are visible.
  const errorMessages = page.getByText('Valinta on pakollinen');
  await expect(errorMessages).toHaveCount(8);

  // Click on all "education on weekdays" radio input fields
  // in all child information sub forms.
  for (let i = 1; i <= 4; i++) {
    const slot = page.locator(`[data-slot-number="${i}"] .hds-selection-group__items`);
    const item = slot.locator('.hds-selection-group__item').nth(i - 1);
    await item.locator('label').click();
  }

  // Submit the form to trigger the sub form error messages.
  await clickResultsButton(page);

  // Check that new "education on weekdays" error message links are visible.
  const educationOnWeekdays = page.getByRole('link', {
    name: 'Hoitotunnit',
    exact: true,
  });
  await expect(educationOnWeekdays).toHaveCount(3);
  expect(
    page
      .getByRole('link', {
        name: 'Esiopetuksen ja varhaiskasvatuksen hoitotunnit yhteensä',
      })
      .isVisible(),
  ).toBeTruthy();

  // Add a household size.
  await fillHouseholdSize(page, '2', 'Perheen koko');

  // Submit the form to trigger the additional error messages.
  await clickResultsButton(page);

  // Check that new "household size" error message links are visible.
  await expectVisible(
    page.getByText('Lukumäärän pitäisi olla vähintään 5, jos samassa osoitteessa asuu aikuinen ja 4 lasta.', {
      exact: true,
    }),
  );
  await expectVisible(page.getByRole('link', { name: 'Perheen koko' }));
});

test('Household size must be two or more', async ({ page }) => {
  await fillHouseholdSize(page, '-1', 'Perheen koko');
  await clickResultsButton(page);
  await expectVisible(page.getByText('Arvon pitää olla 2 tai enemmän: Perheen koko.'));

  await fillHouseholdSize(page, '1', 'Perheen koko');
  await clickResultsButton(page);
  await expectVisible(page.getByText('Arvon pitää olla 2 tai enemmän: Perheen koko.'));

  await fillHouseholdSize(page, '3', 'Perheen koko');
  await clickResultsButton(page);
  await expectNotVisible(page.getByText('Arvon pitää olla 2 tai enemmän: Perheen koko.'));
});

test('Regular days off per month must be positive and in range, or empty', async ({ page }) => {
  // Add two child information sub forms.
  await addNextChildsInformation(page);
  await addNextChildsInformation(page);

  // Click on all "education on weekdays" radio input fields
  // in all child information sub forms.
  for (let i = 1; i <= 3; i++) {
    const slot = page.locator(`[data-slot-number="${i}"] .hds-selection-group__items`);
    const item = slot.locator('.hds-selection-group__item').nth(i - 1);
    await item.locator('label').click();
  }

  // Test to fill each regular days off per month with negative value.
  fillRegularDaysOffPerMonth(page, '-1');
  await clickResultsButton(page);
  await expectVisible(
    page.getByText('Arvon pitää olla väliltä 0 ja 12: Säännöllisiä vapaapäiviä kuukaudessa (päivää)'),
  );

  // Test to fill each regular days off per month with over range value.
  fillRegularDaysOffPerMonth(page, '12');
  await clickResultsButton(page);
  await expectVisible(
    page.getByText('Arvon pitää olla väliltä 0 ja 12: Säännöllisiä vapaapäiviä kuukaudessa (päivää)'),
  );

  // Test with acceptable values.
  // Test to fill each regular days off per month with acceptable value.
  fillRegularDaysOffPerMonth(page, '4');
  await clickResultsButton(page);
  await expectNotVisible(
    page.getByText('Arvon pitää olla väliltä 0 ja 12: Säännöllisiä vapaapäiviä kuukaudessa (päivää)'),
  );
});
