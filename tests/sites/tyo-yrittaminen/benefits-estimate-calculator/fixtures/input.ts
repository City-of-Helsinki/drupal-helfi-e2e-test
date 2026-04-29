import { test, type Page } from '@playwright/test';

const fillVacationMoney = (page: Page, value: string) =>
  test.step('Fill vacation money', async () => {
    await page.getByLabel('Lomaraha').fill(String(value));
  });

const fillMonthlyPay = (page: Page, value: string) =>
  test.step('Fill monthly pay', async () => {
    await page.getByLabel('Työntekijän tuleva bruttopalkka').fill(String(value));
  });

const selectPaySubsidyNotGranted = (page: Page) =>
  test.step('Select pay subsidy not granted', async () => {
    await page
      .getByText('Työsuhteeseen ei ole myönnetty tai haettu muuta tukea *', {
        exact: true,
      })
      .click();
  });

const selectCompanyTypeBusiness = (page: Page) =>
  test.step('Select business', async () => {
    await page.getByText('Työnantaja on yritys', { exact: true }).click({ force: true });
  });

const selectCompanyTypeAssociation = (page: Page) =>
  test.step('Select association', async () => {
    await page.getByText('Työnantaja on yhteisö', { exact: true }).click({ force: true });
  });

const checkAssociationHasBusinessActivities = (page: Page) =>
  test.step('Check association has business activities', async () => {
    await page.getByText('Yhteisö harjoittaa taloudellista toimintaa').isVisible();
    await page.getByText('Yhteisö harjoittaa taloudellista toimintaa', { exact: true }).click();
  });

export {
  fillVacationMoney,
  fillMonthlyPay,
  selectCompanyTypeBusiness,
  selectCompanyTypeAssociation,
  checkAssociationHasBusinessActivities,
  selectPaySubsidyNotGranted,
};
