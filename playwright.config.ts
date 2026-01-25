import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour tests mobiles et desktop
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers and mobile devices */
  projects: [
    // ========== DESKTOP ==========
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },

    // ========== iOS DEVICES ==========
    {
      name: 'iPhone SE',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'iPhone 12',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iPhone 14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'iPhone 14 Pro Max',
      use: { ...devices['iPhone 14 Pro Max'] },
    },
    {
      name: 'iPad Mini',
      use: { ...devices['iPad Mini'] },
    },
    {
      name: 'iPad Pro 11',
      use: { ...devices['iPad Pro 11'] },
    },

    // ========== ANDROID DEVICES ==========
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Pixel 7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Samsung Galaxy S8',
      use: { ...devices['Galaxy S8'] },
    },
    {
      name: 'Samsung Galaxy S9+',
      use: { ...devices['Galaxy S9+'] },
    },
    {
      name: 'Galaxy Tab S4',
      use: { ...devices['Galaxy Tab S4'] },
    },
  ],

  /* Start production server before running tests (more stable than dev) */
  webServer: {
    command: 'pnpm start --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
