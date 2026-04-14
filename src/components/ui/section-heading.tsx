import { createContext, useContext, type ReactNode } from 'react'
import { BookmarkButton } from '@/features/bookmarks/bookmark-button'

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
  /** i18n key for the heading — stored in the bookmark so label follows language */
  labelKey?: string
  /**
   * Override the chapter id. Normally read from the surrounding <ChapterScope>;
   * pass this only when rendering outside a chapter page (e.g. previews).
   */
  chapterId?: string
  children: ReactNode
}

/**
 * Chapter section heading (h2) with:
 * - auto-generated anchor for deep linking
 * - bookmark button visible on hover
 */
export function Section({ id, labelKey, chapterId: chapterIdProp, children }: SectionHeadingProps) {
  const scopedChapterId = useChapterId()
  const chapterId = chapterIdProp ?? scopedChapterId
  const label = typeof children === 'string' ? children : id.replace(/-/g, ' ')

  return (
    <h2
      id={id}
      className="group flex items-center gap-1 scroll-mt-20"
    >
      <span>{children}</span>
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
