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
})
