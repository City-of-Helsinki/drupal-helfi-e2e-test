# Shared Playwright E2E Testing Framework

This package provides a shared end-to-end (E2E) testing framework using Playwright for Helfi Drupal projects. It includes common configurations, utilities, and best practices for writing reliable browser tests.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [Key Components](#key-components)
- [Writing Tests](#writing-tests)
- [Updating the Shared Package](#updating-the-shared-package)
- [Best Practices](#best-practices)

## Overview

The E2E testing framework is designed to:
- Provide a consistent testing environment across all Helfi instances
- Handle common setup/teardown tasks automatically
- Include reusable test utilities and helpers
- Support parallel test execution
- Generate comprehensive test reports

## Project Structure

```
/
├── .env                       # Environment variables
├── package.json               # NPM package configuration
├── playwright.config.ts       # Base Playwright configuration
├── sites.config.ts            # Multi-site configuration
├── tests/                     # Test files
│   ├── common/                # Common tests for all sites
│   │   └── *.spec.ts
│   └── sites/                 # Site-specific tests
│       └── {site-name}/
│           └── *.spec.ts
└── utils/                     # Shared utilities
    ├── fetchJsonApiRequest.ts # API request helper
    ├── globalSetup.ts         # Global test setup
    ├── globalTeardown.ts      # Global test teardown
    ├── handlers.ts            # Common page handlers
    ├── logger.ts              # Logging utilities
    └── storagePath.ts         # Storage state management
```

## Setup and Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Edit the env file to suit your needs.

3. **Running Tests**:
   ```bash
   # Run all tests
   npm run test
   # Run site specific tests
   check readme in sites-folder.

   ```
4. **Running Tests with just one worker can help with performance issues**:
   ```bash
   npx playwright test --workers=1
   ```

## Configuration

The base configuration (in `playwright.config.ts`) includes:
- Default timeouts and retries
- Common reporters (list and HTML)
- Standard viewport settings
- Automatic screenshot and video capture on failure
- Storage state management

Projects can extend and override these settings as needed.

## Key Components

### Global Setup (`utils/globalSetup.ts`)
- Runs once before all tests
- Handles authentication and session management
- Saves browser state to a storage file
- Manages cookie consent and dialogs

### Global Teardown (`utils/globalTeardown.ts`)
- Cleans up after test execution
- Removes temporary files
- Handles any necessary cleanup tasks

### Storage Management (`utils/storagePath.ts`)
- Manages the storage state file location
- Handles cross-platform path resolution
- Ensures proper directory structure exists

### API Helpers (`utils/fetchJsonApiRequest.ts`)
- Provides typed HTTP request methods
- Handles JSON:API interactions
- Includes proper error handling and type safety

### Handlers (`utils/handlers.ts`)
- Common page interaction patterns
- Cookie consent handling
- Dialog and alert management

### Site-specific tests
- See [`README.md`](./tests/sites/README.md).
