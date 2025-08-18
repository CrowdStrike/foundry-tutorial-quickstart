import { Page, expect } from '@playwright/test';

export class EndpointDetectionsPage {
  constructor(private page: Page) {}

  async navigateToEndpointDetections() {
    try {
      // First, let's make sure we're on a page where the main navigation is available
      // If we're on an app details page, we might need to navigate to a main page first
      const currentUrl = this.page.url();
      console.log(`Current page URL: ${currentUrl}`);
      
      // If we're on an app details page, go back to a main page
      if (currentUrl.includes('/foundry/app-catalog/') && currentUrl.split('/').length > 5) {
        console.log('Navigating back to main app catalog page...');
        await this.page.goto(this.getBaseURL() + '/foundry/app-catalog');
        await this.page.waitForLoadState('networkidle');
      }
      
      // Open navigation menu - the correct selector is the "Menu" button
      const menuButton = this.page.getByRole('button', { name: 'Menu', exact: true });
      console.log('Looking for Menu button...');
      await menuButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Menu button found, clicking...');
      await menuButton.click();
      
      // Navigate to Endpoint security - look for the button that contains "Endpoint security"
      const endpointSecurityButton = this.page.getByRole('button', { name: /Endpoint security/ });
      console.log('Looking for Endpoint security button...');
      await endpointSecurityButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Endpoint security button found, clicking...');
      await endpointSecurityButton.click();
      
      // Navigate to Endpoint detections - now it should be a link in the submenu
      const endpointDetectionsLink = this.page.getByRole('link', { name: 'Endpoint detections' });
      console.log('Looking for Endpoint detections link...');
      await endpointDetectionsLink.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Endpoint detections link found, clicking...');
      await endpointDetectionsLink.click();
      
      // Wait for page to load
      await this.page.waitForLoadState('networkidle');
      
      // Verify we're on the correct page
      await expect(this.page).toHaveURL(/.*activity-v2\/detections.*/, { timeout: 15000 });
      console.log('Successfully navigated to Endpoint detections page');
      
    } catch (error) {
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'test-results/navigation-error.png' });
      throw new Error(`Failed to navigate to Endpoint detections: ${error.message}`);
    }
  }

  private getBaseURL(): string {
    return process.env.FALCON_BASE_URL || 'https://falcon.us-2.crowdstrike.com';
  }

  async verifyUIExtensionText(expectedText: string): Promise<boolean> {
    const textLocator = this.page.locator(`text=${expectedText}`);
    
    try {
      // First attempt: look for text immediately
      console.log(`🔍 Looking for '${expectedText}' text in UI extension...`);
      await textLocator.waitFor({ state: 'visible', timeout: 8000 });
      await expect(textLocator).toBeVisible();
      console.log(`✅ Found '${expectedText}' text - UI extension is working correctly!`);
      return true;
      
    } catch (error) {
      // Second attempt: click on a detection to trigger UI extension
      console.log(`⏳ '${expectedText}' text not immediately visible, trying detection click...`);
      
      try {
        const firstDetection = this.page.locator('gridcell button').first();
        await firstDetection.waitFor({ state: 'visible', timeout: 5000 });
        await firstDetection.click();
        
        // Wait a moment for UI extension to load
        await this.page.waitForTimeout(2000);
        
        // Check again for the text
        await textLocator.waitFor({ state: 'visible', timeout: 5000 });
        await expect(textLocator).toBeVisible();
        console.log(`✅ Found '${expectedText}' text after clicking detection!`);
        return true;
        
      } catch (clickError) {
        console.log(`ℹ️ '${expectedText}' text not found after trying detection click`);
        return false;
      }
    }
  }

  async takeScreenshot(filename: string) {
    try {
      await this.page.screenshot({ path: `test-results/${filename}` });
    } catch (error) {
      console.log(`⚠️ Failed to take screenshot ${filename}: ${error.message}`);
    }
  }
}