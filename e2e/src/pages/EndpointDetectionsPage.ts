import { Page, expect } from '@playwright/test';

export class EndpointDetectionsPage {
  constructor(private page: Page) {}

  async navigateToEndpointDetections() {
    try {
      // Navigate directly to Foundry home to ensure we're in the right context
      console.log('🏠 Starting navigation from Foundry home page...');
      await this.page.goto(this.getBaseURL() + '/foundry/home');
      await this.page.waitForLoadState('networkidle');
      
      // Wait a moment for the page to fully render
      await this.page.waitForTimeout(2000);
      
      console.log('🔍 Looking for Menu button...');
      const menuButton = this.page.getByRole('button', { name: 'Menu', exact: true });
      await menuButton.waitFor({ state: 'visible', timeout: 15000 });
      
      console.log('📱 Clicking Menu button...');
      await menuButton.click();
      
      // Wait for the navigation menu to expand
      await this.page.waitForTimeout(1000);
      
      console.log('🛡️ Looking for Endpoint security button...');
      const endpointSecurityButton = this.page.getByRole('button', { name: /Endpoint security/ });
      await endpointSecurityButton.waitFor({ state: 'visible', timeout: 10000 });
      
      console.log('🛡️ Clicking Endpoint security button...');
      await endpointSecurityButton.click();
      
      // Wait for the submenu to expand
      await this.page.waitForTimeout(1000);
      
      console.log('🔍 Looking for Endpoint detections link...');
      const endpointDetectionsLink = this.page.getByRole('link', { name: 'Endpoint detections' });
      await endpointDetectionsLink.waitFor({ state: 'visible', timeout: 10000 });
      
      console.log('🎯 Clicking Endpoint detections link...');
      await endpointDetectionsLink.click();
      
      // Wait for page to load and verify we're on the correct page
      await this.page.waitForLoadState('networkidle');
      await expect(this.page).toHaveURL(/.*activity-v2\/detections.*/, { timeout: 15000 });
      
      console.log('✅ Successfully navigated to Endpoint detections page');
      
    } catch (error) {
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'test-results/navigation-error.png' });
      console.error('❌ Navigation failed:', error.message);
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