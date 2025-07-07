import { test, expect, Page } from '@playwright/test';
import { baseURL } from '../src/utils.cjs';

test.describe("Foundry", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(baseURL + "/foundry/home", {
      waitUntil: "domcontentloaded",
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("Check title", async () => {
    await page.waitForTimeout(2000);
    const title = await page.title();
    await page.screenshot({ path: 'test-results/screenshot.png' });
    expect(title).toBe("Home | Foundry | Falcon"); // without the wait: Falcon Foundry | Falcon
  });

  test("App manager", async()=> {
    await page.getByRole("link", { name: "App manager" }).click();
    await page.waitForTimeout(2000);
    const title = await page.title();
    expect(title).toBe("App manager | Foundry | Falcon");
  });
});
