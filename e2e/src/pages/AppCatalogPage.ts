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
    try {
      // Wait for page to load
      await this.page.waitForLoadState('networkidle');
      
      // Look for the app link first
      const appLink = this.page.getByRole('link', { name: appName });
      
      // If app link is not visible, app might not be deployed yet
      if (!(await appLink.isVisible({ timeout: 5000 }))) {
        return false;
      }
      
      // Look in the app card for installation status
      const appCard = appLink.locator('xpath=../..');
      
      // Check for multiple possible indicators of installation
      const installedIndicators = [
        appCard.locator('text=Installed'),
        appCard.locator('[data-testid="app-status"]:has-text("Installed")'),
        appCard.locator('.installed, [class*="installed"]'),
        // Also check if we can find an "Open menu" button which typically appears for installed apps
        appCard.getByRole('button', { name: 'Open menu' })
      ];
      
      // Check if any of these indicators are visible
      for (const indicator of installedIndicators) {
        if (await indicator.isVisible({ timeout: 2000 })) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.log(`Error checking if app ${appName} is installed:`, error.message);
      return false;
    }
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
    // Wait for the page to fully load first
    await this.page.waitForLoadState('networkidle');
    
    const appLink = this.page.getByRole('link', { name: appName });
    
    try {
      // First attempt: wait for the app link to be visible
      await appLink.waitFor({ state: 'visible', timeout: 15000 });
    } catch (error) {
      // If app link not found, try refreshing the page as the app might still be deploying (CI case)
      console.log(`App ${appName} not immediately visible, refreshing page...`);
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      
      try {
        // Try again after refresh with longer timeout (CI case)
        await appLink.waitFor({ state: 'visible', timeout: 20000 });
      } catch (finalError) {
        // App is not available - this could be a local environment issue
        throw new Error(
          `❌ App "${appName}" is not available in the app catalog.\n\n` +
          `This could mean:\n` +
          `1. In LOCAL environment: The app needs to be manually deployed first using the Foundry CLI\n` +
          `2. In CI environment: The app deployment step may have failed\n\n` +
          `To fix this locally:\n` +
          `- Run: foundry app deploy\n` +
          `- Then run: foundry app release\n` +
          `- Make sure your APP_NAME in .env matches your deployed app name\n\n` +
          `Current APP_NAME from .env: ${appName}`
        );
      }
    }
    
    await appLink.click();
    
    // Wait for the app details page to load
    await this.page.waitForLoadState('networkidle');
  }

  async installApp() {
    try {
      // First check if the app is already installed by looking for the status
      const installedStatus = this.page.locator('text=Installed').first();
      if (await installedStatus.isVisible({ timeout: 3000 })) {
        console.log('App is already installed, skipping installation');
        return;
      }
      
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
      // First check if the app is available at all
      await this.page.waitForLoadState('networkidle');
      const appLink = this.page.getByRole('link', { name: appName });
      
      // Give it a reasonable timeout to appear
      const isAppVisible = await appLink.isVisible({ timeout: 10000 });
      
      if (!isAppVisible) {
        throw new Error(
          `❌ App "${appName}" is not found in the app catalog.\n\n` +
          `This usually means:\n` +
          `🏠 LOCAL environment: You need to deploy the app first:\n` +
          `   1. Run: foundry app deploy\n` +
          `   2. Run: foundry app release\n` +
          `   3. Verify APP_NAME in .env matches your app\n\n` +
          `🏗️ CI environment: The deployment step may have failed\n\n` +
          `Current APP_NAME from .env: ${appName}\n` +
          `Make sure this matches your app name in the Foundry dashboard.`
        );
      }
      
      if (await this.isAppInstalled(appName)) {
        console.log(`App ${appName} is installed, uninstalling...`);
        await this.uninstallApp(appName);
        console.log(`✅ App ${appName} uninstalled successfully`);
      } else {
        console.log(`✅ App ${appName} is not installed`);
      }
    } catch (error) {
      if (error.message.includes('not found in the app catalog')) {
        throw error; // Re-throw our helpful error message
      }
      throw new Error(`Failed to ensure app ${appName} is uninstalled: ${error.message}`);
    }
  }
}