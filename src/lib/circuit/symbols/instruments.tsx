/**
 * Measurement instruments and control components — meter, switches, fuse.
 *
 * Switches and fuse adapted from chris-pikul/electronic-symbols (MIT).
 * Meter has no upstream equivalent and is kept as a local custom symbol
 * (circle with a letter inside, designator-style). See ../vendored/SOURCE.md.
 */

import { type SymbolProps, type Orientation, pins2, STROKE } from '../types'
import { OrientedLabel } from '../SymbolLabel'
import { VendoredSymbol } from './_VendoredSymbol'

// ─── Meter ────────────────────────────────────────────────────────────────────

/**
 * Pin-span for Meter — matches the circle diameter (2 × radius = 40) so
 * wires connect exactly at the circle edge with no gap. Callers MUST use
 * this span (or the `meterPins` helper below) when computing pin positions;
 * the default SPAN=60 would leave a 10 px gap.
 */
export const METER_PIN_SPAN = 40

/** Helper returning Meter's pin positions — use instead of bare pins2 so
 *  callers never have to remember the custom span. */
export function meterPins(cx: number, cy: number, orient: Orientation = 'right') {
  return pins2(cx, cy, orient, METER_PIN_SPAN)
}

/** Accent presets — hard-coded HSL so a voltmeter looks identical across
 *  every chapter and every theme. */
export const METER_ACCENT_V = 'hsl(210 70% 55%)'
export const METER_ACCENT_A = 'hsl(142 55% 42%)'

/**
 * Meter — generic circular meter (V, A, Ω, W, etc.). Custom, not vendored.
 * The circle is rotation-symmetric and the letter is kept upright regardless
 * of `orient`, because a «V» or «A» reads as a letter even when the symbol
 * is drawn rotated on a schematic. Only the pin positions rotate.
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
      <circle cx={x} cy={y} r={20} stroke={accent} strokeWidth={STROKE} fill="none" data-overlap-allowed="" />
      <text
        x={x} y={y}
        fontSize="16" fontWeight={600}
        textAnchor="middle" dominantBaseline="central"
        fill={accent}
        data-uniform-typography-exempt="meter-glyph"
        data-overlap-allowed=""
      >
        {letter}
      </text>
      <OrientedLabel x={x} y={y} orient={orient} offset={28} label={label} value={value} />
    </g>
  )
}

// ─── SwitchSPST ───────────────────────────────────────────────────────────────

/**
 * SwitchSPST — single-pole single-throw.
 * Source: Switch-COM-SPST.svg (always drawn OPEN in upstream; the project's
 * `closed` prop is not represented separately upstream, so we keep the
 * upstream open-state geometry and ignore `closed`. If a closed-switch
 * variant becomes important, add a local override.)
 * Pins: (-30, 0) and (+30, 0).
 */
export function SwitchSPST({
  x,
  y,
  orient = 'right',
  label,
  value,
  // closed prop retained for API stability but currently unused —
  // the upstream symbol is fixed in the open position.
  closed: _closed = false,
}: SymbolProps & { closed?: boolean }) {
  return (
    <g>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <circle cx="37.5" cy="75" r="6.25" />
        <path d="M0 74.94h31.25" />
        <circle cx="112.5" cy="75" r="6.25" />
        <path d="M150 75.06h-31.25m-75-3.31L102 36.5" />
      </VendoredSymbol>
      <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
    </g>
  )
}

// ─── SwitchSPDT ───────────────────────────────────────────────────────────────

/**
 * SwitchSPDT — single-pole double-throw.
 * Source: Switch-COM-SPDT.svg (drawn in the «pole-to-upper-contact»
 * orientation; the existing `position` prop is API-compatible but not
 * reflected in the rendering because the upstream is a fixed drawing).
 * Pins: common (-30, 0), NO/upper (+30, -15), NC/lower (+30, +15).
 */
export function SwitchSPDT({
  x,
  y,
  orient = 'right',
  label,
  value,
  position: _position = 'up',
}: SymbolProps & { position?: 'up' | 'down' }) {
  return (
    <g>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <circle cx="37.5" cy="75" r="6.25" />
        <path d="M0 74.94h31.25" />
        <circle cx="112.5" cy="37.5" r="6.25" />
        <path d="M150 37.56h-31.25m-75 34.19 81.25-25" />
        <circle cx="112.5" cy="112.5" r="6.25" />
        <path d="M150 112.56h-31.25" />
      </VendoredSymbol>
      <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
    </g>
  )
}

// ─── Fuse ─────────────────────────────────────────────────────────────────────

/**
 * Fuse — IEEE rectangular body crossed by a straight wire.
 * Source: Fuse-IEEE.svg
 * Pins: (-30, 0) and (+30, 0).
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
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M0 74.88h150M25 50h100v50H25z" />
      </VendoredSymbol>
      <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
    </g>
  )
}
