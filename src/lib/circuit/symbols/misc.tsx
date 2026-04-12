/**
 * Miscellaneous circuit symbols: antenna, crystal, transformer.
 *
 * Single-pin symbols (antenna), two-pin passive components (crystal),
 * and multi-pin transformer (primary/secondary coils with core).
 */

import { type SinglePinProps, type SymbolProps, orientAngle, STROKE } from '../types'

// ──────────────────────────────────────────────────────────────────────────────
// SINGLE-TERMINAL SYMBOLS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Antenna — standard transmit/receive antenna symbol.
 * Single terminal with upward-pointing V-shaped antenna elements.
 */
export function Antenna(props: SinglePinProps) {
  const { x, y, orient = 'up', label } = props

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Lead from pin upward to antenna */}
        <line x1="0" y1="15" x2="0" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* Left arm of antenna */}
        <line x1="0" y1="0" x2="-10" y2="-12" stroke="currentColor" strokeWidth={STROKE} />

        {/* Right arm of antenna */}
        <line x1="0" y1="0" x2="10" y2="-12" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Label (outside rotation) */}
      {label && (
        <text x={x} y={y + 25} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
          {label}
        </text>
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
export function Crystal(props: SymbolProps) {
  const { x, y, orient = 'right', label, value } = props

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Left plate */}
        <line x1="-6" y1="-8" x2="-6" y2="8" stroke="currentColor" strokeWidth={STROKE} />

        {/* Right plate */}
        <line x1="6" y1="-8" x2="6" y2="8" stroke="currentColor" strokeWidth={STROKE} />

        {/* Crystal body (filled rectangle between plates) */}
        <rect x="-3" y="-6" width="6" height="12" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* Leads */}
        <line x1="-30" y1="0" x2="-6" y2="0" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="6" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Labels (outside rotation) */}
      {label && (
        <text x={x} y={y - 20} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
          {label}
        </text>
      )}
      {value && (
        <text x={x} y={y + 20} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.7">
          {value}
        </text>
      )}
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
export function Transformer(props: TransformerProps) {
  const { x, y, orient = 'right', label, ratio } = props

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

      {/* Labels (outside rotation) */}
      {label && (
        <text x={x} y={y - 25} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
          {label}
        </text>
      )}
      {ratio && (
        <text x={x} y={y + 25} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.7">
          {ratio}
        </text>
      )}
    </>
  )
}
