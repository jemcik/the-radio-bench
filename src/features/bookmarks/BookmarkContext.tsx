import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { codec, readPersisted, usePersistedState } from '@/lib/hooks/usePersistedState'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Bookmark {
  /** Chapter id, e.g. "0-2" */
  chapterId: string
  /** Section anchor (h2 id), or null if bookmarking the whole chapter */
  sectionId: string | null
  /** Human-readable label (fallback when labelKey is absent) */
  label: string
  /** i18n key — resolved at render time so the label follows the active language */
  labelKey?: string
  /** Timestamp when bookmarked */
  ts: number
}

interface BookmarkContextValue {
  bookmarks: Bookmark[]
  isBookmarked: (chapterId: string, sectionId?: string | null) => boolean
  toggle: (chapterId: string, sectionId: string | null, label: string, labelKey?: string) => void
  remove: (chapterId: string, sectionId?: string | null) => void
  clear: () => void
}

// ─── Storage helpers (used by the imperative API below) ──────────────────────

const bookmarkCodec = codec.json<Bookmark[]>()

function loadBookmarks(): Bookmark[] {
  return readPersisted<Bookmark[]>(STORAGE_KEYS.bookmarks, [], bookmarkCodec)
}

function writeBookmarks(bookmarks: Bookmark[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.bookmarks, bookmarkCodec.serialize(bookmarks))
  } catch {
    /* localStorage unavailable / quota exceeded — silently drop */
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const BookmarkContext = createContext<BookmarkContextValue | null>(null)

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = usePersistedState<Bookmark[]>(
    STORAGE_KEYS.bookmarks,
    [],
    bookmarkCodec,
  )

  // Sync from localStorage when imperative helpers (used by the tour) write directly.
  useEffect(() => {
    const handler = () => setBookmarks(loadBookmarks())
    window.addEventListener('radiopedia:bookmark-sync', handler)
    return () => window.removeEventListener('radiopedia:bookmark-sync', handler)
  }, [setBookmarks])

  const isBookmarked = useCallback(
    (chapterId: string, sectionId?: string | null) =>
      bookmarks.some(b => b.chapterId === chapterId && b.sectionId === (sectionId ?? null)),
    [bookmarks]
  )

  const toggle = useCallback(
    (chapterId: string, sectionId: string | null, label: string, labelKey?: string) => {
      setBookmarks(prev => {
        const exists = prev.some(b => b.chapterId === chapterId && b.sectionId === sectionId)
        if (exists) {
          window.dispatchEvent(new CustomEvent('radiopedia:bookmark-removed'))
          return prev.filter(b => !(b.chapterId === chapterId && b.sectionId === sectionId))
        }
        window.dispatchEvent(new CustomEvent('radiopedia:bookmark-added'))
        return [...prev, { chapterId, sectionId, label, ...(labelKey && { labelKey }), ts: Date.now() }]
      })
    },
    [setBookmarks]
  )

  const remove = useCallback(
    (chapterId: string, sectionId?: string | null) => {
      setBookmarks(prev =>
        prev.filter(b => !(b.chapterId === chapterId && b.sectionId === (sectionId ?? null)))
      )
      window.dispatchEvent(new CustomEvent('radiopedia:bookmark-removed'))
    },
    [setBookmarks]
  )

  const clear = useCallback(() => setBookmarks([]), [setBookmarks])

  return (
    <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggle, remove, clear }}>
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext)
  if (!ctx) throw new Error('useBookmarks must be used within BookmarkProvider')
  return ctx
}

// ─── Imperative helpers (for guided tour — no React context needed) ─────────

/** Add a bookmark directly via localStorage + dispatch a sync event */
export function addBookmarkImperative(chapterId: string, sectionId: string | null, label: string, labelKey?: string) {
  const bookmarks = loadBookmarks()
  const exists = bookmarks.some(b => b.chapterId === chapterId && b.sectionId === sectionId)
  if (!exists) {
    bookmarks.push({ chapterId, sectionId, label, ...(labelKey && { labelKey }), ts: Date.now() })
    writeBookmarks(bookmarks)
    window.dispatchEvent(new CustomEvent('radiopedia:bookmark-sync'))
  }
}

/** Remove a bookmark directly via localStorage + dispatch a sync event */
export function removeBookmarkImperative(chapterId: string, sectionId: string | null) {
  const bookmarks = loadBookmarks()
  const filtered = bookmarks.filter(b => !(b.chapterId === chapterId && b.sectionId === sectionId))
  writeBookmarks(filtered)
  window.dispatchEvent(new CustomEvent('radiopedia:bookmark-sync'))
}
