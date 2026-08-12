/**
 * Pedagogical annotation primitives for circuit schematics.
 *
 * These are NOT ARRL-standard circuit elements — they are teaching
 * marks layered on top of a schematic to let the reader anchor prose
 * references to specific points on the circuit. Belong in the shared
 * library so every chapter uses the same visual convention (same
 * circle size, same font, same accent tone) rather than rolling a
 * one-off per chapter.
 *
 * Add new annotation primitives here when a chapter needs a recurring
 * teaching mark (e.g. current-arrow glyph, measurement-probe marker)
 * — do NOT hand-roll SVG inside a chapter-level diagram file.
 */
import { svgTokens } from '@/components/diagrams/svgTokens'
import { renderLabelContent } from '../SymbolLabel'
import { STROKE } from '../types'

interface NodePointProps {
  /** Logical x-coordinate (centre of the circle). */
  x: number
  /** Logical y-coordinate (centre of the circle). */
  y: number
  /** Single letter or short string to display inside (A / B / C / V1 …). */
  letter: string
  /** Optional accent tone override. Defaults to `svgTokens.fg`
   *  (foreground / ink) so the annotation reads as part of the
   *  schematic notation, NOT as a clickable term.
   *
   *  Important: do NOT default to `--primary` or `--term-accent` —
   *  those are glossary-term colours and would make the reader
   *  expect a tooltip / click behaviour that a static annotation
   *  does not provide. */
  accent?: string
  /** Optional circle radius. Default 10 — fits a single italic letter
   *  at 14 px without crowding. Increase for multi-letter labels. */
  r?: number
}

/**
 * Named-node marker: a small open circle with a letter inside,
 * positioned at a specific node of a schematic. Used to name circuit
 * points so prose derivations can say «the voltage between A and C».
 *
 * Background fill matches the page so the circle cleanly overlays a
 * wire or junction dot beneath.
 *
 * @example
 *   <NodePoint x={140} y={40} letter="A" />
 *   <NodePoint x={140} y={104} letter="B" />
 */
export function NodePoint({
  x, y, letter,
  accent = svgTokens.fg,
  r = 10,
}: NodePointProps) {
  return (
    <g>
      <circle
        cx={x} cy={y} r={r}
        fill="hsl(var(--background))"
        stroke={accent}
        strokeWidth={1.4}
      />
      <text
        x={x} y={y}
        fontSize="13"
        fontStyle="italic"
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="central"
        fill={accent}
        data-uniform-typography-exempt="node-point-letter"
      >
        {letter}
      </text>
    </g>
  )
}

interface TerminalLabelProps {
  /** Anchor x. Label is positioned relative to this point. */
  x: number
  /** Anchor y — vertical centre of the label text. */
  y: number
  /** Label text (i18n-provided by the caller). */
  children: React.ReactNode
  /** Text anchor: where `x` sits relative to the label text. */
  anchor?: 'start' | 'middle' | 'end'
  /** Visual tone. `fg` for primary terminals (V_in, V_out),
   *  `mutedFg` for ground / reference. Default 'fg'. Do NOT use a
   *  term-like tone (primary/term-accent) — those colours are
   *  reserved for glossary underlines. */
  tone?: 'fg' | 'mutedFg'
  /** Raw color override. Takes precedence over `tone`. Use when the
   *  label should match a specific accent (e.g. METER_ACCENT_V to
   *  tie a V_out label visually to its voltmeter). */
  color?: string
  /** Optional font-weight override. */
  weight?: number | string
}

/**
 * Terminal / rail-end text label. Thin wrapper around the SVG
 * `<text>` that bakes in the project's conventions: italic serif
 * for math-like identifiers (V_in, V_out, R_1), theme-aware colour,
 * vertical centring.
 *
 * Use for rail endpoints, meter-reading callouts, ground labels —
 * any place a schematic needs a name next to a point.
 *
 * @example
 *   <TerminalLabel x={60} y={40} anchor="end">{t('...vinLabel')}</TerminalLabel>
 *   <TerminalLabel x={60} y={180} anchor="end" tone="mutedFg">{t('...gndLabel')}</TerminalLabel>
 */
export function TerminalLabel({
  x, y, children,
  anchor = 'end',
  tone = 'fg',
  color,
  weight,
}: TerminalLabelProps) {
  // No default `weight` → React omits the `font-weight` attribute,
  // matching the `SymbolText`-based label slots (`Resistor.label`,
  // `OrientedLabel`, `CenteredLabel`, `Transformer.ratio`, …) which
  // also leave the attribute unset. Browser default is regular (400)
  // for both, so V_p / V_out / R_load read with the same ink weight
  // as 1:N / R_1 / C_1 — the visual uniformity the user asked for
  // after the chris-pikul migration (May 2026).
  //
  // The mechanical gate `diagram-label-consistency.test.tsx` strings-
  // matches the `font-weight` attribute, so «no attribute» and
  // «"400"» count as different tuples even though they render
  // identically. Keeping the default unset is what makes the gate
  // happy without a special-case rule.
  //
  // Caller can still pass `weight={600}` (or any explicit number) to
  // opt back into bold for one specific label if a chapter genuinely
  // needs the emphasis.
  const fill = color
    ?? (tone === 'mutedFg' ? svgTokens.mutedFg : svgTokens.fg)

  return (
    <text
      x={x} y={y}
      fontFamily="inherit"
      fontSize="14"
      fontStyle="italic"
      fontWeight={weight}
      textAnchor={anchor}
      dominantBaseline="central"
      fill={fill}
    >
      {renderLabelContent(children)}
    </text>
  )
}

// Note: the `<Tap>` arrow primitive was removed May 2026. Per ARRL
// Handbook 2023 Figure 4.31B + AoE Fig 1.129, a fixed autotransformer
// tap is shown as just a wire branching off the winding line — no
// arrow. Arrows on autotransformers indicate VARIABLE taps (Variacs,
// rotating brush). The old `<Tap>` was used briefly in
// AutotransformerSchematic before that convention research; once
// removed, the primitive itself was orphan dead code. If a Variac
// schematic is added in future, the arrow can be re-derived from
// the chris-pikul `Source-COM-Transformer-Variable.svg` or drawn
// inline with `<path d="M tip → tail …">` — no general primitive
// needed.

interface CurrentArrowProps {
  /** Centre of the arrow, on the wire it annotates. */
  x: number
  y: number
  /** Which way conventional current flows here. */
  dir?: 'right' | 'left'
  /** Usually «I» — rendered above the arrow. */
  label?: string
  /** Distance above the wire. Negative puts the arrow below it. */
  offset?: number
  /** Half-length of the shaft. */
  half?: number
}

/**
 * Current-direction arrow — the teaching mark this file's header has always
 * listed as the example of what belongs here.
 *
 * Drawn ALONGSIDE a wire, never on it, so it reads as an annotation rather than
 * as part of the circuit. Points the way conventional current flows (+ → −),
 * which is the convention ch 1.1 teaches: «whenever you see a current arrow, it
 * is pointing the way positive charge would go».
 *
 * Added for ch 1.1, whose schematic had the letter «I» hung on the LED as if it
 * were a designator, with no arrow anywhere — while the caption told the reader
 * that V pushes I through R.
 */
export function CurrentArrow({
  x, y, dir = 'right', label, offset = 14, half = 16,
}: CurrentArrowProps) {
  const ay = y - offset
  const tipX = dir === 'right' ? x + half : x - half
  const tailX = dir === 'right' ? x - half : x + half
  const back = dir === 'right' ? -5 : 5
  return (
    <>
      <path
        d={`M${tailX} ${ay}H${tipX}`}
        stroke={svgTokens.fg}
        strokeWidth={STROKE}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${tipX + back} ${ay - 3.5}L${tipX} ${ay}L${tipX + back} ${ay + 3.5}`}
        stroke={svgTokens.fg}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {label && (
        <text
          x={x} y={ay - 6}
          fontFamily="inherit"
          fontSize="0.875em"
          fontStyle="italic"
          textAnchor="middle"
          fill={svgTokens.fg}
        >
          {renderLabelContent(label)}
        </text>
      )}
    </>
  )
}
