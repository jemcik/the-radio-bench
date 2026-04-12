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

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
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
        'inline-flex items-center justify-center rounded-md transition-all',
        btnSize,
        active
          ? 'text-primary hover:text-primary/80'
          : 'text-muted-foreground/40 hover:text-muted-foreground',
        className,
      )}
    >
      <Bookmark
        className={cn(iconSize, 'transition-all')}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={active ? 1.5 : 1.5}
      />
    </button>
  )
}
