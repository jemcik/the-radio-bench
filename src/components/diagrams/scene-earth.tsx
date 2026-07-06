/**
 * Shared geometry for the Chapter 4.1 propagation "scene" diagrams
 * (three modes, skip geometry, tropospheric duct).
 *
 * The earth surface is a parabola with its vertex (highest point) at the
 * horizontal centre. The KEY property: `surfaceY(x)` is evaluated from the
 * SAME quadratic that the drawn `stroke`/`fill` paths trace, so any antenna
 * rooted at `surfaceY(x)` and any ray endpoint derived from it sit exactly on
 * the drawn curve — no floating, no sinking.
 *
 * A quadratic Bézier `M 0 yEdge Q cx (2·yMid−yEdge) W yEdge` is a parabola
 * through (0,yEdge), (cx,yMid), (W,yEdge); `surfaceY` is that same parabola in
 * closed form.
 */
import { svgTokens as S } from './svgTokens'

export interface Earth {
  /** Surface y at horizontal position x (exact, matches the drawn curve). */
  surfaceY: (x: number) => number
  /** Stroke path for the visible surface line. */
  stroke: string
  /** Filled earth body below the surface. */
  fill: string
  cx: number
}

export function makeEarth(W: number, H: number, yMid: number, yEdge: number): Earth {
  const cx = W / 2
  const surfaceY = (x: number) => yMid + (yEdge - yMid) * ((x - cx) / cx) ** 2
  const cpY = 2 * yMid - yEdge
  const stroke = `M 0 ${yEdge} Q ${cx} ${cpY} ${W} ${yEdge}`
  // Trace the fill bottom-edge first so the overlap gate's M/L-only path
  // reconstruction sees the bottom + right edges, never a corner-to-corner
  // phantom diagonal across the canvas.
  const fill = `M 0 ${H} L ${W} ${H} L ${W} ${yEdge} Q ${cx} ${cpY} 0 ${yEdge} Z`
  return { surfaceY, stroke, fill, cx }
}

/** Feed point (top of the mast) for an antenna rooted at (x, baseY). */
export function feed(x: number, baseY: number, h: number): [number, number] {
  return [x, baseY - h]
}

/**
 * Quadratic-Bézier path that exactly follows the parabolic surface between x0
 * and x1 (optionally offset vertically by `dy`). Because a sub-arc of a
 * parabola is itself a parabola, one Q Bézier matches the surface pixel-for-
 * pixel — use it for bands/highlights (skip zone, ground-wave coverage) that
 * must hug the curve instead of cutting across it as a straight line.
 */
export function surfaceArc(E: Earth, x0: number, x1: number, dy = 0): string {
  const midX = (x0 + x1) / 2
  const y0 = E.surfaceY(x0) + dy
  const y1 = E.surfaceY(x1) + dy
  const cpY = 2 * (E.surfaceY(midX) + dy) - (y0 + y1) / 2
  return `M ${x0} ${y0.toFixed(2)} Q ${midX} ${cpY.toFixed(2)} ${x1} ${y1.toFixed(2)}`
}

/**
 * A ground-station antenna: a vertical mast rooted on the surface at (x, baseY)
 * with a small feed dot at the top. Rays should start/end at `feed(x, baseY, h)`
 * so they visibly connect to the mast top.
 */
export function Antenna({
  x,
  baseY,
  h = 22,
}: {
  x: number
  baseY: number
  h?: number
}) {
  const top = baseY - h
  return (
    <g stroke={S.fg} strokeWidth={1.8} fill={S.fg} strokeLinecap="round">
      <line x1={x} y1={baseY} x2={x} y2={top} />
      {/* two short elements near the top read as an antenna, not an arrow */}
      <line x1={x - 5} y1={top + 4} x2={x + 5} y2={top + 4} />
      <line x1={x - 3.5} y1={top + 9} x2={x + 3.5} y2={top + 9} />
      <circle cx={x} cy={top} r={2.4} />
    </g>
  )
}
