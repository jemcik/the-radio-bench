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
      {children}
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
