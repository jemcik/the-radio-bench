/**
 * VendoredSymbol — shared wrapper for symbols adapted from
 * chris-pikul/electronic-symbols (MIT). See `../vendored/SOURCE.md`.
 *
 * The upstream SVGs use a 150×150 viewBox with the symbol's centre at
 * (75, 75). Two-terminal components have pins at (0, 75) and (150, 75);
 * three-terminal at (0, 75) + (100, 0/150). Scaling everything by 0.4
 * maps those pin positions exactly onto our existing coordinate
 * conventions (SPAN=60 → ±30 from centre for two-terminal pins).
 *
 * This wrapper handles:
 *   • the parent translate/rotate that positions the symbol in the
 *     enclosing <Circuit>;
 *   • the inner scale + translate that maps the source 150×150 frame
 *     onto our local (-30..+30) coordinate range;
 *   • stroke compensation — source stroke is pre-multiplied by 1/0.4
 *     so the rendered thickness equals STROKE after the down-scale;
 *   • a `fill="none"` default so unfilled paths get the right look,
 *     while filled paths (arrowheads) override per-element.
 */
import type { ReactNode } from 'react'
import { type Orientation, orientAngle, STROKE } from '../types'

/** Source viewBox is 150×150, centre at (75, 75). We map this to our
 *  local coordinate range -30..+30 (SPAN/2 on each side), so the scale
 *  factor is 60 / 150 = 0.4. */
export const VENDORED_SCALE = 0.4

interface VendoredSymbolProps {
  x: number
  y: number
  orient?: Orientation
  children: ReactNode
}

export function VendoredSymbol({ x, y, orient = 'right', children }: VendoredSymbolProps) {
  return (
    <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
      <g
        transform={`scale(${VENDORED_SCALE}) translate(-75 -75)`}
        stroke="currentColor"
        strokeWidth={STROKE / VENDORED_SCALE}
        fill="none"
      >
        {children}
      </g>
    </g>
  )
}
