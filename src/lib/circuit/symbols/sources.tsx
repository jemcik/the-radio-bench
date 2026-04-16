/**
 * Circuit schematic library — voltage and current sources
 *
 * Components:
 *   - Battery: single cell (ARRL standard)
 *   - BatteryMulti: multi-cell (3 cells)
 *   - Ground: chassis ground (single-terminal)
 *   - GroundEarth: earth ground (single-terminal)
 */

import { type SymbolProps, type SinglePinProps, orientAngle, isVertical, STROKE } from '../types'
import { OrientedLabel, SymbolText } from '../SymbolLabel'

// ─── Battery ──────────────────────────────────────────────────────────────────

/**
 * Battery — single cell (ARRL standard)
 * Two vertical plates with a small gap, oriented horizontally by default.
 * Both plates use the SAME stroke width (per ARRL) — polarity is shown
 * by plate LENGTH only: long plate = positive, short plate = negative.
 */
export function Battery({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  const angle = orientAngle(orient)

  // Polarity label positions — computed per orientation so they stay
  // upright and next to the correct plate regardless of rotation.
  // Plates sit at ±2 on the axis perpendicular to the leads; labels sit
  // just next to the plate in the "away-from-body" direction.
  // Both labels sit 5 units from their plate on the outside. The plates
  // are at ±2 on the perpendicular axis, so +7 / −7 gives symmetric spacing.
  const plus  = orient === 'down'  ? { x: x + 9, y: y - 7 }
              : orient === 'up'    ? { x: x - 9, y: y + 7 }
              : orient === 'left'  ? { x: x + 7, y: y - 9 }
              : /* right */          { x: x - 7, y: y - 9 }

  const minus = orient === 'down'  ? { x: x + 9, y: y + 7 }
              : orient === 'up'    ? { x: x - 9, y: y - 7 }
              : orient === 'left'  ? { x: x - 7, y: y + 10 }
              : /* right */          { x: x + 7, y: y + 10 }

  return (
    <g>
      {/* Component body — plates + leads */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Positive plate (pin1 side, left) — LONG */}
        <line x1={-2} y1={-10} x2={-2} y2={10} stroke="currentColor" strokeWidth={STROKE} />

        {/* Negative plate (pin2 side, right) — SHORT, same stroke width */}
        <line x1={2} y1={-6} x2={2} y2={6} stroke="currentColor" strokeWidth={STROKE} />

        {/* Leads */}
        <line x1={-30} y1={0} x2={-2} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={2} y1={0} x2={30} y2={0} stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Polarity labels — outside rotation so they always read correctly.
          Full opacity (same as the rest of the symbol) per user feedback. */}
      <SymbolText x={plus.x} y={plus.y} size={9}>+</SymbolText>
      <SymbolText x={minus.x} y={minus.y} size={10}>−</SymbolText>

      {/* Label + value placement.
          Vertical battery (down/up): designator on the LEFT, value on the
          RIGHT. x-offsets budget room for the plates (long plate ends at
          ±10) plus the polarity marks on the right (at x+9, glyph reaches
          ≈ x+12), so the value starts at x+14 to clear them cleanly.
          Horizontal battery: the default 'above the body' OrientedLabel. */}
      {isVertical(orient) ? (
        <>
          {label && (
            <SymbolText x={x - 12} y={y} size={12} weight="bold" anchor="end">
              {label}
            </SymbolText>
          )}
          {value && (
            <SymbolText x={x + 14} y={y} size={11} anchor="start">
              {value}
            </SymbolText>
          )}
        </>
      ) : (
        <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
      )}
    </g>
  )
}

// ─── BatteryMulti ─────────────────────────────────────────────────────────────

/**
 * BatteryMulti — multi-cell battery (3 cells)
 * Three pairs of plates, tall/thin alternating with short/thick.
 */
export function BatteryMulti({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  const angle = orientAngle(orient)

  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Cell 1 */}
        <line x1={-10} y1={-10} x2={-10} y2={10} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-6} y1={-6} x2={-6} y2={6} stroke="currentColor" strokeWidth={STROKE + 0.8} />

        {/* Cell 2 */}
        <line x1={-2} y1={-10} x2={-2} y2={10} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={2} y1={-6} x2={2} y2={6} stroke="currentColor" strokeWidth={STROKE + 0.8} />

        {/* Cell 3 */}
        <line x1={6} y1={-10} x2={6} y2={10} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={10} y1={-6} x2={10} y2={6} stroke="currentColor" strokeWidth={STROKE + 0.8} />

        {/* Leads */}
        <line x1={-30} y1={0} x2={-10} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={10} y1={0} x2={30} y2={0} stroke="currentColor" strokeWidth={STROKE} />
      </g>

      <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
    </g>
  )
}

// ─── Ground ───────────────────────────────────────────────────────────────────

/**
 * Ground — chassis ground (ARRL standard, single-terminal)
 * Single pin at top (in 'down' orientation).
 * Three horizontal lines decreasing in width.
 */
export function Ground({
  x,
  y,
  orient = 'down',
  label,
}: SinglePinProps) {
  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Lead from top */}
        <line x1={0} y1={-15} x2={0} y2={0} stroke="currentColor" strokeWidth={STROKE} />

        {/* Three horizontal lines, decreasing in width */}
        <line x1={-12} y1={0} x2={12} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-8} y1={5} x2={8} y2={5} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-4} y1={10} x2={4} y2={10} stroke="currentColor" strokeWidth={STROKE} />
      </g>

      <OrientedLabel x={x} y={y} orient={orient} label={label} />
    </g>
  )
}

// ─── GroundEarth ──────────────────────────────────────────────────────────────

/**
 * GroundEarth — earth ground
 * Three horizontal lines with diagonal hatching below.
 */
export function GroundEarth({
  x,
  y,
  orient = 'down',
  label,
}: SinglePinProps) {
  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Lead from top */}
        <line x1={0} y1={-15} x2={0} y2={0} stroke="currentColor" strokeWidth={STROKE} />

        {/* Three horizontal lines */}
        <line x1={-12} y1={0} x2={12} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-8} y1={5} x2={8} y2={5} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-4} y1={10} x2={4} y2={10} stroke="currentColor" strokeWidth={STROKE} />

        {/* Diagonal hatching below */}
        <line x1={-10} y1={14} x2={-4} y2={20} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-4} y1={14} x2={2} y2={20} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={2} y1={14} x2={8} y2={20} stroke="currentColor" strokeWidth={STROKE} />
      </g>

      <OrientedLabel x={x} y={y} orient={orient} label={label} />
    </g>
  )
}
