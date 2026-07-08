import { join } from 'path'

export const dotFolder = '.rete-qa'
export const appsCachePath = join(dotFolder, 'apps')

export const projectNames = ['chromium', 'firefox', 'webkit'] as const

export function getProjects() {
  const { devices } = require('@playwright/test') as typeof import('@playwright/test')

  return [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
}
