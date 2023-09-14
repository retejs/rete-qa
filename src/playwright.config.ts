import { defineConfig } from '@playwright/test';
import { join } from 'path';
import { appsCachePath, projects } from './consts'

const { APP, SERVE } = process.env

if (!APP) throw new Error('process.env.APP is undefined')
if (!SERVE) throw new Error('process.env.SERVE is undefined')

const root = join(__dirname, '..')
const cwd = process.cwd()

const getServeCommand = () => {
  return `${join(root, 'node_modules', '.bin', 'serve')} ${join(cwd, appsCachePath, APP, SERVE)}`
}

export default defineConfig({
  testDir: join(__dirname, 'tests'),
  testMatch: /.*(test|spec)\.(js|ts|mjs)/,
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.001,
      threshold: 0.1
    }
  },
  snapshotPathTemplate: join(root, `snapshots/${APP}/{/projectName}/{arg}{ext}`),
  updateSnapshots: 'none',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['line'],
    process.env.CI ? ['github'] : ['html']
  ],
  use: {
    actionTimeout: 4000,
    trace: 'on-first-retry',
  },
  projects,
  outputDir: join(cwd, 'test-results', APP),
  webServer: {
    command: getServeCommand(),
    port: 3000
  }
});
