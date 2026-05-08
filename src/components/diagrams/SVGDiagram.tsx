/**
 * SVGDiagram — safe wrapper for inline SVG illustrations.
 *
 * ⚠️  IMPORTANT — SCALES TO CONTAINER WIDTH
 * ─────────────────────────────────────────
 * This wrapper passes `width="100%"` to its inner <svg>, which means the
 * SVG renders at its container's full width — typically ~1024 px on a
 * max-w-5xl chapter container. A 540 px viewBox is therefore inflated
 * ~1.9× on screen, and **every numeric `fontSize="N"` (user-space units)
 * scales by the same factor**: `fontSize="13"` becomes ~25 px on screen,
 * far larger than body text.
 *
 * Use ONLY ONE of these patterns when SVGDiagram is in play:
 *
 *   1. **Em-based fontSize** — `fontSize="0.812em"`, `"0.75em"`. EM
 *      inherits from the document root and stays at constant display-px
 *      regardless of how the SVG is scaled. Safe with SVGDiagram.
 *
 *   2. **Bare <svg> with fixed width** (preferred for plots/charts):
 *
 *      <svg width={VB_W} height={VB_H} viewBox={`0 0 ${VB_W} ${VB_H}`}
 *           role="img" aria-label="…"
 *           style={{ display: 'block', margin: '0 auto',
 *                    maxWidth: '100%', height: 'auto' }}>
 *        {…}
 *      </svg>
 *
 *      Native size on desktop, shrinks proportionally on narrow viewports.
 *      Numeric fontSize values work as-written. See OhmsLawPlot,
 *      SineOriginDiagram, HalfWaveRectifierWaveform for examples.
 *
 * ❌ NEVER combine SVGDiagram with numeric `fontSize="13"` style values.
 *    The pairing is mechanically blocked by `check:svg-diagram-fontsize-units`
 *    in the gate suite — added after this combination shipped in ch1.10
 *    and the reader caught fonts ~2× the size of body text.
 *
 * OVERFLOW GUARD
 * ──────────────
 * SVG's viewBox clips content silently: anything whose coordinates exceed
 * (W, H) is cut off with no warning. This wrapper prevents partial renders
 * by applying a hard <clipPath> that matches the declared viewport.
 *
 * USAGE
 * ──────
 *   <SVGDiagram width={W} height={H} aria-label="…">
 *     {…your SVG content using EM-based fontSize values…}
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
 *   //  • All fontSize values are em/rem/% — NEVER bare numeric.
 */

import type { CSSProperties, ReactNode, SVGProps } from 'react'

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

export default function SVGDiagram({ width, height, children, style, ...rest }: SVGDiagramProps) {
  // Each instance gets a stable clip-path ID to avoid collisions when
  // multiple diagrams appear on the same page.
  const clipId = `svg-diagram-clip-${width}x${height}-${(_nextId++).toString(36)}`

  // `display: block` is required for `margin: 0 auto` to center the SVG
  // inside its card. Inline SVGs (the browser default) can't be centred
  // that way. We destructure `style` out of `rest` first, then merge with
  // our baseline — so callers can still pass `maxWidth` / `margin` etc.
  // without clobbering `display: block`.
  const mergedStyle: CSSProperties = { display: 'block', ...(style ?? {}) }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={mergedStyle}
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
