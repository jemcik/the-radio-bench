import { Bookmark } from 'lucide-react'
import { useBookmarks } from '@/context/BookmarkContext'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  chapterId: string
  sectionId?: string | null
  label: string
  /** Size variant */
  size?: 'sm' | 'md'
  className?: string
}

export function BookmarkButton({
  chapterId,
  sectionId = null,
  label,
  size = 'md',
  className,
}: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useBookmarks()
  const active = isBookmarked(chapterId, sectionId)

  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(chapterId, sectionId, label)
      }}
      aria-label={active ? 'Remove bookmark' : 'Bookmark this'}
      title={active ? 'Remove bookmark' : 'Bookmark'}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-all shrink-0',
        btnSize,
        active
          ? 'text-red-600 hover:text-red-700'
          : 'text-muted-foreground/30 hover:text-red-400',
        className,
      )}
    >
      <Bookmark
        className={cn(iconSize, 'transition-all')}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={1.5}
      />
    </button>
  )
}
