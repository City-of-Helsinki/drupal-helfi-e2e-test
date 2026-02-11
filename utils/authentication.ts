import { expect, type Page } from '@playwright/test';

/**
 * Logs in to the site.
 *
 * @param page - Playwright Page object representing the browser page
 */
const login = async (page: Page) => {
  // Get username and password from environment variable.
  const user = process.env.DRUPAL_E2E_USER ?? null;
  if (!user) {
    throw new Error('DRUPAL_E2E_USER must be set');
  }

  let username = null;
  let password = null;

  try {
    // All double quotes are escaped to allow the json to pass through in
    // Azure DevOps without being parsed into ansible variables. We need to
    // unescape them before parsing.
    const userObject = JSON.parse(user.replace(/\\"/g, '"'));
    username = userObject.username;
    password = userObject.password;
  } catch {
    throw new Error('DRUPAL_E2E_USER must be a valid JSON object with "username" and "password" properties');
  }

  if (!username || !password) {
    throw new Error('Username or password is not set.');
  }

  // Navigate to login page and submit login form.
  await page.goto('/user/login');
  await page.locator('#edit-name').fill(username);
  await page.locator('#edit-pass').fill(password);
  await page.locator('#edit-submit').click();

  // Verify that the user is logged in.
  await expect(page.locator('a[data-drupal-link-system-path="user/logout"]')).toBeAttached();
};

/**
 * Logs out of the site.
 *
 * @param page - Playwright Page object representing the browser page
 */
const logout = async (page: Page) => {
  await page.goto('/user/logout');
  await page.locator('#edit-submit').click();

  // Verify that the user is logged out.
  await expect(page.locator('a[data-drupal-link-system-path="user/logout"]')).not.toBeAttached();
};

export { login, logout };
