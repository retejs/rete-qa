import { test, expect } from '@playwright/test'
import { getGraphView, takeBeforeEach } from './helper'

test.describe('Perf', () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === 'webkit' && String(process.env.APP).startsWith('angular'), 'WebKit has problems running Angular apps with a lot of elements (at least in WSL2 environment)');
  })
  const { getContainer } = takeBeforeEach('?template=perf&rows=10&cols=10', 500, 500)

  test('has nodes', async ({ page }) => {
    const { nodes, connections } = await getGraphView(getContainer())

    await page.waitForTimeout(1000)
    expect(await nodes()).toHaveLength(100)
    expect(await connections()).toHaveLength(99)
  })

  test('snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot('perf.png')
  })
})
