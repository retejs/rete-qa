import { App } from 'rete-kit'

type AngularInitVersion = 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22

export const targets: { stack: App.AppStack, versions: number[] }[] = [
  { stack: 'react', versions: [16, 17, 18] },
  { stack: 'react-vite', versions: [16, 17, 18, 19] },
  { stack: 'vue', versions: [2, 3] },
  { stack: 'angular', versions: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] },
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

export function getBaseFeatures({ stack, version }: Pick<(typeof fixtures)[0], 'stack' | 'version'>, next: boolean) {
  return [
    stack === 'angular' && new App.Features.Angular(version as AngularInitVersion as never, next),
    ['react', 'react-vite'].includes(stack) && new App.Features.React(version, stack, next),
    stack === 'vue' && new App.Features.Vue(version as 2 | 3, next),
    stack === 'svelte' && new App.Features.Svelte(version as 3 | 4 | 5, next),
    stack === 'lit-vite' && new App.Features.Lit(version as 3, next),
    new App.Features.ZoomAt(),
    new App.Features.OrderNodes(),
    new App.Features.Dataflow(next),
    new App.Features.Selectable()
  ]
}

export function getFeatures(
  fixture: Pick<(typeof fixtures)[0], 'stack' | 'version'>,
  next: boolean
): App.FeaturesInput {
  const base = getBaseFeatures(fixture, next)
    .filter((feature): feature is Exclude<typeof feature, false> => Boolean(feature))
    .map(feature => feature.name)

  return {
    base,
    minimap: {
      from: 'default',
      features: [...base, 'Minimap']
    },
    reroute: {
      from: 'default',
      features: [...base, 'Reroute']
    },
    readonly: {
      from: 'default',
      features: [...base, 'Readonly']
    },
    comments: {
      from: 'default',
      features: [...base, 'Comments']
    },
    history: {
      from: 'default',
      // Context menu provides Delete for nodes/connections in e2e
      features: [...base, 'History', 'Context menu']
    },
    'comments-history': {
      from: 'default',
      features: [...base, 'Comments', 'History']
    }
  }
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
