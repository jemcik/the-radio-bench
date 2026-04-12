/**
 * Semiconductor symbols for circuit schematics.
 *
 * Includes diodes (rectifier, LED, Zener), transistors (NPN, PNP), and op-amps.
 * All follow ARRL Handbook standards and rotate about their center point.
 */

import { type SymbolProps, type TransistorProps, type OpAmpProps, orientAngle, STROKE } from '../types'

// ──────────────────────────────────────────────────────────────────────────────
// DIODES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Diode — standard rectifier diode (ARRL).
 * Triangle (cathode-facing right) with vertical bar at cathode.
 */
export function Diode(props: SymbolProps) {
  const { x, y, orient = 'right', label, value } = props

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

/**
 * LED — light-emitting diode.
 * Diode with two small arrows pointing away to indicate light emission.
 */
export function LED(props: SymbolProps) {
  const { x, y, orient = 'right', label, value } = props

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
        {/* Upper arrow from ~(2, -12) pointing up-right */}
        <line x1="2" y1="-12" x2="8" y2="-18" stroke="currentColor" strokeWidth={STROKE} />
        <polygon points="8,-18 6,-14 10,-15" fill="currentColor" />

        {/* Lower arrow from ~(6, -14) pointing up-right */}
        <line x1="6" y1="-8" x2="12" y2="-14" stroke="currentColor" strokeWidth={STROKE} />
        <polygon points="12,-14 10,-10 14,-11" fill="currentColor" />
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

/**
 * Zener Diode — voltage regulation diode with bent cathode bar.
 */
export function DiodeZener(props: SymbolProps) {
  const { x, y, orient = 'right', label, value } = props

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

      {/* Labels */}
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
// TRANSISTORS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * NPN Bipolar Junction Transistor.
 * Standard symbol: vertical base bar with angled collector and emitter leads,
 * small arrow on emitter pointing away from base.
 */
export function TransistorNPN(props: TransistorProps) {
  const { x, y, orient = 'right', circle = true, label, value } = props

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Optional enclosing circle */}
        {circle && <circle cx="0" cy="0" r="18" fill="none" stroke="currentColor" strokeWidth={STROKE} />}

        {/* Base-junction bar (vertical) */}
        <line x1="-5" y1="-11" x2="-5" y2="11" stroke="currentColor" strokeWidth={STROKE} />

        {/* Base lead */}
        <line x1="-30" y1="0" x2="-5" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* Collector: line from base upward-right */}
        <line x1="-5" y1="-7" x2="12" y2="-25" stroke="currentColor" strokeWidth={STROKE} />
        {/* Collector output pad */}
        <line x1="12" y1="-25" x2="12" y2="-28" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter: line from base downward-right */}
        <line x1="-5" y1="7" x2="12" y2="25" stroke="currentColor" strokeWidth={STROKE} />
        {/* Emitter output pad */}
        <line x1="12" y1="25" x2="12" y2="28" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter arrow pointing away from base (outward) */}
        {/* Arrow tip at ~(12, 25), arrow base perpendicular to emitter line */}
        <polygon points="12,25 8,18 14,20" fill="currentColor" />
      </g>

      {/* Labels (outside rotation) */}
      {label && (
        <text x={x} y={y - 25} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
          {label}
        </text>
      )}
      {value && (
        <text x={x} y={y + 25} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.7">
          {value}
        </text>
      )}
    </>
  )
}

/**
 * PNP Bipolar Junction Transistor.
 * Same as NPN but emitter arrow points inward (toward base).
 */
export function TransistorPNP(props: TransistorProps) {
  const { x, y, orient = 'right', circle = true, label, value } = props

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Optional enclosing circle */}
        {circle && <circle cx="0" cy="0" r="18" fill="none" stroke="currentColor" strokeWidth={STROKE} />}

        {/* Base-junction bar (vertical) */}
        <line x1="-5" y1="-11" x2="-5" y2="11" stroke="currentColor" strokeWidth={STROKE} />

        {/* Base lead */}
        <line x1="-30" y1="0" x2="-5" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* Collector: line from base upward-right */}
        <line x1="-5" y1="-7" x2="12" y2="-25" stroke="currentColor" strokeWidth={STROKE} />
        {/* Collector output pad */}
        <line x1="12" y1="-25" x2="12" y2="-28" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter: line from base downward-right */}
        <line x1="-5" y1="7" x2="12" y2="25" stroke="currentColor" strokeWidth={STROKE} />
        {/* Emitter output pad */}
        <line x1="12" y1="25" x2="12" y2="28" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter arrow pointing inward (toward base junction) */}
        {/* Arrow tip points back toward (-5, 7) */}
        <polygon points="2,18 8,20 6,14" fill="currentColor" />
      </g>

      {/* Labels (outside rotation) */}
      {label && (
        <text x={x} y={y - 25} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
          {label}
        </text>
      )}
      {value && (
        <text x={x} y={y + 25} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.7">
          {value}
        </text>
      )}
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
export function OpAmp(props: OpAmpProps) {
  const { x, y, orient = 'right', label, value } = props

  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {/* Triangle: (-20,-22) to (24,0) to (-20,22) */}
        <path d="M-20,-22 L24,0 L-20,22 Z" fill="none" stroke="currentColor" strokeWidth={STROKE} />

        {/* Inverting input (−) label */}
        <text x="-12" y="-8" fontSize="12" textAnchor="middle" dominantBaseline="middle" fill="currentColor">
          −
        </text>

        {/* Non-inverting input (+) label */}
        <text x="-12" y="10" fontSize="12" textAnchor="middle" dominantBaseline="middle" fill="currentColor">
          +
        </text>

        {/* Inverting input lead (upper-left) */}
        <line x1="-30" y1="-12" x2="-20" y2="-12" stroke="currentColor" strokeWidth={STROKE} />

        {/* Non-inverting input lead (lower-left) */}
        <line x1="-30" y1="12" x2="-20" y2="12" stroke="currentColor" strokeWidth={STROKE} />

        {/* Output lead (right) */}
        <line x1="24" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth={STROKE} />
      </g>

      {/* Component label (right of symbol) */}
      {label && (
        <text x={x + 32} y={y} fontSize="11" fontWeight="600" textAnchor="start" dominantBaseline="middle" fill="currentColor">
          {label}
        </text>
      )}
      {/* Value label (below) */}
      {value && (
        <text x={x} y={y + 25} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.7">
          {value}
        </text>
      )}
    </>
  )
}
