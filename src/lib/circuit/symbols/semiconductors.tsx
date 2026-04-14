/**
 * Semiconductor symbols for circuit schematics.
 *
 * Includes diodes (rectifier, LED, Zener), transistors (NPN, PNP), and op-amps.
 * All follow ARRL Handbook standards and rotate about their center point.
 */

import { type SymbolProps, type TransistorProps, type OpAmpProps, orientAngle, STROKE } from '../types'
import { CenteredLabel, SymbolText } from '../SymbolLabel'

// ──────────────────────────────────────────────────────────────────────────────
// DIODES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Diode — standard rectifier diode (ARRL).
 * Triangle (cathode-facing right) with vertical bar at cathode.
 */
export function Diode({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Triangle pointing right (anode-left, cathode-right) */}
        <path d="M-8,-9 L8,0 L-8,9 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* Cathode bar (vertical) */}
        <line x1="8" y1="-9" x2="8" y2="9" stroke="currentColor" strokeWidth={STROKE} />

        {/* Leads */}
        <line x1="-30" y1="0" x2="-8" y2="0" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="8" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      <CenteredLabel x={x} y={y} label={label} value={value} />
    </>
  )
}

/**
 * LED — light-emitting diode.
 * Diode with two small arrows pointing away to indicate light emission.
 */
export function LED({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Triangle pointing right */}
        <path d="M-8,-9 L8,0 L-8,9 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* Cathode bar */}
        <line x1="8" y1="-9" x2="8" y2="9" stroke="currentColor" strokeWidth={STROKE} />

        {/* Leads */}
        <line x1="-30" y1="0" x2="-8" y2="0" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="8" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* Light arrows (upper and lower, pointing up-right) */}
        <line x1="2" y1="-12" x2="8" y2="-18" stroke="currentColor" strokeWidth={STROKE} />
        <polygon points="8,-18 6,-14 10,-15" fill="currentColor" />

        <line x1="6" y1="-8" x2="12" y2="-14" stroke="currentColor" strokeWidth={STROKE} />
        <polygon points="12,-14 10,-10 14,-11" fill="currentColor" />
      </g>

      <CenteredLabel x={x} y={y} label={label} value={value} />
    </>
  )
}

/**
 * Zener Diode — voltage regulation diode with bent cathode bar.
 */
export function DiodeZener({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Triangle pointing right */}
        <path d="M-8,-9 L8,0 L-8,9 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* Cathode bar with bent hooks */}
        <line x1="8" y1="-9" x2="8" y2="9" stroke="currentColor" strokeWidth={STROKE} />
        {/* Top hook */}
        <line x1="8" y1="-9" x2="6" y2="-9" stroke="currentColor" strokeWidth={STROKE} />
        {/* Bottom hook */}
        <line x1="8" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth={STROKE} />

        {/* Leads */}
        <line x1="-30" y1="0" x2="-8" y2="0" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="8" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      <CenteredLabel x={x} y={y} label={label} value={value} />
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TRANSISTORS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * NPN Bipolar Junction Transistor.
 * Standard symbol: vertical base bar with angled collector and emitter leads,
 * small arrow on emitter pointing away from base.
 */
export function TransistorNPN({ x, y, orient = 'right', circle = true, label, value }: TransistorProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Optional enclosing circle */}
        {circle && <circle cx="0" cy="0" r="18" fill="none" stroke="currentColor" strokeWidth={STROKE} />}

        {/* Base-junction bar (vertical) */}
        <line x1="-5" y1="-11" x2="-5" y2="11" stroke="currentColor" strokeWidth={STROKE} />

        {/* Base lead */}
        <line x1="-30" y1="0" x2="-5" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* Collector */}
        <line x1="-5" y1="-7" x2="12" y2="-25" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="12" y1="-25" x2="12" y2="-28" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter */}
        <line x1="-5" y1="7" x2="12" y2="25" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="12" y1="25" x2="12" y2="28" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter arrow pointing away from base (outward) */}
        <polygon points="12,25 8,18 14,20" fill="currentColor" />
      </g>

      <CenteredLabel x={x} y={y} label={label} value={value} gap={25} />
    </>
  )
}

/**
 * PNP Bipolar Junction Transistor.
 * Same as NPN but emitter arrow points inward (toward base).
 */
export function TransistorPNP({ x, y, orient = 'right', circle = true, label, value }: TransistorProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Optional enclosing circle */}
        {circle && <circle cx="0" cy="0" r="18" fill="none" stroke="currentColor" strokeWidth={STROKE} />}

        {/* Base-junction bar (vertical) */}
        <line x1="-5" y1="-11" x2="-5" y2="11" stroke="currentColor" strokeWidth={STROKE} />

        {/* Base lead */}
        <line x1="-30" y1="0" x2="-5" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* Collector */}
        <line x1="-5" y1="-7" x2="12" y2="-25" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="12" y1="-25" x2="12" y2="-28" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter */}
        <line x1="-5" y1="7" x2="12" y2="25" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="12" y1="25" x2="12" y2="28" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter arrow pointing inward (toward base junction) */}
        <polygon points="2,18 8,20 6,14" fill="currentColor" />
      </g>

      <CenteredLabel x={x} y={y} label={label} value={value} gap={25} />
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// OPERATIONAL AMPLIFIER
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Op-Amp — operational amplifier (ARRL triangle symbol).
 * Triangle pointing right with − (inverting) and + (non-inverting) inputs,
 * and output on the right.
 */
export function OpAmp({ x, y, orient = 'right', label, value }: OpAmpProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Triangle: (-20,-22) to (24,0) to (-20,22) */}
        <path d="M-20,-22 L24,0 L-20,22 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* Input markers — drawn inside the rotated group so they follow orientation */}
        <SymbolText x={-12} y={-8} size={12}>−</SymbolText>
        <SymbolText x={-12} y={10} size={12}>+</SymbolText>

        {/* Inverting input lead (upper-left) */}
        <line x1="-30" y1="-12" x2="-20" y2="-12" stroke="currentColor" strokeWidth={STROKE} />

        {/* Non-inverting input lead (lower-left) */}
        <line x1="-30" y1="12" x2="-20" y2="12" stroke="currentColor" strokeWidth={STROKE} />

        {/* Output lead (right) */}
        <line x1="24" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Component label (right of symbol) */}
      {label && (
        <SymbolText x={x + 32} y={y} size={11} weight={600} anchor="start">
          {label}
        </SymbolText>
      )}
      {/* Value label (below) */}
      {value && (
        <SymbolText x={x} y={y + 25} size={10} opacity={0.7}>
          {value}
        </SymbolText>
      )}
    </>
  )
}
