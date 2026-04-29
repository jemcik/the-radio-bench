import { createContext, useContext, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BookmarkButton } from '@/features/bookmarks/bookmark-button'
import { withSubscripts } from '@/lib/text-with-subscripts'

/* ── Chapter scope ──────────────────────────────────────────────────────────
 * ChapterPage wraps each chapter's body in <ChapterScope chapterId={...}>
 * so primitives like <Section> can attach bookmarks without depending on
 * react-router. Keeps UI primitives router-agnostic and easier to test.
 */

const ChapterScopeContext = createContext<string | null>(null)

export function ChapterScope({
  chapterId,
  children,
}: {
  chapterId: string
  children: ReactNode
}) {
  return (
    <ChapterScopeContext.Provider value={chapterId}>{children}</ChapterScopeContext.Provider>
  )
}

/** Returns the current chapter id, or null when used outside <ChapterScope>. */
export function useChapterId(): string | null {
  return useContext(ChapterScopeContext)
}

/* ── Section heading ────────────────────────────────────────────────────── */

interface SectionHeadingProps {
  /** Used as the anchor id and bookmark key */
  id: string
  /**
   * i18n key for the heading.
   *
   * Two behaviours:
   *  - **Sole source of the heading text** — pass `labelKey` and omit
   *    `children`; the heading renders `t(labelKey)`. Strongly preferred,
   *    because it keeps the i18n key in exactly one place.
   *  - **Bookmark hint only** — pass both `labelKey` and `children`; the
   *    `children` are rendered (e.g. when the heading needs JSX, like an
   *    inline `<G>` term). The `labelKey` then lets the bookmark label
   *    follow the user's language even when the displayed heading is JSX.
   */
  labelKey?: string
  /**
   * Override the chapter id. Normally read from the surrounding <ChapterScope>;
   * pass this only when rendering outside a chapter page (e.g. previews).
   */
  chapterId?: string
  children?: ReactNode
}

/**
 * Chapter section heading (h2) with:
 * - auto-generated anchor for deep linking
 * - bookmark button visible on hover
 */
export function Section({ id, labelKey, chapterId: chapterIdProp, children }: SectionHeadingProps) {
  const { t } = useTranslation('ui')
  const scopedChapterId = useChapterId()
  const chapterId = chapterIdProp ?? scopedChapterId

  // Prefer explicit children; otherwise resolve from labelKey so the
  // common `<Section id="x" labelKey="…" />` form needs no duplication.
  const display: ReactNode = children ?? (labelKey ? t(labelKey) : id.replace(/-/g, ' '))
  const label = typeof display === 'string' ? display : id.replace(/-/g, ' ')

  return (
    <h2
      id={id}
      className="group flex items-center gap-1 scroll-mt-20"
    >
      <span>{typeof display === 'string' ? withSubscripts(display) : display}</span>
      {chapterId && (
        <BookmarkButton
          chapterId={chapterId}
          sectionId={id}
          label={label}
          labelKey={labelKey}
          size="sm"
        />
      )}
    </h2>
  )
}
