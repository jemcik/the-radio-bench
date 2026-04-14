import { StrictMode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { BookmarkProvider, useBookmarks } from './BookmarkContext'

/**
 * The motivating regression: adding a bookmark fired the
 * `radiopedia:bookmark-added` CustomEvent twice in development, producing
 * a duplicate "Bookmark saved" toast. Root cause was a side-effect
 * (dispatchEvent) inside the setBookmarks updater callback — React 18's
 * StrictMode double-invokes updaters to surface that exact class of bug.
 *
 * These tests wrap the hook in <StrictMode> so the double-invoke check is
 * active; any future regression that moves side effects back into the
 * updater will trip them.
 */

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <StrictMode>
      <BookmarkProvider>{children}</BookmarkProvider>
    </StrictMode>
  )
}

describe('BookmarkContext', () => {
  it('dispatches bookmark-added exactly once per add (StrictMode-safe)', () => {
    const onAdded = vi.fn()
    window.addEventListener('radiopedia:bookmark-added', onAdded)

    const { result } = renderHook(() => useBookmarks(), { wrapper })
    act(() => {
      result.current.toggle('0-3', null, 'Math Toolkit')
    })

    expect(onAdded).toHaveBeenCalledTimes(1)
    window.removeEventListener('radiopedia:bookmark-added', onAdded)
  })

  it('dispatches bookmark-removed exactly once per remove via toggle', () => {
    const onRemoved = vi.fn()
    window.addEventListener('radiopedia:bookmark-removed', onRemoved)

    const { result } = renderHook(() => useBookmarks(), { wrapper })
    // Seed one bookmark, then toggle it off.
    act(() => { result.current.toggle('0-3', null, 'Math Toolkit') })
    act(() => { result.current.toggle('0-3', null, 'Math Toolkit') })

    expect(onRemoved).toHaveBeenCalledTimes(1)
    window.removeEventListener('radiopedia:bookmark-removed', onRemoved)
  })

  it('dispatches bookmark-removed exactly once when remove() is called', () => {
    const onRemoved = vi.fn()
    window.addEventListener('radiopedia:bookmark-removed', onRemoved)

    const { result } = renderHook(() => useBookmarks(), { wrapper })
    act(() => { result.current.toggle('0-3', null, 'Math Toolkit') })
    act(() => { result.current.remove('0-3', null) })

    expect(onRemoved).toHaveBeenCalledTimes(1)
    window.removeEventListener('radiopedia:bookmark-removed', onRemoved)
  })

  it('toggle flips the bookmark state and reflects in isBookmarked', () => {
    const { result } = renderHook(() => useBookmarks(), { wrapper })

    expect(result.current.isBookmarked('0-3', null)).toBe(false)
    act(() => { result.current.toggle('0-3', null, 'Math Toolkit') })
    expect(result.current.isBookmarked('0-3', null)).toBe(true)
    act(() => { result.current.toggle('0-3', null, 'Math Toolkit') })
    expect(result.current.isBookmarked('0-3', null)).toBe(false)
  })

  it('distinguishes bookmarks by sectionId', () => {
    const { result } = renderHook(() => useBookmarks(), { wrapper })
    act(() => { result.current.toggle('0-3', null, 'Math Toolkit') })
    act(() => { result.current.toggle('0-3', 'fractions', 'Fractions') })

    expect(result.current.isBookmarked('0-3', null)).toBe(true)
    expect(result.current.isBookmarked('0-3', 'fractions')).toBe(true)
    expect(result.current.isBookmarked('0-3', 'other')).toBe(false)
    expect(result.current.bookmarks).toHaveLength(2)
  })

  it('persists the labelKey when provided', () => {
    const { result } = renderHook(() => useBookmarks(), { wrapper })
    act(() => {
      result.current.toggle('0-3', 'fractions', 'Fractions', 'ch0_3.sectionFractions')
    })
    const bookmark = result.current.bookmarks[0]
    expect(bookmark.labelKey).toBe('ch0_3.sectionFractions')
    expect(bookmark.label).toBe('Fractions')
  })

  it('clear() empties the list', () => {
    const { result } = renderHook(() => useBookmarks(), { wrapper })
    act(() => { result.current.toggle('0-3', null, 'Math Toolkit') })
    act(() => { result.current.toggle('0-2', null, 'Lab Bench Setup') })
    expect(result.current.bookmarks).toHaveLength(2)

    act(() => { result.current.clear() })
    expect(result.current.bookmarks).toHaveLength(0)
  })
})
