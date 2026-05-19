/**
 * Semiconductor symbols — diodes, transistors (BJT, MOSFET), op-amps.
 *
 * Geometry adapted from chris-pikul/electronic-symbols (MIT-licensed).
 * See ../vendored/SOURCE.md for the source revision and the full per-symbol
 * mapping. The shared `VendoredSymbol` wrapper handles the 0.4 down-scale
 * from the upstream 150×150 frame onto our local (-30..+30) coordinates,
 * so each component just lists its source paths verbatim.
 */

import { type SymbolProps, type TransistorProps, type OpAmpProps, STROKE } from '../types'
import { CenteredLabel, SymbolText, LABEL_SIZE, VALUE_SIZE } from '../SymbolLabel'
import { VendoredSymbol } from './_VendoredSymbol'

// ──────────────────────────────────────────────────────────────────────────────
// DIODES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Diode — standard rectifier diode.
 * Source: Diode-COM-Standard.svg
 * Pins: anode (-30, 0), cathode (+30, 0).
 */
export function Diode({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="m100 75-50 31.25v-62.5L100 75zm0-34.25v68.5M50 75H0m100 0h50" />
      </VendoredSymbol>
      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * LED — light-emitting diode with two emission arrows pointing up-right.
 * Source: Diode-COM-LED.svg
 * Pins: anode (-30, 0), cathode (+30, 0).
 */
export function LED({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="m100 75-50 31.25v-62.5L100 75zm0-34.25v68.5M50 75H0m100 0h50m-50-43.75 18.75-18.75" />
        <path fill="currentColor" stroke="none" d="m122.49 19.34 3.87-14.45-14.45 3.87 10.58 10.58z" />
        <path d="m118.75 50 18.75-18.75" />
        <path fill="currentColor" stroke="none" d="m141.24 38.09 3.87-14.45-14.45 3.87 10.58 10.58z" />
      </VendoredSymbol>
      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} labelSide="below" />
    </>
  )
}

/**
 * Zener Diode — voltage regulation diode with bent cathode bar.
 * Source: Diode-COM-Zener.svg
 * Pins: anode (-30, 0), cathode (+30, 0).
 */
export function DiodeZener({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="m100 75-50 31.25v-62.5L100 75zm-50 0H0m100 0h50" />
        <path d="M112.5 109.5 100 100V50l-12.5-9.5" />
      </VendoredSymbol>
      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TRANSISTORS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * NPN Bipolar Junction Transistor.
 * Source: Transistor-COM-BJT-NPN.svg
 * Pins: base (-30, 0), collector (+10, -30), emitter (+10, +30).
 */
export function TransistorNPN({ x, y, orient = 'right', circle = true, label, value }: TransistorProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        {circle && <circle cx="75" cy="75" r="50" />}
        <path d="M100 150v-31.25M0 75h50m0-31.25v62.5M100 0v40.5l-50 22m0 25 37.52 22.47" />
        <path fill="currentColor" stroke="none" d="m81.8 115.26 14.95.24-7.27-13.07-7.68 12.83z" />
      </VendoredSymbol>
      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} gap={26} />
    </>
  )
}

/**
 * PNP Bipolar Junction Transistor.
 * Source: Transistor-COM-BJT-PNP.svg
 * Pins: base (-30, 0), collector (+10, +30), emitter (+10, -30) — note the
 * upstream uses emitter-on-top for the inward arrow orientation.
 */
export function TransistorPNP({ x, y, orient = 'right', circle = true, label, value }: TransistorProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        {circle && <circle cx="75" cy="75" r="50" />}
        <path d="M0 75h50m0 31.25v-62.5M100 150v-40.5l-50-22M99.84 0v31.25L62.22 53.94" />
        <path fill="currentColor" stroke="none" d="M60.23 46.41 53 59.5l14.95-.28-7.72-12.81z" />
      </VendoredSymbol>
      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} gap={26} />
    </>
  )
}

/**
 * n-channel enhancement-mode MOSFET.
 * Source: Transistor-COM-MOSFET-N-Enhancement.svg
 * Pins: gate (-30, 0), drain (+10, -30), source (+10, +30).
 */
export function TransistorNMOS({ x, y, orient = 'right', circle = true, label, value }: TransistorProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        {circle && <circle cx="75" cy="75" r="50" />}
        <path d="M0 75h50m0-25v50m12.5-59.25v18.5m0 50v-18.5m0-25v18.5M100 0v50H62.5M100 150V75H62.5m37.5 25H62.5" />
        <path fill="currentColor" stroke="none" d="M68.75 75 87.5 62.5v25L68.75 75z" />
      </VendoredSymbol>
      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} gap={26} />
    </>
  )
}

/**
 * p-channel enhancement-mode MOSFET.
 * Source: Transistor-COM-MOSFET-P-Enhancement.svg
 * Pins: gate (-30, 0), drain (+10, -30), source (+10, +30). Arrow direction
 * is reversed from N-channel (apex points into the gate / away from body).
 */
export function TransistorPMOS({ x, y, orient = 'right', circle = true, label, value }: TransistorProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        {circle && <circle cx="75" cy="75" r="50" />}
        <path d="M0 75h50m0-25v50m12.5-59.25v18.5m0 50v-18.5m0-25v18.5M100 0v75H62.5m37.5 75v-50H62.5" />
        <path fill="currentColor" stroke="none" d="M93.75 75 75 87.5v-25L93.75 75z" />
        <path d="M100 50H62.5" />
      </VendoredSymbol>
      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} gap={26} />
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// OPERATIONAL AMPLIFIER
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Op-Amp — operational amplifier (triangle symbol).
 * Source: IC-COM-OpAmp.svg
 *
 * Pin endpoints in local coords:
 *   non-inverting «+» input: (-30, -10)   ← upper-left
 *   inverting     «−» input: (-30, +10)   ← lower-left
 *   output                 : (+30,  0)
 *
 * The chris-pikul source also draws V+ and V− supply-rail stubs that
 * extend to the top and bottom edges of the source viewBox (local y =
 * ±30, x ≈ 0). For our pedagogical schematics these almost always look
 * like disconnected wire stubs because the supply nodes aren't part of
 * the lesson. `supplies` defaults to `false` — pass `supplies={true}`
 * when the circuit explicitly wires V+ / V− to drawn supply rails.
 */
export function OpAmp({ x, y, orient = 'right', label, value, supplies = false }: OpAmpProps & { supplies?: boolean }) {
  // Path split:
  //   • body: triangle + 2 inputs + 1 output + «+» / «−» glyphs
  //   • rails (opt-in): V+ stub from (74.69, 0) to (74.69, 50) and V−
  //     stub from (75.06, 150) to (75.06, 100), both inside the source
  //     viewBox above/below the triangle.
  const body = 'M25 25v100l100-50L25 25zm0 25H0m125 25h25M0 100h25m9.5-47H53m-9.25-9.25v18.5M34.5 97H53'
  const rails = 'M74.69 0v50M75.06 150v-50'
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d={supplies ? `${body}${rails}` : body} />
      </VendoredSymbol>

      {/* Component label (right of symbol) */}
      {label && (
        <SymbolText x={x + 32} y={y} size={LABEL_SIZE} anchor="start">
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

// STROKE re-exported for callers that draw freehand lines alongside symbols
// (kept here to avoid breaking imports in downstream schematic files).
export { STROKE }
