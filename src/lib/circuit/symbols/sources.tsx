/**
 * Voltage / current sources and ground primitives.
 *
 * Geometry adapted from chris-pikul/electronic-symbols (MIT-licensed).
 * See ../vendored/SOURCE.md for the per-symbol mapping.
 */

import { type SymbolProps, type SinglePinProps, type Orientation, isVertical, STROKE } from '../types'
import { OrientedLabel, SymbolText, LABEL_SIZE, VALUE_SIZE } from '../SymbolLabel'
import { VendoredSymbol } from './_VendoredSymbol'

/**
 * Battery polarity markers — «+» beside the positive (long) plate and
 * «−» beside the negative (short) plate. Rendered OUTSIDE the vendored
 * symbol's rotation group so the marker glyphs stay upright (a «+»
 * cross and a horizontal «−») regardless of the body's orient.
 *
 * The chris-pikul source SVG bakes these markers into the same path as
 * the plates and leads, which means the «−» (a single horizontal stroke,
 * not rotation-symmetric) renders as a stray vertical line under
 * `orient='down'`/`'up'`. ARRL Handbook 2023 Figure 2.1 shows both
 * polarity markers explicitly («the symbol for a battery is shown with
 * its voltage polarity as + and –»), so the fix is to render them
 * properly — not to drop them.
 *
 * Placement is ORIENT-AWARE (a simple rotation of a single default
 * position doesn't work because the conventional placement differs
 * between horizontal and vertical orient):
 *
 *   • Horizontal orient (`right` / `left`): markers sit ABOVE the body,
 *     each one over its respective plate (+ over long plate, − over
 *     short plate). This is the chris-pikul / ARRL convention for a
 *     horizontally-drawn cell.
 *
 *   • Vertical orient (`down` / `up`): markers sit to one SIDE of the
 *     body axis (away from where Battery puts the value label at
 *     `x+14`), each one at the y-level of its plate (+ next to long
 *     plate, − next to short plate). Rotating the horizontal placement
 *     would put markers FAR above/below the body — visually disconnected
 *     from the cell (a reader's screenshot showed «−» sitting below the
 *     value label, looking unrelated to the battery).
 *
 * `plateGap` is the absolute distance from the body centre to the
 * outermost positive/negative plate along the body's electrical axis.
 * Battery (single cell): 3.7 (plates at ±3.7 local). BatteryMulti:
 * ≈11 (outermost plates at ±11 local).
 *
 * Glyph size 5 (cross / minus stroke) is much smaller than the 10-px
 * chris-pikul originals — the originals were visually intrusive at
 * vertical-battery scale.
 */
function PolarityMarkers({
  x, y, orient, plateGap,
}: {
  x: number; y: number; orient: Orientation; plateGap: number
}) {
  const vert = isVertical(orient)
  const GLYPH = 5
  const half = GLYPH / 2

  let plusX: number, plusY: number, minusX: number, minusY: number
  if (vert) {
    // Vertical orient: markers on the RIGHT of the body axis, at the
    // y-level of their respective plates. The perpendicular extent of
    // each plate (after rotation) is x=±10 for long plate, ±5 for
    // short; the LATERAL=15 offset clears the long plate's right edge
    // (10) plus the glyph half-width (2.5) plus a ~3-px breathing gap
    // (the user's request: «3 пікселі далі від значка»). Battery's
    // own value label sits FURTHER RIGHT at x+20, OUTSIDE the markers.
    //
    // `orient='down'` puts the long (positive) plate at TOP (y=-3.7
    // for Battery); `orient='up'` flips that.
    const longPlateAtTop = orient === 'down' ? -1 : 1
    const lateral = 15
    plusX = x + lateral
    plusY = y + longPlateAtTop * plateGap
    minusX = x + lateral
    minusY = y - longPlateAtTop * plateGap
  } else {
    // Horizontal orient: markers ABOVE the body, each above its plate.
    // `orient='right'` (default) puts long plate at LEFT (x=-plateGap);
    // `orient='left'` flips that. Same 15-px outside-body clearance as
    // the vertical case.
    const longPlateAtLeft = orient === 'right' ? -1 : 1
    const vertical = 15
    plusX = x + longPlateAtLeft * plateGap
    plusY = y - vertical
    minusX = x - longPlateAtLeft * plateGap
    minusY = y - vertical
  }

  return (
    <g stroke="currentColor" strokeWidth={STROKE} fill="none" strokeLinecap="round">
      {/* «+» — a small cross, 5 units wide × 5 units tall, drawn UPRIGHT
          (the cross strokes stay horizontal + vertical regardless of
          `orient`). */}
      <path d={`M${plusX - half},${plusY}h${GLYPH}M${plusX},${plusY - half}v${GLYPH}`} />
      {/* «−» — a horizontal stroke, 5 units wide, also drawn UPRIGHT. */}
      <path d={`M${minusX - half},${minusY}h${GLYPH}`} />
    </g>
  )
}

// ─── AcSource ─────────────────────────────────────────────────────────────────

/** Radius of the AC source body circle in our local SVG coordinates.
 *  Source SVG is r=50 in a 150-px viewBox; VendoredSymbol scales by 0.4
 *  → r=20 locally. Exported so callsites can place external labels with
 *  the proper clearance (e.g., `TerminalLabel y={TOP_Y - (AC_SOURCE_RADIUS + 10)}`)
 *  instead of hardcoding an offset that breaks the next time the
 *  primitive resizes. */
export const AC_SOURCE_RADIUS = 20

/**
 * AcSource — AC voltage source.
 * Source: Source-COM-AC.svg
 * A circle with sinusoid inside, two leads at left/right.
 * Pins: (-30, 0) and (+30, 0).
 */
export function AcSource({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  return (
    <g>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <circle cx="75" cy="75" r="50" />
        <path d="M25 75H0m125 0h25m-113 .38s6.38-15.63 22.13-15.63 9.5 30.75 31.5 30.75S112 75.38 112 75.38" />
      </VendoredSymbol>
      <AcSourceLabel x={x} y={y} orient={orient} label={label} value={value} />
    </g>
  )
}

/* Internal helper — custom label/value placement for AcSource that clears
   the 20-radius (in our coords) circle body. Not exported. */
function AcSourceLabel({
  x,
  y,
  orient,
  label,
  value,
}: {
  x: number
  y: number
  orient: Orientation
  label?: string
  value?: string
}) {
  if (!label && !value) return null
  // Source circle radius is 50 px → 20 SVG units after the 0.4 down-scale.
  // Add ~8 px clearance.
  const G = 28
  const vert = orient === 'up' || orient === 'down'
  const valueIsPrimary = !label
  // Lone value takes the LABEL slot (size 14) so an AC source / battery
  // with only «V_in» reads at the same size as a Resistor whose label
  // is «R». When a separate designator is supplied, the value falls back
  // to VALUE_SIZE. Weight is uniformly regular (400) across the library
  // as of May 2026 — see TerminalLabel/OrientedLabel for the rationale.
  const valueSize = valueIsPrimary ? LABEL_SIZE : VALUE_SIZE
  if (vert) {
    return (
      <>
        {label && (
          <SymbolText x={x + G} y={y - 7} size={LABEL_SIZE} anchor="start">
            {label}
          </SymbolText>
        )}
        {value && (
          <SymbolText
            x={x + G}
            y={valueIsPrimary ? y : y + 9}
            size={valueSize}
            anchor="start"
          >
            {value}
          </SymbolText>
        )}
      </>
    )
  }
  return (
    <>
      {label && (
        <SymbolText x={x} y={y - G} size={LABEL_SIZE}>
          {label}
        </SymbolText>
      )}
      {value && (
        <SymbolText
          x={x}
          y={valueIsPrimary ? y - G : y + G}
          size={valueSize}
        >
          {value}
        </SymbolText>
      )}
    </>
  )
}

// ─── Battery ──────────────────────────────────────────────────────────────────

/**
 * Battery — single cell.
 * Source: Source-COM-Battery-Single.svg
 *
 * Upstream draws the long (positive) plate on the RIGHT and the «+» marker
 * adjacent to it. To match the existing project convention of «pin1 (left) =
 * positive», we mirror the source horizontally inside the wrapper so the
 * long plate and «+» land on the left side.
 *
 * Pins: positive (-30, 0), negative (+30, 0).
 */
export function Battery({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  return (
    <g>
      <VendoredSymbol x={x} y={y} orient={orient}>
        {/* Mirror horizontally so the positive (long) plate lands on the
            LEFT, matching the «pin1 = positive» convention. The chris-
            pikul source path also bakes «+» and «−» polarity markers
            into the geometry; we strip them out here («m125-37.5h-25
            M112.5 25v25» for «+» and «M25 37.5h25» for «−») and re-emit
            them via the orient-aware `PolarityMarkers` helper below.
            This keeps both markers upright in every orient — the «−»
            in particular is asymmetric, so leaving it inside the
            rotated group renders it as a vertical stroke for orient
            'up'/'down'. ARRL Figure 2.1 explicitly shows both markers,
            so we keep both — just rendered properly. */}
        <g transform="translate(150 0) scale(-1 1)">
          <path d="M84.25 50v50m-18.5-37.5v25M84.25 75H150m-84.25 0H0" />
        </g>
      </VendoredSymbol>
      <PolarityMarkers x={x} y={y} orient={orient} plateGap={3.7} />

      {isVertical(orient) ? (
        <>
          {label && (
            <SymbolText x={x - 12} y={y} size={LABEL_SIZE} anchor="end">
              {label}
            </SymbolText>
          )}
          {value && (
            // x+22 sits OUTSIDE the PolarityMarkers cluster on the
            // right (markers centred at x+15, glyph extends to x+17.5),
            // leaving ~4 px of breathing room before the value text.
            <SymbolText
              x={x + 22}
              y={y}
              size={label ? VALUE_SIZE : LABEL_SIZE}
              anchor="start"
            >
              {value}
            </SymbolText>
          )}
        </>
      ) : (
        <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
      )}
    </g>
  )
}

// ─── BatteryMulti ─────────────────────────────────────────────────────────────

/**
 * BatteryMulti — multi-cell battery.
 * Source: Source-COM-Battery-Multiple.svg
 * Mirrored horizontally for the same «pin1 = positive» convention as Battery.
 * Pins: positive (-30, 0), negative (+30, 0).
 */
export function BatteryMulti({
  x,
  y,
  orient = 'right',
  label,
  value,
}: SymbolProps) {
  return (
    <g>
      <VendoredSymbol x={x} y={y} orient={orient}>
        {/* See Battery (above) for the markers-stripping rationale.
            Removed segments: «m137.5-37.5h-25M125 25v25» («+») and
            «M12.5 37.5h25» («−») — both re-emitted by PolarityMarkers
            below, orient-aware. BatteryMulti's body is wider (plates
            at ±11 local instead of ±3.7) so the marker half-width is
            bumped from 15 (Battery) to 20 to keep them clear of the
            outermost plates. */}
        <g transform="translate(150 0) scale(-1 1)">
          <path d="M84.25 62.5v25M103 50v50M65.5 50v50M46.75 62.5v25M103 75h47M46.75 75H0" />
        </g>
      </VendoredSymbol>
      <PolarityMarkers x={x} y={y} orient={orient} plateGap={11} />
      <OrientedLabel x={x} y={y} orient={orient} label={label} value={value} />
    </g>
  )
}

// ─── Ground ───────────────────────────────────────────────────────────────────

/**
 * Ground — general (Earth) ground.
 * Source: Ground-COM-General.svg (with shortened pin AND tightened
 * stripes — see below).
 *
 * The upstream chris-pikul drawing uses a long 75-source-unit pin
 * (30 local px after scale 0.4) and stripe widths 100 → 50 → 12.5
 * spaced 25 source units apart (i.e. 40 → 20 → 5 local px at 10-local-
 * px spacing). That whole symbol totalled 50 local px tall and was too
 * dominant in tight schematics like the balun and varactor-tuner.
 *
 * The custom path here applies two compactions:
 *   • Pin shortened to 25 source units (10 local px), starting at
 *     source y=50 instead of y=0 — see `Battery`-side rationale for the
 *     same chris-pikul-pin-is-too-long issue.
 *   • Each stripe halved in length AND inter-stripe spacing halved:
 *     widths 100 → 50 → 12.5 became 50 → 25 → 6.25 source units;
 *     stripe ys 75 → 100 → 125 became 75 → 87.5 → 100.
 *   Net: symbol height 20 local px (was 50), still preserving the
 *   3-line IEEE earth-ground convention (each row shorter than the one
 *   above it).
 *
 * Local geometry (after wrapper's `translate(-75,-75)` + `scale(0.4)`):
 *   pin            : (0, -10) [tip] → (0, 0) [base, at top stripe]
 *   stripe widths  : top 20 → middle 10 → smallest 2.5
 *   stripe ys      : y=0, y=+5, y=+10
 *
 * Pin TIP location (where the external wire connects) relative to
 * component centre, after each `orient` rotation:
 *   orient='right' (no rotation) → tip at (0, -10)  pin points UP    ← typical
 *   orient='down'  (rotate  90°) → tip at (+10, 0)  pin points RIGHT
 *   orient='left'  (rotate 180°) → tip at (0, +10)  pin points DOWN
 *   orient='up'    (rotate -90°) → tip at (-10, 0)  pin points LEFT
 *
 * Use `orient='right'` (NOT `orient='up'`!) for the standard «pin
 * connects upward to a rail above, stripes hang below» layout — that's
 * the unrotated chris-pikul drawing. Place the component at
 * (rail_x, rail_y + 10) so the tip lands exactly on the rail. Default
 * `orient='down'` is kept for backward compatibility but rotates the
 * symbol so the pin points right — only correct when the rail sits to
 * the LEFT of the ground symbol.
 */
export function Ground({
  x,
  y,
  orient = 'down',
  label,
}: SinglePinProps) {
  return (
    <g>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M75 50v25m-25 0h50m-37.5 12.5h25M71.875 100h6.25" />
      </VendoredSymbol>
      <OrientedLabel x={x} y={y} orient={orient} label={label} />
    </g>
  )
}

// ─── GroundEarth ──────────────────────────────────────────────────────────────

/**
 * GroundEarth — chassis ground (hatched).
 * Source: Ground-COM-Chassis.svg (with shortened pin — see `Ground` for
 * the rationale; same `V0 → V50` change shrinks the pin from 30 to 10
 * local px and matches Ground's proportions). Pin TIP and placement
 * rules follow the same conventions as `Ground`.
 */
export function GroundEarth({
  x,
  y,
  orient = 'down',
  label,
}: SinglePinProps) {
  return (
    <g>
      <VendoredSymbol x={x} y={y} orient={orient}>
        <path d="M56.25 125 75 75h-.31V50" />
        <path d="m25 125 18.75-50h62.5L87.5 125" />
      </VendoredSymbol>
      <OrientedLabel x={x} y={y} orient={orient} label={label} />
    </g>
  )
}
