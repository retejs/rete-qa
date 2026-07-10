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

const snapshotStack = 'react-vite'

export function validateSnapshotsUpdate(targetFixtures: typeof fixtures) {
  const fixture = targetFixtures[0]
  const numberOfFixtures = targetFixtures.length
  const target = targets.find(({ stack }) => stack === snapshotStack)

  if (!target) {
    return { error: `Snapshot stack "${snapshotStack}" is not configured` }
  }

  const latestVersion = target.versions[target.versions.length - 1]
  const canUpdateSnashots = numberOfFixtures === 1
    && fixture.stack === snapshotStack
    && fixture.version === latestVersion

  if (!canUpdateSnashots) {
    return { error: `You can update snapshots only for the latest version of ${snapshotStack} (v${latestVersion})` }
  }

  return { error: null }
}
