import { beforeEach, describe, expect, it } from '@jest/globals'
import { App } from 'rete-kit'

import { fixtures, getFeatures, validate } from './index'

describe('Features', () => {
  fixtures.forEach(fixture => {
    describe(`Stack: ${fixture.stack}, Version: ${fixture.version}`, () => {
      let features: ReturnType<typeof getFeatures> = []

      beforeEach(() => {
        const next = false

        features = getFeatures(fixture, next).filter(Boolean)
      })

      it('has common features', () => {
        expect(features).toContainEqual(expect.any(App.Features.ZoomAt))
        expect(features).toContainEqual(expect.any(App.Features.OrderNodes))
        expect(features).toContainEqual(expect.any(App.Features.Dataflow))
        expect(features).toContainEqual(expect.any(App.Features.Selectable))
        expect(features).toContainEqual(expect.any(App.Features.Minimap))
        expect(features).toContainEqual(expect.any(App.Features.Reroute))
      })

      it('has stack specific features', () => {
        if (fixture.stack === 'angular') {
          expect(features).toContainEqual(expect.any(App.Features.Angular))
        } else if (fixture.stack === 'react') {
          expect(features).toContainEqual(expect.any(App.Features.React))
        } else if (fixture.stack === 'vue') {
          expect(features).toContainEqual(expect.any(App.Features.Vue))
        } else if (fixture.stack === 'svelte') {
          expect(features).toContainEqual(expect.any(App.Features.Svelte))
        }
      })
    })
  })
})

describe('Validation', () => {
  it('rejects unknown stack names', () => {
    const stacks = ['react', 'angular', 'unknown']
    const stackVersions = null

    const result = validate(stacks, stackVersions)

    expect(result.error).toBe('Unknown stack names: unknown')
  })

  it('throws an error if versions are specified for multiple stacks', () => {
    const stacks = ['react', 'angular']
    const stackVersions = ['16', '12']

    const result = validate(stacks, stackVersions)

    expect(result.error).toBe(`You can't specify versions for multiple stacks`)
  })

  it('throws an error if unsupported versions are specified', () => {
    const stacks = ['react']
    const stackVersions = ['unknown']

    const result = validate(stacks, stackVersions)

    expect(result.error).toBe('Unknown stack versions: unknown')
  })

  it('should return null if no errors are found', () => {
    const stacks = ['react']
    const stackVersions = ['16', '17']

    const result = validate(stacks, stackVersions)

    expect(result.error).toBeNull()
  })
})
