import { expect, type Page, type TestInfo, test } from '@playwright/test';

const clickResultsButton = (page: Page) =>
  test.step('Click results button', async () => {
    await page.getByRole('button', { name: 'Laske arvio' }).click();
  });

const resultSelector = '.helfi-calculator__receipt-total__value';
const expectResult = (page: Page, result: string) =>
  test.step('Click results button', async () => {
    expect(await page.locator(resultSelector).textContent()).toBe(result);
  });

const testUnfilledFields = (page: Page) =>
  test.step('On submit, unfilled fields give an error', async () => {
    await clickResultsButton(page);

    // General error message should be visible.
    const errorMessage = page.getByLabel('Täytäthän puuttuvat tiedot.');
    expect(errorMessage.isVisible()).toBeTruthy();

    // Find all visible required fields and their error messages.
    const requiredFields = await page.locator('.input--required:visible').all();
    const requiredFieldMessages = await page
      .locator('.input--required .hdbt-error-text')
      .all();

    // Required fields should be marked as invalid.
    for (const requiredField of requiredFields) {
      await expect(requiredField).toContainClass('hds-text-input--invalid');
    }

    // Required fields should have error messages visible.
    for (const requiredFieldMessage of requiredFieldMessages) {
      await expect(requiredFieldMessage).toHaveText(
        /^(Kenttä|Valinta) on pakollinen\.$/,
      );
    }
  });

const skipUnpublished = async (
  page: Page,
  url: string,
  testInfo: TestInfo,
) => {
  const response = await page.goto(url, { waitUntil: 'networkidle' });

  if ((!response || !response.ok()) && response?.status() === 403) {
    testInfo.skip(true, 'The calculator page is unpublished. Access 403 - Skipping tests');
  }
};

const publishedBeforeEach = (url: string) =>
  async ({ page }: { page: Page }, testInfo: TestInfo) =>
    skipUnpublished(page, url, testInfo);

export { testUnfilledFields, clickResultsButton, expectResult, publishedBeforeEach };
