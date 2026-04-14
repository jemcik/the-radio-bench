/**
 * SVGDiagram — safe wrapper for all inline SVG illustrations.
 *
 * OVERFLOW GUARD
 * ──────────────
 * SVG's viewBox clips content silently: anything whose coordinates exceed
 * (W, H) is cut off with no warning. This wrapper prevents partial renders
 * by applying a hard <clipPath> that matches the declared viewport.
 *
 * In development (import.meta.env.DEV) a dashed red border is rendered on
 * top of the diagram so you can immediately see when content is approaching
 * or crossing the boundary.
 *
 * USAGE
 * ──────
 * Replace bare <svg viewBox="0 0 W H"> with:
 *
 *   <SVGDiagram width={W} height={H} aria-label="…">
 *     {…your SVG content…}
 *   </SVGDiagram>
 *
 * COORDINATE BUDGET CHECKLIST (copy into each diagram file)
 * ──────────────────────────────────────────────────────────
 *   const W = ???, H = ???
 *   // Verify before committing:
 *   //  • max x used:  ??? (must be < W)
 *   //  • max y used:  ??? (must be < H — include font descenders ≈ fontSize*0.3)
 *   //  • textAnchor="end" at x=X means right edge = X (must be < W)
 *   //  • textAnchor="middle" at x=X means right edge = X + textWidth/2
 */

import type { ReactNode, SVGProps } from 'react'

// Uncomment to re-enable the dev overlay: const isDev = import.meta.env.DEV

/**
 * READABILITY CONSTANTS — import these in every diagram file.
 *
 * TEXT OPACITY RULE: never go below TEXT_DIM for any readable label.
 * Low-opacity `currentColor` text on coloured diagram backgrounds becomes
 * near-invisible in light themes (dark text × low alpha over dark fill = nothing).
 *
 *  TEXT_PRIMARY  — main labels, callout text, anything the reader must see
 *  TEXT_DIM      — secondary / decorative labels (axis ticks, minor annotations)
 *  TEXT_GHOST    — purely ambient text (DIP-gap hints, background notes)
 *
 * ⚠️  Do NOT go below TEXT_DIM for text on a coloured background.
 *     If a label seems "too loud", reduce font-size or font-weight first.
 *
 * COLOUR RULE: never use `currentColor` for text drawn on a fixed-colour
 * diagram background (boards, screens, panels). `currentColor` resolves to
 * near-black in light themes — invisible on dark fills. Use an explicit
 * light HSL value instead (e.g. hsl(142 30% 82%) on a dark-green board).
 */
export const TEXT_PRIMARY = 0.85
export const TEXT_DIM     = 0.60
export const TEXT_GHOST   = 0.45

interface SVGDiagramProps extends Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'width' | 'height'> {
  /** Logical pixel width of the diagram */
  width: number
  /** Logical pixel height of the diagram */
  height: number
  children: ReactNode
}

let _nextId = 0

export default function SVGDiagram({ width, height, children, ...rest }: SVGDiagramProps) {
  // Each instance gets a stable clip-path ID to avoid collisions when
  // multiple diagrams appear on the same page.
  const clipId = `svg-diagram-clip-${width}x${height}-${(_nextId++).toString(36)}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ display: 'block' }}
      {...rest}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={width} height={height} />
        </clipPath>
      </defs>

      {/* All content clipped to the declared viewport — no silent overflow */}
      <g clipPath={`url(#${clipId})`}>
        {children}
      </g>

      {/* DEV overlay removed — uncomment to debug overflow:
      {isDev && (
        <rect width={width} height={height} fill="none"
          stroke="red" strokeWidth="2" strokeDasharray="8 5"
          opacity="0.55" style={{ pointerEvents: 'none' }} />
      )} */}
    </svg>
  )
}
