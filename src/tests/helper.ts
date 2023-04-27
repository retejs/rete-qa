import { test, expect, ElementHandle, Page } from '@playwright/test'

type Node = ElementHandle<HTMLElement | SVGElement>
type Connection = ElementHandle<HTMLElement | SVGElement>

export async function getGraphView(container: ElementHandle<HTMLElement | SVGElement>) {
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

export async function getBackgroundColor(node: Node) {
  const color = await node.evaluate((el) => {
    const styles = window.getComputedStyle(el)
    return styles.getPropertyValue('background-color')
  })

  if (!color) throw 'color'

  return color
}

export async function getInput(node: Node, controlKey: string) {
  const el = await node.$(`[data-testid="control-${controlKey}"] input`)

  if (!el) throw `cannot find control's "${controlKey}" input`

  return el
}

export async function setInputValue(page: Page, node: Node, controlKey: string, value: string) {
  const el = await getInput(node, controlKey)

  await el.fill(value)
  await page.keyboard.press('Tab')
}

export async function boundingBox(node: Node) {
  const box = await node.boundingBox()

  if (!box) throw 'box'

  return box
}

export function takeBeforeEach(path: string, timeoutBefore: number, timeoutAfter: number) {
  let container!: ElementHandle<HTMLElement | SVGElement>

  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:3000/${path}`)

    await page.waitForSelector('.rete', { timeout: 6000 })
    const _container = await page.$('.rete')

    expect(_container).toBeTruthy()

    if (!_container) throw 'cannot find .rete element'

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

export async function move(page: Page, node: ElementHandle<HTMLElement | SVGElement>, dx: number, dy: number) {
  const beforeBox = await boundingBox(node)

  await page.mouse.move(beforeBox.x + 20, beforeBox.y + 20)
  await page.mouse.down({ button: 'left' })
  await page.mouse.move(beforeBox.x + 20 + dx, beforeBox.y + 20 + dy)
  await page.mouse.up({ button: 'left' })

  const afterBox = await boundingBox(node)

  return {
    before: beforeBox,
    after: afterBox
  }
}

