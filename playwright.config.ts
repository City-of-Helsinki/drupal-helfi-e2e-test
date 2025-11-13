import { defineConfig, devices } from '@playwright/test';
import { getStorageStatePath } from './utils/storagePath';
import { sites, getSiteConfig } from './sites.config';

try {
  process.loadEnvFile('.env')
} catch (e) {
  // Use default config.
}

type Config = Parameters<typeof defineConfig>[0];

const baseSetupPath = require.resolve('./utils/globalSetup');
const baseTeardownPath = require.resolve('./utils/globalTeardown');

const browserConfig = devices['Desktop Chrome']

const base: Config = {
  globalSetup: [baseSetupPath],
  globalTeardown: [baseTeardownPath],
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 300_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: [
    ['list'],
    ['junit', { outputFile: 'report/e2e-junit-results.xml' }],
    ['html', { open: 'never', outputFolder: 'report/html' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.test.hel.ninja/',
    storageState: getStorageStatePath(),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
    launchOptions: { slowMo: process.env.SLOWMO ? 1_000 : 0 },
  },
  projects: [
    // Common tests project - runs only shared tests.
    {
      name: 'common',
      testMatch: '**/tests/common/**/*.spec.ts',
      use: {
        ...browserConfig,
        baseURL: process.env.BASE_URL ?? 'https://www.test.hel.ninja/',
      },
    },
    // Generate a project for each configured site.
    ...sites.map((site) => {
      const siteConfig = getSiteConfig(site);
      return {
        name: site.name,
        // Include both common tests and site-specific tests.
        testMatch: [
          '**/tests/common/**/*.spec.ts',
          `**/tests/sites/${site.name}/**/*.spec.ts`,
        ],
        use: {
          ...browserConfig,
          baseURL: siteConfig.baseURL,
        },
      };
    }),
  ],
};

export const baseConfig = defineConfig(base);

const toArray = (v: Config['globalSetup']) =>
  v ? (Array.isArray(v) ? v : [v]) : [];

const mergeAppend = (
  baseVal: Config['globalSetup'],
  overrideVal: Config['globalSetup']
) => Array.from(new Set([...toArray(baseVal), ...toArray(overrideVal)]));

export function makeConfig(overrides: Partial<Config> = {}) {
  const merged: Config = {
    ...base,
    ...overrides,
    use: { ...base.use, ...(overrides.use ?? {}) },
    globalSetup: mergeAppend(base.globalSetup, overrides.globalSetup),
    globalTeardown: mergeAppend(base.globalTeardown, overrides.globalTeardown),
  };
  return defineConfig(merged);
}

export default baseConfig;
