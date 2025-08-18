import { Page, expect } from '@playwright/test';

export class FoundryHomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(this.getBaseURL() + '/foundry/home', {
      waitUntil: 'domcontentloaded',
    });
  }

  private getBaseURL(): string {
    return process.env.FALCON_BASE_URL || 'https://falcon.us-2.crowdstrike.com';
  }

  async verifyLoaded() {
    await expect(this.page).toHaveTitle('Home | Foundry | Falcon');
  }

  async navigateToAppManager() {
    await this.page.getByRole('link', { name: 'App manager' }).click();
    await expect(this.page).toHaveTitle('App manager | Foundry | Falcon');
  }
}