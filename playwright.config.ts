import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load E2E environment (staging DB base URL + seeded role credentials).
dotenv.config({ path: path.resolve(__dirname, 'e2e/.env.e2e') });

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const START_LOCAL_SERVER = process.env.E2E_WEBSERVER === '1';

export default defineConfig({
  testDir: './e2e/tests',
  // Parallel-safe: every spec is independent and uses worker-scoped unique data.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/report', open: 'never' }],
    ['json', { outputFile: 'e2e/report/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    // 1) Auth setup — logs in every seeded role once and saves storage state.
    { name: 'setup', testDir: './e2e/support', testMatch: /auth\.setup\.ts/ },

    // 2) Main test project — depends on setup so role storage states exist.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  webServer: START_LOCAL_SERVER
    ? {
        command: 'pnpm --filter web start',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
