import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the production build: the API serves the
 * built Angular app from a throw-away data directory seeded with sample data.
 * `npm run build` must have run first (CI does; `npm run e2e` does too).
 */
const PORT = 3100;
const DATA_DIR = '.e2e-data';
/** A second server with APP_PASSWORD set, for the sign-in tests. */
const AUTH_PORT = 3101;
const AUTH_DATA_DIR = '.e2e-data-auth';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    viewport: { width: 1366, height: 900 },
  },
  projects: [
    { name: 'chromium', testIgnore: /auth\.spec/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'auth',
      testMatch: /auth\.spec/,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${AUTH_PORT}` },
    },
  ],
  webServer: [
    {
      command: `rm -rf ${DATA_DIR} && node apps/api/dist/seed.js && node apps/api/dist/main.js`,
      url: `http://localhost:${PORT}/api/pickups`,
      reuseExistingServer: false,
      env: { PORT: String(PORT), DATA_DIR },
      timeout: 60_000,
    },
    {
      command: `rm -rf ${AUTH_DATA_DIR} && node apps/api/dist/seed.js && node apps/api/dist/main.js`,
      url: `http://localhost:${AUTH_PORT}/api/version`,
      reuseExistingServer: false,
      env: { PORT: String(AUTH_PORT), DATA_DIR: AUTH_DATA_DIR, APP_PASSWORD: 'workshop-secret' },
      timeout: 60_000,
    },
  ],
});
