import { type APIRequestContext, expect, request as playwrightRequest } from '@playwright/test';
import { fetchRequest } from './fetchJsonApiRequest';
import { logger } from './logger';

/**
 * Message summary returned by the Mailpit API.
 */
export type MailpitMessageSummary = {
  ID: string;
  Subject: string;
  To: { Name: string; Address: string }[];
  Created: string;
};

/**
 * Message returned by the Mailpit API.
 */
export type MailpitMessage = MailpitMessageSummary & {
  HTML: string;
  Text: string;
};

type MailpitSearchResponse = {
  messages: MailpitMessageSummary[];
};

/**
 * Whether the Mailpit API is configured.
 */
const isMailpitConfigured = (): boolean => !!process.env.MAILPIT_URL;

/**
 * Create a unique email address.
 *
 * @param prefix - Address prefix.
 */
const createTestEmail = (prefix: string = 'e2e'): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`;

/**
 * Run a callback with Mailpit API context.
 */
const withMailpit = async <T>(callback: (api: APIRequestContext) => Promise<T>): Promise<T> => {
  const baseURL = process.env.MAILPIT_URL;
  if (!baseURL) {
    throw new Error('MAILPIT_URL must be set');
  }

  const username = process.env.MAILPIT_USER;
  const api = await playwrightRequest.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
    httpCredentials: username ? { username, password: process.env.MAILPIT_PASSWORD ?? '', send: 'always' } : undefined,
  });

  try {
    return await callback(api);
  } finally {
    await api.dispose();
  }
};

/**
 * Search messages sent to the given address.
 *
 * @param to Recipient email address.
 */
const searchMessages = async (to: string): Promise<MailpitMessageSummary[]> =>
  withMailpit(async (api) => {
    const response = await fetchRequest<MailpitSearchResponse>(api, '/api/v1/search', { query: `to:"${to}"` });
    return response.messages;
  });

/**
 * Wait until a message sent to the given address arrives.
 *
 * @param to Recipient email address.
 * @param timeout How long to wait for the message (in milliseconds).
 */
const waitForMessage = async (to: string, timeout: number = 180_000): Promise<MailpitMessageSummary> => {
  let message: MailpitMessageSummary | undefined;

  await expect
    .poll(
      async () => {
        message = (await searchMessages(to))[0];
        logger(`Mailpit messages for ${to}:`, message ? message.ID : 'none');
        return message;
      },
      { message: `Email to ${to} was not received`, timeout, intervals: [5_000] },
    )
    .toBeDefined();

  return message as MailpitMessageSummary;
};

/**
 * Get a single message.
 *
 * @param id Mailpit message ID.
 */
const getMessage = async (id: string): Promise<MailpitMessage> =>
  withMailpit((api) => fetchRequest<MailpitMessage>(api, `/api/v1/message/${id}`));

/**
 * Delete messages.
 *
 * @param ids Mailpit message IDs.
 */
const deleteMessages = async (ids: string[]): Promise<void> => {
  if (!ids.length) {
    return;
  }

  await withMailpit(async (api) => {
    const response = await api.delete('/api/v1/messages', { data: { IDs: ids } });
    if (!response.ok()) {
      logger(`Failed to delete Mailpit messages: ${response.status()} ${response.statusText()}`);
    }
  });
};

export { createTestEmail, deleteMessages, getMessage, isMailpitConfigured, searchMessages, waitForMessage };
