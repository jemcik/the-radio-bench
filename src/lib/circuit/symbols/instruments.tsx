/**
 * Circuit schematic library — measurement instruments and control components
 *
 * Components:
 *   - Meter: general meter circle (V, A, Ω, W, etc.)
 *   - SwitchSPST: single-pole single-throw
 *   - SwitchSPDT: single-pole double-throw
 *   - Fuse: simple fuse symbol
 */

import { type SymbolProps, orientAngle, isVertical, STROKE } from '../types'

// ─── Meter ────────────────────────────────────────────────────────────────────

/**
 * Meter — general meter circle
 * A circle with a letter inside (V, A, Ω, W, etc.).
 * Props: SymbolProps & { letter: string; accent?: string }
 */
export function Meter({
  x,
  y,
  orient = 'right',
  label,
  value,
  letter,
  accent = 'currentColor',
}: SymbolProps & { letter: string; accent?: string }) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  return (
    <g>
      {/* Component body — circle + letter only, NO leads.
          Wires connect directly to the circle edge via pins2(…, 40).
          This avoids colour mismatches between wire and lead strokes. */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Circle */}
        <circle cx={0} cy={0} r={20} stroke={accent} strokeWidth={STROKE} fill="none" />

        {/* Letter inside */}
        <text
          x={0}
          y={7}
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          fill={accent}
        >
          {letter}
        </text>
      </g>

      {/* Label and value outside rotation */}
      {label && (
        <text
          x={vert ? x + 28 : x}
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
          x={vert ? x + 28 : x}
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

// ─── SwitchSPST ───────────────────────────────────────────────────────────────

/**
 * SwitchSPST — single-pole single-throw
 * Left contact at (-12, 0), right contact at (12, 0).
 * When closed: straight line. When open: line at angle.
 * Props: SymbolProps & { closed?: boolean }
 */
export function SwitchSPST({
  x,
  y,
  orient = 'right',
  label,
  value,
  closed = false,
}: SymbolProps & { closed?: boolean }) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Left contact dot */}
        <circle cx={-12} cy={0} r={2.5} fill="currentColor" />

        {/* Right contact dot */}
        <circle cx={12} cy={0} r={2.5} fill="currentColor" />

        {/* Arm — straight when closed, angled when open */}
        {closed ? (
          <line x1={-12} y1={0} x2={12} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        ) : (
          <line x1={-12} y1={0} x2={10} y2={-10} stroke="currentColor" strokeWidth={STROKE} />
        )}

        {/* Leads */}
        <line x1={-30} y1={0} x2={-12} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={12} y1={0} x2={30} y2={0} stroke="currentColor" strokeWidth={STROKE} />
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

// ─── SwitchSPDT ───────────────────────────────────────────────────────────────

/**
 * SwitchSPDT — single-pole double-throw
 * Common contact at (-12, 0), top contact at (12, -10), bottom at (12, 10).
 * Arm selects top (default) or bottom position.
 * Props: SymbolProps & { position?: 'up' | 'down' }
 */
export function SwitchSPDT({
  x,
  y,
  orient = 'right',
  label,
  value,
  position = 'up',
}: SymbolProps & { position?: 'up' | 'down' }) {
  const angle = orientAngle(orient)
  const vert = isVertical(orient)

  const targetY = position === 'up' ? -10 : 10

  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {/* Common contact dot */}
        <circle cx={-12} cy={0} r={2.5} fill="currentColor" />

        {/* Top contact dot */}
        <circle cx={12} cy={-10} r={2.5} fill="currentColor" />

        {/* Bottom contact dot */}
        <circle cx={12} cy={10} r={2.5} fill="currentColor" />

        {/* Arm — from common to selected contact */}
        <line x1={-12} y1={0} x2={12} y2={targetY} stroke="currentColor" strokeWidth={STROKE} />

        {/* Leads */}
        <line x1={-30} y1={0} x2={-12} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={12} y1={-10} x2={30} y2={-10} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={12} y1={10} x2={30} y2={10} stroke="currentColor" strokeWidth={STROKE} />
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

// ─── Fuse ─────────────────────────────────────────────────────────────────────

/**
 * Fuse — simple fuse symbol
 * A small rectangle with an S-curve or line inside.
 */
export function Fuse({
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
        {/* Rectangle body */}
        <rect
          x={-9}
          y={-4}
          width={18}
          height={8}
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="none"
          rx={1}
        />

        {/* S-curve inside (simplified as a wavy line) */}
        <path
          d="M -6,-2 Q -2,-4 0,-2 Q 2,0 6,2"
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
        />

        {/* Leads */}
        <line x1={-30} y1={0} x2={-9} y2={0} stroke="currentColor" strokeWidth={STROKE} />
        <line x1={9} y1={0} x2={30} y2={0} stroke="currentColor" strokeWidth={STROKE} />
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
