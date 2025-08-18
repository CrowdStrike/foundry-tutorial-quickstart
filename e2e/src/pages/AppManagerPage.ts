import { Page, expect } from '@playwright/test';

export class AppManagerPage {
  constructor(private page: Page) {}

  async findAndNavigateToApp(appName: string) {
    const appList = this.page.getByTestId('custom-apps-list');
    const appText = appList.getByText(appName);
    await appText.waitFor({ state: 'visible', timeout: 10000 });
    
    const parent = appText.locator('../../../../..');
    await parent.locator('button').click();
    await this.page.getByText('View in app catalog').click();
    
    await expect(this.page).toHaveTitle('App catalog | Foundry | Falcon');
    
    // After arriving at app catalog, the app might take time to appear in the catalog
    // Wait for the page to fully load first
    await this.page.waitForLoadState('networkidle');
    
    // Try multiple approaches to find the app link
    const appLink = this.page.getByRole('link', { name: appName });
    
    try {
      // First attempt: wait for the app link to be visible
      await appLink.waitFor({ state: 'visible', timeout: 15000 });
    } catch (error) {
      // If app link not found, try refreshing the page as the app might still be deploying
      console.log(`App ${appName} not immediately visible, refreshing page...`);
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      
      // Try again after refresh
      await appLink.waitFor({ state: 'visible', timeout: 15000 });
    }
    
    await appLink.click();
    
    // Wait for the app details page to load
    await this.page.waitForLoadState('networkidle');
  }
}