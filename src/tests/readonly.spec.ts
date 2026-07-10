import { expect, test } from '@playwright/test'

import { getGraphView, move, takeBeforeEach } from './helper'

test.describe('Readonly', () => {
  const { getContainer } = takeBeforeEach('?template=readonly', 500, 500)

  test('has nodes', async () => {
    const { findNodes } = await getGraphView(getContainer())

    expect(await findNodes('Add')).toHaveLength(1)
    expect(await findNodes('Number')).toHaveLength(2)
  })

  test('does not translate nodes', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())
    const [numberNode1] = await findNodes('Number')

    const { before, after } = await move(page, numberNode1, -100, 30)

    expect(after.x - before.x).toBeCloseTo(0, 0)
    expect(after.y - before.y).toBeCloseTo(0, 0)
  })

  test('keeps connections after disconnect attempt', async ({ page }) => {
    const { connections, findNodes } = await getGraphView(getContainer())
    const [addNode] = await findNodes('Add')

    expect(await connections()).toHaveLength(2)

    const el = await addNode.$('[data-testid="input-a"] [data-testid="input-socket"]')
    const box = await el?.boundingBox()

    if (!box) throw new Error('Cannot find bounding box for input socket')

    const socketCenter = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    }

    await page.mouse.move(socketCenter.x, socketCenter.y)
    await page.mouse.down()
    await page.mouse.move(socketCenter.x - 50, socketCenter.y - 30)
    await page.mouse.up()

    await page.waitForTimeout(500)
    expect(await connections()).toHaveLength(2)
  })

  test('snapshot: initial', async ({ page }) => {
    expect(await page.screenshot()).toMatchSnapshot('initial.png')
  })
})
