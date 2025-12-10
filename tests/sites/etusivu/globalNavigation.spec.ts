import { expect, type Page, test } from '@playwright/test';
import { fetchJsonApiRequest } from '../../../utils/fetchJsonApiRequest';
import type { GlobalMenuResponse } from './types/globalMenuResponseType';
import type { GlobalMenuItem, MenuLink } from './types/menuLinkType';

const viewports = [
  { label: 'mobile', width: 375, height: 812 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1280, height: 800 },
];

const languages: string[] = ['fi', 'sv', 'en'];

/**
 * Fetches the global mobile menu JSON for a given language.
 *
 * @param language - Language code (e.g. 'fi', 'sv', 'en').
 * @param baseURL - Base URL of the site under test.
 * @throws If the API is unreachable or returns an empty response.
 * @returns Parsed global menu API response.
 */
async function apiResponse(language: string, baseURL: string) {
  let response: GlobalMenuResponse;

  try {
    response = await fetchJsonApiRequest<GlobalMenuResponse>(
      baseURL,
      `/${language}/api/v1/global-mobile-menu`,
    );

    // Verify that the response contains at least one menu root.
    expect(Object.keys(response).length).toBeGreaterThan(0);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch menu items from /${language}/api/v1/global-mobile-menu. The API might be down or the endpoint is not accessible. Error: ${error.message}`,
      );
    }

    throw new Error(
      `Unknown error occurred while fetching global mobile menu data from ${baseURL}/${language}/api/v1/global-mobile-menu`,
    );
  }

  return response;
}

/**
 * Picks a single random item from a non-empty array.
 *
 * @param items - Array of items to pick from.
 * @throws If the array is empty.
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
 * Builds a random navigation chain starting from a given menu link.
 *
 * The function walks down through `sub_tree` picking a random child at each level
 * until either:
 *  - maxDepth is reached, or
 *  - a link without children is found.
 *
 * @param link - Root link to start from.
 * @param maxDepth - Maximum depth to follow from the root (Infinity for full depth).
 * @param currentDepth - Internal recursion counter, do not pass manually.
 * @returns Array of MenuLinks representing the navigation chain.
 */
const buildRandomLinkChainFromLink = (
  link: MenuLink,
  maxDepth: number,
  currentDepth = 0,
): MenuLink[] => {
  if (
    currentDepth >= maxDepth ||
    !link.sub_tree ||
    link.sub_tree.length === 0
  ) {
    return [link];
  }

  const child = getRandomArrayItem(link.sub_tree);

  return [
    link,
    ...buildRandomLinkChainFromLink(child, maxDepth, currentDepth + 1),
  ];
};

/**
 * Creates a random navigation chain from a menu item root.
 *
 * For 'mega' menus, the chain is at most two items (root + one child).
 * For 'mobile' menus, the chain can be arbitrarily deep.
 *
 * @param menuItem - A single root menu item from the API response.
 * @param type - Menu type, 'mega' or 'mobile'. Defaults to 'mobile'.
 * @throws If the menu tree is empty.
 * @returns Array of MenuLinks representing the navigation chain.
 */
export const getRandomLinkChainFromMenuItem = (
  menuItem: GlobalMenuItem,
  type: 'mega' | 'mobile' = 'mobile',
): MenuLink[] => {
  if (!menuItem.menu_tree.length) {
    throw new Error('menu_tree is empty');
  }

  const rootLink = getRandomArrayItem(menuItem.menu_tree);
  return buildRandomLinkChainFromLink(
    rootLink,
    type === 'mega' ? 1 : Infinity,
  );
};

/**
 * Tests the desktop mega menu by verifying that randomly selected links
 * from the API also exist in the rendered mega menu.
 *
 * @param page - Playwright page instance.
 * @param menuItems - Global menu items from the API.
 * @param viewportLabel - Label for the current viewport (e.g. 'desktop').
 */
const testMegaMenu = (
  page: Page,
  menuItems: GlobalMenuItem[],
  viewportLabel: string,
) =>
  test.step(`Test the mega menu for: ${viewportLabel}`, async () => {
    const megaMenu = page.locator(
      'nav.nav-toggle-dropdown .mega-and-mobilemenu .megamenu:not(.megamenu__subnav)',
    );

    await expect(megaMenu).toBeVisible();

    // Pick two random chains to test (root and possible child).
    const chainsToTest = [
      ...getRandomLinkChainFromMenuItem(
        getRandomArrayItem(menuItems),
        'mega',
      ),
      ...getRandomLinkChainFromMenuItem(
        getRandomArrayItem(menuItems),
        'mega',
      ),
    ];

    await test.step('Assert randomly selected mega menu links are visible', async () => {
      await Promise.all(
        chainsToTest.map(async (link: MenuLink) => {
          const anchor = page.locator(
            `a.megamenu__link[href="${link.url}"]`,
          );
          await expect(anchor).toBeVisible();
          await expect(
            anchor.locator('span.megamenu__link__text'),
          ).toHaveText(link.name);
        }),
      );
    });
  });

/**
 * Navigates the mobile menu downwards according to the given chain.
 *
 * For each item in the chain except the last one, this function:
 *  - clicks the corresponding `.mmenu__forward` button
 *  - asserts that the panel title matches the link (href + text)
 *
 * For the last item, it asserts that a corresponding `.mmenu__item-link`
 * exists in the current panel.
 *
 * @param page - Playwright page instance.
 * @param chain - Navigation chain as returned by getRandomLinkChainFromMenuItem().
 */
const navigateMobileMenuDown = async (page: Page, chain: MenuLink[]) => {
  if (!chain.length) {
    throw new Error('Cannot navigate an empty chain');
  }

  await test.step(
    `Navigate mobile menu down: ${chain.map((link) => link.name).join(' → ')}`,
    async () => {
      // If the chain has only a single item, just assert it exists in the current panel.
      if (chain.length === 1) {
        const leaf = chain[0];

        await test.step(`Assert single leaf item is visible: ${leaf.name}`, async () => {
          const leafLink = page.locator(
            `section.mmenu__panel--current a.mmenu__item-link[href="${leaf.url}"]`,
          );

          await expect(leafLink).toBeVisible();
          await expect(
            leafLink.locator('.mmenu__link__text'),
          ).toHaveText(leaf.name);
        });

        return;
      }

      // All items *except* the last – these will be clicked via .mmenu__forward.
      const pathToLeafParent = chain.slice(0, -1);
      const leaf = chain[chain.length - 1];

      await pathToLeafParent.reduce<Promise<void>>(
        async (previous, link) => {
          await previous;

          await test.step(`Open submenu: ${link.name}`, async () => {
            const forwardButton = page.locator(
              `section.mmenu__panel--current button.mmenu__forward[value="${link.id}"]`,
            );

            await forwardButton.click();

            const title = page.locator(
              'section.mmenu__panel--current .mmenu__title-link',
            );
            await expect(title).toHaveAttribute('href', link.url);
            await expect(
              title.locator('.mmenu__link__text'),
            ).toHaveText(link.name);
          });
        },
        Promise.resolve(),
      );

      // Now we should be on the parent panel of the leaf item.
      // The leaf itself should be rendered as `.mmenu__item-link`.
      await test.step(`Assert leaf item is visible: ${leaf.name}`, async () => {
        const leafItem = page.locator(
          `section.mmenu__panel--current a.mmenu__item-link[href="${leaf.url}"]`,
        );

        if (await leafItem.count()) {
          await expect(leafItem).toBeVisible();
          await expect(
            leafItem.locator('.mmenu__link__text'),
          ).toHaveText(leaf.name);
          return;
        }

        // Fallback: in some configurations the leaf may be the title link.
        const leafTitle = page.locator(
          'section.mmenu__panel--current .mmenu__title-link',
        );
        await expect(leafTitle).toHaveAttribute('href', leaf.url);
        await expect(
          leafTitle.locator('.mmenu__link__text'),
        ).toHaveText(leaf.name);
      });
    },
  );
};

/**
 * Navigates the mobile menu back up using the given chain.
 *
 * Starting from the deepest level (last item in the chain), this function:
 *  - clicks `.mmenu__back` to go one level up (for each step except the first),
 *  - asserts that the panel title matches the link (href + text).
 *
 * @param page - Playwright page instance.
 * @param chain - Navigation chain that was previously used to go down.
 */
const navigateMobileMenuUp = async (page: Page, chain: MenuLink[]) => {
  // If the chain was empty or only had a leaf (which we never opened as a panel),
  // there is nothing meaningful to navigate back through.
  if (chain.length <= 1) {
    return;
  }

  // We only navigated panels for all items *except* the leaf.
  const parents = chain.slice(0, -1);
  const reversed = [...parents].reverse();

  await test.step(
    `Navigate mobile menu up: ${reversed.map((link) => link.name).join(' ← ')}`,
    async () => {
      await reversed.reduce<Promise<void>>(
        async (previous, link, index) => {
          await previous;

          await test.step(
            index === 0
              ? `Assert deepest parent panel title: ${link.name}`
              : `Go back to: ${link.name}`,
            async () => {
              if (index > 0) {
                const backButton = page.locator(
                  'section.mmenu__panel--current button.mmenu__back',
                );
                await backButton.click();
              }

              const title = page.locator(
                'section.mmenu__panel--current .mmenu__title-link',
              );
              await expect(title).toHaveAttribute('href', link.url);
              await expect(
                title.locator('.mmenu__link__text'),
              ).toHaveText(link.name);
            },
          );
        },
        Promise.resolve(),
      );
    },
  );
};

/**
 * Tests the mobile menu by navigating a random chain from the API
 * and verifying that the corresponding links exist in the rendered menu.
 *
 * @param page - Playwright page instance.
 * @param menuItems - Global menu items from the API.
 * @param viewportLabel - Label for the current viewport (e.g. 'mobile', 'tablet').
 */
const testMobileMenu = (
  page: Page,
  menuItems: GlobalMenuItem[],
  viewportLabel: string,
) =>
  test.step(`Test the mobile menu for: ${viewportLabel}`, async () => {
    const mobileMenu = page.locator('nav.nav-toggle-dropdown .mmenu');

    await expect(mobileMenu).toBeVisible();

    const randomMenuItem = getRandomArrayItem(menuItems);
    const chain = getRandomLinkChainFromMenuItem(randomMenuItem, 'mobile');

    await navigateMobileMenuDown(page, chain);

    // Final leaf verification from the current panel list.
    const leaf = chain[chain.length - 1];

    await test.step(`Verify final leaf link in list: ${leaf.name}`, async () => {
      const leafAnchor = page.locator(
        `section.mmenu__panel--current a.mmenu__item-link[href="${leaf.url}"]`,
      );
      await expect(leafAnchor).toBeVisible();
      await expect(
        leafAnchor.locator('.mmenu__link__text'),
      ).toHaveText(leaf.name);
    });

    await navigateMobileMenuUp(page, chain);
  });

/**
 * Test suite for global navigation (mega + mobile menus) across languages and viewports.
 */
test.describe('Global navigation', () => {
  languages.forEach((language) => {
    test.describe(`Language: ${language}`, () => {
      let menuItems: GlobalMenuItem[] = [];

      test.beforeAll(async ({ baseURL }) => {
        if (typeof baseURL === 'undefined') {
          throw new Error('Base URL is undefined');
        }

        const response = await apiResponse(language, baseURL);
        menuItems = Object.values(response);

        if (!menuItems.length) {
          throw new Error('GlobalMenuResponse is empty');
        }
      });

      viewports.forEach(({ label, width, height }) => {
        test(`Navigation works on ${label} (${width}x${height})`, async ({ browser }) => {
          const context = await browser.newContext();
          const page = await context.newPage();

          await test.step(
            `Open front page for ${language} on ${label}`,
            async () => {
              await page.setViewportSize({ width, height });
              await page.goto(`/${language}`, { waitUntil: 'domcontentloaded' });
            },
          );

          const menuButton = page.locator('.nav-toggle--menu button.nav-toggle__button');
          await expect(menuButton).toBeVisible();
          await menuButton.click();

          if (label === 'desktop') {
            await expect(
              page.locator('nav.nav-toggle-dropdown .mega-and-mobilemenu'),
            ).toBeVisible();
            await testMegaMenu(page, menuItems, label);
          } else {
            await expect(
              page.locator('nav.nav-toggle-dropdown .mmenu .mmenu__panels'),
            ).toBeVisible();
            await testMobileMenu(page, menuItems, label);
          }

          await context.close();
        });
      });
    });
  });
});
