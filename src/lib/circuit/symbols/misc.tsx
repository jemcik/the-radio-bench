/**
 * Miscellaneous circuit symbols: antenna, crystal, transformer.
 *
 * Single-pin symbols (antenna), two-pin passive components (crystal),
 * and multi-pin transformer (primary/secondary coils with core).
 */

import { type SinglePinProps, type SymbolProps, orientAngle, STROKE } from '../types'
import { CenteredLabel, SymbolText } from '../SymbolLabel'

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
        <SymbolText x={x} y={y + 25} size={11} weight={600}>
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

      <CenteredLabel x={x} y={y} label={label} value={value} />
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
 * Transformer — basic transformer with two coils facing each other.
 * Primary (left coil) and secondary (right coil) separated by core lines.
 * Four pins: p1_top, p1_bot (primary), p2_top, p2_bot (secondary).
 */
export function Transformer({ x, y, orient = 'right', label, ratio }: TransformerProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* PRIMARY COIL (left) — 4 arcs going upward */}
        <path d="M-22,-8 Q-18,-16 -14,-8" fill="none" stroke="currentColor" strokeWidth={STROKE} />
        <path d="M-22,-4 Q-18,-12 -14,-4" fill="none" stroke="currentColor" strokeWidth={STROKE} />
        <path d="M-22,4 Q-18,-4 -14,4" fill="none" stroke="currentColor" strokeWidth={STROKE} />
        <path d="M-22,8 Q-18,0 -14,8" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* SECONDARY COIL (right) — 4 mirrored arcs */}
        <path d="M14,-8 Q18,-16 22,-8" fill="none" stroke="currentColor" strokeWidth={STROKE} />
        <path d="M14,-4 Q18,-12 22,-4" fill="none" stroke="currentColor" strokeWidth={STROKE} />
        <path d="M14,4 Q18,-4 22,4" fill="none" stroke="currentColor" strokeWidth={STROKE} />
        <path d="M14,8 Q18,0 22,8" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* CORE — two parallel vertical lines between coils */}
        <line x1="-4" y1="-12" x2="-4" y2="12" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="4" y1="-12" x2="4" y2="12" stroke="currentColor" strokeWidth={STROKE} />

        {/* PRIMARY LEADS */}
        <line x1="-30" y1="-12" x2="-22" y2="-12" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="-30" y1="12" x2="-22" y2="12" stroke="currentColor" strokeWidth={STROKE} />

        {/* SECONDARY LEADS */}
        <line x1="22" y1="-12" x2="30" y2="-12" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="22" y1="12" x2="30" y2="12" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Transformer reuses the centered-with-larger-gap style; `ratio` slots
          into the value position. */}
      <CenteredLabel x={x} y={y} label={label} value={ratio} gap={25} />
    </>
  )
}
