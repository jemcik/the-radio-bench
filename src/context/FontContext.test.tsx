import { act } from 'react'
import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { FontProvider, useFont, FONT_SIZES } from './FontContext'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { DEFAULT_FONT } from '@/lib/fonts'

function wrapper({ children }: { children: React.ReactNode }) {
  return <FontProvider>{children}</FontProvider>
}

beforeEach(() => {
  // Reset root-level style properties between tests — the module-level
  // "apply immediately" side effect leaves them set.
  const root = document.documentElement
  root.style.removeProperty('--font-sans')
  root.style.removeProperty('--font-mono')
  root.style.fontSize = ''
})

describe('FontContext', () => {
  it('starts on the default font and middle size index', () => {
    const { result } = renderHook(() => useFont(), { wrapper })
    expect(result.current.font).toBe(DEFAULT_FONT)
    // Default is index 2 (16px) — the middle of the 5-step ladder.
    expect(result.current.sizeIndex).toBe(2)
  })

  it('setFont updates context, CSS variables, and localStorage', () => {
    const { result } = renderHook(() => useFont(), { wrapper })

    act(() => result.current.setFont('serif'))

    expect(result.current.font).toBe('serif')
    expect(localStorage.getItem(STORAGE_KEYS.font)).toBe('serif')
    // The --font-sans CSS var is set to whatever `serif` maps to in fonts.ts;
    // we only assert it is non-empty so the test doesn't leak into fonts.ts.
    expect(document.documentElement.style.getPropertyValue('--font-sans')).not.toBe('')
  })

  it('setSizeIndex applies the correct px to documentElement.fontSize', () => {
    const { result } = renderHook(() => useFont(), { wrapper })

    act(() => result.current.setSizeIndex(4))

    expect(result.current.sizeIndex).toBe(4)
    expect(document.documentElement.style.fontSize).toBe(`${FONT_SIZES[4]}px`)
    expect(localStorage.getItem(STORAGE_KEYS.fontSize)).toBe('4')
  })

  it('setSizeIndex clamps out-of-range values into the allowed ladder', () => {
    const { result } = renderHook(() => useFont(), { wrapper })

    act(() => result.current.setSizeIndex(99))
    expect(result.current.sizeIndex).toBe(FONT_SIZES.length - 1)

    act(() => result.current.setSizeIndex(-5))
    expect(result.current.sizeIndex).toBe(0)
  })

  it('hydrates from localStorage if saved values are present', () => {
    localStorage.setItem(STORAGE_KEYS.font, 'mono')
    localStorage.setItem(STORAGE_KEYS.fontSize, '3')

    const { result } = renderHook(() => useFont(), { wrapper })
    expect(result.current.font).toBe('mono')
    expect(result.current.sizeIndex).toBe(3)
  })
})
