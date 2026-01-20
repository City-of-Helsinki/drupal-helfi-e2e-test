import { expect, test, type Page, type Locator } from '@playwright/test';

async function selectRadioOption(group: Locator, option: 'yes' | 'no') {
  await group.waitFor({ state: 'visible' });

  const labelText = option === 'yes' ? 'Kyllä' : 'Ei';
  const label = group.locator('label', { hasText: labelText });

  await expect(label).toBeVisible();
  await label.click();

  const input =
    option === 'yes' ? group.locator('input[type="radio"]').first() : group.locator('input[type="radio"]').last();

  await expect(input).toBeChecked();
}

const fillEarnedIncome = (page: Page, value: string) =>
  test.step('Fill earned income', async () => {
    await page.getByLabel('Ansiotulot (euroa)', { exact: true }).fill(String(value));
  });

const fillClientBenefits = (page: Page, value: string) =>
  test.step('Fill client benefits', async () => {
    await page.getByLabel('Etuudet (euroa)', { exact: true }).fill(String(value));
  });

const fillCapitalIncome = (page: Page, value: string) =>
  test.step('Fill capital income', async () => {
    await page.getByLabel('Pääomatulot (euroa)', { exact: true }).fill(String(value));
  });

const fillAnnualForestIncome = (page: Page, value: string) =>
  test.step('Fill annual forest income', async () => {
    await page.getByLabel('Metsän vuotuinen tuotto (euroa)', { exact: true }).fill(String(value));
  });

const fillGuardianshipFees = (page: Page, value: string) =>
  test.step('Fill guardianship fees', async () => {
    await page.getByLabel('Edunvalvontamaksut (euroa)', { exact: true }).fill(String(value));
  });

const fillClientForeclosure = (page: Page, value: string) =>
  test.step('Fill client foreclosure', async () => {
    await page.getByLabel('Ulosmittaus (euroa)', { exact: true }).fill(String(value));
  });

const fillCompensationOrLifeAnnuity = (page: Page, value: string) =>
  test.step('Fill compensation or life annuity', async () => {
    await page.getByLabel('Hyvitys tai syytinki (euroa)', { exact: true }).fill(String(value));
  });

const fillMaintenancePayments = (page: Page, value: string) =>
  test.step('Fill maintenance payments', async () => {
    await page.getByLabel('Elatusapu (euroa)', { exact: true }).fill(String(value));
  });

  const selectSocialWelfareActYes = (page: Page) =>
  test.step('Select social welfare act: yes', async () => {
    const group = page.getByRole('group', {
      name: 'Kyseessä on sosiaalihuoltolain mukainen palvelu',
    });

    await selectRadioOption(group, 'yes');
  });

const selectSocialWelfareActNo = (page: Page) =>
  test.step('Select social welfare act: no', async () => {
    const group = page.getByRole('group', {
      name: 'Kyseessä on sosiaalihuoltolain mukainen palvelu',
    });

    await selectRadioOption(group, 'no');
  });

  const selectHasSpouseYes = (page: Page) =>
  test.step('Select has spouse: yes', async () => {
    const group = page.getByRole('group', {
      name: 'Onko sinulla puoliso ',
    });

    await selectRadioOption(group, 'yes');
  });

const selectHasSpouseNo = (page: Page) =>
  test.step('Select has spouse: no', async () => {
    const group = page.getByRole('group', {
      name: 'Onko sinulla puoliso ',
    });

    await selectRadioOption(group, 'no');
  });

  const fillSpouseEarnedIncome = (page: Page, value: string) =>
  test.step('Fill spouse earned income', async () => {
    await page.getByLabel('Puolison ansiotulot (euroa)', { exact: true }).fill(String(value));
  });

const fillSpouseClientBenefits = (page: Page, value: string) =>
  test.step('Fill spouse client benefits', async () => {
    await page.getByLabel('Puolison etuudet (euroa)', { exact: true }).fill(String(value));
  });

const fillSpouseCapitalIncome = (page: Page, value: string) =>
  test.step('Fill spouse capital income', async () => {
    await page.getByLabel('Puolison pääomatulot (euroa)', { exact: true }).fill(String(value));
  });

const fillSpouseAnnualForestIncome = (page: Page, value: string) =>
  test.step('Fill spouse annual forest income', async () => {
    await page.getByLabel('Puolison metsän vuotuinen tuotto (euroa)', { exact: true }).fill(String(value));
  });

  const fillSpouseGuardianshipFees = (page: Page, value: string) =>
  test.step('Fill spouse guardianship fees', async () => {
    await page.getByLabel('Puolison edunvalvontamaksut (euroa)', { exact: true }).fill(String(value));
  });

const fillSpouseClientForeclosure = (page: Page, value: string) =>
  test.step('Fill spouse foreclosure', async () => {
    await page.getByLabel('Puolison ulosmittaus (euroa)', { exact: true }).fill(String(value));
  });

const fillSpouseCompensationOrLifeAnnuity = (page: Page, value: string) =>
  test.step('Fill spouse compensation or life annuity', async () => {
    await page.getByLabel('Puolison hyvitys tai syytinki (euroa)', { exact: true }).fill(String(value));
  });

const fillSpouseMaintenancePayments = (page: Page, value: string) =>
  test.step('Fill spouse maintenance payments', async () => {
    await page.getByLabel('Puolison elatusapu (euroa)', { exact: true }).fill(String(value));
  });

  export {
  fillEarnedIncome,
  fillClientBenefits,
  fillCapitalIncome,
  fillAnnualForestIncome,
  fillGuardianshipFees,
  fillClientForeclosure,
  fillCompensationOrLifeAnnuity,
  fillMaintenancePayments,
  selectSocialWelfareActYes,
  selectSocialWelfareActNo,
  selectHasSpouseYes,
  selectHasSpouseNo,
  fillSpouseEarnedIncome,
  fillSpouseClientBenefits,
  fillSpouseCapitalIncome,
  fillSpouseAnnualForestIncome,
  fillSpouseGuardianshipFees,
  fillSpouseClientForeclosure,
  fillSpouseCompensationOrLifeAnnuity,
  fillSpouseMaintenancePayments,
};
