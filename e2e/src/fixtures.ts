import { test as baseTest } from '@playwright/test';
import { DetectionExtensionPage } from '@crowdstrike/foundry-playwright';

type FoundryFixtures = {
  detectionExtensionPage: DetectionExtensionPage;
};

export const test = baseTest.extend<FoundryFixtures>({
  detectionExtensionPage: async ({ page }, use) => {
    await use(new DetectionExtensionPage(page));
  },
});

export { expect } from '@playwright/test';
