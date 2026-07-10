import { beforeEach, describe, expect, it } from '@jest/globals'
import { App } from 'rete-kit'

import { fixtures, getBaseFeatures, getFeatures, validate } from './index'

describe('Features', () => {
  fixtures.forEach(fixture => {
    describe(`Stack: ${fixture.stack}, Version: ${fixture.version}`, () => {
      let baseFeatures: ReturnType<typeof getBaseFeatures> = []
      let features: ReturnType<typeof getFeatures>

      beforeEach(() => {
        const next = false

        baseFeatures = getBaseFeatures(fixture, next).filter(Boolean)
        features = getFeatures(fixture, next)
      })

      it('has common base features', () => {
        expect(baseFeatures).toContainEqual(expect.any(App.Features.ZoomAt))
        expect(baseFeatures).toContainEqual(expect.any(App.Features.OrderNodes))
        expect(baseFeatures).toContainEqual(expect.any(App.Features.Dataflow))
        expect(baseFeatures).toContainEqual(expect.any(App.Features.Selectable))
        expect(baseFeatures).not.toContainEqual(expect.any(App.Features.Minimap))
        expect(baseFeatures).not.toContainEqual(expect.any(App.Features.Reroute))
        expect(baseFeatures).not.toContainEqual(expect.any(App.Features.Readonly))
        expect(baseFeatures).not.toContainEqual(expect.any(App.Features.Comments))
        expect(baseFeatures).not.toContainEqual(expect.any(App.Features.History))
      })

      it('puts optional plugins into features object extras', () => {
        expect(Array.isArray(features)).toBe(false)
        if (Array.isArray(features)) return

        expect(features.base).toEqual(expect.arrayContaining(['Zoom at', 'Selectable nodes']))
        expect(features.minimap).toEqual({
          from: 'default',
          features: expect.arrayContaining(['Minimap'])
        })
        expect(features.reroute).toEqual({
          from: 'default',
          features: expect.arrayContaining(['Reroute'])
        })
        expect(features.readonly).toEqual({
          from: 'default',
          features: expect.arrayContaining(['Readonly'])
        })
        expect(features.comments).toEqual({
          from: 'default',
          features: expect.arrayContaining(['Comments'])
        })
        expect(features.history).toEqual({
          from: 'default',
          features: expect.arrayContaining(['History', 'Context menu'])
        })
        expect(features['comments-history']).toEqual({
          from: 'default',
          features: expect.arrayContaining(['Comments', 'History'])
        })
        if (typeof features.comments === 'object' && !Array.isArray(features.comments)) {
          expect(features.comments.features).not.toContain('History')
        }
        if (typeof features.history === 'object' && !Array.isArray(features.history)) {
          expect(features.history.features).not.toContain('Comments')
        }
        if (typeof features.minimap === 'object' && !Array.isArray(features.minimap)) {
          expect(features.minimap.features).not.toContain('Reroute')
          expect(features.minimap.features).not.toContain('Readonly')
        }
        if (typeof features.reroute === 'object' && !Array.isArray(features.reroute)) {
          expect(features.reroute.features).not.toContain('Minimap')
          expect(features.reroute.features).not.toContain('Readonly')
        }
        if (typeof features.readonly === 'object' && !Array.isArray(features.readonly)) {
          expect(features.readonly.features).not.toContain('Minimap')
          expect(features.readonly.features).not.toContain('Reroute')
        }
      })

      it('has stack specific features', () => {
        if (fixture.stack === 'angular') {
          expect(baseFeatures).toContainEqual(expect.any(App.Features.Angular))
        } else if (fixture.stack === 'react') {
          expect(baseFeatures).toContainEqual(expect.any(App.Features.React))
        } else if (fixture.stack === 'vue') {
          expect(baseFeatures).toContainEqual(expect.any(App.Features.Vue))
        } else if (fixture.stack === 'svelte') {
          expect(baseFeatures).toContainEqual(expect.any(App.Features.Svelte))
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
