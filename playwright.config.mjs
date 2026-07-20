import { defineConfig, devices } from '@playwright/test'
import { homedir } from 'node:os'
import { join } from 'node:path'

const chromiumExecutable = join(
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
    join(homedir(), 'AppData', 'Local', 'ms-playwright'),
  'chromium-1169',
  'chrome-win',
  'chrome.exe',
)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5173',
        launchOptions: {
          executablePath: chromiumExecutable,
          headless: true,
        },
      },
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    launchOptions: {
      executablePath: chromiumExecutable,
    },
  },
})
