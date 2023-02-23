#!/usr/bin/env node

import { createCommand } from 'commander'
import execa from 'execa'
import chalk from 'chalk'
import fs from 'fs'
import { join, resolve } from 'path'
import { Features, AppStack, builders } from 'rete-kit'

const program = createCommand()

program.version(require('../package.json').version)

const targets: { stack: AppStack, versions: number[] }[] = [
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
      stack === 'angular' && new Features.Angular(),
      stack === 'react' && new Features.React(version),
      stack === 'vue' && new Features.Vue(version as 2 | 3),
      new Features.ZoomAt(),
      new Features.OrderNodes(),
      new Features.Dataflow(),
      new Features.Selectable()
    ]
  }))

program
  .command('init')
  .description(`Initialize testing tool`)
  .option('-d --deps-alias <deps-alias>')
  .action(async (options: { depsAlias: string }) => {
    for (const { folder, stack, version, features } of fixtures) {
      console.log(chalk.green('Start creating', chalk.yellow(stack, `v${version}`), 'application in ', folder));

      await fs.promises.mkdir('apps', { recursive: true })
      await execa('../node_modules/.bin/rete-kit', [
        'app',
        '--name', folder,
        '--stack', stack,
        '--stack-version', String(version),
        '--features', features.map(f => f && f.name).filter(Boolean).join(','),
        ...( options.depsAlias ? ['--deps-alias', resolve(process.cwd(), options.depsAlias)] : [])
      ], { cwd: join(process.cwd(), 'apps'), stdio: 'inherit' })
      await execa('npm', ['run', 'build'], { cwd: join(process.cwd(), 'apps', folder) })
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
        const SERVE = builders[fixture.stack].getStaticPath(fixture.folder)

        await execa('./node_modules/.bin/playwright', ['test'], { env: { APP, SERVE }, stdio: 'inherit' })
        console.log(chalk.green('Testing done for ', chalk.yellow(fixture.folder)))
      } catch (err) {
        console.log(chalk.red('Tests in', fixture.folder, 'failed.', err))
      }
    }
  })

program.parse(process.argv)

export {}
