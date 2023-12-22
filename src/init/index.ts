import { App } from 'rete-kit'

export const targets: { stack: App.AppStack, versions: number[] }[] = [
  { stack: 'react', versions: [16, 17, 18] },
  { stack: 'vue', versions: [2, 3] },
  { stack: 'angular', versions: [12, 13, 14, 15, 16, 17] },
  { stack: 'svelte', versions: [3, 4] }
]
export const stackNames = targets.map(t => t.stack)

export const fixtures = targets
  .map(({ stack, versions }) => versions.map(version => ({ stack, version, folder: `${stack}${version}` as const })))
  .flat()
  .map(({ stack, version, folder }) => ({
    stack,
    version,
    folder
  }))

export function getFeatures({ stack, version }: (typeof fixtures)[0], next: boolean) {
  return [
    stack === 'angular' && new App.Features.Angular(version as 12 | 13 | 14 | 15, next),
    stack === 'react' && new App.Features.React(version, stack, next),
    stack === 'vue' && new App.Features.Vue(version as 2 | 3, next),
    stack === 'svelte' && new App.Features.Svelte(version as 3 | 4, next),
    new App.Features.ZoomAt(),
    new App.Features.OrderNodes(),
    new App.Features.Dataflow(next),
    new App.Features.Selectable(),
    new App.Features.Minimap(next),
    new App.Features.Reroute(next)
  ]
}

