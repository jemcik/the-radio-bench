/**
 * Passive components — resistors, capacitors, inductors.
 *
 * Geometry adapted from chris-pikul/electronic-symbols (MIT-licensed).
 * See ../vendored/SOURCE.md for the per-symbol mapping.
 */

import { type SymbolProps, isVertical } from '../types'
import { SymbolText, getLabelPosition, LABEL_SIZE, VALUE_SIZE } from '../SymbolLabel'
import { VendoredSymbol } from './_VendoredSymbol'

/**
 * Passive components share an "above-the-body" label style: both the
 * designator (R1) and the value (1 kΩ) sit just above the symbol, with
 * subtle opacity. Vertical orientations slide the texts to the right
 * instead. The `getLabelPosition` helper handles the orient maths.
 *
 * For the bolder split-above/below style used by sources, switches, meters,
 * etc., see `OrientedLabel` in `../SymbolLabel`.
 */
function PassiveLabel({
  x,
  y,
  orient,
  label,
  value,
}: SymbolProps & { orient: NonNullable<SymbolProps['orient']> }) {
  const { lx, ly, anchor } = getLabelPosition(x, y, orient)
  const bothPresent = !!label && !!value
  const labelY = isVertical(orient)
    ? ly
    : ly - (bothPresent ? 18 : 4)
  return (
    <>
      {label && (
        <SymbolText x={lx} y={labelY} size={LABEL_SIZE} anchor={anchor}>
          {label}
        </SymbolText>
      )}
      {value && (
        <SymbolText x={lx} y={labelY + LABEL_SIZE} size={VALUE_SIZE} anchor={anchor}>
          {value}
        </SymbolText>
      )}
    </>
  )
}

/**
 * Resistor — IEEE zigzag.
 * Source: Resistor-IEEE-Standard.svg
 * Pins: (-30, 0) and (+30, 0).
 */
export function Resistor({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M0 74.94h31.25l10.29-24.97L54.92 100l13.39-50 13.38 50 13.39-49.62L108.46 100l10.29-25H150" />
      </VendoredSymbol>
      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * Capacitor — non-polarised (two parallel plates).
 * Source: Capacitor-IEEE-NonPolarized.svg
 * Pins: (-30, 0) and (+30, 0).
 */
export function Capacitor({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M150 74.97H84.5M0 75.25h66.5M54 44s12.5 12.25 12.5 31S54 106 54 106m30.5-62v62" />
      </VendoredSymbol>
      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * Capacitor — variable (tuning). The non-polarised plates with a diagonal
 * arrow drawn through them — the standard «adjustable» convention used for
 * tuning capacitors in a tuned circuit.
 * Pins: (-30, 0) and (+30, 0).
 */
export function CapacitorVariable({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        {/* plates + pin wires — identical to Capacitor */}
        <path d="M150 74.97H84.5M0 75.25h66.5M54 44s12.5 12.25 12.5 31S54 106 54 106m30.5-62v62" />
        {/* adjustability arrow: diagonal shaft through both plates + arrowhead */}
        <path d="M30 118 113 38" />
        <path d="M113 38 96 41m17-3-3 17" />
      </VendoredSymbol>
      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * Capacitor — polarised (electrolytic) with curved plate and «+» marker.
 * Source: Capacitor-IEEE-Polarized.svg
 * Pins: (-30, 0) and (+30, 0).
 */
export function CapacitorElectrolytic({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M150 74.97H84.5M0 75.25h66.5M54 44s12.5 12.25 12.5 31S54 106 54 106m30.5-62v62m46.75-56h-25m12.5-12.5v25" />
      </VendoredSymbol>
      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * Inductor — air-core (4 semicircular bumps).
 * Source: Inductor-COM-Air.svg
 * Pins: (-30, 0) and (+30, 0).
 */
export function Inductor({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M0 75.13h12.5s0-18.82 15.63-18.82S43.75 75 43.75 75s0-18.75 15.63-18.75S75 75 75 75s0-18.75 15.63-18.75S106.25 75 106.25 75s0-18.75 15.63-18.75S137.5 75 137.5 75H150" />
      </VendoredSymbol>
      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

/**
 * Inductor — magnetic core (bumps + two parallel horizontal core lines).
 * Source: Inductor-COM-Magnetic.svg
 * Pins: (-30, 0) and (+30, 0).
 */
export function InductorCore({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M0 75.13h12.5s0-18.82 15.63-18.82S43.75 75 43.75 75s0-18.75 15.63-18.75S75 75 75 75s0-18.75 15.63-18.75S106.25 75 106.25 75s0-18.75 15.63-18.75S137.5 75 137.5 75H150M12.5 43.75h125m-125-12.5h125" />
      </VendoredSymbol>
      <PassiveLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}
