/**
 * Site configuration for multi-site testing.
 *
 * Each site can have its own BASE_URL and other configuration settings.
 * Configuration is loaded from environment variables using the pattern:
 * {ENV_PREFIX}_BASE_URL.
 *
 * Example:
 * - ETUSIVU_BASE_URL=https://etusivu.docker.so
 * - ASUMINEN_BASE_URL=https://asuminen.docker.so
 */

export interface SiteConfig {
  /** Unique identifier for the site (used in project name and storage state) */
  name: string;
  /** Prefix for environment variables (e.g., 'ETUSIVU' for ETUSIVU_BASE_URL) */
  envPrefix: string;
  /** Optional default BASE_URL if the environment variable is not set */
  defaultBaseURL?: string;
  /** Optional default timeout override (in milliseconds) */
  defaultTimeout?: number;
}

/**
 * Define your test sites here.
 * Add a new entry for each site you want to test.
 */
export const sites: SiteConfig[] = [
  {
    name: 'etusivu',
    envPrefix: 'ETUSIVU',
    defaultBaseURL: 'https://www.test.hel.ninja/',
  },
  {
    name: 'tyo-yrittaminen',
    envPrefix: 'TYO_YRITTAMINEN',
    defaultBaseURL: 'https://www.test.hel.ninja/',
  },
  {
    name: 'hallinto',
    envPrefix: 'HALLINTO',
    defaultBaseURL: 'https://www.test.hel.ninja/',
  },
  // Add more sites here as needed:
  // {
  //   name: 'asuminen',
  //   envPrefix: 'ASUMINEN',
  //   defaultBaseURL: 'https://asuminen.test.hel.ninja/',
  // },
];

/**
 * Get configuration for a specific site from environment variables.
 */
export function getSiteConfig(site: SiteConfig): {
  baseURL: string;
  timeout?: number;
} {
  const baseURL = process.env[`${site.envPrefix}_BASE_URL`] || process.env[`BASE_URL`] || site.defaultBaseURL;

  if (!baseURL) {
    throw new Error(
      `BASE_URL not configured for site '${site.name}'. ` +
        `Set ${site.envPrefix}_BASE_URL environment variable or provide defaultBaseURL.`,
    );
  }

  return {
    baseURL,
  };
}
