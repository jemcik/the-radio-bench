/**
 * Wire — connects component pins with orthogonal (or free-form) line segments.
 * Junction — filled dot marking an electrical connection between wires.
 *
 * USAGE
 *   // Explicit waypoints — full control, no surprises
 *   <Wire points={[r1.p2, {x:200, y:40}, {x:200, y:120}, c1.p1]} />
 *
 *   // Accent-coloured wire (e.g. to highlight a measurement branch)
 *   <Wire points={[...]} color="hsl(210 70% 55%)" />
 *
 *   // Junction dot where wires meet
 *   <Junction x={200} y={40} />
 */

import type { Point } from './types'
import { WIRE_STROKE } from './types'

// ─── Wire ─────────────────────────────────────────────────────────────────────

interface WireProps {
  /** Ordered array of waypoints (at least 2). */
  points: Point[]
  /** Override stroke colour (default: currentColor). */
  color?: string
  /** Dashed style for construction / phantom wires. */
  dashed?: boolean
}

export function Wire({ points, color, dashed }: WireProps) {
  if (points.length < 2) return null
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ')
  return (
    <path
      d={d}
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth={WIRE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? '6 4' : undefined}
    />
  )
}

// ─── Junction ─────────────────────────────────────────────────────────────────

interface JunctionProps {
  x: number
  y: number
  /** Override fill colour (default: currentColor). */
  color?: string
  /** Radius in px (default 3). */
  r?: number
}

export function Junction({ x, y, color, r = 3 }: JunctionProps) {
  return <circle cx={x} cy={y} r={r} fill={color ?? 'currentColor'} />
}
