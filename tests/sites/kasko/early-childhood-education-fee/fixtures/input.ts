import { expect, type Page, test } from '@playwright/test';

const addNextChildsInformation = (page: Page) =>
  test.step('Add next child´s information', async () => {
    await page.getByRole('button', { name: 'Lisää seuraavan lapsen tiedot' }).click();
  });

const fillGrossIncome = (page: Page, value: string) =>
  test.step("Fill family's gross monthly income", async () => {
    await page.getByLabel('Perheen bruttotulot kuukaudessa').fill(String(value));
  });

const fillRegularDaysOffPerMonth = (page: Page, child: number = 0, daycareType: number, value: string | number) =>
  test.step('Fill regular days off per month', async () => {
    const input = page.locator(`input[id^="daycare_type_${daycareType}_${child}_free_days_helfi"]`);
    await input.fill(String(value));
  });

const selectDaycareType = (page: Page, child: number, daycareType: number) =>
  test.step('Select daycare type', async () => {
    const label = page.locator(`label[for^="daycare_type_for_child_${child}_${daycareType}"]`);

    // As playwright click won't work for this case, we use evaluate to click the element.
    await label.evaluate((el) => {
      (el as HTMLElement).click();
    });
    await expect(label).toBeChecked();
  });

const selectDaycareTypeExtra = (page: Page, child: number, daycareType: number, daycareTypeExtra: boolean) =>
  test.step('Select daycare type extra', async () => {
    const input = page.locator(`input[id^="daycare_type_${daycareType}_${child}_has_preschool"]`);

    // As playwright click won't work for this case, we use evaluate to click the element.
    await input.setChecked(daycareTypeExtra);
    if (daycareTypeExtra) {
      await expect(input).toBeChecked();
    } else {
      await expect(input).not.toBeChecked();
    }
  });

const selectDaycareTime = (page: Page, child: number, daycareType: number, daycareTime: number) =>
  test.step('Select daycare time', async () => {
    const label = page.locator(`label[for^="daycare_type_${daycareType}_${child}_group_caretime_${daycareTime}"]`);

    // As playwright click won't work for this case, we use evaluate to click the element.
    await label.evaluate((el) => {
      (el as HTMLElement).click();
    });
    await expect(label).toBeChecked();
  });

export {
  addNextChildsInformation,
  fillGrossIncome,
  selectDaycareType,
  selectDaycareTypeExtra,
  selectDaycareTime,
  fillRegularDaysOffPerMonth,
};
