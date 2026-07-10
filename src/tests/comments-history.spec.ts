import { expect, test } from '@playwright/test'

import {
  editCommentViaContextMenu,
  findInlineComment,
  getCommentText,
  move,
  redo,
  takeBeforeEach,
  undo
} from './helper'

const INLINE_ORIGINAL = 'Inline comment — try Ctrl+Z after edit/delete'
const INLINE_UPDATED = 'Updated inline comment'

// Integration: Comments + History (comment actions in the undo stack)
test.describe('Comments + History', () => {
  const { getContainer: _getContainer } = takeBeforeEach('?template=comments-history', 500, 500)

  test('edit inline comment undo/redo', async ({ page }) => {
    const inline = await findInlineComment(page)

    expect(await getCommentText(inline)).toContain('Inline comment')

    await editCommentViaContextMenu(page, inline, INLINE_UPDATED)
    await page.waitForTimeout(300)

    expect(await getCommentText(inline)).toBe(INLINE_UPDATED)
    expect(await page.screenshot()).toMatchSnapshot('comment-inline-edited.png')

    await undo(page)
    await page.waitForTimeout(300)

    expect(await getCommentText(inline)).toBe(INLINE_ORIGINAL)
    expect(await page.screenshot()).toMatchSnapshot('comment-inline-edit-undone.png')

    await redo(page)
    await page.waitForTimeout(300)

    expect(await getCommentText(inline)).toBe(INLINE_UPDATED)
    expect(await page.screenshot()).toMatchSnapshot('comment-inline-edit-redone.png')
  })

  test('undo comment drag', async ({ page }) => {
    const inline = await findInlineComment(page)
    const before = await inline.boundingBox()

    if (!before) throw new Error('inline comment box')

    await move(page, inline, 60, 40)
    await page.waitForTimeout(300)

    const dragged = await inline.boundingBox()

    if (!dragged) throw new Error('inline comment box after drag')

    expect(dragged.x - before.x).toBeGreaterThan(40)
    expect(await page.screenshot()).toMatchSnapshot('comment-inline-dragged-before-undo.png')

    await undo(page)
    await page.waitForTimeout(300)

    const restored = await inline.boundingBox()

    if (!restored) throw new Error('inline comment box after undo')

    expect(restored.x).toBeCloseTo(before.x, 1)
    expect(restored.y).toBeCloseTo(before.y, 1)
    expect(await page.screenshot()).toMatchSnapshot('comment-inline-drag-undone.png')
  })
})
