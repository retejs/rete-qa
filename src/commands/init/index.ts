import { App } from 'rete-kit'

export const targets: { stack: App.AppStack, versions: number[] }[] = [
  { stack: 'react', versions: [16, 17, 18] },
  { stack: 'react-vite', versions: [16, 17, 18] },
  { stack: 'vue', versions: [2, 3] },
  { stack: 'angular', versions: [12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { stack: 'svelte', versions: [3, 4, 5] },
  { stack: 'lit-vite', versions: [3] }
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

export function getFeatures({ stack, version }: Pick<(typeof fixtures)[0], 'stack' | 'version'>, next: boolean) {
  return [
    stack === 'angular' && new App.Features.Angular(version as 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20, next),
    ['react', 'react-vite'].includes(stack) && new App.Features.React(version, stack, next),
    stack === 'vue' && new App.Features.Vue(version as 2 | 3, next),
    stack === 'svelte' && new App.Features.Svelte(version as 3 | 4 | 5, next),
    stack === 'lit-vite' && new App.Features.Lit(version as 3, next),
    new App.Features.ZoomAt(),
    new App.Features.OrderNodes(),
    new App.Features.Dataflow(next),
    new App.Features.Selectable(),
    new App.Features.Minimap(next),
    new App.Features.Reroute(next)
  ]
}

export function validate(stacks: string[], stackVersions: string[] | null): { error: string | null } {
  const unknownStacks = stacks.filter(name => !stackNames.includes(name as App.AppStack))

  if (unknownStacks.length > 0) {
    return { error: `Unknown stack names: ${unknownStacks.join(', ')}` }
  }

  if (stacks.length > 1 && stackVersions && stackVersions.length > 0) {
    return { error: `You can't specify versions for multiple stacks` }
  }

  if (stacks.length === 1 && stackVersions && stackVersions.length > 0) {
    const [stack] = stacks
    const unknownVersions = stackVersions.filter(v => {
      const target = targets.find(t => t.stack === stack)

      return !target?.versions.includes(Number(v))
    })

    if (unknownVersions.length > 0) {
      return { error: `Unknown stack versions: ${unknownVersions.join(', ')}` }
    }
  }

  return { error: null }
}
