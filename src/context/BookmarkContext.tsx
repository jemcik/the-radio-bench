import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Bookmark {
  /** Chapter id, e.g. "0-2" */
  chapterId: string
  /** Section anchor (h2 id), or null if bookmarking the whole chapter */
  sectionId: string | null
  /** Human-readable label */
  label: string
  /** Timestamp when bookmarked */
  ts: number
}

interface BookmarkContextValue {
  bookmarks: Bookmark[]
  isBookmarked: (chapterId: string, sectionId?: string | null) => boolean
  toggle: (chapterId: string, sectionId: string | null, label: string) => void
  remove: (chapterId: string, sectionId?: string | null) => void
  clear: () => void
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'radiopedia-bookmarks'

function load(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
}

// ─── Context ─────────────────────────────────────────────────────────────────

const BookmarkContext = createContext<BookmarkContextValue | null>(null)

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load)

  // Persist on every change
  useEffect(() => { save(bookmarks) }, [bookmarks])

  const isBookmarked = useCallback(
    (chapterId: string, sectionId?: string | null) =>
      bookmarks.some(b => b.chapterId === chapterId && b.sectionId === (sectionId ?? null)),
    [bookmarks]
  )

  const toggle = useCallback(
    (chapterId: string, sectionId: string | null, label: string) => {
      setBookmarks(prev => {
        const exists = prev.some(b => b.chapterId === chapterId && b.sectionId === sectionId)
        if (exists) {
          return prev.filter(b => !(b.chapterId === chapterId && b.sectionId === sectionId))
        }
        return [...prev, { chapterId, sectionId, label, ts: Date.now() }]
      })
    },
    []
  )

  const remove = useCallback(
    (chapterId: string, sectionId?: string | null) => {
      setBookmarks(prev =>
        prev.filter(b => !(b.chapterId === chapterId && b.sectionId === (sectionId ?? null)))
      )
    },
    []
  )

  const clear = useCallback(() => setBookmarks([]), [])

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
