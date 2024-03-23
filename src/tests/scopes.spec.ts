import { test, expect } from '@playwright/test'
import { boundingBox, getGraphView, isInside, move, pickNode, takeBeforeEach, toRect } from './helper'

test.describe('Scopes', () => {
  const { getContainer } = takeBeforeEach('?template=scopes', 500, 500)

  test('has nodes', async () => {
    const { findNodes } = await getGraphView(getContainer())

    expect(await findNodes('A')).toHaveLength(1)
    expect(await findNodes('B')).toHaveLength(2)
    expect(await findNodes('Parent')).toHaveLength(2)
  })

  test('snapshot', async ({ page }) => {
    expect(await page.screenshot()).toMatchSnapshot('scopes.png')
  })

  // eslint-disable-next-line max-statements
  test('has correct sizes', async () => {
    const { findNodes } = await getGraphView(getContainer())

    const [A] = await findNodes('A')
    const [B1, B2] = await findNodes('B')
    const [outerParent, innerParent] = await findNodes('Parent')

    const aRect = toRect(await boundingBox(A))
    const b1Rect = toRect(await boundingBox(B1))
    const b2Rect = toRect(await boundingBox(B2))
    const outerParentRect = toRect(await boundingBox(outerParent))
    const innerParentRect = toRect(await boundingBox(innerParent))

    expect(isInside(aRect, outerParentRect)).toBe(true)
    expect(isInside(b1Rect, innerParentRect)).toBe(true)
    expect(isInside(b2Rect, outerParentRect)).toBe(true)
    expect(isInside(innerParentRect, outerParentRect)).toBe(true)
  })

  test('translate nested node', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())
    const [node] = await findNodes('B')

    await pickNode(page, node)
    await move(page, node, -30, -100)

    expect(await page.screenshot()).toMatchSnapshot('scopes-translated.png')
  })

  test('translate nested node', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())
    const [node] = await findNodes('B')

    await pickNode(page, node)
    await move(page, node, -30, -100)

    expect(await page.screenshot()).toMatchSnapshot('scopes-nested-translated.png')
  })

  test('translate parent node', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())
    const [outerParent] = await findNodes('Parent')

    await pickNode(page, outerParent)
    await move(page, outerParent, -30, -100)

    expect(await page.screenshot()).toMatchSnapshot('scopes-parent-translated.png')
  })

  test('change relation', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())
    const [node] = await findNodes('B')

    await pickNode(page, node)
    await move(page, node, 0, -220, 'corner', {
      async down() {
        await page.mouse.down({ button: 'left' })
        await page.waitForTimeout(2000)
      }
    })

    expect(await page.screenshot()).toMatchSnapshot('scopes-changed-relation.png')
  })
})
