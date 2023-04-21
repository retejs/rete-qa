import { test, expect } from '@playwright/test'
import { getGraphView, takeBeforeEach } from './helper'

const { getContainer } = takeBeforeEach('?template=perf&rows=10&cols=10', 2000, 500)

test('perf: has nodes', async ({}) => {
  const { nodes, connections } = await getGraphView(getContainer())

  expect(await nodes()).toHaveLength(100)
  expect(await connections()).toHaveLength(99)
})

test('perf: snapshot', async ({ page }) => {
  expect(await page.screenshot()).toMatchSnapshot('perf.png')
})
