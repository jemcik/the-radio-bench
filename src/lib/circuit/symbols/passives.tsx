import { type SymbolProps, orientAngle, isVertical, STROKE } from '../types'
import { SymbolText, getLabelPosition } from '../SymbolLabel'

/**
 * Passive components share an "above-the-body" label style: both the
 * designator (R1) and the value (1 kΩ) sit just above the symbol, with
 * subtle opacity. Vertical orientations slide the texts to the right
 * instead. The `getLabelPosition` helper handles the orient maths.
 *
 * For the bolder split-above/below style used by sources, switches, meters,
 * etc., see `OrientedLabel` in `../SymbolLabel`.
 */
function PassiveLabel({
  x,
  y,
  orient,
  label,
  value,
}: SymbolProps & { orient: NonNullable<SymbolProps['orient']> }) {
  // `getLabelPosition` puts horizontal labels at y-14 — too tight for a
  // 12 px glyph above a body that extends to y-8 (resistor zigzag peaks,
  // capacitor plates). Push labels up by 4 more px so there's ~4 px of
  // breathing room between the glyph and the symbol.
  const { lx, ly, anchor } = getLabelPosition(x, y, orient)
  const labelY = isVertical(orient) ? ly : ly - 4
  return (
    <>
      {label && (
        <SymbolText x={lx} y={labelY} size={12} weight={600} anchor={anchor}>
          {label}
        </SymbolText>
      )}
      {value && (
        <SymbolText x={lx} y={labelY + 12} size={11} anchor={anchor}>
          {value}
        </SymbolText>
      )}
    </>
  )
}

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
export function Resistor({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
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

      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
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
export function Capacitor({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Left lead */}
        <line x1="-30" y1="0" x2="-4" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Plate 1 (left, positive) */}
        <line x1="-4" y1="-10" x2="-4" y2="10" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Plate 2 (right, negative) */}
        <line x1="4" y1="-10" x2="4" y2="10" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />

        {/* Right lead */}
        <line x1="4" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      </g>

      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * Capacitor (Electrolytic) — polarised
 *
 * Same as Capacitor but with one curved plate and a "+" mark.
 */
export function CapacitorElectrolytic({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
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
        <SymbolText x={-10} y={-8} size={9} opacity={0.5}>+</SymbolText>
      </g>

      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * Inductor — air-core (4 semicircular bumps)
 */
export function Inductor({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
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

      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * Inductor (Magnetic Core) — air-core with iron core lines
 */
export function InductorCore({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
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

      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}
