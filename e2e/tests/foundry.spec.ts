import { test } from '../src/fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Foundry Tutorial Quickstart - E2E Tests', () => {
  test('should navigate to Endpoint detections page', async ({ detectionExtensionPage }) => {
    await detectionExtensionPage.navigateToEndpointDetections();
  });

  test('should navigate to detection details and find extension', async ({ detectionExtensionPage }) => {
    await detectionExtensionPage.navigateToDetectionDetails();
    await detectionExtensionPage.verifyExtensionExists('My First Extension');
  });
});
