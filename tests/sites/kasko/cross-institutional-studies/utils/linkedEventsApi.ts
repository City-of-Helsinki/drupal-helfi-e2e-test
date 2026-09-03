import { expect, type Page } from '@playwright/test';
import { fetchRequest } from '../../../../../utils/fetchJsonApiRequest';
import type { Langcode } from '../../../../common/types/languagesType';

/**
 * Type definition for a translated LinkedEvents field.
 */
type TranslatedField = Record<Langcode, string | null>;

/**
 * Type definition for a LinkedEvents event.
 */
interface LinkedEvent {
  id: string;
  name: TranslatedField;
  short_description: TranslatedField;
  super_event: { '@id': string } | null;
  sub_events: { '@id': string }[];
}

/**
 * Type definition for a LinkedEvents listing response.
 */
interface LinkedEventsResponse {
  data: LinkedEvent[];
  meta: { count: number };
}

/**
 * Get the LinkedEvents API URL from the search page settings.
 */
async function getEventsApiUrl(page: Page): Promise<string> {
  const apiUrl = await page.evaluate(() => {
    const settings = (
      window as unknown as {
        drupalSettings: {
          helfi_events: { data: Record<string, { events_api_url: string }> };
        };
      }
    ).drupalSettings;
    return settings.helfi_events.data['cross-institutional-studies-search'].events_api_url;
  });

  expect(apiUrl, 'LinkedEvents API URL is missing from the page settings').toBeTruthy();
  return apiUrl;
}

/**
 * Fetch events from the LinkedEvents API.
 */
async function fetchEvents(page: Page, url: string): Promise<LinkedEvent[]> {
  const { data } = await fetchRequest<LinkedEventsResponse>(page.request, url);
  return data;
}

/**
 * Fetch the amount of events matching the given search parameters.
 */
async function fetchEventCount(page: Page, apiUrl: string, params: URLSearchParams): Promise<number> {
  const url = new URL(apiUrl);

  // The search page uses the API parameter names in its own URL.
  for (const [key, value] of params) {
    url.searchParams.set(key, value);
  }

  const { meta } = await fetchRequest<LinkedEventsResponse>(page.request, url.toString());
  return meta.count;
}

/**
 * Fetch a single event from the LinkedEvents API.
 */
async function fetchEvent(page: Page, apiUrl: string, id: string): Promise<LinkedEvent> {
  const url = new URL(apiUrl);
  url.search = '';
  url.pathname = `${url.pathname.replace(/\/$/, '')}/${id}/`;
  return await fetchRequest<LinkedEvent>(page.request, url.toString());
}

/**
 * Fetch the sub events of the given super event.
 */
async function fetchSubEvents(page: Page, apiUrl: string, superEventId: string): Promise<LinkedEvent[]> {
  const superEvent = await fetchEvent(page, apiUrl, superEventId);
  const subEventIds = superEvent.sub_events.map((subEvent) => getEventId(subEvent['@id']));
  return await Promise.all(subEventIds.map((id) => fetchEvent(page, apiUrl, id)));
}

/**
 * Picks a random event that is translated to the given language.
 */
function pickRandomEvent(events: LinkedEvent[], langcode: Langcode): LinkedEvent | undefined {
  const translated = events.filter((event) => event.name[langcode]);
  return translated[Math.floor(Math.random() * translated.length)];
}

/**
 * Resolve the event ID from a LinkedEvents API reference.
 */
function getEventId(reference: string): string {
  return reference.replace(/\/$/, '').split('/').pop() || '';
}

export { fetchEventCount, fetchEvents, fetchSubEvents, getEventId, getEventsApiUrl, pickRandomEvent };
