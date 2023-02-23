import fs from 'fs';
import { defineConfig, devices } from '@playwright/test';
import { join } from 'path';

const { APP, SERVE } = process.env

if (!APP) throw new Error('process.env.APP is undefined')
if (!SERVE) throw new Error('process.env.SERVE is undefined')

const getServeCommand = () => {
  return `./node_modules/.bin/serve ${join('apps', APP, SERVE)}`
}

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.002,
      threshold: 0.1
    }
  },
  snapshotPathTemplate: `snapshots/${APP}/{/projectName}/{testFilePath}/{arg}{ext}`,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'line',
  use: {
    actionTimeout: 4000,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    }
  ],
  outputDir: join('test-results', APP),
  webServer: {
    command: getServeCommand(),
    port: 3000
  }
});
