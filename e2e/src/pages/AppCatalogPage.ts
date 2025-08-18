import { Page, expect } from '@playwright/test';

export class AppCatalogPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(this.getBaseURL() + '/foundry/app-catalog');
    await this.page.waitForLoadState('networkidle');
  }

  private getBaseURL(): string {
    // Get base URL from utils or environment
    return process.env.FALCON_BASE_URL || 'https://falcon.us-2.crowdstrike.com';
  }

  async isAppInstalled(appName: string): Promise<boolean> {
    const appLink = this.page.getByRole('link', { name: appName });
    if (!(await appLink.isVisible())) return false;
    
    const appCard = appLink.locator('xpath=../..');
    const installedStatus = appCard.locator('text=Installed');
    return await installedStatus.isVisible();
  }

  async uninstallApp(appName: string) {
    try {
      const appLink = this.page.getByRole('link', { name: appName });
      await appLink.waitFor({ state: 'visible', timeout: 10000 });
      
      const appCard = appLink.locator('xpath=../..');
      const menuButton = appCard.getByRole('button', { name: 'Open menu' });
      await menuButton.waitFor({ state: 'visible', timeout: 5000 });
      await menuButton.click();
      
      const uninstallMenuItem = this.page.getByRole('menuitem', { name: 'Uninstall app' });
      await uninstallMenuItem.waitFor({ state: 'visible', timeout: 5000 });
      await uninstallMenuItem.click();
      
      const confirmButton = this.page.getByRole('button', { name: 'Uninstall' });
      await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmButton.click();
      
      // Wait for uninstall to complete - look for status change
      await this.page.waitForLoadState('networkidle');
      
      // Wait for the "Installed" status to disappear
      const installedStatus = appCard.locator('text=Installed');
      await installedStatus.waitFor({ state: 'detached', timeout: 15000 });
      
    } catch (error) {
      throw new Error(`Failed to uninstall app ${appName}: ${error.message}`);
    }
  }

  async navigateToAppDetails(appName: string) {
    const appLink = this.page.getByRole('link', { name: appName });
    await appLink.waitFor({ state: 'visible', timeout: 10000 });
    await appLink.click();
    
    // Wait for the app details page to load
    await this.page.waitForLoadState('networkidle');
  }

  async installApp() {
    try {
      const installBtn = this.page.getByTestId('app-details-page__install-button');
      await expect(installBtn).toBeVisible({ timeout: 15000 });
      await installBtn.click();

      // Wait for dialog to load
      await this.page.waitForLoadState('networkidle');

      // Save and install
      const submitBtn = this.page.getByTestId('submit');
      await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
      await submitBtn.click();

      // Wait for next screen to load
      await this.page.waitForLoadState('networkidle');

      // Verify installed - wait for status to show "Installed"
      const status = this.page.getByTestId('status-text');
      await status.waitFor({ state: 'visible', timeout: 10000 });
      await expect(status).toHaveText('Installed', { timeout: 60000 });
      
    } catch (error) {
      throw new Error(`Failed to install app: ${error.message}`);
    }
  }

  async ensureAppUninstalled(appName: string) {
    try {
      if (await this.isAppInstalled(appName)) {
        console.log(`App ${appName} is installed, uninstalling...`);
        await this.uninstallApp(appName);
        console.log(`✅ App ${appName} uninstalled successfully`);
      } else {
        console.log(`✅ App ${appName} is not installed`);
      }
    } catch (error) {
      throw new Error(`Failed to ensure app ${appName} is uninstalled: ${error.message}`);
    }
  }
}