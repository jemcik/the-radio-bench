/**
 * Shared vertical-layout constants for schematic diagrams.
 *
 * Every `<Circuit>`-using diagram should import these and derive its
 * viewBox height + rail y-coordinates from them instead of hardcoding
 * numbers per-file. One place to adjust padding; all diagrams follow.
 *
 * HISTORY
 * ───────
 * Multiple rounds of "this schematic has too much blank space above it"
 * user feedback in Ch 0.5. Each diagram had picked its own TOP_Y / H and
 * the padding drifted apart. Extracted these constants so the rule is
 * enforced at import time, not by eye.
 *
 * See also: `feedback_schematic_pin_symbol_drift.md` in project memory,
 * which covers a related bug (component centre duplicated between pin
 * helpers and JSX render).
 */

/**
 * Vertical padding from the SVG top edge to the top rail.
 *
 * 35 px chosen as the worst-case budget:
 *   – Meter circle on the top wire (r=20): circle top sits at TOP−20
 *     = y=15, leaving 15 px of clear space above it.
 *   – A bold 12 px label above a horizontal passive (placed at
 *     TOP−18): glyph top ≈ TOP−24 = y=11, leaving 11 px clear.
 * Either case renders with comfortable (≥10 px) breathing room.
 */
export const SCHEMATIC_PAD_TOP = 35

/**
 * Vertical padding from the bottom rail to the SVG bottom edge.
 *
 * 20 px — enough for a battery/meter label or caption row to live
 * beneath the bottom wire without clipping, and visually symmetric-ish
 * with PAD_TOP after you account for the larger content above the top
 * rail (labels, meter circles).
 */
const SCHEMATIC_PAD_BOT = 20

/**
 * Compute the SVG viewBox height for a schematic with the given
 * rail-to-rail vertical span (the y-distance from the top wire to the
 * bottom wire).
 *
 * @example
 *   const RAIL_SPAN = 140
 *   const TOP_Y = SCHEMATIC_PAD_TOP           // 35
 *   const BOT_Y = TOP_Y + RAIL_SPAN           // 175
 *   const H     = schematicHeight(RAIL_SPAN)  // 195
 */
export function schematicHeight(railSpan: number): number {
  return SCHEMATIC_PAD_TOP + railSpan + SCHEMATIC_PAD_BOT
}
