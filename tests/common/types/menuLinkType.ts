/**
 * Type definition for MenuLinkAttributes.
 */
export type MenuLinkAttributes = Record<string, string | boolean> | [];

/**
 * Type definition for MenuLink.
 */
export interface MenuLink {
  url: string;
  id: string;
  name: string;
  external: boolean;
  weight: number;
  // Optional fields appear only on some items.
  parentId?: string;
  attributes: MenuLinkAttributes;
  hasItems?: boolean;
  expanded?: boolean;
  parents?: string[];
  sub_tree?: MenuLink[];
}

/**
 * Type definition for GlobalMenuItem.
 */
export interface GlobalMenuItem {
  menu_tree: MenuLink[];
}
