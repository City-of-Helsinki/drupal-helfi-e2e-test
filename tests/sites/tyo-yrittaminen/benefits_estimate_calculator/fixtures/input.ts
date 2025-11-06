import { expect, test, type Page } from '@playwright/test';

const replaceValue = '${value}';
const PAY_SUBSIDY_PERCENTAGES = ['50', '70'];

const fillVacationMoney = (page: Page, value) =>
  test.step('Fill vacation money', async () => {
    await page.getByLabel('Lomaraha').fill(String(value));
  });

const fillMonthlyPay = (page: Page, value) =>
  test.step('Fill monthly pay', async () => {
    await page.getByLabel('Työntekijän tuleva bruttopalkka').fill(String(value));
  });

const selectPaySubsidyGranted = (page: Page) =>
  test.step('Select pay subsidy granted', async () => {
    await page.getByText('Palkkatuki tai 55 vuotta täyttäneiden työllistämistuki', { exact: true }).click();
  });

const selectPaySubsidyNotGranted = (page: Page) =>
  test.step('Select pay subsidy not granted', async () => {
    await page.getByText('Työsuhteeseen ei ole myönnetty tai haettu muuta tukea', { exact: true }).click();
  });

const selectPaySubsidyPercentageOption1 = (page: Page) =>
  test.step('Select pay subsidy percentage #1', async () => {
    await page
      .getByText(
        'Tuki kattaa ${value} % palkkauskustannuksista (tuen perusteena ammatillisen osaamisen parantaminen)'.replace(replaceValue, PAY_SUBSIDY_PERCENTAGES.at(0), {
          exact: true,
        }),
      )
      .click();
  });

const selectPaySubsidyPercentageOption2 = (page: Page) =>
  test.step('Select pay subsidy percentage #2', async () => {
    await page
      .getByText(
        'Tuki kattaa ${value} % palkkauskustannuksista (tuen perusteena alentunut työkyky tai 55 vuotta täyttäneiden työllistämistuki)'.replace(replaceValue, PAY_SUBSIDY_PERCENTAGES.at(1), {
          exact: true,
        }),
      )
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

const clickResultsButton = (page: Page) =>
  test.step('Click results button', async () => {
    await page.getByRole('button', { name: 'Laske arvio' }).click();
  });

const resultSelector = '.helfi-calculator__receipt-total__value';
const expectResult = (page: Page, result) =>
  test.step('Click results button', async () => {
    expect(await page.locator(resultSelector).textContent()).toBe(result);
  });

export {
  selectPaySubsidyPercentageOption1,
  selectPaySubsidyPercentageOption2,
  fillVacationMoney,
  fillMonthlyPay,
  selectCompanyTypeBusiness,
  selectCompanyTypeAssociation,
  checkAssociationHasBusinessActivities,
  selectPaySubsidyGranted,
  selectPaySubsidyNotGranted,
  clickResultsButton,
  expectResult,
};
