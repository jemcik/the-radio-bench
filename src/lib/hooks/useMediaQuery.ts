import { useEffect, useState } from 'react'
import { type Breakpoint, minWidth } from '../breakpoints'

/**
 * Subscribe to a media query and return whether it currently matches.
 *
 * @example
 *   const isWide = useMediaQuery('(min-width: 1024px)')
 *   const isDark = useMediaQuery('(prefers-color-scheme: dark)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)

    // Read once after mount in case the query result changed between SSR/init
    // and the mount. (Cheap insurance.)
    setMatches(mql.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Convenience: true when the viewport is at least the given Tailwind breakpoint. */
export function useBreakpoint(bp: Breakpoint): boolean {
  return useMediaQuery(minWidth(bp))
}
