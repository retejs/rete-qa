import fs from 'fs'
import { join } from 'path'

import { appsCachePath } from '../../consts'
import { fixtures, targets } from '../init'

export async function validateTestRun(app: string, dist: string): Promise<{ error: string | null }> {
  const indexHtmlPath = join(process.cwd(), appsCachePath, app, dist, 'index.html')
  const indexHtmlExists = await fs.promises.stat(indexHtmlPath).catch(() => false)

  if (!indexHtmlExists) {
    return { error: 'index.html not found. Check if the app was built correctly' }
  }

  return { error: null }
}

export function validateSnapshotsUpdate(targetFixtures: typeof fixtures) {
  const fixture = targetFixtures[0]
  const numberOfFixtures = targetFixtures.length
  const target = targets[0]

  const canUpdateSnashots = numberOfFixtures === 1
    && fixture.stack === target.stack
    && fixture.version === target.versions[target.versions.length - 1]

  if (!canUpdateSnashots) {
    return { error: 'You can update snapshots only for the latest version of React' }
  }

  return { error: null }
}
