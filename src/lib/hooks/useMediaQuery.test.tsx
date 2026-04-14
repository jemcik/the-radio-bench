import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useMediaQuery, useBreakpoint } from './useMediaQuery'

/**
 * Wire up a controllable matchMedia mock. Each call returns an MQL whose
 * `matches` we can flip; calling `__fire(matches)` triggers the change handler.
 */
function setupMatchMedia() {
  const listeners = new Set<(e: MediaQueryListEvent) => void>()
  let currentMatches = false

  const mock = vi.fn((query: string) => ({
    matches: currentMatches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(
      (_evt: string, l: (e: MediaQueryListEvent) => void) => listeners.add(l),
    ),
    removeEventListener: vi.fn(
      (_evt: string, l: (e: MediaQueryListEvent) => void) => listeners.delete(l),
    ),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: mock,
  })

  return {
    setMatches(v: boolean) {
      currentMatches = v
    },
    fire(matches: boolean) {
      currentMatches = matches
      const event = { matches } as MediaQueryListEvent
      listeners.forEach(l => l(event))
    },
  }
}

describe('useMediaQuery', () => {
  let helpers: ReturnType<typeof setupMatchMedia>

  beforeEach(() => {
    helpers = setupMatchMedia()
  })

  it('returns the initial match state from matchMedia', () => {
    helpers.setMatches(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(true)
  })

  it('updates when the media query changes', () => {
    helpers.setMatches(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(false)

    act(() => helpers.fire(true))
    expect(result.current).toBe(true)

    act(() => helpers.fire(false))
    expect(result.current).toBe(false)
  })

  it('useBreakpoint builds the right query for a Tailwind breakpoint', () => {
    renderHook(() => useBreakpoint('lg'))

    const matchMediaMock = window.matchMedia as unknown as ReturnType<typeof vi.fn>
    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1024px)')
  })
})
