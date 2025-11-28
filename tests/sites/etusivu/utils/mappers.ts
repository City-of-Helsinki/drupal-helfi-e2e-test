/**
 * Type definition for a mapped sitemap with URL information.
 *
 * originalUrl: The original URL from the sitemap.
 * mappedUrl: The URL mapped to the current environment.
 * path: The path part of the URL including query and hash.
 * isFrontPage: Whether this is the front page sitemap.
 */
export type MappedSitemap = {
  originalUrl: string;
  mappedUrl: string;
  path: string;
  isFrontPage: boolean;
};

/**
 * Processes a sitemap XML string and maps URLs based on current environment.
 *
 * @param rootSitemapXml - The XML content of the root sitemap
 * @param baseUrl - The base URL to map sitemap entries to (optional)
 * @returns Array of processed sitemap entries
 */
export const mapSitemaps = (rootSitemapXml: string, baseUrl?: string): MappedSitemap[] => {
  // Early return if no base URL is provided.
  if (!baseUrl) return [];

  // Extract all <loc>...</loc> values from the XML.
  const locRegex = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  const locMatches = [...rootSitemapXml.matchAll(locRegex)];

  // Get the protocol and domain from the base URL.
  const origin = new URL(baseUrl).origin;

  // Process each matched URL in the sitemap.
  return locMatches.map((match) => {
    const originalUrl = match[1].trim();
    const original = new URL(originalUrl);

    // Reconstruct the full path and create the mapped URL.
    const constructedPath = `${original.pathname}${original.search}${original.hash}`;
    const mappedUrl = `${origin}${constructedPath}`;

    // Return the mapped sitemap entry.
    return {
      originalUrl,
      mappedUrl,
      path: constructedPath,
      isFrontPage: constructedPath === '/fi/sitemap.xml',
    };
  });
};
