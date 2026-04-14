import { useEffect, useState } from 'react'

/**
 * Returns `true` for `durationMs` after `trigger` transitions from a falsy
 * value to a truthy one. Useful for one-shot animations / pulses driven by
 * external state changes ("the value just changed — flash for a moment").
 *
 * Implementation note: uses the React-recommended "reset state on prop change"
 * pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
 * so the rising-edge detection happens during render, not inside an effect.
 *
 * @example
 *   const isBookmarked = useBookmarks().has(id)
 *   const justBookmarked = useTransientFlag(isBookmarked, 600)
 *   <Icon className={justBookmarked ? 'animate-pop' : ''} />
 */
export function useTransientFlag(trigger: unknown, durationMs: number): boolean {
  const [prev, setPrev] = useState(trigger)
  const [active, setActive] = useState(false)

  // Detect the falsy → truthy transition during render. This avoids the
  // set-state-in-effect lint rule and the cascading-render performance hit.
  if (trigger !== prev) {
    setPrev(trigger)
    if (trigger && !prev) setActive(true)
  }

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setActive(false), durationMs)
    return () => clearTimeout(timer)
  }, [active, durationMs])

  return active
}
