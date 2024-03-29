import { test, expect } from '@playwright/test'
import { getGraphView, getPositions, isInside, isOutside, move, takeBeforeEach } from './helper'

test.describe('Minimap', () => {
  const { getContainer } = takeBeforeEach('', 500, 500)

  test('has minimap', async ({ page }) => {
    await expect(page.getByTestId('minimap')).toBeVisible()
    await expect(page.getByTestId('minimap')).toHaveCount(1)
  })

  test('has mini nodes', async ({ page }) => {
    await expect(page.getByTestId('minimap-node')).toHaveCount(3)
  })

  test('has mini viewport', async ({ page }) => {
    await expect(page.getByTestId('minimap-viewport')).toBeVisible()
    await expect(page.getByTestId('minimap-viewport')).toHaveCount(1)
  })

  test('translate node', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())

    const [numberNode1] = await findNodes('Number')

    const before = await getPositions(page, '[data-testid="minimap-node"]')

    await move(page, numberNode1, -420, 100)

    const after = await getPositions(page, '[data-testid="minimap-node"]')

    expect(before.width * 1.5).toBeLessThan(after.width)
    expect(await page.screenshot()).toMatchSnapshot('minimap-translate-node.png')
  })

  test('translate area', async ({ page }) => {
    const container = getContainer()
    const area = await container.$('div')

    if (!area) throw new Error('area not found')

    const nodesBefore = await getPositions(page, '[data-testid="minimap-node"]')
    const viewportBefore = await getPositions(page, '[data-testid="minimap-viewport"]')

    expect(isInside(nodesBefore, viewportBefore)).toBeTruthy()

    await move(page, area, 900, 0, 'corner')

    const nodesAfter = await getPositions(page, '[data-testid="minimap-node"]')
    const viewportAfter = await getPositions(page, '[data-testid="minimap-viewport"]')

    expect(isOutside(nodesAfter, viewportAfter)).toBeTruthy()

    expect(await page.screenshot()).toMatchSnapshot('minimap-translate-area.png')
  })

  test('translate mini viewport', async ({ page }) => {
    test.skip(String(process.env.APP).startsWith('react16'), 'React.js v16 has problems with minimap viewport translation')

    await page.waitForSelector('[data-testid="minimap-viewport"]')

    const viewport = await page.$('[data-testid="minimap-viewport"]')

    if (!viewport) throw new Error('viewport not found')

    await move(page, viewport, 25, 0)

    expect(await page.screenshot()).toMatchSnapshot('minimap-translate-viewport.png')
  })

  test('double click viewport', async ({ page }) => {
    const bbox = await page.getByTestId('minimap-viewport').boundingBox()

    if (!bbox) throw new Error('bbox')

    await page.mouse.dblclick(bbox.x + bbox.width * 0.75, bbox.y + bbox.height * 0.75)

    expect(await page.screenshot()).toMatchSnapshot('minimap-dblclick-viewport.png')
  })
})
