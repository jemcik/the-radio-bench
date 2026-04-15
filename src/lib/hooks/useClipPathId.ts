import { useId } from 'react'

/**
 * Build a unique, SVG-safe id for a `<clipPath>` (or any other `<defs>`
 * entry that needs a stable, instance-unique identifier).
 *
 * `useId()` returns a string containing colons (e.g. `:r3:`) which are
 * legal in HTML ids but break inside `url(#id)` references in some SVG
 * renderers. Stripping the colons sidesteps the problem.
 *
 * @example
 *   const clipId = useClipPathId('logaxis-plot')
 *   //   → "logaxis-plot-r3"
 *   …
 *   <clipPath id={clipId}>…</clipPath>
 *   <path clipPath={`url(#${clipId})`} … />
 */
export function useClipPathId(prefix: string): string {
  const uid = useId().replace(/:/g, '')
  return `${prefix}-${uid}`
}
