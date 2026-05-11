/**
 * Miscellaneous symbols — antenna, crystal, transformer.
 *
 * Geometry adapted from chris-pikul/electronic-symbols (MIT-licensed).
 * See ../vendored/SOURCE.md for the per-symbol mapping.
 */

import { type SinglePinProps, type SymbolProps } from '../types'
import { CenteredLabel, SymbolText, LABEL_SIZE, VALUE_SIZE } from '../SymbolLabel'
import { VendoredSymbol } from './_VendoredSymbol'

// ──────────────────────────────────────────────────────────────────────────────
// SINGLE-TERMINAL
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Antenna — aerial (T-shaped with two diagonal arms).
 * Source: Antenna-COM-Aerial.svg
 * Pin: at the bottom of the viewBox → (0, +30) in local coords.
 */
export function Antenna({ x, y, orient = 'up', label }: SinglePinProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M74.88 150V12.5m.12 50 37.5-50M75 62.5l-37.5-50" />
      </VendoredSymbol>
      {label && (
        <SymbolText x={x} y={y + 25} size={LABEL_SIZE}>
          {label}
        </SymbolText>
      )}
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TWO-TERMINAL
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Crystal — quartz crystal oscillator.
 * Source: Miscellaneous-COM-Crystal_Oscillator.svg
 * Pins: (-30, 0) and (+30, 0).
 */
export function Crystal({ x, y, orient = 'right', label, value }: SymbolProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M50 25h50v100H50zM37.5 43.75v62.5m75-62.5v62.5M0 74.63h37.5m75 .37H150" />
      </VendoredSymbol>
      <CenteredLabel x={x} y={y} orient={orient} label={label} value={value} />
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TRANSFORMER
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Props for transformer symbol — keeps the optional `ratio` annotation
 * separate from the designator `label` (so a callsite can write
 * `<Transformer label="T1" ratio="1:4" />`).
 */
export interface TransformerProps {
  x: number
  y: number
  orient?: 'right' | 'down' | 'left' | 'up'
  label?: string
  ratio?: string
}

/**
 * Transformer — two windings with a core between them.
 * Source: Transformer-COM-Standard.svg
 *
 * The upstream draws the windings VERTICALLY (primary on left, secondary
 * on right) with the iron core as two parallel vertical lines between
 * them. We expose the same orientation: `orient='right'` (default) leaves
 * the windings vertical; pass `orient='down'` for the «horizontal» layout
 * with primary on top, secondary on bottom.
 *
 * Pins (orient='right'):
 *   primary p1   (-30, -25) ↔  primary p2   (-30, +25)
 *   secondary p1 (+30, -25) ↔  secondary p2 (+30, +25)
 */
export function Transformer({ x, y, orient = 'right', label, ratio }: TransformerProps) {
  return (
    <>
      <VendoredSymbol x={x} y={y} orient={orient}>
        {/* No `fill="currentColor"` — these are STROKED coil bumps, not
            filled blobs. They inherit `fill="none"` from VendoredSymbol. */}
        <path d="M0 12.5h37.5s18.81 0 18.81 15.63-18.68 15.62-18.68 15.62 18.75 0 18.75 15.63S37.63 75 37.63 75s18.75 0 18.75 15.63-18.75 15.62-18.75 15.62 18.75 0 18.75 15.63-18.75 15.62-18.75 15.62H0M68.75 6.25v137.5m12.5 0V6.25" />
        <path d="M150.13 137.5h-37.5s-18.82 0-18.82-15.62 18.69-15.63 18.69-15.63-18.75 0-18.75-15.62S112.5 75 112.5 75s-18.75 0-18.75-15.62 18.75-15.63 18.75-15.63-18.75 0-18.75-15.62S112.5 12.5 112.5 12.5h37.63" />
      </VendoredSymbol>
      {label && (
        <CenteredLabel x={x} y={y} label={label} gap={orient === 'up' || orient === 'down' ? 38 : 38} />
      )}
      {ratio && (orient === 'up' || orient === 'down') && (
        <SymbolText x={x + 38} y={y} size={VALUE_SIZE} anchor="start">
          {ratio}
        </SymbolText>
      )}
      {ratio && (orient === 'right' || orient === 'left') && (
        <SymbolText x={x} y={y + 38} size={VALUE_SIZE}>
          {ratio}
        </SymbolText>
      )}
    </>
  )
}
