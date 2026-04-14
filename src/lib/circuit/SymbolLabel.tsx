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
}

export function CenteredLabel({ x, y, label, value, gap = 20 }: CenteredLabelProps) {
  if (!label && !value) return null
  return (
    <>
      {label && (
        <SymbolText x={x} y={y - gap} size={11} weight={600}>
          {label}
        </SymbolText>
      )}
      {value && (
        <SymbolText x={x} y={y + gap} size={10} opacity={0.7}>
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
        <SymbolText x={lx} y={labelY} size={12} weight="bold" anchor={anchor}>
          {label}
        </SymbolText>
      )}
      {value && (
        <SymbolText x={lx} y={valueY} size={11} anchor={anchor} opacity={0.7}>
          {value}
        </SymbolText>
      )}
    </>
  )
}
