/**
 * Circuit schematic library — measurement instruments and control components
 *
 * Components:
 *   - Meter: general meter circle (V, A, Ω, W, etc.)
 *   - SwitchSPST: single-pole single-throw
 *   - SwitchSPDT: single-pole double-throw
 *   - Fuse: simple fuse symbol
 */

import { type SymbolProps, type Orientation, pins2, orientAngle, STROKE } from '../types'
import { OrientedLabel } from '../SymbolLabel'

// ─── Meter ────────────────────────────────────────────────────────────────────

/**
 * Pin-span for Meter. Matches the circle diameter (2 × radius = 40) so
 * wires connect exactly at the circle edge with no gap. Callers MUST
 * use this span (or the `meterPins` helper below) when computing pin
 * positions, not the default SPAN=60 — that would leave a 10 px gap
 * between the wire endpoint and the circle.
 */
export const METER_PIN_SPAN = 40

/** Helper returning Meter's pin positions — use instead of bare pins2
 *  so callers never have to remember the custom span. */
export function meterPins(cx: number, cy: number, orient: Orientation = 'right') {
  return pins2(cx, cy, orient, METER_PIN_SPAN)
}

/**
 * Accent-colour presets for Meter. These are deliberately hard-coded
 * HSL values (not theme tokens) so a voltmeter looks identical across
 * every chapter and every theme. Used in ch0.2 and ch1.4 — future
 * meter usages MUST import these rather than copy-pasting the HSL
 * literal, to keep the colour book-wide consistent.
 */
export const METER_ACCENT_V = 'hsl(210 70% 55%)'   // voltmeter — blue
export const METER_ACCENT_A = 'hsl(142 55% 42%)'   // ammeter   — green

/**
 * Meter — general meter circle
 * A circle with a letter inside (V, A, Ω, W, etc.).
 *
 * Visual convention: the meter body and its letter are ORIENTATION-
 * INVARIANT — the circle is rotation-symmetric and the letter is kept
 * upright regardless of `orient`, because a "V" or "A" on a rotated
 * schematic is still read as a letter, not a tipped-over shape. Only
 * the PIN POSITIONS rotate with `orient` (via `meterPins` / pins2).
 *
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
  return (
    <g>
      {/* Circle — symmetric under rotation, so no transform needed. */}
      <circle cx={x} cy={y} r={20} stroke={accent} strokeWidth={STROKE} fill="none" />

      {/* Letter — kept UPRIGHT regardless of `orient`. Circuit-symbol
          convention (IEEE 315, ARRL Handbook): instrument-designator
          letters inside meter circles always read upright even when
          the symbol itself is drawn in a rotated orientation on the
          schematic. `dominantBaseline="central"` centres on the
          em-box middle (correct for uppercase letters in a circle). */}
      <text
        x={x} y={y}
        fontSize="16" fontWeight="bold"
        textAnchor="middle" dominantBaseline="central"
        fill={accent}
      >
        {letter}
      </text>

      <OrientedLabel x={x} y={y} orient={orient} offset={28} label={label} value={value} />
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
  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
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

      <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
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
  const targetY = position === 'up' ? -10 : 10

  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
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

      <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
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
  return (
    <g>
      {/* Component body */}
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Rectangle body */}
        <rect x={-9} y={-4} width={18} height={8} stroke="currentColor" strokeWidth={STROKE} fill="none" rx={1} />

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

      <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
    </g>
  )
}

