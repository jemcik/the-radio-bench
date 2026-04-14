import { act } from 'react'
import { describe, expect, it, beforeEach } from 'vitest'
import { render, renderHook } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { DEFAULT_THEME } from '@/lib/themes'

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

beforeEach(() => {
  // Reset the theme attribute on <html> between tests — the module-level
  // "apply immediately to avoid flash" side effect can leave it set.
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeContext', () => {
  it('starts on the default theme when storage is empty', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe(DEFAULT_THEME)
  })

  it('applies the theme to <html data-theme> after mount', () => {
    render(<ThemeProvider>child</ThemeProvider>)
    expect(document.documentElement.getAttribute('data-theme')).toBe(DEFAULT_THEME)
  })

  it('setTheme updates context, DOM attribute, and localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => result.current.setTheme('dusk'))

    expect(result.current.theme).toBe('dusk')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dusk')
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe('dusk')
  })

  it('hydrates from localStorage if a saved theme is present', () => {
    localStorage.setItem(STORAGE_KEYS.theme, 'moonlight')
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('moonlight')
  })
})
