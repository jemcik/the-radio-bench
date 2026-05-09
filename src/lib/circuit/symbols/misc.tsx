/**
 * Miscellaneous circuit symbols: antenna, crystal, transformer.
 *
 * Single-pin symbols (antenna), two-pin passive components (crystal),
 * and multi-pin transformer (primary/secondary coils with core).
 */

import { type SinglePinProps, type SymbolProps, orientAngle, STROKE } from '../types'
import { CenteredLabel, SymbolText, LABEL_SIZE, VALUE_SIZE } from '../SymbolLabel'

// ──────────────────────────────────────────────────────────────────────────────
// SINGLE-TERMINAL SYMBOLS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Antenna — standard transmit/receive antenna symbol.
 * Single terminal with upward-pointing V-shaped antenna elements.
 */
export function Antenna({ x, y, orient = 'up', label }: SinglePinProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Lead from pin upward to antenna */}
        <line x1="0" y1="15" x2="0" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* V-shaped antenna arms */}
        <line x1="0" y1="0" x2="-10" y2="-12" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="0" y1="0" x2="10" y2="-12" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Antenna's label sits below the symbol (unique among single-pin parts) */}
      {label && (
        <SymbolText x={x} y={y + 25} size={LABEL_SIZE} weight={600}>
          {label}
        </SymbolText>
      )}
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TWO-TERMINAL SYMBOLS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Crystal — quartz crystal oscillator (ARRL standard).
 * Two vertical plates with a crystal body between them.
 */
export function Crystal({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Left plate */}
        <line x1="-6" y1="-8" x2="-6" y2="8" stroke="currentColor" strokeWidth={STROKE} />

        {/* Right plate */}
        <line x1="6" y1="-8" x2="6" y2="8" stroke="currentColor" strokeWidth={STROKE} />

        {/* Crystal body (rectangle between plates) */}
        <rect x="-3" y="-6" width="6" height="12" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* Leads */}
        <line x1="-30" y1="0" x2="-6" y2="0" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="6" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TRANSFORMER
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Props for transformer symbol.
 * Extends basic symbol props with optional transformer ratio label.
 */
export interface TransformerProps {
  x: number
  y: number
  orient?: 'right' | 'down' | 'left' | 'up'
  label?: string
  ratio?: string  // e.g., "1:2" for step-up
}

/**
 * Transformer — ARRL Handbook style two-winding transformer.
 *
 * Primary winding on TOP (horizontal `⌒⌒⌒⌒` row, bumps going UP).
 * Iron core: two parallel HORIZONTAL lines between the windings.
 * Secondary winding on BOTTOM (horizontal row, bumps going DOWN).
 *
 * Pin layout (default orient='right'):
 *   primary p1 (-30, -12) ──[bumps up]──── (+30, -12) primary p2
 *                          ════════════
 *                          ════════════  ← iron core
 *   secondary p1 (-30, 12) ─[bumps down]── (+30, 12) secondary p2
 *
 * Each winding mirrors the horizontal Inductor primitive's proportions
 * (4 bumps × 9 px wide × 6 px peak amplitude) so the two symbols read
 * at the same visual weight.
 */
export function Transformer({ x, y, orient = 'right', label, ratio }: TransformerProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* PRIMARY WINDING (top) — horizontal coil at y=-12 with leads
            extending out to the corner pins. 4 semicircular bumps
            going UP (away from the core in the centre).
            Path: lead ─── bumps ─── lead.
            sweep=0 going right ⇒ counter-clockwise ⇒ bulges UP. */}
        <path
          d="M -30 -12 L -18 -12 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 a 4.5 6 0 0 0 9 0 L 30 -12"
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* SECONDARY WINDING (bottom) — mirror of primary at y=+12.
            sweep=1 going right ⇒ clockwise ⇒ bulges DOWN. */}
        <path
          d="M -30 12 L -18 12 a 4.5 6 0 0 1 9 0 a 4.5 6 0 0 1 9 0 a 4.5 6 0 0 1 9 0 a 4.5 6 0 0 1 9 0 L 30 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* IRON CORE — two parallel HORIZONTAL lines between windings */}
        <line x1="-18" y1="-3" x2="18" y2="-3" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="-18" y1="3" x2="18" y2="3" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Designator label (`label` prop) always sits ABOVE the body via
          CenteredLabel. The ratio label gets orient-aware positioning:
          for the default horizontal body (orient='right'/'left') it
          fits below; but for the vertical body (orient='up'/'down')
          there are usually wire stubs going above and below the body
          to a horizontal rail, so we place the ratio to the SIDE
          instead — at x+24 with start-anchored text — where there's
          empty schematic space. */}
      {label && (
        <CenteredLabel x={x} y={y} label={label} gap={orient === 'up' || orient === 'down' ? 38 : 26} />
      )}
      {ratio && (orient === 'up' || orient === 'down') && (
        <SymbolText x={x + 24} y={y} size={VALUE_SIZE} anchor="start">
          {ratio}
        </SymbolText>
      )}
      {ratio && (orient === 'right' || orient === 'left') && (
        <SymbolText x={x} y={y + 26} size={VALUE_SIZE}>
          {ratio}
        </SymbolText>
      )}
    </>
  )
}
