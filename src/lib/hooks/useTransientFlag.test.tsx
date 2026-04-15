import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTransientFlag } from './useTransientFlag'

describe('useTransientFlag', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts false', () => {
    const { result } = renderHook(({ trigger }) => useTransientFlag(trigger, 500), {
      initialProps: { trigger: false },
    })
    expect(result.current).toBe(false)
  })

  it('starts false even if initial trigger is true (only the *transition* matters)', () => {
    const { result } = renderHook(({ trigger }) => useTransientFlag(trigger, 500), {
      initialProps: { trigger: true },
    })
    expect(result.current).toBe(false)
  })

  it('flips to true on false → true transition, then back to false after duration', () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useTransientFlag(trigger, 500),
      { initialProps: { trigger: false } },
    )

    rerender({ trigger: true })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe(false)
  })

  it('does not re-fire if trigger stays true', () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useTransientFlag(trigger, 500),
      { initialProps: { trigger: false } },
    )

    rerender({ trigger: true })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe(false)

    // Trigger stays true — no new pulse.
    rerender({ trigger: true })
    expect(result.current).toBe(false)
  })

  it('re-fires after a true → false → true cycle', () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useTransientFlag(trigger, 500),
      { initialProps: { trigger: false } },
    )

    rerender({ trigger: true })
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(500))

    rerender({ trigger: false })
    expect(result.current).toBe(false)

    rerender({ trigger: true })
    expect(result.current).toBe(true)
  })

  it('re-fires on each increment of a counter trigger (regression: sidebar-pulse bug)', () => {
    // A counter goes 0 → 1 → 2 → 3 and never returns to a falsy value.
    // The sidebar-pulse on Layout.tsx uses this shape: every "bookmark
    // added" event bumps a counter, and the flag should fire every time.
    // The previous rise-edge-only implementation fired only on the 0 → 1
    // transition and stayed dark forever after.
    const { result, rerender } = renderHook(
      ({ trigger }) => useTransientFlag(trigger, 500),
      { initialProps: { trigger: 0 } },
    )

    rerender({ trigger: 1 })
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe(false)

    rerender({ trigger: 2 })
    expect(result.current).toBe(true)           // ← previously failed
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe(false)

    rerender({ trigger: 3 })
    expect(result.current).toBe(true)           // ← previously failed
  })
})
