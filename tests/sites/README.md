# Site-Specific Tests

This directory contains site-specific tests for individual sites.

## Directory Structure

Each site has its own subdirectory:

```
tests/sites/
├── etusivu/
│   └── *.spec.ts
└── {site-name}/
    └── *.spec.ts
```

## Adding a New Site

To add tests for a site:

### 1. Configure the Site

Add the site to `sites.config.ts` in the project root:

```typescript
export const sites: SiteConfig[] = [
  {
    name: 'etusivu',
    envPrefix: 'ETUSIVU',
    defaultBaseURL: 'https://www.test.hel.ninja/',
  },
  // Add your new site:
  {
    name: 'your-site-name',
    envPrefix: 'YOUR_SITE',
    defaultBaseURL: 'https://your-site.test.hel.ninja/',
  },
];
```

### 2. Create Test Directory

Create a directory for your site:

```bash
mkdir -p tests/sites/your-site-name
```

### 3. Write Tests

Create test files with the `.spec.ts` suffix:

```typescript
// tests/sites/your-site-name/feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Your site feature', () => {
  test('should test something specific to this site', async ({ page }) => {
    await page.goto('/');
    // Your test logic here
  });
});
```

### 4. Configure Environment Variables

Add site-specific environment variables to your `.env` file:

```bash
YOUR_SITE_BASE_URL=https://your-site.docker.so
```

### 5. Run Site Tests

Run tests for your site using the project name:

```bash
npx playwright test --project=your-site-name
```

## How It Works

- Each site gets its own Playwright project
- Common tests from `tests/common/` run automatically with each site project
- Each site can have a unique configuration (BASE_URL, etc.)

## Running Tests

```bash
# Run tests for specific site (includes common tests)
npx playwright test --project=etusivu

# Run only common tests
npx playwright test --project=common

# Run all sites
npx playwright test

# Run a specific test
npx playwright test tests/sites/etusivu/cookieBanner.spec.ts

# Run tests with playwright UI
npx playwright test tests/sites/etusivu/cookieBanner.spec.ts --ui

# Run tests slower so that after each action the test waits 1 second
SLOWMO=true npx playwright test

# Run tests with headed browser
npx playwright test tests/sites/etusivu/cookieBanner.spec.ts --headed
```
