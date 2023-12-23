#!/usr/bin/env node

import { createCommand } from 'commander'
import execa from 'execa'
import chalk from 'chalk'
import fs from 'fs'
import { join, dirname, resolve } from 'path'
import { App } from 'rete-kit'
import { appsCachePath, projects } from './consts'
import { log } from './ui'
import { fixtures, getFeatures, stackNames, validate } from './commands/init'

const program = createCommand()

program.version(require('../package.json').version)

program
  .command('init')
  .description(`Initialize testing tool`)
  .option('-d --deps-alias <deps-alias>')
  .option('-n --next')
  .option('-s --stack <stack>', `Stacks to test, comma-separated (${stackNames.join(',')})`)
  .option('-sv --stack-versions <stack-version>', `Versions to test, comma-separated`)
  .action(async (options: { depsAlias: string, stack?: string, stackVersions?: string, next?: boolean }) => {
    if (!process.version.startsWith('v16')) console.info(chalk.yellow('---\nWe recommend using Node.js 16 to avoid any potential issues\n---'))

    const next = options.next || false
    const cwd = process.cwd()
    const depsAlias = options.depsAlias ? resolve(cwd, options.depsAlias) : undefined
    const stacks = options.stack ? options.stack.split(',') : stackNames
    const stackVersions = options.stackVersions ? options.stackVersions.split(',') : null

    const { error } = validate(stacks, stackVersions)

    if (error) {
      log('fail', 'FAIL')(chalk.red(error))
      process.exit(1)
    }

    await fs.promises.mkdir(join(cwd, appsCachePath), { recursive: true })

    for (const fixture of fixtures) {
      const features = getFeatures(fixture, next)
      const { folder, stack, version } = fixture

      if (!stacks.includes(stack)) continue
      if (stackVersions && !stackVersions.includes(String(version))) continue

      log('success')('Start creating', chalk.yellow(stack, `v${version}`), 'application in ', folder)

      process.chdir(join(cwd, appsCachePath))
      await App.createApp({
        name: folder,
        stack,
        version,
        features: features.map(f => f && f.name).filter(Boolean) as string[],
        depsAlias,
        next
      })
      await execa('npm', ['run', 'build'], { cwd: join(cwd, appsCachePath, folder) })
    }
  })

program
  .command('test')
  .description(`Run tests for previously initialized apps`)
  .option('-u --update-snapshots', 'Update snapshots')
  .option('-g --grep <regex>', 'Match tests by name')
  .option('-s --stack <stack>', `Stacks to test, comma-separated (${stackNames.join(',')})`)
  .option('-sv --stack-versions <stack-version>', `Versions to test, comma-separated`)
  .option('-p --project <project>', `Project (${projects.map(p => p.name)})`)
  .action(async (options: { updateSnapshots?: boolean, stack?: string, stackVersions?: string, project?: string, grep?: string }) => {
    const stacks = options.stack ? options.stack.split(',') : null
    const stackVersions = options.stackVersions ? options.stackVersions.split(',') : null

    for (const fixture of fixtures) {
      const { folder, stack, version } = fixture

      if (stacks && !stacks.includes(stack)) continue
      if (stackVersions && !stackVersions.includes(String(version))) continue

      try {
        log('success', 'START')('Testing in', chalk.yellow(folder), '...')
        const APP = folder
        const SERVE = App.builders[stack].getStaticPath(folder, version)
        const playwrightFolder = dirname(require.resolve('@playwright/test'))

        await execa(`${playwrightFolder}/cli.js`, [
          'test',
          '--config', join(__dirname, './playwright.config.js'),
          ...(options.project ? ['--project', options.project] : []),
          ...(options.updateSnapshots ? ['--update-snapshots'] : []),
          ...(options.grep ? ['--grep', options.grep] : [])
        ], { env: { APP, SERVE }, stdio: 'inherit' })
        log('success', 'DONE')('Testing for', chalk.yellow(folder), 'done')
      } catch (err) {
        log('fail', 'FAIL')('Tests in', folder, 'failed.', err)
      }
    }
  })

program.parse(process.argv)

export { }
