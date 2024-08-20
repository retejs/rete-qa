import { devices } from '@playwright/test'
import { join } from 'path'

export const dotFolder = '.rete-qa'
export const appsCachePath = join(dotFolder, 'apps')

export const projects = [
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
]
