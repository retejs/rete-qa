import { join } from 'path'
import fs from 'fs'
import { appsCachePath } from '../../consts'

export async function validateTestRun(app: string, dist: string): Promise<{ error: string | null }> {
  const indexHtmlPath = join(process.cwd(), appsCachePath, app, dist, 'index.html')
  const indexHtmlExists = await fs.promises.stat(indexHtmlPath).catch(() => false)

  if (!indexHtmlExists) {
    return { error: 'index.html not found. Check if the app was built correctly' }
  }

  return { error: null }
}
