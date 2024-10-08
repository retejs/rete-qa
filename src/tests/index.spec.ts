import { expect, test } from '@playwright/test'
import tinycolor from 'tinycolor2'

import { getBackgroundColor, getGraphView, move, pickNode, setInputValue, takeBeforeEach } from './helper'

const { getContainer } = takeBeforeEach('', 500, 500)

test('has nodes', async ({ }) => {
  const { findNodes } = await getGraphView(getContainer())

  expect(await findNodes('Add')).toHaveLength(1)
  expect(await findNodes('Number')).toHaveLength(2)
})

test('select node', async ({ page }) => {
  const { findNodes } = await getGraphView(getContainer())

  const [addNode] = await findNodes('Add')

  const bg = await getBackgroundColor(addNode)

  expect(tinycolor.readability(bg, 'blue') < 3).toBeTruthy()

  await pickNode(page, addNode)

  const selectedBg = await getBackgroundColor(addNode)

  expect(tinycolor.readability(selectedBg, 'yellow') < 3).toBeTruthy()
  expect(await page.screenshot()).toMatchSnapshot('selected.png')
})

test('change input values', async ({ page }) => {
  const { findNodes } = await getGraphView(getContainer())

  const [numberNode1, numberNode2] = await findNodes('Number')

  await setInputValue(page, numberNode1, 'value', '3')
  await setInputValue(page, numberNode2, 'value', '5')

  // wait for input value changed (in webkit change detector in Angular doesn't update it immediately)
  await expect(page.locator(`[data-testid="control-result"] input`)).toHaveValue('8')
})

test('translate', async ({ page }) => {
  const { findNodes } = await getGraphView(getContainer())
  const translateX = -100
  const translateY = 30

  const [numberNode1] = await findNodes('Number')

  const { before, after } = await move(page, numberNode1, translateX, translateY)

  expect(after.x - before.x).toBeCloseTo(translateX, 1)
  expect(after.y - before.y).toBeCloseTo(translateY, 1)

  expect(await page.screenshot()).toMatchSnapshot('translate.png')
})

test('disconnect', async ({ page }) => {
  const { connections, findNodes } = await getGraphView(getContainer())
  const [addNode] = await findNodes('Add')

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

  expect(await page.screenshot()).toMatchSnapshot('disconnecting.png')

  await page.mouse.up()

  await page.waitForTimeout(500)
  expect(await connections()).toHaveLength(1)
  expect(await page.screenshot()).toMatchSnapshot('disconnected.png')
})

test('disconnect with clicks', async ({ page }) => {
  const { connections, findNodes } = await getGraphView(getContainer())
  const [addNode] = await findNodes('Add')

  const el = await addNode.$('[data-testid="input-a"] [data-testid="input-socket"]')
  const box = await el?.boundingBox()

  if (!box) throw new Error('Cannot find bounding box for input socket')

  const socketCenter = {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2
  }

  await page.mouse.move(socketCenter.x, socketCenter.y)
  await page.mouse.down()
  await page.mouse.up()

  expect(await page.screenshot()).toMatchSnapshot('disconnecting-click.png')

  await page.mouse.move(socketCenter.x - 50, socketCenter.y - 30)

  expect(await page.screenshot()).toMatchSnapshot('disconnecting.png')

  await page.mouse.down()
  await page.mouse.up()

  await page.waitForTimeout(500)
  expect(await connections()).toHaveLength(1)
  expect(await page.screenshot()).toMatchSnapshot('disconnected.png')
})

test('snapshot: initial', async ({ page }) => {
  const screenshot = await page.screenshot()

  expect(screenshot).toMatchSnapshot('initial.png')
})
