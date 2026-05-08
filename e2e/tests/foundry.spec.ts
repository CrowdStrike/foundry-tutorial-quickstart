import { test } from '../src/fixtures';

test('should find extension in detection details', async ({ detectionExtensionPage }) => {
  await detectionExtensionPage.navigateToDetectionDetails();
  await detectionExtensionPage.verifyExtensionExists('My First Extension');
});
