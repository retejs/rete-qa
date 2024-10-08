import { ElementHandle, expect, Page, test } from '@playwright/test'

type Element = ElementHandle<HTMLElement | SVGElement>
type Node = Element
type Connection = Element
type Side = 'right' | 'left'
type HandlerPosition = 'corner' | 'center'
type Selector = Element

export async function getGraphView(container: Element) {
  const area = await container.$('> div')

  if (!area) throw new Error('area')

  const nodes = (): Promise<Node[]> => area.$$(`[data-testid="node"]`)
  const connections = (): Promise<Connection[]> => area.$$(`[data-testid="connection"]`)

  return {
    area,
    nodes,
    connections,
    async findNodes(title: string) {
      const list: Node[] = []

      for (const node of await nodes()) {
        const titleElement = await node.$(`[data-testid="title"]:text-is("${title}")`)

        if (titleElement) list.push(node)
      }

      return list
    }
  }
}

export async function getBackgroundColor(node: Node) {
  const color = await node.evaluate(el => {
    const styles = window.getComputedStyle(el)
    return styles.getPropertyValue('background-color')
  })

  if (!color) throw new Error('color')

  return color
}

export async function getInput(node: Node, controlKey: string) {
  const el = await node.$(`[data-testid="control-${controlKey}"] input`)

  if (!el) throw new Error(`cannot find control's "${controlKey}" input`)

  return el
}

export async function setInputValue(page: Page, node: Node, controlKey: string, value: string) {
  const el = await getInput(node, controlKey)

  await el.fill(value)
  await page.keyboard.press('Tab')
}

export async function boundingBox(node: Node) {
  const box = await node.boundingBox()

  if (!box) throw new Error('box')

  return box
}

export function toRect(box: { x: number, y: number, width: number, height: number }) {
  return {
    left: box.x,
    right: box.x + box.width,
    top: box.y,
    bottom: box.y + box.height
  }
}

export function takeBeforeEach(path: string, timeoutBefore: number, timeoutAfter: number) {
  let container!: Element
  const headlessQuery = path.includes('?')
    ? '&headless=true'
    : '?headless=true'

  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:3000/${path}${headlessQuery}`)

    await page.waitForSelector('.rete', { timeout: 6000 })
    const _container = await page.$('.rete')

    expect(_container).toBeTruthy()

    if (!_container) throw new Error('cannot find .rete element')

    container = _container

    await page.waitForTimeout(timeoutBefore)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(timeoutAfter)
  })

  return {
    getContainer() {
      return container
    }
  }
}

export async function pickNode(page: Page, node: Selector) {
  const beforeBox = await boundingBox(node)
  const pickOffset = { x: 20, y: 20 }

  await page.mouse.move(beforeBox.x + pickOffset.x, beforeBox.y + pickOffset.y)
  await page.mouse.down({ button: 'left' })
  await page.mouse.up({ button: 'left' })
}

export async function clickCenter(page: Page, selector: Selector | string, button: Side = 'left') {
  const element = typeof selector === 'string'
    ? await page.$(selector)
    : selector
  if (!element) throw new Error('cannot find element')
  const beforeBox = await boundingBox(element)
  const pickOffset = { x: beforeBox.width / 2, y: beforeBox.height / 2 }

  await page.mouse.move(beforeBox.x + pickOffset.x, beforeBox.y + pickOffset.y)
  await page.mouse.down({ button })
  await page.mouse.up({ button })
}

export async function move(page: Page, node: Selector, dx: number, dy: number, handlerPosition: HandlerPosition = 'corner', options?: {
  down?: () => Promise<void>
  up?: () => Promise<void>
}) {
  const beforeBox = await boundingBox(node)
  const pickOffset = handlerPosition === 'corner'
    ? { x: 20, y: 20 }
    : { x: beforeBox.width / 2, y: beforeBox.height / 2 }

  await page.mouse.move(beforeBox.x + pickOffset.x, beforeBox.y + pickOffset.y)
  if (options?.down) {
    await options.down()
  } else {
    await page.mouse.down({ button: 'left' })
  }
  await page.mouse.move(beforeBox.x + pickOffset.x + dx, beforeBox.y + pickOffset.y + dy)
  if (options?.up) {
    await options.up()
  } else {
    await page.mouse.up({ button: 'left' })
  }

  const afterBox = await boundingBox(node)

  return {
    before: beforeBox,
    after: afterBox
  }
}

type Rect = {
  left: number
  right: number
  top: number
  bottom: number
}

export async function getPositions(page: Page, selector: string) {
  const list = await page.$$(selector)
  const positions = await Promise.all(list.map(boundingBox))

  const left = Math.min(...positions.map(({ x }) => x))
  const right = Math.max(...positions.map(({ x, width }) => x + width))
  const top = Math.min(...positions.map(({ y }) => y))
  const bottom = Math.max(...positions.map(({ y, height }) => y + height))

  return {
    positions,
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top
  }
}

export function isInside(inner: Rect, outer: Rect) {
  return (
    inner.left >= outer.left
    && inner.top >= outer.top
    && inner.right <= outer.right
    && inner.bottom <= outer.bottom
  )
}

export function isOutside(inner: Rect, outer: Rect) {
  return (
    inner.left >= outer.right
    || inner.top >= outer.bottom
    || inner.right <= outer.left
    || inner.bottom <= outer.top
  )
}
