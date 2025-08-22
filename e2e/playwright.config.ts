import { defineConfig, devices } from '@playwright/test';
import { AuthFile } from './constants/AuthFile';

if (!process.env.CI) {
  require("dotenv").config({ path: ".env" });
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Serial execution for tutorial learning experience
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Allow 1 retry locally for better reliability
  workers: process.env.CI ? 1 : undefined,
  
  // Enhanced timeout hierarchy for reliability
  timeout: process.env.CI ? 60 * 1000 : 45 * 1000, // Test timeout
  expect: {
    timeout: process.env.CI ? 10 * 1000 : 8 * 1000, // Assertion timeout
  },
  
  reporter: 'html',
  use: {
    testIdAttribute: 'data-test-selector',
    trace: 'on-first-retry',
    
    // Optimized timeouts for better tutorial experience
    actionTimeout: process.env.CI ? 15 * 1000 : 12 * 1000, // Action timeout
    navigationTimeout: process.env.CI ? 30 * 1000 : 25 * 1000, // Navigation timeout
  },

  projects: [
    {
      name: 'setup',
      testMatch: /authenticate.setup.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AuthFile
      },
      dependencies: ["setup"]
    },
  ],
});
