import { test as baseTest } from '@playwright/test';
import {
  AppCatalogPage,
  WorkflowsPage,
  DetectionExtensionPage,
  HostExtensionPage,
  CaseExtensionPage,
  WorkbenchExtensionPage,
  AutomatedLeadsExtensionPage,
  WorkflowExecutionExtensionPage,
  config,
} from '@crowdstrike/foundry-playwright';

type FoundryFixtures = {
  appCatalogPage: AppCatalogPage;
  workflowsPage: WorkflowsPage;
  detectionExtensionPage: DetectionExtensionPage;
  hostExtensionPage: HostExtensionPage;
  caseExtensionPage: CaseExtensionPage;
  workbenchExtensionPage: WorkbenchExtensionPage;
  automatedLeadsExtensionPage: AutomatedLeadsExtensionPage;
  workflowExecutionExtensionPage: WorkflowExecutionExtensionPage;
  appName: string;
};

export const test = baseTest.extend<FoundryFixtures>({
  appCatalogPage: async ({ page }, use) => {
    await use(new AppCatalogPage(page));
  },
  workflowsPage: async ({ page }, use) => {
    await use(new WorkflowsPage(page));
  },
  detectionExtensionPage: async ({ page }, use) => {
    await use(new DetectionExtensionPage(page));
  },
  hostExtensionPage: async ({ page }, use) => {
    await use(new HostExtensionPage(page));
  },
  caseExtensionPage: async ({ page }, use) => {
    await use(new CaseExtensionPage(page));
  },
  workbenchExtensionPage: async ({ page }, use) => {
    await use(new WorkbenchExtensionPage(page));
  },
  automatedLeadsExtensionPage: async ({ page }, use) => {
    await use(new AutomatedLeadsExtensionPage(page));
  },
  workflowExecutionExtensionPage: async ({ page }, use) => {
    await use(new WorkflowExecutionExtensionPage(page));
  },
  appName: async ({}, use) => {
    await use(config.appName);
  },
});

export { expect } from '@playwright/test';
