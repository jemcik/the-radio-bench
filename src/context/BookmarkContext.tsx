import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

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

  // Sync from localStorage when imperative helpers write directly
  useEffect(() => {
    const handler = () => setBookmarks(load())
    window.addEventListener('radiopedia:bookmark-sync', handler)
    return () => window.removeEventListener('radiopedia:bookmark-sync', handler)
  }, [])

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
    []
  )

  const remove = useCallback(
    (chapterId: string, sectionId?: string | null) => {
      setBookmarks(prev =>
        prev.filter(b => !(b.chapterId === chapterId && b.sectionId === (sectionId ?? null)))
      )
      window.dispatchEvent(new CustomEvent('radiopedia:bookmark-removed'))
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

// ─── Imperative helpers (for guided tour — no React context needed) ─────────

/** Add a bookmark directly via localStorage + dispatch a sync event */
export function addBookmarkImperative(chapterId: string, sectionId: string | null, label: string, labelKey?: string) {
  const bookmarks = load()
  const exists = bookmarks.some(b => b.chapterId === chapterId && b.sectionId === sectionId)
  if (!exists) {
    bookmarks.push({ chapterId, sectionId, label, ...(labelKey && { labelKey }), ts: Date.now() })
    save(bookmarks)
    window.dispatchEvent(new CustomEvent('radiopedia:bookmark-sync'))
  }
}

/** Remove a bookmark directly via localStorage + dispatch a sync event */
export function removeBookmarkImperative(chapterId: string, sectionId: string | null) {
  const bookmarks = load()
  const filtered = bookmarks.filter(b => !(b.chapterId === chapterId && b.sectionId === sectionId))
  save(filtered)
  window.dispatchEvent(new CustomEvent('radiopedia:bookmark-sync'))
}
