#!/usr/bin/env node

import { createCommand } from 'commander'
import execa from 'execa'
import chalk from 'chalk'
import fs from 'fs'
import { join, resolve } from 'path'
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
    folder,
    features: [
      stack === 'angular' && new App.Features.Angular(),
      stack === 'react' && new App.Features.React(version),
      stack === 'vue' && new App.Features.Vue(version as 2 | 3),
      new App.Features.ZoomAt(),
      new App.Features.OrderNodes(),
      new App.Features.Dataflow(),
      new App.Features.Selectable()
    ]
  }))

program
  .command('init')
  .description(`Initialize testing tool`)
  .option('-d --deps-alias <deps-alias>')
  .action(async (options: { depsAlias: string }) => {
    const cwd = process.cwd()
    const depsAlias = options.depsAlias ? resolve(cwd, options.depsAlias) : undefined

    for (const { folder, stack, version, features } of fixtures) {
      console.log(chalk.green('Start creating', chalk.yellow(stack, `v${version}`), 'application in ', folder));

      await fs.promises.mkdir(join(appsCachePath, folder), { recursive: true })

      process.chdir(join(cwd, appsCachePath))
      await App.createApp(folder, stack, version, features.map(f => f && f.name).filter(Boolean) as string[], depsAlias)
      await execa('npm', ['run', 'build'], { cwd: join(cwd, appsCachePath, folder) })
    }
  })

program
  .command('test')
  .description(`Test`)
  .action(async () => {
    for (const fixture of fixtures) {
      try {
        console.log(chalk.green('Testing in', chalk.yellow(fixture.folder), '...'))
        const APP = fixture.folder
        const SERVE = App.builders[fixture.stack].getStaticPath(fixture.folder)

        await execa('./node_modules/.bin/playwright', ['test'], { env: { APP, SERVE }, stdio: 'inherit' })
        console.log(chalk.green('Testing done for ', chalk.yellow(fixture.folder)))
      } catch (err) {
        console.log(chalk.red('Tests in', fixture.folder, 'failed.', err))
      }
    }
  })

program.parse(process.argv)

export {}
