import { useEffect, useState } from 'react'

/**
 * Returns `true` for `durationMs` whenever `trigger` **changes** to a truthy
 * value. Useful for one-shot animations / pulses driven by external state
 * changes ("the value just changed — flash for a moment").
 *
 * Two supported trigger styles:
 *
 *   1. **Boolean flag** — `useTransientFlag(isActive, 600)`. Fires on the
 *      `false → true` transition. `true → false` does nothing. `true → true`
 *      is not a change, so nothing fires.
 *
 *   2. **Ticker / counter** — `useTransientFlag(tick, 2400)` where `tick` is
 *      an incrementing integer. Fires on **every** increment (`0 → 1`,
 *      `1 → 2`, `2 → 3`, …). Use this shape when the same event can happen
 *      repeatedly with no natural "off" state in between (e.g. "a bookmark
 *      was added" fires again and again, there's no moment when the signal
 *      resets to falsy).
 *
 * Implementation note: uses the React-recommended "reset state on prop change"
 * pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
 * so the edge detection happens during render, not inside an effect.
 *
 * @example
 *   const isBookmarked = useBookmarks().has(id)
 *   const justBookmarked = useTransientFlag(isBookmarked, 600)
 *
 * @example
 *   const [tick, setTick] = useState(0)
 *   useEventListener('bookmark-added', () => setTick(n => n + 1))
 *   const pulseBtn = useTransientFlag(tick, 2400)   // fires on every ++
 */
export function useTransientFlag(trigger: unknown, durationMs: number): boolean {
  const [prev, setPrev] = useState(trigger)
  const [active, setActive] = useState(false)

  // Any change → truthy value fires the flag. This catches both the
  // boolean `false → true` edge AND the counter `n → n+1` case where both
  // sides are truthy — the earlier `trigger && !prev` guard only fired on
  // the very first increment of a counter and then stayed silent forever.
  if (trigger !== prev) {
    setPrev(trigger)
    if (trigger) setActive(true)
  }

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setActive(false), durationMs)
    return () => clearTimeout(timer)
  }, [active, durationMs])

  return active
}
