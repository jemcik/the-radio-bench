import { useState, useEffect, useRef } from 'react'
import { Bookmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBookmarks } from '@/context/BookmarkContext'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  chapterId: string
  sectionId?: string | null
  label: string
  /** i18n key — stored in the bookmark so the sidebar can re-translate it */
  labelKey?: string
  /** Size variant */
  size?: 'sm' | 'md'
  className?: string
}

const pulseKeyframes: React.CSSProperties = {
  animation: 'bookmark-pop 0.5s ease-out',
}

export function BookmarkButton({
  chapterId,
  sectionId = null,
  label,
  labelKey,
  size = 'md',
  className,
}: BookmarkButtonProps) {
  const { t } = useTranslation('ui')
  const { isBookmarked, toggle } = useBookmarks()
  const active = isBookmarked(chapterId, sectionId)
  const prevActive = useRef(active)
  const [pulse, setPulse] = useState(false)

  // Fire pulse when bookmark is added (active goes false → true)
  useEffect(() => {
    if (active && !prevActive.current) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(timer)
    }
    prevActive.current = active
  }, [active])

  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(chapterId, sectionId, label, labelKey)
      }}
      aria-label={active ? t('bookmark.removeBookmark') : t('bookmark.bookmarkThis')}
      title={active ? t('bookmark.removeBookmark') : t('bookmark.bookmark')}
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
        style={pulse ? pulseKeyframes : undefined}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={1.5}
      />
    </button>
  )
}
