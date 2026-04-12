import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { BookmarkButton } from './bookmark-button'

interface SectionHeadingProps {
  /** Used as the anchor id and bookmark key */
  id: string
  children: ReactNode
}

/**
 * Chapter section heading (h2) with:
 * - auto-generated anchor for deep linking
 * - bookmark button visible on hover
 */
export function Section({ id, children }: SectionHeadingProps) {
  const { chapterId } = useParams<{ chapterId: string }>()
  const label = typeof children === 'string' ? children : id.replace(/-/g, ' ')

  return (
    <h2
      id={id}
      className="group flex items-center gap-2 scroll-mt-20"
    >
      <span className="flex-1">{children}</span>
      {chapterId && (
        <BookmarkButton
          chapterId={chapterId}
          sectionId={id}
          label={label}
          size="sm"
          className=""
        />
      )}
    </h2>
  )
}
