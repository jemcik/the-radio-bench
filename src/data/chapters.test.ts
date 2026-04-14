import { describe, expect, it } from 'vitest'
import {
  PARTS,
  getAllChapters,
  getChapterById,
  getAdjacentChapters,
} from './chapters'

/**
 * These are the primary chapter-navigation primitives.
 * `getAdjacentChapters` in particular drives the prev/next UI at the
 * bottom of every chapter page — an off-by-one here would silently
 * break site navigation, which is exactly the kind of regression a
 * unit test can pin cheaply.
 */

describe('getAllChapters', () => {
  it('returns every chapter across all parts, preserving order', () => {
    const all = getAllChapters()
    expect(all.length).toBeGreaterThan(0)
    // Flat length equals the sum of per-part lengths — no dupes or misses.
    const perPart = PARTS.reduce((sum, p) => sum + p.chapters.length, 0)
    expect(all).toHaveLength(perPart)
    // First chapter is the first chapter of the first part.
    expect(all[0]).toBe(PARTS[0].chapters[0])
  })

  it('preserves uniqueness of chapter ids', () => {
    const ids = getAllChapters().map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getChapterById', () => {
  it('returns the chapter when the id exists', () => {
    const c = getChapterById('0-3')
    expect(c).toBeDefined()
    expect(c?.id).toBe('0-3')
    expect(c?.title).toBe('Math Toolkit for Radio')
  })

  it('returns undefined for an unknown id', () => {
    expect(getChapterById('does-not-exist')).toBeUndefined()
  })
})

describe('getAdjacentChapters', () => {
  it('gives both neighbours for a chapter in the middle of the list', () => {
    const all = getAllChapters()
    // Pick chapter index 2 (guaranteed to have both neighbours given PARTS size).
    const target = all[2]
    const { prev, next } = getAdjacentChapters(target.id)
    expect(prev).toBe(all[1])
    expect(next).toBe(all[3])
  })

  it('returns undefined for prev on the very first chapter', () => {
    const first = getAllChapters()[0]
    const { prev, next } = getAdjacentChapters(first.id)
    expect(prev).toBeUndefined()
    expect(next).toBeDefined()
  })

  it('returns undefined for next on the very last chapter', () => {
    const all = getAllChapters()
    const last = all[all.length - 1]
    const { prev, next } = getAdjacentChapters(last.id)
    expect(prev).toBeDefined()
    expect(next).toBeUndefined()
  })

  it('returns undefined for both when the id is unknown', () => {
    const { prev, next } = getAdjacentChapters('does-not-exist')
    expect(prev).toBeUndefined()
    expect(next).toBeUndefined()
  })
})
