import { expect, test } from '@playwright/test'

import {
  boundingBox,
  findFrameComment,
  findInlineComment,
  getCommentText,
  getGraphView,
  isInside,
  move,
  takeBeforeEach,
  toRect
} from './helper'

test.describe('Comments', () => {
  const { getContainer } = takeBeforeEach('', 500, 500)

  test('seeded on load', async ({ page }) => {
    const frame = await findFrameComment(page)
    const inline = await findInlineComment(page)

    expect(await getCommentText(frame)).toContain('Frame comment')
    expect(await getCommentText(inline)).toContain('Inline comment')
    expect(await page.locator('.frame-comment')).toHaveCount(1)
    expect(await page.locator('.inline-comment')).toHaveCount(1)
    expect(await page.screenshot()).toMatchSnapshot('comments-initial.png')
  })

  test('drag inline comment', async ({ page }) => {
    const inline = await findInlineComment(page)
    const { before, after } = await move(page, inline, 50, 30)

    expect(after.x - before.x).toBeCloseTo(50, 1)
    expect(after.y - before.y).toBeCloseTo(30, 1)
    expect(await page.screenshot()).toMatchSnapshot('comment-inline-dragged.png')
  })

  test('drag frame comment moves linked nodes', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())
    const [number1, number2] = await findNodes('Number')
    const frame = await findFrameComment(page)
    const dx = 40
    const dy = 25

    const before1 = await boundingBox(number1)
    const before2 = await boundingBox(number2)

    await move(page, frame, dx, dy)

    const after1 = await boundingBox(number1)
    const after2 = await boundingBox(number2)

    expect(after1.x - before1.x).toBeCloseTo(dx, 5)
    expect(after1.y - before1.y).toBeCloseTo(dy, 5)
    expect(after2.x - before2.x).toBeCloseTo(dx, 5)
    expect(after2.y - before2.y).toBeCloseTo(dy, 5)
    expect(await page.screenshot()).toMatchSnapshot('comment-frame-dragged.png')
  })

  test('frame membership — drag node out of frame', async ({ page }) => {
    const { findNodes } = await getGraphView(getContainer())
    const frame = await findFrameComment(page)
    const [numberNode] = await findNodes('Number')
    const frameRect = toRect(await boundingBox(frame))
    const nodeRectBefore = toRect(await boundingBox(numberNode))

    expect(isInside(nodeRectBefore, frameRect)).toBe(true)

    await move(page, numberNode, 250, 0, 'corner', {
      async down() {
        await page.mouse.down({ button: 'left' })
        await page.waitForTimeout(1500)
      }
    })

    const nodeRectAfter = toRect(await boundingBox(numberNode))

    expect(isInside(nodeRectAfter, frameRect)).toBe(false)
    expect(await page.screenshot()).toMatchSnapshot('comment-membership-out.png')
  })
})
