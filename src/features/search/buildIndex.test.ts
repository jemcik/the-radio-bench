import { describe, expect, it } from 'vitest'
import i18next from 'i18next'
import enUi from '@/i18n/locales/en/ui.json'
import { getAllChapters } from '@/data/chapters'
import { buildIndex, matchScore, searchIndex, type SearchResult } from './buildIndex'

/** Stand up a tiny i18next instance synchronously for the tests. */
function makeT() {
  const i = i18next.createInstance()
  i.init({
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'ui',
    resources: { en: { ui: enUi } },
    interpolation: { escapeValue: false },
  })
  return i.getFixedT('en', 'ui')
}

describe('matchScore', () => {
  it('returns 0 for no match', () => {
    expect(matchScore('xyz', 'something else')).toBe(0)
  })

  it('rewards exact substring match (front-of-string scores highest)', () => {
    expect(matchScore('vol', 'voltage')).toBe(100)
    expect(matchScore('age', 'voltage')).toBeLessThan(100)
  })

  it('returns 50 when every query word is present (non-contiguous)', () => {
    // No substring "alt curr" but both words present
    expect(matchScore('alt curr', 'alternating current')).toBe(50)
  })

  it('returns word-count × 10 when only some query words match', () => {
    expect(matchScore('alt xyz', 'alternating wave')).toBe(10)
    expect(matchScore('alt wave xyz', 'alternating wave')).toBe(20)
  })

  it('is case-insensitive', () => {
    expect(matchScore('VOLT', 'voltage')).toBe(100)
  })
})

describe('buildIndex', () => {
  const t = makeT()
  const index = buildIndex(t)

  it('returns chapters and glossary entries', () => {
    expect(index.some(r => r.type === 'chapter')).toBe(true)
    expect(index.some(r => r.type === 'glossary')).toBe(true)
  })

  it('chapter ids are prefixed with the chapter number', () => {
    const ch = index.find(r => r.type === 'chapter')!
    expect(ch.title).toMatch(/^[\d.]+ — /)
  })

  it('glossary results expose the original key and full entry', () => {
    const term = index.find(r => r.type === 'glossary')!
    expect(term.glossaryKey).toBeTruthy()
    expect(term.entry).toBeDefined()
    expect(term.entry?.tip).toBeTruthy()
  })

  it('a chapter is navigable exactly when it is published', () => {
    // This used to assert that at least one coming-soon chapter existed. That
    // stopped being an invariant when 4.5 shipped and completed the course —
    // and it was never the property worth testing anyway. What matters is the
    // correspondence itself, which holds whether or not anything is unwritten.
    const chapters = index.filter(r => r.type === 'chapter')
    expect(chapters.length).toBeGreaterThan(0)

    const publishedIds = new Set(
      getAllChapters().filter(c => c.status === 'published').map(c => c.id),
    )
    for (const row of chapters) {
      const isPublished = publishedIds.has(row.id)
      expect(row.href === null).toBe(!isPublished)
    }
  })

  it('glossary entries always have href: null (they expand in-place)', () => {
    const glossaryWithHref = index.filter(r => r.type === 'glossary' && r.href !== null)
    expect(glossaryWithHref).toHaveLength(0)
  })
})

describe('searchIndex', () => {
  const t = makeT()
  const index = buildIndex(t)

  it('returns [] for an empty query', () => {
    expect(searchIndex('', index)).toEqual([])
    expect(searchIndex('   ', index)).toEqual([])
  })

  it('caps results at 12', () => {
    // A common term that matches lots of glossary tips.
    const results = searchIndex('a', index)
    expect(results.length).toBeLessThanOrEqual(12)
  })

  it('orders by score (best match first)', () => {
    const results = searchIndex('voltage', index)
    expect(results.length).toBeGreaterThan(0)
    // The top hit should mention voltage in its title.
    expect(results[0]?.title.toLowerCase()).toContain('voltage')
  })

  it('matches against glossary keys (so the user can type "ac" to find Alternating Current)', () => {
    const results = searchIndex('ac', index)
    expect(results.some(r => r.glossaryKey === 'ac')).toBe(true)
  })

  it('returns empty when nothing scores', () => {
    const fake: SearchResult[] = [
      { type: 'glossary', id: 'g-x', title: 'aaa', subtitle: 'bbb', href: null },
    ]
    expect(searchIndex('zzz', fake)).toEqual([])
  })
})
