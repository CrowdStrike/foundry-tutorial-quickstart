import { Page, expect } from '@playwright/test';

export class EndpointDetectionsPage {
  constructor(private page: Page) {}

  async navigateToEndpointDetections() {
    try {
      // Open navigation menu - the correct selector is the "Menu" button
      const menuButton = this.page.getByRole('button', { name: 'Menu', exact: true });
      await menuButton.waitFor({ state: 'visible', timeout: 10000 });
      await menuButton.click();
      
      // Navigate to Endpoint security - look for the button that contains "Endpoint security"
      const endpointSecurityButton = this.page.getByRole('button', { name: /Endpoint security/ });
      await endpointSecurityButton.waitFor({ state: 'visible', timeout: 10000 });
      await endpointSecurityButton.click();
      
      // Navigate to Endpoint detections - now it should be a link in the submenu
      const endpointDetectionsLink = this.page.getByRole('link', { name: 'Endpoint detections' });
      await endpointDetectionsLink.waitFor({ state: 'visible', timeout: 10000 });
      await endpointDetectionsLink.click();
      
      // Wait for page to load
      await this.page.waitForLoadState('networkidle');
      
      // Verify we're on the correct page
      await expect(this.page).toHaveURL(/.*activity-v2\/detections.*/, { timeout: 15000 });
      
    } catch (error) {
      throw new Error(`Failed to navigate to Endpoint detections: ${error.message}`);
    }
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