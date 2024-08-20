import { expect, test } from '@playwright/test'

import { getGraphView, takeBeforeEach } from './helper'

const { getContainer } = takeBeforeEach('?template=customization', 1000, 500)

test('customization: has nodes', async ({}) => {
  const { nodes, connections } = await getGraphView(getContainer())

  expect(await nodes()).toHaveLength(2)
  expect(await connections()).toHaveLength(1)
})

test('customization: snapshot', async ({ page }) => {
  await page.waitForTimeout(500)

  expect(await page.screenshot()).toMatchSnapshot('customization.png')
})
