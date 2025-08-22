import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { RetryHandler } from '../utils/SmartWaiter';
import { config } from '../config/TestConfig';

export class AppCatalogPage extends BasePage {
  constructor(page: Page) {
    super(page, 'AppCatalogPage');
  }

  protected getPagePath(): string {
    return '/foundry/app-catalog';
  }

  protected async verifyPageLoaded(): Promise<void> {
    await this.waiter.waitForPageLoad('App catalog page');
  }

  /**
   * Check if app is installed by looking for installation indicators.
   * Works for both CI (pre-installed) and local (user-deployed) scenarios.
   * May have timing issues due to UI state updates, but core functionality is verified.
   */
  async isAppInstalled(appName: string): Promise<boolean> {
    this.logger.step(`Check if app '${appName}' is installed`);
    
    return RetryHandler.withPlaywrightRetry(
      async () => {
        await this.waiter.waitForPageLoad();
        
        const appLink = this.page.getByRole('link', { name: appName });
        
        if (!(await this.elementExists(appLink, 5000))) {
          this.logger.debug(`App '${appName}' not found in catalog`);
          return false;
        }
        
        const appCard = appLink.locator('xpath=../..');
        const installedIndicators = [
          appCard.getByText('Installed'),
          appCard.getByTestId('app-status').filter({ hasText: 'Installed' }),
          appCard.locator('.installed, [class*="installed"]'), // Keep CSS as fallback
          appCard.getByRole('button', { name: 'Open menu' }),
          appCard.getByRole('button', { name: /installed/i })
        ];
        
        for (const indicator of installedIndicators) {
          if (await this.elementExists(indicator, 2000)) {
            this.logger.success(`App '${appName}' is installed`);
            return true;
          }
        }
        
        return false;
      },
      `Check installation status for ${appName}`
    );
  }

  async uninstallApp(appName: string): Promise<void> {
    this.logger.step(`Uninstall app '${appName}'`);
    
    return RetryHandler.withPlaywrightRetry(
      async () => {
        const appLink = await this.waiter.waitForVisible(
          this.page.getByRole('link', { name: appName }),
          { description: `App '${appName}' link`, timeout: 10000 }
        );
        
        const appCard = appLink.locator('xpath=../..');
        
        await this.smartClick(
          appCard.getByRole('button', { name: 'Open menu' }),
          'App menu button'
        );
        
        await this.smartClick(
          this.page.getByRole('menuitem', { name: 'Uninstall app' }),
          'Uninstall menu item'
        );
        
        await this.smartClick(
          this.page.getByRole('button', { name: 'Uninstall' }),
          'Confirm uninstall button'
        );
        
        await this.waiter.waitForPageLoad();
        
        // Wait for uninstall to complete
        await this.waiter.waitForCondition(
          async () => {
            const installedStatus = appCard.locator('text=Installed');
            return !(await this.elementExists(installedStatus, 1000));
          },
          'App uninstall to complete',
          { timeout: 15000 }
        );
        
        this.logger.success(`App '${appName}' uninstalled successfully`);
      },
      `Uninstall app ${appName}`
    );
  }

  async navigateToAppDetails(appName: string): Promise<void> {
    this.logger.step(`Navigate to app details for '${appName}'`);
    
    return RetryHandler.withPlaywrightRetry(
      async () => {
        await this.waiter.waitForPageLoad();
        
        let appLink = this.page.getByRole('link', { name: appName });
        
        // First attempt: wait for app link
        if (!(await this.elementExists(appLink, 15000))) {
          // Second attempt: refresh page (for CI deployment timing)
          this.logger.debug(`App '${appName}' not immediately visible, refreshing page...`);
          await this.page.reload();
          await this.waiter.waitForPageLoad();
          
          appLink = this.page.getByRole('link', { name: appName });
          if (!(await this.elementExists(appLink, 20000))) {
            const errorMessage = this.buildAppNotFoundError(appName);
            throw new Error(errorMessage);
          }
        }
        
        await appLink.click();
        await this.waiter.waitForPageLoad();
        
        this.logger.success(`Navigated to ${appName} details page`);
      },
      `Navigate to ${appName} details`
    );
  }

  /**
   * Install app via UI. Handles both CI (pre-installed) and local scenarios.
   * In CI, the app is pre-installed by Foundry CLI deployment.
   * In local tests, assumes the app (specified by APP_NAME in .env) is already deployed.
   * This method automatically detects and handles both cases.
   */
  async installApp(): Promise<void> {
    this.logger.step('Install app via UI');
    
    return RetryHandler.withPlaywrightRetry(
      async () => {
        // Check if already installed using improved detection
        const isInstalled = await this.checkInstallationStatus();
        if (isInstalled) {
          this.logger.info('App is already installed, skipping installation');
          return;
        }
        
        // Find and click install button using multiple strategies
        const installButton = await this.findInstallButton();
        await installButton.click();
        
        await this.waiter.waitForPageLoad();
        
        // Find and click submit button using multiple strategies  
        const submitButton = await this.findSubmitButton();
        await submitButton.click();
        
        await this.waiter.waitForPageLoad();
        
        // Wait for installation to complete with improved verification
        await this.waitForInstallationComplete();
        
        this.logger.success('App installation completed successfully');
      },
      'Install app'
    );
  }

  async ensureAppUninstalled(appName: string): Promise<void> {
    this.logger.step(`Ensure app '${appName}' is uninstalled`);
    
    return RetryHandler.withPlaywrightRetry(
      async () => {
        await this.waiter.waitForPageLoad();
        
        const appLink = this.page.getByRole('link', { name: appName });
        
        if (!(await this.elementExists(appLink, 10000))) {
          const errorMessage = this.buildAppNotFoundError(appName);
          throw new Error(errorMessage);
        }
        
        if (await this.isAppInstalled(appName)) {
          this.logger.info(`App '${appName}' is installed, uninstalling...`);
          await this.uninstallApp(appName);
          this.logger.success(`App '${appName}' uninstalled successfully`);
        } else {
          this.logger.success(`App '${appName}' is not installed`);
        }
      },
      `Ensure ${appName} is uninstalled`
    );
  }

  /**
   * Check if app is currently installed using multiple detection strategies
   */
  private async checkInstallationStatus(): Promise<boolean> {
    const strategies = [
      this.page.getByTestId('status-text').filter({ hasText: /^Installed$/i }),
      this.page.getByText('Installed', { exact: true }).first(),
      this.page.locator('.installed, [class*="installed"]')
    ];
    
    for (const strategy of strategies) {
      if (await this.elementExists(strategy, 2000)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find install button using multiple reliable strategies
   */
  private async findInstallButton() {
    const timeout = config.isCI ? 15000 : 10000;
    const strategies = [
      this.page.getByTestId('app-details-page__install-button'),
      this.page.getByRole('link', { name: 'Install now' }),
      this.page.getByRole('button', { name: 'Install now' })
    ];
    
    for (const strategy of strategies) {
      if (await this.elementExists(strategy, 3000)) {
        this.logger.debug('Found install button using strategy');
        return strategy;
      }
    }
    
    throw new Error('Install button not found using any detection strategy');
  }

  /**
   * Find submit button using multiple reliable strategies
   */
  private async findSubmitButton() {
    const strategies = [
      this.page.getByTestId('submit'),
      this.page.getByRole('button', { name: 'Save and install' }),
      this.page.getByRole('button', { name: /save.*install/i }),
      this.page.locator('button[type="submit"]')
    ];
    
    for (const strategy of strategies) {
      if (await this.elementExists(strategy, 5000)) {
        this.logger.debug('Found submit button using strategy');
        return strategy;
      }
    }
    
    throw new Error('Submit button not found using any detection strategy');
  }

  /**
   * Wait for installation to complete with improved verification
   */
  private async waitForInstallationComplete(): Promise<void> {
    const timeout = config.isCI ? 60000 : 45000;
    
    // Wait for status element to appear
    const statusElement = await this.waiter.waitForVisible(
      this.page.getByTestId('status-text'),
      { description: 'Installation status', timeout: 10000 }
    );
    
    // Wait for "Installed" status with extended timeout
    await expect(statusElement).toHaveText('Installed', { timeout });
  }

  private buildAppNotFoundError(appName: string): string {
    return [
      `❌ TUTORIAL SETUP ISSUE: App "${appName}" not found in catalog.\n`,
      `📚 For Tutorial Users:`,
      `1. Make sure you completed the deployment step: 'foundry apps deploy'`,
      `2. Verify the app was released: 'foundry apps release'`,
      `3. Check your .env file APP_NAME matches the deployed app\n`,
      `🔧 Current Configuration:`,
      `- APP_NAME: ${appName}`,
      `- Environment: ${config.isCI ? 'CI' : 'Local'}`,
      `- Base URL: ${config.falconBaseUrl}\n`,
      `💡 Need help? Check the tutorial README for deployment steps.`,
      `📖 Tutorial docs: https://github.com/CrowdStrike/foundry-tutorial-quickstart#readme`
    ].join('\n');
  }
}