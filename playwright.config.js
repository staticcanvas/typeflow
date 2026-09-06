import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}/`;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.pw.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A single retry absorbs occasional browser-runner contention under the
  // fully parallel desktop/mobile matrix; the server serves one static build.
  retries: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'chromium-360',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 } },
    },
  ],
  webServer: {
    command: `hugo --source docs --baseURL=${BASE_URL} --gc && python3 -m http.server ${PORT} --bind 127.0.0.1 --directory public`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
