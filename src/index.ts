#!/usr/bin/env node

import { createCommand } from 'commander'
import execa from 'execa'
import chalk from 'chalk'
import fs from 'fs'
import { join, dirname, resolve } from 'path'
import { App } from 'rete-kit'
import { appsCachePath } from './consts'

const program = createCommand()

program.version(require('../package.json').version)

const targets: { stack: App.AppStack, versions: number[] }[] = [
  { stack: 'react', versions: [16, 18] },
  { stack: 'vue', versions: [2, 3] },
  { stack: 'angular', versions: [12, 15] }
]
const fixtures = targets
  .map(({ stack, versions }) => versions.map(version => ({ stack, version, folder:`${stack}${version}` as const })))
  .flat()
  .map(({ stack, version, folder }) => ({
    stack,
    version,
    folder
  }))

function getFeatures({ stack, version }: (typeof fixtures)[0], next: boolean) {
  return [
    stack === 'angular' && new App.Features.Angular(version as 12 | 13 | 14 | 15, next),
    stack === 'react' && new App.Features.React(version, stack, next),
    stack === 'vue' && new App.Features.Vue(version as 2 | 3, next),
    new App.Features.ZoomAt(),
    new App.Features.OrderNodes(),
    new App.Features.Dataflow(next),
    new App.Features.Selectable()
  ]
}


program
  .command('init')
  .description(`Initialize testing tool`)
  .option('-d --deps-alias <deps-alias>')
  .option('-n --next')
  .action(async (options: { depsAlias: string, next?: boolean }) => {
    if (!process.version.startsWith('v16')) console.info(chalk.yellow('---\nWe recommend using Node.js 16 to avoid any potential issues\n---'))
    if (!options.next) {
      console.error(chalk.red('--next option is required since v2 is still in Beta'))
      process.exit(1)
    }

    const next = options.next || false
    const cwd = process.cwd()
    const depsAlias = options.depsAlias ? resolve(cwd, options.depsAlias) : undefined

    await fs.promises.mkdir(join(cwd, appsCachePath), { recursive: true })

    for (const fixture of fixtures) {
      const features = getFeatures(fixture, next)
      const { folder, stack, version } = fixture

      console.log(chalk.green('Start creating', chalk.yellow(stack, `v${version}`), 'application in ', folder));

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
  .action(async (options: { updateSnapshots?: boolean }) => {
    for (const fixture of fixtures) {
      try {
        console.log('\n', chalk.bgGreen(' START '), chalk.green('Testing in', chalk.yellow(fixture.folder), '...'))
        const APP = fixture.folder
        const SERVE = App.builders[fixture.stack].getStaticPath(fixture.folder)
        const playwrightFolder = dirname(require.resolve('playwright'))

        await execa(`${playwrightFolder}/cli.js`, [
          'test',
          '--config', join(__dirname, './playwright.config.js'),
          ...(options.updateSnapshots ? ['--update-snapshots'] : [])
        ], { env: { APP, SERVE }, stdio: 'inherit' })
        console.log('\n', chalk.bgGreen(' DONE '), chalk.green('Testing for', chalk.yellow(fixture.folder), 'done'))
      } catch (err) {
        console.log('\n', chalk.black.bgRgb(220,50,50)(' FAIL '), chalk.red('Tests in', fixture.folder, 'failed.', err))
      }
    }
  })

program.parse(process.argv)

export {}
