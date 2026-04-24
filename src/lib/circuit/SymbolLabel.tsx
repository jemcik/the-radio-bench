import React from 'react'
import { type Orientation, isVertical } from './types'

/**
 * Low-level SVG text primitive used inside circuit symbols.
 *
 * Bakes in the conventions every symbol shares:
 *  - `fill="currentColor"` (theme-aware)
 *  - `dominantBaseline="middle"` (vertical centering)
 *  - opacity defaults to 1
 *
 * Use this directly for one-off labels (e.g. the "+" mark on an electrolytic
 * cap) or build it via the higher-level `OrientedLabel` for the standard
 * label-and-value pair.
 */
interface SymbolTextProps {
  x: number
  y: number
  /** Font size in px. Default 11. */
  size?: number
  /** Font weight. SVG accepts numbers (100–900) or keywords. */
  weight?: number | string
  /** Default 'middle'. */
  anchor?: 'start' | 'middle' | 'end'
  /** Default 1. */
  opacity?: number
  children: React.ReactNode
}

/**
 * Parse an SVG schematic label for a TeX-ish subscript pattern.
 * Returns `{ base, sub }` or `null` if no subscript is present.
 *
 * Accepted shapes:
 *   «V_C»       → { base: 'V', sub: 'C' }
 *   «V_in»      → { base: 'V', sub: 'in' }
 *   «V_{pk-pk}» → { base: 'V', sub: 'pk-pk' }   (braces stripped)
 *
 * Plain labels without `_` (e.g. `R`, `C`, `S`, `0 V`, `GND`) return
 * `null` and render verbatim. Exported so both the SVG text helpers
 * in this file AND the standalone `TerminalLabel` (in
 * `symbols/annotations.tsx`) share the same parsing behaviour — every
 * schematic label in the project benefits from a single fix.
 */
function parseLabelSubscript(s: string): { base: string; sub: string } | null {
  // Strip outer <var>…</var> wrapper so strings that live in i18n in
  // canonical wrapped form («<var>V_{\mathrm{in}}</var>») also work
  // when dropped into a SVG <text> via raw `t()`.
  const stripped = s.replace(/^<var>(.+)<\/var>$/, '$1')
  // Braced subscript: X_{…}. Greedy content, anchored at the final `}`,
  // so nested braces in «V_{\mathrm{in}}» are handled correctly.
  const braced = /^(.+?)_\{(.+)\}$/.exec(stripped)
  if (braced) {
    let sub = braced[2]
    // Unwrap common TeX upright-text wrappers (\mathrm, \text,
    // \operatorname) so the SVG subscript shows plain letters, not
    // «\mathrm{in}».
    const inner = /^\\(?:mathrm|text|operatorname)\{([^{}]+)\}$/.exec(sub)
    if (inner) sub = inner[1]
    return { base: braced[1], sub }
  }
  const plain = /^(.+?)_(.+)$/.exec(stripped)
  if (plain) return { base: plain[1], sub: plain[2] }
  return null
}

/**
 * Render the text children of a schematic label. If the children are
 * a plain string with a `X_Y` / `X_{Y}` pattern, split into an italic
 * base + upright, baseline-shifted subscript (matching HTML `<sub>`
 * default and KaTeX math-italic convention).
 *
 * The base is rendered italic via inheritance — callers who want
 * upright base text must explicitly pass italic=false (unused so far).
 */
export function renderLabelContent(children: React.ReactNode): React.ReactNode {
  if (typeof children !== 'string') return children
  const parsed = parseLabelSubscript(children)
  if (!parsed) return children
  return (
    <>
      {parsed.base}
      <tspan fontSize="70%" dy="4" fontStyle="normal">
        {parsed.sub}
      </tspan>
    </>
  )
}

/**
 * Render a mixed-content SVG label that may contain multiple
 * `<var>X_{…}</var>` fragments interleaved with plain text (e.g. a
 * short formula like «V_out = V_in × R₂ / (R₁ + R₂)»). Emits a
 * sequence of `<tspan>` children suitable for dropping inside a
 * parent `<text>` element.
 *
 * Each var fragment is rendered as italic base + upright subscript
 * with a baseline shift; the shift is reset by a second zero-width
 * tspan so subsequent plain text lands on the normal baseline.
 *
 * For simple single-variable labels use `renderLabelContent` instead
 * — this one is only needed when the SVG label is a sentence or
 * formula with several embedded vars.
 */
export function renderSvgInlineMath(s: string): React.ReactNode {
  const parts = s.split(/(<var>[^<]+<\/var>)/)
  return parts.map((part, i) => {
    const m = /^<var>(.+)<\/var>$/.exec(part)
    if (!m) return <React.Fragment key={i}>{part}</React.Fragment>
    const parsed = parseLabelSubscript(m[1])
    if (!parsed) {
      return (
        <tspan key={i} fontStyle="italic">
          {m[1]}
        </tspan>
      )
    }
    return (
      <React.Fragment key={i}>
        <tspan fontStyle="italic">{parsed.base}</tspan>
        <tspan fontSize="70%" dy="4" fontStyle="normal">
          {parsed.sub}
        </tspan>
        {/* Reset baseline for any plain text that follows. */}
        <tspan dy="-4" fontSize="0">
          {'\u200B' /* ZWSP — non-visual character to carry the dy shift */}
        </tspan>
      </React.Fragment>
    )
  })
}

export function SymbolText({
  x,
  y,
  size = 11,
  weight,
  anchor = 'middle',
  opacity,
  children,
}: SymbolTextProps) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      dominantBaseline="middle"
      fill="currentColor"
      opacity={opacity}
    >
      {renderLabelContent(children)}
    </text>
  )
}

/**
 * Compute label / value placement for an oriented two-terminal symbol.
 *
 * Horizontal symbols put labels above (y - 14) and centred.
 * Vertical symbols put labels to the right (x + offset) and start-aligned.
 *
 * @param offset Horizontal distance from the symbol centre when vertical.
 *               Default 18 — bump up for symbols with wider bodies (e.g. the
 *               20-radius meter circle uses 28).
 */
export function getLabelPosition(
  x: number,
  y: number,
  orient: Orientation,
  offset = 18,
): { lx: number; ly: number; anchor: 'start' | 'middle' } {
  const vert = isVertical(orient)
  return {
    lx: vert ? x + offset : x,
    ly: vert ? y : y - 14,
    anchor: vert ? 'start' : 'middle',
  }
}

/**
 * Pre-baked label + value pair for symbols that follow the standard
 * "bold label above, value below body" convention (battery, switch, fuse,
 * meter, ground, etc.).
 *
 * For passives (non-bold style with both texts above the body), use
 * `SymbolText` directly with the appropriate offsets.
 */
interface OrientedLabelProps {
  /** Symbol centre x. */
  x: number
  /** Symbol centre y. */
  y: number
  orient: Orientation
  label?: string
  value?: string
  /**
   * Horizontal offset for vertical orientations (px from centre to where the
   * text starts). Default 18.
   */
  offset?: number
}

/**
 * Pre-baked label + value pair for symbols that always render in a centred,
 * vertically-symmetric layout regardless of orient (diodes, BJTs, crystal,
 * transformer). Label sits above the body, value sits below — both centred.
 *
 * `gap` controls the distance from the symbol centre to each text. Diodes use
 * 20; transistors and the transformer use 25.
 */
interface CenteredLabelProps {
  /** Symbol centre x. */
  x: number
  /** Symbol centre y. */
  y: number
  label?: string
  value?: string
  /** Distance from centre to each text. Default 20. */
  gap?: number
  /**
   * Which side the designator label sits on. Default 'above'. Use 'below'
   * for symbols that have decorations above the body (e.g. LED emission
   * arrows) where putting the label above would force an awkwardly large
   * gap. With 'below', the value (if any) flips above.
   */
  labelSide?: 'above' | 'below'
}

// Schematic-label type sizes. Bumped to respect the diagram-quality
// skill's 13 px floor for any readable label — the previous 11/12 values
// were below the floor and rendered component designators (R₁, R₂, …)
// uncomfortably small compared to surrounding prose and node markers.
//
// EXPORTED for use in other label helpers (e.g. `PassiveLabel` in
// `symbols/passives.tsx`). Every schematic-label helper in the library
// MUST pull from these constants — do NOT hard-code `size={12}` or
// similar locally, or the label-size floor silently drifts between
// component families.
export const LABEL_SIZE = 14
export const VALUE_SIZE = 13

export function CenteredLabel({ x, y, label, value, gap = 20, labelSide = 'above' }: CenteredLabelProps) {
  if (!label && !value) return null
  const labelY = labelSide === 'above' ? y - gap : y + gap
  const valueY = labelSide === 'above' ? y + gap : y - gap
  return (
    <>
      {label && (
        <SymbolText x={x} y={labelY} size={LABEL_SIZE} weight={600}>
          {label}
        </SymbolText>
      )}
      {value && (
        <SymbolText x={x} y={valueY} size={VALUE_SIZE} opacity={0.7}>
          {value}
        </SymbolText>
      )}
    </>
  )
}

export function OrientedLabel({
  x,
  y,
  orient,
  label,
  value,
  offset = 18,
}: OrientedLabelProps) {
  if (!label && !value) return null
  const vert = isVertical(orient)
  const { lx, anchor } = getLabelPosition(x, y, orient, offset)
  // Label sits above the body (or beside it when vertical); value sits below
  // (or further down-right when vertical).
  const labelY = vert ? y : y - 14
  const valueY = vert ? y + 16 : y + 4

  return (
    <>
      {label && (
        <SymbolText x={lx} y={labelY} size={LABEL_SIZE} weight="bold" anchor={anchor}>
          {label}
        </SymbolText>
      )}
      {value && (
        <SymbolText x={lx} y={valueY} size={VALUE_SIZE} anchor={anchor} opacity={0.7}>
          {value}
        </SymbolText>
      )}
    </>
  )
}
