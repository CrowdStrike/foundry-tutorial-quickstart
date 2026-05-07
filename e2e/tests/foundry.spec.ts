import { expect } from '@playwright/test';
import { test } from '../src/fixtures';

test('should find extension in detection details', async ({ detectionExtensionPage, page }) => {
  await detectionExtensionPage.navigateToEndpointDetections();
  await detectionExtensionPage.openFirstDetection();

  const extensionButton = page.getByRole('button', { name: /My First Extension/i }).first();

  for (let attempt = 0; attempt < 10; attempt++) {
    const visible = await extensionButton.isVisible().catch(() => false);
    if (visible) break;
    await page.keyboard.press('End');
    await page.waitForLoadState('domcontentloaded');
  }

  await expect(extensionButton).toBeVisible({ timeout: 10000 });
});
