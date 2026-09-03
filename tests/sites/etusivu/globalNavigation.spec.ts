import { expect, type Page, test } from '@playwright/test';
import { fetchJsonApiRequest } from '../../../utils/fetchJsonApiRequest';
import type { GlobalMenuResponse } from '../../common/types/globalMenuResponseType';
import { DEFAULT_LANGUAGES, type Langcode } from '../../common/types/languagesType';
import type { GlobalMenuItem, MenuLink } from '../../common/types/menuLinkType';
import { DEFAULT_VIEWPORTS } from '../../common/types/viewportsType';

/**
 * Fetches the global mobile menu JSON for a given language.
 *
 * @param language - Language code.
 * @param baseURL - Base URL of the site.
 * @throws error - If the API is unreachable or returns an empty response.
 * @returns Parsed global menu API response.
 */
async function apiResponse(language: string, baseURL: string) {
  let response: GlobalMenuResponse;

  try {
    response = await fetchJsonApiRequest<GlobalMenuResponse>(baseURL, `/${language}/api/v1/global-mobile-menu`);

    // Verify that the response contains at least one menu root.
    expect(Object.keys(response).length).toBeGreaterThan(0);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch menu items from ${baseURL}/${language}/api/v1/global-mobile-menu. Error: ${error.message}`,
      );
    }

    throw new Error(
      `Unknown error occurred while fetching global mobile menu data from ${baseURL}/${language}/api/v1/global-mobile-menu`,
    );
  }

  return response;
}

/**
 * Picks a single random item from an array.
 *
 * @param items - Array of items to pick from.
 * @throws error - If the array is empty.
 * @returns A single randomly selected item.
 */
const getRandomArrayItem = <T>(items: T[]): T => {
  if (!items.length) {
    throw new Error('Cannot pick random item from empty array');
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

/**
 * Builds a random navigation path starting from a given menu link.
 *
 * The function traverses down through the subtree by picking a random
 * child at each level until either maxDepth is reached or a link without
 * children is found.
 *
 * @param link - Root link to start from.
 * @param maxDepth - Maximum depth to follow from the root.
 * @param currentDepth - Internal recursion counter.
 * @returns Array of MenuLinks representing the navigation path.
 */
const buildNavigationPathFromLink = (link: MenuLink, maxDepth: number, currentDepth = 0): MenuLink[] => {
  // Return the link if the maximum depth is reached or there are no children.
  if (currentDepth >= maxDepth || !link.sub_tree || link.sub_tree.length === 0) {
    return [link];
  }

  // Pick a random child to traverse down to.
  const child = getRandomArrayItem(link.sub_tree);

  // Return the link and the navigation path from the child.
  return [link, ...buildNavigationPathFromLink(child, maxDepth, currentDepth + 1)];
};

/**
 * Creates a random navigation path from a menu item root.
 *
 * For megamenu, the path is max. two levels.
 * For mobile menus, the path can be deep.
 *
 * @param menuItem - A single root menu item from the API response.
 * @param type - Menu type, 'mega' or 'mobile'. Defaults to 'mobile'.
 * @throws error - If the menu tree is empty.
 * @returns Array of MenuLinks representing the navigation path.
 */
export const getRandomLinkPathFromMenuItem = (
  menuItem: GlobalMenuItem,
  type: 'mega' | 'mobile' = 'mobile',
): MenuLink[] => {
  if (!menuItem.menu_tree.length) {
    throw new Error('menu_tree is empty');
  }

  const rootLink = getRandomArrayItem(menuItem.menu_tree);
  return buildNavigationPathFromLink(rootLink, type === 'mega' ? 1 : Infinity);
};

/**
 * Tests the desktop mega menu by verifying that the links
 * from the API also exist in the rendered mega menu.
 *
 * @param page - Playwright page instance.
 * @param menuItems - Global menu items from the API.
 * @param viewportLabel - Label for the current viewport.
 */
const testMegaMenu = (page: Page, menuItems: GlobalMenuItem[], viewportLabel: string) =>
  test.step(`Test the mega menu for: ${viewportLabel}`, async () => {
    const megaMenu = page.locator('nav.nav-toggle-dropdown .mega-and-mobilemenu .megamenu:not(.megamenu__subnav)');

    await expect(megaMenu).toBeVisible();

    // Pick two random navigation paths to test.
    const pathsToTest = [
      ...getRandomLinkPathFromMenuItem(getRandomArrayItem(menuItems), 'mega'),
      ...getRandomLinkPathFromMenuItem(getRandomArrayItem(menuItems), 'mega'),
    ];

    await test.step('Assert the mega menu links are visible', async () => {
      await Promise.all(
        pathsToTest.map(async (link: MenuLink) => {
          const anchor = page.locator(`a.megamenu__link[href="${link.url}"]`);
          await expect(anchor).toBeVisible();
          await expect(anchor.locator('span.megamenu__link__text')).toHaveText(link.name);
        }),
      );
    });
  });

/**
 * Navigates the mobile menu downwards according to the given path.
 *
 * @param page - Playwright page instance.
 * @param path - Navigation path.
 */
const navigateMobileMenuDown = async (page: Page, path: MenuLink[]) => {
  if (!path.length) {
    throw new Error('Cannot navigate an empty path');
  }

  await test.step(`Navigate mobile menu down: ${path.map((link) => link.name).join(' → ')}`, async () => {
    // Handle case where path contains only a single panel.
    if (path.length === 1) {
      const panel = path[0];

      await test.step(`Assert single panel item is visible: ${panel.name}`, async () => {
        const panelLink = page.locator(`section.mmenu__panel--current a.mmenu__item-link[href="${panel.url}"]`);

        await expect(panelLink).toBeVisible();
        await expect(panelLink.locator('.mmenu__link__text')).toHaveText(panel.name);
      });

      return;
    }

    // Get all links from path except the last one.
    const pathToPanelParent = path.slice(0, -1);
    // Get the last link from path.
    const panel = path[path.length - 1];

    await pathToPanelParent.reduce<Promise<void>>(async (previous, link) => {
      await previous;

      await test.step(`Open submenu: ${link.name}`, async () => {
        const forwardButton = page.locator(`section.mmenu__panel--current button.mmenu__forward[value="${link.id}"]`);
        await forwardButton.click();

        // Assert that panel title matches current link.
        const title = page.locator('section.mmenu__panel--current .mmenu__title-link');
        await expect(title).toHaveAttribute('href', link.url);
        await expect(title.locator('.mmenu__link__text')).toHaveText(link.name);
      });
    }, Promise.resolve());

    // The current panel should contain the final panel from the path.
    await test.step(`Assert panel item is visible: ${panel.name}`, async () => {
      // Try locating the panel link inside list items.
      const panelItem = page.locator(`section.mmenu__panel--current a.mmenu__item-link[href="${panel.url}"]`);

      // If found in the list, assert visibility and text.
      if (await panelItem.count()) {
        await expect(panelItem).toBeVisible();
        await expect(panelItem.locator('.mmenu__link__text')).toHaveText(panel.name);
        return;
      }

      // If the panel link is not in the list, it must be the title link.
      const panelTitle = page.locator('section.mmenu__panel--current .mmenu__title-link');
      await expect(panelTitle).toHaveAttribute('href', panel.url);
      await expect(panelTitle.locator('.mmenu__link__text')).toHaveText(panel.name);
    });
  });
};

/**
 * Navigates the mobile menu back up using the given path.
 *
 * Starting from the deepest level (last item in the path), this function:
 *  - clicks `.mmenu__back` to go one level up (for each step except the first),
 *  - asserts that the panel title matches the link (href + text).
 *
 * @param page - Playwright page instance.
 * @param path - Navigation path that was previously used to go down.
 */
const navigateMobileMenuUp = async (page: Page, path: MenuLink[]) => {
  // If the path has only one item, we cannot navigate up.
  if (path.length <= 1) {
    return;
  }

  // Get all links from path except the last one.
  const parents = path.slice(0, -1);
  // Reverse the path to navigate up.
  const reversed = [...parents].reverse();

  await test.step(`Navigate mobile menu up: ${reversed.map((link) => link.name).join(' ← ')}`, async () => {
    await reversed.reduce<Promise<void>>(async (previous, link, index) => {
      await previous;

      await test.step(
        index === 0 ? `Assert deepest parent panel title: ${link.name}` : `Go back to: ${link.name}`,
        async () => {
          if (index > 0) {
            const backButton = page.locator('section.mmenu__panel--current button.mmenu__back');
            await backButton.click();
          }

          const title = page.locator('section.mmenu__panel--current .mmenu__title-link');
          await expect(title).toHaveAttribute('href', link.url);
          await expect(title.locator('.mmenu__link__text')).toHaveText(link.name);
        },
      );
    }, Promise.resolve());
  });
};

/**
 * Tests the mobile menu by navigating a random path from the API.
 *
 * @param page - Playwright page instance.
 * @param menuItems - Global menu items from the API.
 * @param viewportLabel - Label for the current viewport.
 */
const testMobileMenu = (page: Page, menuItems: GlobalMenuItem[], viewportLabel: string) =>
  test.step(`Test the mobile menu for: ${viewportLabel}`, async () => {
    const mobileMenu = page.locator('nav.nav-toggle-dropdown .mmenu');

    await expect(mobileMenu).toBeVisible();

    // Pick a random menu from the API response and generate a path for it.
    const randomMenuItem = getRandomArrayItem(menuItems);
    const path = getRandomLinkPathFromMenuItem(randomMenuItem, 'mobile');

    // Navigate down the path.
    await navigateMobileMenuDown(page, path);

    // Get the final panel from the path.
    const panel = path[path.length - 1];

    await test.step(`Verify final panel link in list: ${panel.name}`, async () => {
      const panelAnchor = page.locator(`section.mmenu__panel--current a.mmenu__item-link[href="${panel.url}"]`);
      await expect(panelAnchor).toBeVisible();
      await expect(panelAnchor.locator('.mmenu__link__text')).toHaveText(panel.name);
    });

    // Navigate up the path.
    await navigateMobileMenuUp(page, path);
  });

/**
 * Test suite for global navigation (mega + mobile menus) across languages and viewports.
 */
test.describe('Global navigation', () => {
  DEFAULT_LANGUAGES.forEach((language: Langcode) => {
    test.describe(`Language: ${language}`, () => {
      let menuItems: GlobalMenuItem[] = [];

      test.beforeAll(async ({ baseURL }) => {
        if (typeof baseURL === 'undefined') {
          throw new Error('Base URL is undefined');
        }

        const response = await apiResponse(language, baseURL);

        // Filter out "etusivu" link from the response.
        const { etusivu: _, ...rest } = response;
        menuItems = Object.values(rest);

        if (!menuItems.length) {
          throw new Error('GlobalMenuResponse is empty');
        }
      });

      DEFAULT_VIEWPORTS.forEach(({ label, width, height }) => {
        test(`Navigation works on ${label} (${width}x${height})`, async ({ browser }) => {
          const context = await browser.newContext();
          const page = await context.newPage();

          await test.step(`Open front page for ${language} on ${label}`, async () => {
            await page.setViewportSize({ width, height });
            await page.goto(`/${language}`, { waitUntil: 'domcontentloaded' });
          });

          // Open the menu.
          const menuButton = page.locator('.nav-toggle--menu button.nav-toggle__button');
          await expect(menuButton).toBeVisible();
          await menuButton.click();

          // Test mega menu on desktop.
          if (label === 'desktop') {
            await expect(page.locator('nav.nav-toggle-dropdown .mega-and-mobilemenu')).toBeVisible();
            await testMegaMenu(page, menuItems, label);
          }
          // Test mobile menu on mobile and tablet.
          else {
            await expect(page.locator('nav.nav-toggle-dropdown .mmenu .mmenu__panels')).toBeVisible();
            await testMobileMenu(page, menuItems, label);
          }

          await context.close();
        });
      });
    });
  });
});
