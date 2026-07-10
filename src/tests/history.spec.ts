import { expect, test } from '@playwright/test'

import {
  addNodeViaContextMenu,
  connectSockets,
  deleteViaContextMenu,
  disconnectInput,
  getGraphView,
  move,
  redo,
  takeBeforeEach,
  undo
} from './helper'

test.describe('History', () => {
  const { getContainer } = takeBeforeEach('?template=history', 500, 500)

  test('undo/redo node translate', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())
    const [numberNode] = await findNodes('Number')
    const before = await numberNode.boundingBox()

    if (!before) throw new Error('number node box')

    await move(page, numberNode, 80, 50)
    await page.waitForTimeout(300)

    const moved = await numberNode.boundingBox()

    if (!moved) throw new Error('number node box after move')

    expect(moved.x - before.x).toBeGreaterThan(50)
    expect(await page.screenshot()).toMatchSnapshot('history-node-translated.png')

    await undo(page)
    await page.waitForTimeout(300)

    const restored = await numberNode.boundingBox()

    if (!restored) throw new Error('number node box after undo')

    expect(restored.x).toBeCloseTo(before.x, 1)
    expect(restored.y).toBeCloseTo(before.y, 1)
    expect(await page.screenshot()).toMatchSnapshot('history-node-undo.png')

    await redo(page)
    await page.waitForTimeout(300)

    const redone = await numberNode.boundingBox()

    if (!redone) throw new Error('number node box after redo')

    expect(redone.x).toBeCloseTo(moved.x, 1)
    expect(redone.y).toBeCloseTo(moved.y, 1)
    expect(await page.screenshot()).toMatchSnapshot('history-node-redo.png')
  })

  test('undo/redo node delete', async ({ page }) => {
    const { connections, findNodes, nodes } = await getGraphView(getContainer())

    expect(await nodes()).toHaveLength(3)
    expect(await connections()).toHaveLength(2)

    const [numberNode] = await findNodes('Number')

    await deleteViaContextMenu(page, numberNode)
    await page.waitForTimeout(300)

    expect(await findNodes('Number')).toHaveLength(1)
    expect(await nodes()).toHaveLength(2)
    expect(await connections()).toHaveLength(1)
    expect(await page.screenshot()).toMatchSnapshot('history-node-deleted.png')

    await undo(page)
    await page.waitForTimeout(300)

    expect(await findNodes('Number')).toHaveLength(2)
    expect(await nodes()).toHaveLength(3)
    expect(await connections()).toHaveLength(2)
    expect(await page.screenshot()).toMatchSnapshot('history-node-delete-undone.png')

    await redo(page)
    await page.waitForTimeout(300)

    expect(await findNodes('Number')).toHaveLength(1)
    expect(await nodes()).toHaveLength(2)
    expect(await connections()).toHaveLength(1)
    expect(await page.screenshot()).toMatchSnapshot('history-node-delete-redone.png')
  })

  test('undo/redo connection remove', async ({ page }) => {
    const { connections, findNodes } = await getGraphView(getContainer())
    const [addNode] = await findNodes('Add')

    expect(await connections()).toHaveLength(2)

    await disconnectInput(page, addNode, 'a')
    await page.waitForTimeout(500)

    expect(await connections()).toHaveLength(1)
    expect(await page.screenshot()).toMatchSnapshot('history-connection-removed.png')

    await undo(page)
    await page.waitForTimeout(300)

    expect(await connections()).toHaveLength(2)
    expect(await page.screenshot()).toMatchSnapshot('history-connection-remove-undone.png')

    await redo(page)
    await page.waitForTimeout(300)

    expect(await connections()).toHaveLength(1)
    expect(await page.screenshot()).toMatchSnapshot('history-connection-remove-redone.png')
  })

  test('undo/redo node add', async ({ page }) => {
    const { findNodes, nodes } = await getGraphView(getContainer())

    expect(await nodes()).toHaveLength(3)
    expect(await findNodes('Number')).toHaveLength(2)

    await addNodeViaContextMenu(page, getContainer(), 'Number')
    await page.waitForTimeout(300)

    expect(await findNodes('Number')).toHaveLength(3)
    expect(await nodes()).toHaveLength(4)
    expect(await page.screenshot()).toMatchSnapshot('history-node-added.png')

    await undo(page)
    await page.waitForTimeout(300)

    expect(await findNodes('Number')).toHaveLength(2)
    expect(await nodes()).toHaveLength(3)
    expect(await page.screenshot()).toMatchSnapshot('history-node-add-undone.png')

    await redo(page)
    await page.waitForTimeout(300)

    expect(await findNodes('Number')).toHaveLength(3)
    expect(await nodes()).toHaveLength(4)
    expect(await page.screenshot()).toMatchSnapshot('history-node-add-redone.png')
  })

  test('undo/redo connection add', async ({ page }) => {
    const { connections, findNodes } = await getGraphView(getContainer())
    const [numberNode] = await findNodes('Number')
    const [addNode] = await findNodes('Add')

    expect(await connections()).toHaveLength(2)

    await disconnectInput(page, addNode, 'a')
    await page.waitForTimeout(500)
    expect(await connections()).toHaveLength(1)

    await connectSockets(page, numberNode, 'value', addNode, 'a')
    await page.waitForTimeout(500)

    expect(await connections()).toHaveLength(2)
    expect(await page.screenshot()).toMatchSnapshot('history-connection-added.png')

    await undo(page)
    await page.waitForTimeout(300)

    expect(await connections()).toHaveLength(1)
    expect(await page.screenshot()).toMatchSnapshot('history-connection-add-undone.png')

    await redo(page)
    await page.waitForTimeout(300)

    expect(await connections()).toHaveLength(2)
    expect(await page.screenshot()).toMatchSnapshot('history-connection-add-redone.png')
  })
})
