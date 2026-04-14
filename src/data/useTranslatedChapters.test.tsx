import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { I18nTestProvider } from '@/test/i18nTestProvider'
import { useTranslatedChapter, useTranslatedParts } from './useTranslatedChapters'
import { getChapterById } from './chapters'

function withI18n(language: 'en' | 'uk' = 'en') {
  return ({ children }: { children: React.ReactNode }) => (
    <I18nTestProvider language={language}>{children}</I18nTestProvider>
  )
}

describe('useTranslatedChapter', () => {
  it('returns undefined when the input is undefined', () => {
    const { result } = renderHook(
      () => useTranslatedChapter(undefined),
      { wrapper: withI18n('en') },
    )
    expect(result.current).toBeUndefined()
  })

  it('returns the chapter with translated title/subtitle for uk', () => {
    const meta = getChapterById('0-3')!
    const { result } = renderHook(
      () => useTranslatedChapter(meta),
      { wrapper: withI18n('uk') },
    )
    // Ukrainian locale has ch0_3 title under chapterTitles.0-3 — assert it
    // differs from the English baseline, confirming the t() resolved.
    expect(result.current?.title).toBeTruthy()
    expect(result.current?.title).not.toBe(meta.title)
    // id, part, status etc. pass through untouched
    expect(result.current?.id).toBe(meta.id)
    expect(result.current?.part).toBe(meta.part)
    expect(result.current?.status).toBe(meta.status)
  })

  it('falls back to baseline title when the key is missing', () => {
    // Fabricate a ChapterMeta with an id no locale knows about.
    const meta = {
      id: 'nonexistent-id',
      number: '99.9',
      part: 9,
      title: 'Baseline Title',
      subtitle: 'Baseline Subtitle',
      status: 'published' as const,
      hasLab: false,
      hasQuiz: false,
    }
    const { result } = renderHook(
      () => useTranslatedChapter(meta),
      { wrapper: withI18n('en') },
    )
    expect(result.current?.title).toBe('Baseline Title')
    expect(result.current?.subtitle).toBe('Baseline Subtitle')
  })
})

describe('useTranslatedParts', () => {
  it('returns every part with translated chapter titles', () => {
    const { result: en } = renderHook(() => useTranslatedParts(), {
      wrapper: withI18n('en'),
    })
    const { result: uk } = renderHook(() => useTranslatedParts(), {
      wrapper: withI18n('uk'),
    })

    // Same topology
    expect(en.current.length).toBe(uk.current.length)
    expect(en.current[0].chapters.length).toBe(uk.current[0].chapters.length)

    // At least one chapter title must differ between locales (otherwise
    // the hook is not actually translating — a silent regression).
    const enTitles = en.current.flatMap(p => p.chapters.map(c => c.title))
    const ukTitles = uk.current.flatMap(p => p.chapters.map(c => c.title))
    const differing = enTitles.filter((t, i) => t !== ukTitles[i])
    expect(differing.length).toBeGreaterThan(0)
  })

  it('preserves chapter id, status, and other non-translatable fields', () => {
    const { result } = renderHook(() => useTranslatedParts(), {
      wrapper: withI18n('uk'),
    })

    const firstPart = result.current[0]
    const firstChapter = firstPart.chapters[0]
    expect(firstChapter.id).toBeTruthy()
    expect(firstChapter.status).toBeDefined()
    expect(typeof firstChapter.hasLab).toBe('boolean')
  })
})
