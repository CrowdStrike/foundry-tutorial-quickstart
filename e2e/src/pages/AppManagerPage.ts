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
  }
}