import { test, expect, Page } from '@playwright/test';
import { baseURL } from '../src/utils.cjs';
import dotenv from 'dotenv';

dotenv.config();

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

  test("Ensure Foundry loads", async () => {
    await expect(page).toHaveTitle("Home | Foundry | Falcon");
  });

  test("Install using App manager", async()=> {
    await page.getByRole("link", { name: "App manager" }).click();
    await expect(page).toHaveTitle("App manager | Foundry | Falcon");

    // Find app
    const appList = page.getByTestId("custom-apps-list")
    const appText = appList.getByText(process.env.APP_NAME);
    await appText.waitFor({ state: "visible" });
    const parent = appText.locator("../../../../..");
    await parent.locator("button").click();
    await page.getByText("View in app catalog").click();

    await expect(page).toHaveTitle("App catalog | Foundry | Falcon");

    // Install now
    const installBtn = page.getByTestId("app-details-page__install-button")
    await expect(installBtn).toBeVisible();
    await installBtn.click();

    // Wait for dialog to load
    await page.waitForLoadState("networkidle");

    // Save and install
    const submitBtn = page.getByTestId("submit")
    await submitBtn.waitFor({ state: "visible" });
    await submitBtn.click();

    // Wait for next screen to load
    await page.waitForLoadState("networkidle");

    // Verify installed
    const status = page.getByTestId("status-text");
    await status.waitFor({ state: "visible" });
    await expect(status).toHaveText("Installed");

    // Navigate to Host management socket to see UI extension
    await page.getByTestId("nav-trigger").click();
    await page.getByText("Host setup and management").click();
    await page.getByText("Host management").click();

    await page.screenshot({ path: "test-results/screenshot.png" });

    // todo: navigate to Endpoint security > Endpoint detections and confirm app renders
  });
});
