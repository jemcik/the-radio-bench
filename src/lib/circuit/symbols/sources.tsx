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

// ─── Battery ──────────────────────────────────────────────────────────────────

/**
 * Battery — single cell (ARRL standard)
 * Two vertical plates with a gap, oriented horizontally by default.
 * Positive plate (pin1 side): thin line
 * Negative plate (pin2 side): thick, short line
 */
export function Battery({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  // Polarity label positions — computed per orientation so they stay
  // upright and next to the correct plate regardless of rotation.
  const plus  = orient === 'down'  ? { x: x + 12, y: y - 8 }
              : orient === 'up'    ? { x: x - 12, y: y + 12 }
              : orient === 'left'  ? { x: x + 10, y: y - 10 }
              : /* right */          { x: x - 10, y: y - 10 }

  const minus = orient === 'down'  ? { x: x + 12, y: y + 12 }
              : orient === 'up'    ? { x: x - 12, y: y - 8 }
              : orient === 'left'  ? { x: x - 10, y: y + 12 }
              : /* right */          { x: x + 10, y: y + 12 }

  return (
    <g>
      {/* Component body — plates + leads */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Positive plate (pin1 side, left) — thin, tall */}
        <line x1={-4} y1={-10} x2={-4} y2={10} stroke="currentColor" strokeWidth={STROKE} />

        {/* Negative plate (pin2 side, right) — thick, short */}
        <line
          x1={4} y1={-6} x2={4} y2={6}
          stroke="currentColor" strokeWidth={STROKE + 0.8}
        />

        {/* Leads */}
        <line x1={-30} y1={0} x2={-4} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={4} y1={0} x2={30} y2={0} stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Polarity labels — outside rotation so they always read correctly */}
      <text x={plus.x} y={plus.y} fontSize={9} textAnchor="middle"
        fill="currentColor" opacity={0.45}>+</text>
      <text x={minus.x} y={minus.y} fontSize={10} textAnchor="middle"
        fill="currentColor" opacity={0.45}>−</text>

      {/* Label and value outside rotation */}
      {(label || value) && (
        <>
          {label && (
            <text
              x={vert ? x + 18 : x}
              y={vert ? y : y - 14}
              fontSize="12" fontWeight="bold"
              textAnchor={vert ? 'start' : 'middle'}
              fill="currentColor"
            >{label}</text>
          )}
          {value && (
            <text
              x={vert ? x + 18 : x}
              y={vert ? y + 16 : y + 4}
              fontSize="11"
              textAnchor={vert ? 'start' : 'middle'}
              fill="currentColor" opacity={0.7}
            >{value}</text>
          )}
        </>
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
  const vert = isVertical(orient)

  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Cell 1 */}
        <line x1={-10} y1={-10} x2={-10} y2={10} stroke="currentColor" strokeWidth={STROKE} />
        <line
          x1={-6}
          y1={-6}
          x2={-6}
          y2={6}
          stroke="currentColor"
          strokeWidth={STROKE + 0.8}
        />

        {/* Cell 2 */}
        <line x1={-2} y1={-10} x2={-2} y2={10} stroke="currentColor" strokeWidth={STROKE} />
        <line
          x1={2}
          y1={-6}
          x2={2}
          y2={6}
          stroke="currentColor"
          strokeWidth={STROKE + 0.8}
        />

        {/* Cell 3 */}
        <line x1={6} y1={-10} x2={6} y2={10} stroke="currentColor" strokeWidth={STROKE} />
        <line
          x1={10}
          y1={-6}
          x2={10}
          y2={6}
          stroke="currentColor"
          strokeWidth={STROKE + 0.8}
        />

        {/* Leads */}
        <line x1={-30} y1={0} x2={-10} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={10} y1={0} x2={30} y2={0} stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Label and value outside rotation */}
      {label && (
        <text
          x={vert ? x + 18 : x}
          y={vert ? y : y - 14}
          fontSize="12"
          fontWeight="bold"
          textAnchor={vert ? 'start' : 'middle'}
          fill="currentColor"
        >
          {label}
        </text>
      )}
      {value && (
        <text
          x={vert ? x + 18 : x}
          y={vert ? y + 16 : y + 4}
          fontSize="11"
          textAnchor={vert ? 'start' : 'middle'}
          fill="currentColor"
          opacity={0.7}
        >
          {value}
        </text>
      )}
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
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Lead from top */}
        <line x1={0} y1={-15} x2={0} y2={0} stroke="currentColor" strokeWidth={STROKE} />

        {/* Three horizontal lines, decreasing in width */}
        <line x1={-12} y1={0} x2={12} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-8} y1={5} x2={8} y2={5} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-4} y1={10} x2={4} y2={10} stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Label outside rotation */}
      {label && (
        <text
          x={vert ? x + 18 : x}
          y={vert ? y : y - 14}
          fontSize="12"
          fontWeight="bold"
          textAnchor={vert ? 'start' : 'middle'}
          fill="currentColor"
        >
          {label}
        </text>
      )}
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
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Lead from top */}
        <line x1={0} y1={-15} x2={0} y2={0} stroke="currentColor" strokeWidth={STROKE} />

        {/* Three horizontal lines */}
        <line x1={-12} y1={0} x2={12} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-8} y1={5} x2={8} y2={5} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={-4} y1={10} x2={4} y2={10} stroke="currentColor" strokeWidth={STROKE} />

        {/* Diagonal hatching below */}
        <line
          x1={-10}
          y1={14}
          x2={-4}
          y2={20}
          stroke="currentColor"
          strokeWidth={STROKE}
        />
        <line
          x1={-4}
          y1={14}
          x2={2}
          y2={20}
          stroke="currentColor"
          strokeWidth={STROKE}
        />
        <line
          x1={2}
          y1={14}
          x2={8}
          y2={20}
          stroke="currentColor"
          strokeWidth={STROKE}
        />
      </g>

      {/* Label outside rotation */}
      {label && (
        <text
          x={vert ? x + 18 : x}
          y={vert ? y : y - 14}
          fontSize="12"
          fontWeight="bold"
          textAnchor={vert ? 'start' : 'middle'}
          fill="currentColor"
        >
          {label}
        </text>
      )}
    </g>
  )
}
