import { test, expect, ElementHandle } from '@playwright/test'
import { getGraphView, move, takeBeforeEach } from './helper'
import { boundingBox } from './helper'

async function getConnectionPath(connection: ElementHandle<HTMLElement | SVGElement>) {
  const path = await connection.$('path')

  if (!path) throw new Error('cannot find path')

  return {
    path,
    bbox: await boundingBox(path)
  }
}

test.describe('Reroute', () => {
  const { getContainer } = takeBeforeEach('', 500, 500)

  test('has no pins', async ({ page }) => {
    await expect(page.getByTestId('pin')).toHaveCount(0)
  })

  test('add pin', async ({ page }) => {
    const { connections } = await getGraphView(getContainer())
    const { bbox } = await getConnectionPath((await connections())[0])

    await page.mouse.click(bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5)

    await expect(page.getByTestId('pin')).toHaveCount(1)
    expect(await page.screenshot()).toMatchSnapshot('added-pin.png')
  })


  test('add pin and translate node', async ({ page }) => {
    const { nodes, connections } = await getGraphView(getContainer())

    const { bbox } = await getConnectionPath((await connections())[0])
    const firstNode = (await nodes())[0]

    await page.mouse.click(bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5)
    await move(page, firstNode, -200, 65)

    expect(await page.screenshot()).toMatchSnapshot('added-pin-node-translate.png')
  })

  test('remove pin', async ({ page }) => {
    const { connections } = await getGraphView(getContainer())

    const { bbox } = await getConnectionPath((await connections())[0])

    await page.mouse.click(bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5)

    expect(await page.screenshot()).toMatchSnapshot('added-pin.png')

    await page.getByTestId('pin').click({ button: 'right' })

    await expect(page.getByTestId('pin')).toHaveCount(0)
    expect(await page.screenshot()).toMatchSnapshot('removed-pin.png')
  })

  test('move pin', async ({ page }) => {
    test.skip(String(process.env.APP).startsWith('react16'), 'React.js v16 has problems with pin translation')

    const { connections } = await getGraphView(getContainer())

    const { bbox } = await getConnectionPath((await connections())[0])

    await page.mouse.click(bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5)

    expect(await page.screenshot()).toMatchSnapshot('added-pin.png')

    const pin = await page.$('[data-testid="pin"]')

    await move(page, pin as ElementHandle<HTMLElement | SVGElement>, 0, -100, 'center')

    await expect(page.getByTestId('pin')).toHaveCount(1)
    expect(await page.screenshot()).toMatchSnapshot('moved-pin.png')
  })
})
