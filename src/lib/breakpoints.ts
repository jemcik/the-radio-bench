/**
 * Breakpoints in pixels — mirror Tailwind's default scale.
 *
 * Single source of truth used by both:
 *  - JS code that needs to react to viewport width (`useMediaQuery`)
 *  - tailwind.config.ts (when overriding theme.screens, otherwise inherited)
 *
 * Keep these in sync with Tailwind. If we ever customize Tailwind's screens,
 * import from here in tailwind.config.ts to avoid drift.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/** Build a `min-width` media query string for a named breakpoint. */
export function minWidth(bp: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[bp]}px)`
}
