import type { TFunction } from 'i18next'
import { getAllChapters } from '@/data/chapters'
import { glossary, type GlossaryEntry } from '@/features/glossary/glossary'

/**
 * Search-index builder for the global Cmd+K dialog.
 *
 * Lives outside the dialog component so it can be unit-tested in isolation
 * without rendering anything. The dialog calls this once per language change
 * and feeds the result into a small in-memory matcher.
 */

export interface SearchResult {
  type: 'chapter' | 'glossary'
  id: string
  title: string
  subtitle: string
  /** Where to navigate (null for glossary terms — they expand in-place). */
  href: string | null
  /** Full glossary entry for the inline preview card. */
  entry?: GlossaryEntry
  /** Original glossary key (used for matching and "see also" labels). */
  glossaryKey?: string
}

function mergeGlossaryEntry(key: string, base: GlossaryEntry, t: TFunction<'ui'>): GlossaryEntry {
  const translatedTip = t(`glossary.${key}.tip`, { defaultValue: '' })
  const translatedDetail = t(`glossary.${key}.detail`, { defaultValue: '' })
  return {
    ...base,
    tip: translatedTip || base.tip,
    detail: translatedDetail || base.detail,
  }
}

function glossaryDisplayTitle(key: string, t: TFunction<'ui'>): string {
  const fallback = key.charAt(0).toUpperCase() + key.slice(1)
  return t(`glossary._names.${key}`, { defaultValue: fallback })
}

/**
 * Build the full searchable index for the current language. Combines every
 * chapter and every glossary entry into a flat list. Coming-soon chapters
 * still appear (so the user knows they exist) but with `href: null`.
 */
export function buildIndex(t: TFunction<'ui'>): SearchResult[] {
  const chapters: SearchResult[] = getAllChapters().map(ch => {
    const title = t(`chapterTitles.${ch.id}`, { defaultValue: ch.title })
    const subtitle = t(`chapterSubtitles.${ch.id}`, { defaultValue: ch.subtitle })
    return {
      type: 'chapter',
      id: ch.id,
      title: `${ch.number} — ${title}`,
      subtitle,
      href: ch.status !== 'coming-soon' ? `/chapter/${ch.id}` : null,
    }
  })

  const terms: SearchResult[] = Object.entries(glossary).map(([key, entry]) => {
    const merged = mergeGlossaryEntry(key, entry, t)
    return {
      type: 'glossary' as const,
      id: `g-${key}`,
      title: glossaryDisplayTitle(key, t),
      subtitle: merged.tip,
      href: null,
      entry: merged,
      glossaryKey: key,
    }
  })

  return [...chapters, ...terms]
}

/* ── Fuzzy match ────────────────────────────────────────────────────────── */

/**
 * Score how well `query` matches `text`. Higher is better.
 *  - Exact substring: 100 (penalised by index)
 *  - All query words present: 50
 *  - Some words present: 10 per word
 *  - No match: 0
 */
export function matchScore(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return 100 - t.indexOf(q)
  const words = q.split(/\s+/).filter(Boolean)
  const allPresent = words.every(w => t.includes(w))
  if (allPresent) return 50
  const matchCount = words.filter(w => t.includes(w)).length
  if (matchCount > 0) return matchCount * 10
  return 0
}

/**
 * Rank `all` against `query` and return the top 12 results.
 * Returns an empty array for blank queries.
 */
export function searchIndex(query: string, all: SearchResult[]): SearchResult[] {
  if (!query.trim()) return []
  return all
    .map(r => {
      const keyScore =
        r.type === 'glossary' && r.glossaryKey
          ? matchScore(query, r.glossaryKey) * 0.85
          : 0
      return {
        result: r,
        score: Math.max(
          matchScore(query, r.title),
          matchScore(query, r.subtitle) * 0.7,
          keyScore,
        ),
      }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(r => r.result)
}
