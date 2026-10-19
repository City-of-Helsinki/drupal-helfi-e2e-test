import { expect, type Locator, type Page, test } from '@playwright/test';
import { cookieHandler, dialogHandler } from './handlers';
import {
  createTestEmail,
  deleteMessages,
  getMessage,
  isMailpitConfigured,
  type MailpitMessage,
  searchMessages,
  waitForMessage,
} from './mailpit';

type HakuvahtiTestOptions = {
  /** Title of the test.describe block. */
  title: string;
  /** Prefix for the generated test email address. */
  emailPrefix: string;
  /** Path of the search page. */
  path: string;
  /** Selector of the search app root element. */
  rootSelector: string;
  /** Waits until the search results are rendered. */
  waitForResults: (root: Locator) => Promise<void>;
  /** Sets search criteria before opening the search monitor dialog. */
  beforeSubscribe?: (page: Page, root: Locator) => Promise<void>;
  /** Site-specific interactions and assertions inside the search monitor dialog. */
  fillDialog?: (dialog: Locator) => Promise<void>;
  /** Extra assertions for the confirmation email. */
  checkEmail?: (message: MailpitMessage) => void;
  texts: {
    /** Dialog header after submitting the subscription. */
    almostDone: string;
    /** Subject of the confirmation email. */
    subject: string;
    /** Name of the confirm link in the confirmation email. */
    confirmLink: string;
    /** Heading on the confirm page. */
    confirmed: string;
    /** Heading on the unsubscribe page. */
    removed: string;
  };
};

/**
 * Registers a test for subscribing to, confirming and unsubscribing from Hakuvahti.
 */
const hakuvahtiTest = (options: HakuvahtiTestOptions) => {
  const { texts } = options;

  test.describe(options.title, () => {
    test.skip(!isMailpitConfigured(), 'MAILPIT_URL is not set');

    const email = createTestEmail(options.emailPrefix);

    test.afterEach(async () => {
      const messages = await searchMessages(email);
      await deleteMessages(messages.map((message) => message.ID));
    });

    test('Subscribe and confirm via email', async ({ page }) => {
      await page.goto(options.path);
      await cookieHandler(page);
      await dialogHandler(page);

      const root = page.locator(options.rootSelector);
      await options.waitForResults(root);
      await options.beforeSubscribe?.(page, root);

      // Open the search monitor dialog and subscribe.
      await root.locator('button.hdbt-search__search-monitor__button').click();
      const dialog = page.locator('#hdbt-search__search-monitor__content');
      await options.fillDialog?.(dialog);
      await dialog.locator('#hdbt-search__search-monitor__email').fill(email);
      await dialog.locator('#hdbt-search__search-monitor__terms').check();
      await dialog.locator('#hdbt-search__search-monitor__submit-button').click();

      await expect(dialog.locator('#hdbt-search__search-monitor__header')).toHaveText(texts.almostDone, {
        timeout: 15_000,
      });
      await expect(dialog.locator('.hdbt-search__search-monitor__error')).not.toBeAttached();

      const summary = await waitForMessage(email);
      const message = await getMessage(summary.ID);
      expect(message.Subject).toBe(texts.subject);
      options.checkEmail?.(message);

      // Open the email and click the confirm button.
      await page.setContent(message.HTML);
      const confirmLink = page.getByRole('link', { name: texts.confirmLink });
      await expect(confirmLink).toHaveAttribute('href', /\/hakuvahti\/confirm\?/);
      const confirmUrl = new URL((await confirmLink.getAttribute('href')) as string);
      await confirmLink.click();

      // The confirm page submits the confirmation automatically.
      await expect(page.getByRole('heading', { name: texts.confirmed })).toBeVisible({ timeout: 15_000 });

      // The unsubscribe link uses the same query parameters as the confirm link.
      const unsubscribeUrl = new URL(confirmUrl);
      unsubscribeUrl.pathname = unsubscribeUrl.pathname.replace(/\/confirm$/, '/unsubscribe');
      await page.goto(unsubscribeUrl.toString());

      await expect(page.getByRole('heading', { name: texts.removed })).toBeVisible({ timeout: 15_000 });
    });
  });
};

export { hakuvahtiTest };
