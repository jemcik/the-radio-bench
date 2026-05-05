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
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="central"
        fill={accent}
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

interface TapProps {
  /** Tip of the arrow — the point that touches the winding. */
  x: number
  y: number
  /** Direction the arrow flies FROM. `'right'` means the arrow comes
   *  from the right side (tail on the right, tip pointing LEFT into
   *  the winding); use this when the winding sits to the LEFT of the
   *  external tap wire. */
  from: 'left' | 'right' | 'up' | 'down'
  /** Length of the arrow shaft (tail to tip). Default 10. */
  length?: number
  /** Width / height of the arrowhead triangle base. Default 5. */
  headSize?: number
}

/**
 * Tap arrow — a short arrowhead pointing INTO a winding to mark a tap
 * connection point. Per ARRL Handbook 2023 Figure 4.31 (autotransformer
 * schematic convention), a tap is shown as a wire branching off the
 * winding at a specific position; this primitive provides the visual
 * arrow indicator at the tap point so the reader's eye instantly
 * locks onto «the wire connects to the winding HERE».
 *
 * Rendered as a short shaft + filled triangular arrowhead. The TIP of
 * the arrow sits exactly at (x, y) — the caller positions it on the
 * winding, then draws their tap wire from the SHAFT END outward.
 *
 * The shaft-end coordinate (where the external tap wire should
 * connect) depends on `from`:
 *   from='right'  → shaft end at (x + length, y)
 *   from='left'   → shaft end at (x - length, y)
 *   from='down'   → shaft end at (x, y + length)
 *   from='up'     → shaft end at (x, y - length)
 *
 * @example
 *   <Tap x={290} y={97} from="right" />
 *   <Wire points={[{ x: 290 + 14, y: 97 }, { x: 410, y: 97 }]} />
 */
export function Tap({
  x, y, from,
  length = 10,
  headSize = 5,
}: TapProps) {
  // Shaft endpoints. (x, y) is the tip; the tail sits `length` away in
  // the direction the arrow comes FROM.
  const dx = from === 'right' ? 1 : from === 'left' ? -1 : 0
  const dy = from === 'down' ? 1 : from === 'up' ? -1 : 0
  const tailX = x + dx * length
  const tailY = y + dy * length

  // Arrowhead — an isoceles triangle whose apex is at (x, y) and whose
  // base sits `headSize` back along the shaft. The base width is also
  // `headSize`. Built as a path for a clean filled shape.
  // Base midpoint:
  const baseX = x + dx * headSize
  const baseY = y + dy * headSize
  // Perpendicular unit vector for base width:
  const px = -dy
  const py = dx
  const halfW = headSize / 2
  const b1x = baseX + px * halfW
  const b1y = baseY + py * halfW
  const b2x = baseX - px * halfW
  const b2y = baseY - py * halfW

  return (
    <g stroke="currentColor" fill="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Shaft from tail to base of arrowhead */}
      <line
        x1={tailX} y1={tailY}
        x2={baseX} y2={baseY}
        strokeWidth={2}
        fill="none"
      />
      {/* Filled arrowhead — apex at (x, y), base between (b1, b2). */}
      <path d={`M ${x} ${y} L ${b1x} ${b1y} L ${b2x} ${b2y} Z`} strokeWidth={1} />
    </g>
  )
}
