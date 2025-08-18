import { test as baseTest } from '@playwright/test';
import { FoundryHomePage } from './pages/FoundryHomePage';
import { AppManagerPage } from './pages/AppManagerPage';
import { AppCatalogPage } from './pages/AppCatalogPage';
import { EndpointDetectionsPage } from './pages/EndpointDetectionsPage';
import { baseURL } from './utils.cjs';

type FoundryFixtures = {
  foundryHomePage: FoundryHomePage;
  appManagerPage: AppManagerPage;
  appCatalogPage: AppCatalogPage;
  endpointDetectionsPage: EndpointDetectionsPage;
  appName: string;
};

export const test = baseTest.extend<FoundryFixtures>({
  // Set base URL for all pages
  page: async ({ page }, use) => {
    page.setDefaultTimeout(30000);
    await use(page);
  },

  // Page object fixtures
  foundryHomePage: async ({ page }, use) => {
    await use(new FoundryHomePage(page));
  },

  appManagerPage: async ({ page }, use) => {
    await use(new AppManagerPage(page));
  },

  appCatalogPage: async ({ page }, use) => {
    await use(new AppCatalogPage(page));
  },

  endpointDetectionsPage: async ({ page }, use) => {
    await use(new EndpointDetectionsPage(page));
  },

  // App name from environment
  appName: async ({}, use) => {
    const appName = process.env.APP_NAME;
    if (!appName) {
      throw new Error('APP_NAME environment variable is required');
    }
    await use(appName);
  },
});

export { expect } from '@playwright/test';