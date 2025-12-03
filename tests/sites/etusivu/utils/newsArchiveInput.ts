import { expect, test, type Page } from '@playwright/test';

// Helper function for the dropdowns on news archive page.
async function fillDropdown(page: Page, selector: string, values: string[]) {
  const dropdownButton = page.locator(`.hdbt-search--react__dropdown-filters > *:nth-child(${selector}) button[role="combobox"]`);

  // Open the dropdown.
  await dropdownButton.click();
  await expect(page.getByRole('listbox')).toBeVisible();

  // Select options
  for (const value of values) {
    const option = page.locator(`.hdbt-search--react__dropdown-filters > *:nth-child(${selector}) li[aria-label="${value}"]`);
    
    // As playwright click won't work for this case, we use evaluate to click the element.
    await option.evaluate((el) => {
      (el as HTMLElement).click();
    });
    
    await expect(option).toHaveAttribute('aria-selected', 'true');
  }

  // Close the dropdown.
  await dropdownButton.click();
  await expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
}

const fillTextFilter = async (page: Page, value: string) =>
  await test.step('Fill text filter', async () => {
    await page.getByLabel('Hakusana').fill(String(value));
  });

const fillTopics = async (page: Page, values: string[]) =>
  await test.step('Fill topics', async () => {
    await fillDropdown(page, '1', values);
  });

const fillCityDistricts = async (page: Page, values: string[]) =>
  await test.step('Fill city districts', async () => {
    await fillDropdown(page, '2', values);
  });

const fillTargetGroups = async (page: Page, values: string[]) =>
  await test.step('Fill target groups', async () => {
    await fillDropdown(page, '3', values);
  });

const clickSubmitButton = async (page: Page) =>
  await test.step('Click submit button', async () => {
    await page.getByRole('button', { name: 'Etsi' }).click();
  });

// All the test cases expect more than one result.
const resultSelector = '.hdbt-search--react__results--title';
const expectResult = async (page: Page) =>
  await test.step('Check the results', async () => {
    // Get the current results text before waiting for changes
    const initialText = await page.locator(resultSelector).textContent() || '';
    
    // Wait for the results to change
    await page.waitForFunction(
      ({ selector, initialText }) => {
        const resultElement = document.querySelector(selector);
        if (!resultElement) return false;
        const currentText = resultElement.textContent || '';
        return currentText !== initialText && currentText.includes('hakutulosta');
      },
      { selector: resultSelector, initialText }
    );

    // Now get the actual result text and verify
    const resultText = await page.locator(resultSelector).textContent();
    const numberMatch = resultText?.match(/(\d+)/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1], 10);
      expect(number).toBeGreaterThan(1);
    } else {
      throw new Error('0 results or no number at all found in the result text.');
    }
  });

export {
  fillTextFilter,
  fillTopics,
  fillCityDistricts,
  fillTargetGroups,
  clickSubmitButton,
  expectResult,
};