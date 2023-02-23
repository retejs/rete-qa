import { test, expect, ElementHandle, Page } from '@playwright/test'
import tinycolor from 'tinycolor2'

type Node = ElementHandle<HTMLElement | SVGElement>
type Connection = ElementHandle<HTMLElement | SVGElement>

async function getGraphView(container: ElementHandle<HTMLElement | SVGElement>) {
  const area = await container?.$('> div')

  if (!area) throw 'area'

  const nodes = (): Promise<Node[]> => area.$$(`[data-testid="node"]`)
  const connections = (): Promise<Connection[]> => area.$$(`[data-testid="connection"]`)

  return {
    area,
    nodes,
    connections,
    async findNodes(title: string) {
      const list: Node[] = []

      for (const node of await nodes()) {
        const titleElement = await node.$(`[data-testid="title"]:text("${title}")`)

        if (titleElement) list.push(node)
      }

      return list
    }
  }
}

async function getBackgroundColor(node: Node) {
  const color = await node.evaluate((el) => {
    const styles = window.getComputedStyle(el)
    return styles.getPropertyValue('background-color')
  })

  if (!color) throw 'color'

  return color
}

async function getInput(node: Node, controlKey: string) {
  const el = await node.$(`[data-testid="control-${controlKey}"] input`)

  if (!el) throw `cannot find control's "${controlKey}" input`

  return el
}

async function setInputValue(page: Page, node: Node, controlKey: string, value: string) {
  const el = await getInput(node, controlKey)

  await el.fill(value)
  await page.keyboard.press('Tab')
}

async function boundingBox(node: Node) {
  const box = await node.boundingBox()

  if (!box) throw 'box'

  return box
}

let container!: ElementHandle<HTMLElement | SVGElement>

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/')

  const _container = await page.$('.rete')

  expect(_container).toBeTruthy()

  if (!_container) throw 'cannot find .rete element'

  container = _container

  await page.waitForTimeout(200)
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight)
  })
})

test('has nodes', async ({}) => {
  const { findNodes } = await getGraphView(container)

  expect(await findNodes('Add')).toHaveLength(1)
  expect(await findNodes('Number')).toHaveLength(2)
})

test('select node', async ({ page }) => {
  const { findNodes } = await getGraphView(container)

  const [addNode] = await findNodes('Add')

  const bg = await getBackgroundColor(addNode)

  expect(tinycolor.readability(bg, 'blue') < 3).toBeTruthy()

  await (await addNode.$('[data-testid="title"]'))?.click()

  const selectedBg = await getBackgroundColor(addNode)

  expect(tinycolor.readability(selectedBg, 'yellow') < 3).toBeTruthy()
  expect(await page.screenshot()).toMatchSnapshot('selected.png')
})

test('change input values', async ({ page }) => {
  const { findNodes } = await getGraphView(container)

  const [addNode] = await findNodes('Add')
  const [numberNode1, numberNode2] = await findNodes('Number')

  await setInputValue(page, numberNode1, 'value', '3')
  await setInputValue(page, numberNode2, 'value', '5')

  // wait for input value changed (in webkit change detector in Angular doesn't update it immediately)
  await expect(page.locator(`[data-testid="control-result"] input`)).toHaveValue('8')
})

test('translate', async ({ page }) => {
  const { findNodes } = await getGraphView(container)
  const translateX = -100
  const translateY = -50

  const [numberNode1] = await findNodes('Number')

  const box = await boundingBox(numberNode1)

  await page.mouse.move(box.x + 20, box.y + 20)
  await page.mouse.down({ button: 'left' })
  await page.mouse.move(box.x + 20 + translateX, box.y + 20 + translateY)
  await page.mouse.up({ button: 'left' })

  const boxAfter = await boundingBox(numberNode1)

  expect(boxAfter.x - box.x).toBeCloseTo(translateX, 1)
  expect(boxAfter.y - box.y).toBeCloseTo(translateY, 1)

  expect(await page.screenshot()).toMatchSnapshot('translate.png')
})

test('disconnect', async ({ page }) => {
  const { connections, findNodes } = await getGraphView(container)
  const [addNode] = await findNodes('Add')

  const el = await addNode.$('[data-testid="input-a"] [data-testid="input-socket"]')
  const box = await el?.boundingBox()

  if (!box) throw 'box'

  const socketCenter = {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2
  }

  await page.mouse.move(socketCenter.x, socketCenter.y)
  await page.mouse.down()
  await page.mouse.move(socketCenter.x - 50, socketCenter.y - 30)

  expect(await page.screenshot()).toMatchSnapshot('disconnecting.png')

  await page.mouse.up()

  expect(await connections()).toHaveLength(1)
  expect(await page.screenshot()).toMatchSnapshot('disconnected.png')
})

test('disconnect with clicks', async ({ page }) => {
  const { connections, findNodes } = await getGraphView(container)
  const [addNode] = await findNodes('Add')

  const el = await addNode.$('[data-testid="input-a"] [data-testid="input-socket"]')
  const box = await el?.boundingBox()

  if (!box) throw 'box'

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

  expect(await connections()).toHaveLength(1)
  expect(await page.screenshot()).toMatchSnapshot('disconnected.png')
})

test('snapshot: initial', async ({ page }) => {
  const screenshot = await page.screenshot()

  expect(screenshot).toMatchSnapshot('initial.png')
})
