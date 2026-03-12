import path from 'node:path';
import type { Page } from '@playwright/test';
import { sites } from '../sites.config';
import { logger } from './logger';

/**
 * Handles cookie consent banner acceptance.
 *
 * This function waits for and clicks the 'Accept all cookies' button
 * in the HDS (Helsinki Design System) cookie consent banner.
 *
 * @param page - Playwright Page object representing the browser page
 */
const cookieHandler = async (page: Page) => {
  try {
    // Wait for the cookie banner to appear in the DOM.
    await page.waitForSelector('.hds-cc--banner', {
      state: 'attached',
      timeout: 5000,
    });

    // Locate and wait for the accept all cookies button.
    const agreeButton = page.locator('.hds-cc__all-cookies-button');
    await agreeButton.waitFor({ state: 'attached' });

    // Click the button to accept all cookies.
    await agreeButton.click();
  } catch (error) {
    // Log if no cookie banner is found.
    logger(`No cookie banner found: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Disables the survey dialog by setting a cookie.
 *
 * This prevents the survey dialog from appearing during tests,
 * ensuring consistent test execution.
 */
const dialogHandler = async (page: Page) => {
  try {
    // Set 'helfi_no_survey' cookie to disable survey dialog
    await page.context().addCookies([
      {
        name: 'helfi_no_survey',
        value: '1',
        domain: new URL(page.url()).hostname,
        path: '/',
        httpOnly: false,
      },
    ]);
  } catch (error) {
    logger(`Failed to set survey cookie: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get local base URL from a direct CLI run like:
 *   npx playwright test tests/sites/sote/.../*.spec.ts
 *   npx playwright test --project=sote
 *
 * Returns the base URL of the site or null.
 */
const getLocalBaseURL = (): string | null => {
  if (!process.env.ETUSIVU_BASE_URL?.includes('docker.so') || !process.env.BASE_URL?.includes('docker.so')) {
    return null;
  }

  // Convert path separators to forward slashes.
  const argv = process.argv.map((arg) => arg.split(path.sep).join('/'));

  // Find any CLI argument that contains tests/sites/<site>/.
  const matchArg = argv.find((arg) => arg.includes('tests/sites/'));
  let siteName = null;

  // Try to get site name from CLI argument.
  if (matchArg) {
    const match = matchArg.match(/tests\/sites\/([^/]+)(\/|$)/);
    siteName = match ? match[1] : null;
  }
  // Try to get site name from --project CLI argument.
  else {
    siteName = getProjectFromArgv();
  }

  // If no site name was found, return null.
  if (!siteName) {
    return null;
  }

  // Find site configuration.
  const siteConfig = sites.find((site) => site.name === siteName) ?? null;

  // If no site configuration was found, return null.
  if (!siteConfig) {
    return null;
  }
  const envVariable = `${siteConfig?.envPrefix}_BASE_URL`;

  // Return the environment variable if it exists.
  if (process.env[envVariable]) {
    return process.env[envVariable];
  }
  return null;
};

/**
 * Get project name from CLI arguments.
 */
const getProjectFromArgv = (): string | null => {
  const argv = process.argv;

  // Handle: --project=common
  const equalsForm = argv.find((arg) => arg.startsWith('--project='));
  if (equalsForm) {
    return equalsForm.split('=')[1] ?? null;
  }

  // Handle: --project common
  const index = argv.indexOf('--project');
  if (index !== -1 && argv[index + 1]) {
    return argv[index + 1];
  }

  return null;
};

export { cookieHandler, dialogHandler, getLocalBaseURL };
