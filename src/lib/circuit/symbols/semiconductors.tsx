/**
 * Semiconductor symbols for circuit schematics.
 *
 * Includes diodes (rectifier, LED, Zener), transistors (NPN, PNP), and op-amps.
 * All follow ARRL Handbook standards and rotate about their center point.
 */

import { type SymbolProps, type TransistorProps, type OpAmpProps, orientAngle, STROKE } from '../types'
import { CenteredLabel, SymbolText, LABEL_SIZE, VALUE_SIZE } from '../SymbolLabel'

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

        {/* Light emission arrows — two parallel 45° shafts with open chevron
            arrowheads (per KiCad / ARRL convention). For a (1,−1) shaft
            direction the chevron splits into one horizontal barb (backward)
            and one vertical barb (downward), each 3 units long.
            Stroke is lighter than the body so arrows read as annotation. */}
        <g strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="2" y1="-11" x2="9" y2="-18" stroke="currentColor" />
          <polyline points="6,-18 9,-18 9,-15" fill="none" stroke="currentColor" />

          <line x1="6" y1="-9" x2="13" y2="-16" stroke="currentColor" />
          <polyline points="10,-16 13,-16 13,-13" fill="none" stroke="currentColor" />
        </g>
      </g>

      {/* Label sits BELOW the LED body — the emission arrows occupy the
          space above, so placing the label there would force an awkwardly
          large gap. Below the body it sits at the standard distance. */}
      <CenteredLabel x={x} y={y} label={label} value={value} labelSide="below" />
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
 * NPN Bipolar Junction Transistor — ARRL Handbook standard.
 *
 * Geometry (orient='right', at origin):
 *   Circle:     r=15
 *   Base bar:   x=−4, y=−11 to +11
 *   Base lead:  (−26, 0) → (−4, 0)
 *   Collector:  diagonal (−4, −6) → pin (12, −19)  (~39° from horizontal)
 *   Emitter:    diagonal (−4, 6) → pin (12, 19) with filled arrowhead.
 *
 * Pins extended 2 units along the lead direction (from (10, ±17) to
 * (12, ±19)) so future wire connections have a longer stub to attach to.
 * Stub outside the circle is ≈ 8 units, up from ≈ 5.
 *
 * Emitter direction d=(16, 13), |d|=√425. Arrowhead:
 *   tip   (4, 12.5)    — t≈0.5, inside circle (|·|≈13.1)
 *   wing  (−1.9, 11.6) — t≈0.25 + 3 perp
 *   wing  (1.9, 6.9)   — t≈0.25 − 3 perp
 * Both wings at distance ≈ √36 ≈ 6 from tip.
 */
export function TransistorNPN({ x, y, orient = 'right', circle = true, label, value }: TransistorProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {circle && <circle cx="0" cy="0" r="15" fill="none" stroke="currentColor" strokeWidth={STROKE} />}

        {/* Base bar + lead */}
        <line x1="-4" y1="-11" x2="-4" y2="11" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="-26" y1="0" x2="-4" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* Collector — diagonal from bar to pin */}
        <line x1="-4" y1="-6" x2="12" y2="-19" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter — diagonal with filled arrowhead pointing outward */}
        <line x1="-4" y1="6" x2="12" y2="19" stroke="currentColor" strokeWidth={STROKE} />
        <polygon points="4,12.5 -1.9,11.6 1.9,6.9" fill="currentColor" />
      </g>

      <CenteredLabel x={x} y={y} label={label} value={value} gap={22} />
    </>
  )
}

/**
 * PNP Bipolar Junction Transistor — ARRL Handbook standard.
 * Same as NPN but emitter arrow points inward (toward base junction).
 * Tip at bar junction (−4, 6), wings at (−0.8, 11.8) and (2.4, 8) —
 * both inside r=15. Wings at distance ≈ √44 ≈ 6.6 from tip.
 */
export function TransistorPNP({ x, y, orient = 'right', circle = true, label, value }: TransistorProps) {
  return (
    <>
      <g transform={`translate(${x},${y}) rotate(${orientAngle(orient)})`}>
        {circle && <circle cx="0" cy="0" r="15" fill="none" stroke="currentColor" strokeWidth={STROKE} />}

        {/* Base bar + lead */}
        <line x1="-4" y1="-11" x2="-4" y2="11" stroke="currentColor" strokeWidth={STROKE} />
        <line x1="-26" y1="0" x2="-4" y2="0" stroke="currentColor" strokeWidth={STROKE} />

        {/* Collector — diagonal from bar to pin */}
        <line x1="-4" y1="-6" x2="12" y2="-19" stroke="currentColor" strokeWidth={STROKE} />

        {/* Emitter — diagonal with filled arrowhead pointing inward */}
        <line x1="-4" y1="6" x2="12" y2="19" stroke="currentColor" strokeWidth={STROKE} />
        <polygon points="-4,6 -0.8,11.8 2.4,8" fill="currentColor" />
      </g>

      <CenteredLabel x={x} y={y} label={label} value={value} gap={22} />
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
        <SymbolText x={x + 32} y={y} size={LABEL_SIZE} weight={600} anchor="start">
          {label}
        </SymbolText>
      )}
      {/* Value label (below) */}
      {value && (
        <SymbolText x={x} y={y + 25} size={VALUE_SIZE} opacity={0.7}>
          {value}
        </SymbolText>
      )}
    </>
  )
}
