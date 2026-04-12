import { type SymbolProps, orientAngle, isVertical, STROKE } from '../types'

/**
 * Resistor — ARRL zigzag style
 *
 * SVG path (at origin, orient='right'):
 *   Lead from (-30,0) to (-16,0)
 *   Zigzag: (-12,-8) → (-4,8) → (4,-8) → (12,8) → (16,0)
 *   Lead from (16,0) to (30,0)
 *
 * The zigzag creates 3.5 cycles matching ARRL standard.
 */
export function Resistor({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  // Label positioning
  const lx = vert ? x + 18 : x
  const ly = vert ? y : y - 14
  const anchor = vert ? 'start' : 'middle'

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Left lead */}
        <line x1="-30" y1="0" x2="-16" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Zigzag resistor body */}
        <polyline
          points="-16,0 -12,-8 -4,8 4,-8 12,8 16,0 30,0"
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Label (un-rotated, placed outside transform group) */}
      {label && (
        <text
          x={lx}
          y={ly}
          fontSize="12"
          fill="currentColor"
          opacity={0.85}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}

      {/* Value (un-rotated, placed below/beside label) */}
      {value && (
        <text
          x={lx}
          y={ly + 12}
          fontSize="11"
          fill="currentColor"
          opacity={0.6}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {value}
        </text>
      )}
    </>
  )
}

/**
 * Capacitor — fixed (two parallel plates)
 *
 * SVG path (at origin, orient='right'):
 *   Lead from (-30,0) to (-4,0)
 *   Plate 1: vertical line (-4,-10) to (-4,10)
 *   Plate 2: vertical line (4,-10) to (4,10)
 *   Lead from (4,0) to (30,0)
 */
export function Capacitor({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  const lx = vert ? x + 18 : x
  const ly = vert ? y : y - 14
  const anchor = vert ? 'start' : 'middle'

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Left lead */}
        <line x1="-30" y1="0" x2="-4" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Plate 1 (left, positive) */}
        <line x1="-4" y1="-10" x2="-4" y2="10" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Plate 2 (right, negative) */}
        <line x1="4" y1="-10" x2="4" y2="10" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Right lead */}
        <line x1="4" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      </g>

      {/* Label (un-rotated, placed outside transform group) */}
      {label && (
        <text
          x={lx}
          y={ly}
          fontSize="12"
          fill="currentColor"
          opacity={0.85}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}

      {/* Value (un-rotated, placed below/beside label) */}
      {value && (
        <text
          x={lx}
          y={ly + 12}
          fontSize="11"
          fill="currentColor"
          opacity={0.6}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {value}
        </text>
      )}
    </>
  )
}

/**
 * Capacitor (Electrolytic) — polarised
 *
 * SVG path (at origin, orient='right'):
 *   Lead from (-30,0) to (-4,0)
 *   Plate 1 (positive): vertical line (-4,-10) to (-4,10)
 *   Plate 2 (negative): curved using quadratic bezier
 *   Lead from (4,0) to (30,0)
 *   "+" text near the positive plate at about (-10, -8)
 */
export function CapacitorElectrolytic({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  const lx = vert ? x + 18 : x
  const ly = vert ? y : y - 14
  const anchor = vert ? 'start' : 'middle'

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Left lead */}
        <line x1="-30" y1="0" x2="-4" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Plate 1 (left, positive) */}
        <line x1="-4" y1="-10" x2="-4" y2="10" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Plate 2 (right, negative) — curved using quadratic bezier */}
        <path
          d="M 4 -10 Q 6 0 4 10"
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
        />

        {/* Right lead */}
        <line x1="4" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* "+" mark near positive plate */}
        <text
          x="-10"
          y="-8"
          fontSize="9"
          fill="currentColor"
          opacity={0.5}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          +
        </text>
      </g>

      {/* Label (un-rotated, placed outside transform group) */}
      {label && (
        <text
          x={lx}
          y={ly}
          fontSize="12"
          fill="currentColor"
          opacity={0.85}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}

      {/* Value (un-rotated, placed below/beside label) */}
      {value && (
        <text
          x={lx}
          y={ly + 12}
          fontSize="11"
          fill="currentColor"
          opacity={0.6}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {value}
        </text>
      )}
    </>
  )
}

/**
 * Inductor — air-core (4 semicircular bumps)
 *
 * SVG path (at origin, orient='right'):
 *   Lead from (-30,0) to (-18,0)
 *   4 arcs bulging upward (negative y): a4.5,6 0 0,0 9,0 (repeated 4 times)
 *   Lead to (30,0)
 */
export function Inductor({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  const lx = vert ? x + 18 : x
  const ly = vert ? y : y - 14
  const anchor = vert ? 'start' : 'middle'

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Left lead */}
        <line x1="-30" y1="0" x2="-18" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* 4 semicircular bumps (arcs bulging upward) */}
        <path
          d="M -18 0 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 L 30 0"
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Label (un-rotated, placed outside transform group) */}
      {label && (
        <text
          x={lx}
          y={ly}
          fontSize="12"
          fill="currentColor"
          opacity={0.85}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}

      {/* Value (un-rotated, placed below/beside label) */}
      {value && (
        <text
          x={lx}
          y={ly + 12}
          fontSize="11"
          fill="currentColor"
          opacity={0.6}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {value}
        </text>
      )}
    </>
  )
}

/**
 * Inductor (Magnetic Core) — air-core with iron core lines
 *
 * Same as Inductor but with two horizontal parallel lines below the bumps
 * at y=4 and y=7, spanning from x=-16 to x=16, representing the iron core.
 */
export function InductorCore({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  const lx = vert ? x + 18 : x
  const ly = vert ? y : y - 14
  const anchor = vert ? 'start' : 'middle'

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Left lead */}
        <line x1="-30" y1="0" x2="-18" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* 4 semicircular bumps (arcs bulging upward) */}
        <path
          d="M -18 0 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 L 30 0"
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Iron core — two horizontal parallel lines */}
        <line x1="-16" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        <line x1="-16" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      </g>

      {/* Label (un-rotated, placed outside transform group) */}
      {label && (
        <text
          x={lx}
          y={ly}
          fontSize="12"
          fill="currentColor"
          opacity={0.85}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}

      {/* Value (un-rotated, placed below/beside label) */}
      {value && (
        <text
          x={lx}
          y={ly + 12}
          fontSize="11"
          fill="currentColor"
          opacity={0.6}
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {value}
        </text>
      )}
    </>
  )
}
