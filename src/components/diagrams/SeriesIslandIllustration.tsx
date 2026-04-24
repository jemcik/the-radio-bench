/**
 * Chapter 1.5 — pedagogical illustration for «ізольований вузол»
 * (isolated-island) concept in series capacitors.
 *
 * What the reader sees, left-to-right:
 *
 *   1. «+» battery terminal on the far left (a short bold tick).
 *   2. A wire running right into the LEFT OUTER plate of C₁ — a tall
 *      vertical bar; under it the charge label «+Q».
 *   3. The RIGHT INNER plate of C₁ — separated from plate 1 by a
 *      small gap (the dielectric). Under it: «−Q».
 *   4. A short connecting wire to C₂.
 *   5. The LEFT INNER plate of C₂, label «+Q».
 *   6. The RIGHT OUTER plate of C₂, label «−Q», and a wire exiting
 *      to the «−» battery terminal on the far right.
 *   7. A dashed rough cloud (rounded-rectangle with noisy outline)
 *      encircles the two inner plates and the connecting wire — the
 *      «isolated node». The caption under the cloud reads
 *      «ізольований вузол: Σ = 0».
 *
 * Style: hand-drawn Rough.js, matching the book's other inline
 * illustrations. No schematic conventions — this is a pedagogical
 * cartoon meant to anchor the concept, not a circuit blueprint.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughRect,
  roughPath,
} from '@/lib/rough'
import { svgTokens } from './svgTokens'

/* ── Overall layout ──────────────────────────────────────────────── */
const VB_W = 600
const VB_H = 260

const MAIN_Y = 110 // vertical centre of the plate row
const PLATE_H = 70 // plate height
const PLATE_TOP = MAIN_Y - PLATE_H / 2
const PLATE_BOT = MAIN_Y + PLATE_H / 2

/* Plate width — thin, because plates are vertical bars. */
const PLATE_W = 8
/* Gap between the two plates of a single capacitor (dielectric zone). */
const DIEL_GAP = 22
/* Gap along the connecting wire between C₁'s inner plate and C₂'s inner plate. */
const ISLAND_WIRE_GAP = 130

/* X coordinates of the four plates, derived so the whole arrangement
 * sits centred horizontally inside VB_W. */
const TOTAL_SPAN = PLATE_W * 4 + DIEL_GAP * 2 + ISLAND_WIRE_GAP
const START_X = (VB_W - TOTAL_SPAN) / 2

const P1_X = START_X // C₁ left outer plate
const P2_X = P1_X + PLATE_W + DIEL_GAP // C₁ right inner plate
const P3_X = P2_X + PLATE_W + ISLAND_WIRE_GAP // C₂ left inner plate
const P4_X = P3_X + PLATE_W + DIEL_GAP // C₂ right outer plate
const END_X = P4_X + PLATE_W

/* Wire from battery+ into P1, and from P4 out to battery−. */
const LEAD_LEN = 56
const BAT_POS_X = P1_X - LEAD_LEN
const BAT_NEG_X = END_X + LEAD_LEN

/* Battery tick marks — short vertical bars at the two ends. */
const BAT_TICK_H = 30

/* Island cloud — a rounded rectangle drawn with Rough.js that spans
 * the two inner plates + the connecting wire between them. */
const ISLAND_PAD_X = 20
const ISLAND_PAD_Y = 16
const ISLAND_X = P2_X - ISLAND_PAD_X
const ISLAND_Y = PLATE_TOP - ISLAND_PAD_Y
const ISLAND_W = P3_X + PLATE_W + ISLAND_PAD_X - ISLAND_X
const ISLAND_H = PLATE_H + 2 * ISLAND_PAD_Y

const CHARGE_LABEL_Y = PLATE_BOT + 26
const CAP_LABEL_Y = PLATE_TOP - 18
const ISLAND_CAPTION_Y = PLATE_BOT + 70

/* ── Rough.js strokes ────────────────────────────────────────────── */

function plateStrokes(x: number, seed: number): RoughPath[] {
  return roughRect(x, PLATE_TOP, PLATE_W, PLATE_H, {
    seed,
    strokeWidth: 1.6,
    roughness: 0.6,
  })
}

function wireStrokes(seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  // Battery+ lead into P1 (stop before the plate)
  paths.push(...roughLine(BAT_POS_X, MAIN_Y, P1_X, MAIN_Y, { seed, strokeWidth: 1.3, roughness: 0.5 }))
  // Connecting wire from P2 to P3 (the ISLAND wire — drawn slightly bolder)
  paths.push(...roughLine(P2_X + PLATE_W, MAIN_Y, P3_X, MAIN_Y, { seed: seed + 1, strokeWidth: 1.6, roughness: 0.5 }))
  // P4 out to battery− lead
  paths.push(...roughLine(P4_X + PLATE_W, MAIN_Y, BAT_NEG_X, MAIN_Y, { seed: seed + 2, strokeWidth: 1.3, roughness: 0.5 }))
  // Battery+ tick (short vertical bar at far left)
  paths.push(...roughLine(BAT_POS_X, MAIN_Y - BAT_TICK_H / 2, BAT_POS_X, MAIN_Y + BAT_TICK_H / 2, { seed: seed + 3, strokeWidth: 2.0, roughness: 0.4 }))
  // Battery− tick (short vertical bar at far right)
  paths.push(...roughLine(BAT_NEG_X, MAIN_Y - BAT_TICK_H / 2, BAT_NEG_X, MAIN_Y + BAT_TICK_H / 2, { seed: seed + 4, strokeWidth: 2.0, roughness: 0.4 }))
  return paths
}

/** Rough rounded-rectangle "cloud" around the island. */
function islandStrokes(seed: number): RoughPath[] {
  const r = 22
  const x = ISLAND_X
  const y = ISLAND_Y
  const w = ISLAND_W
  const h = ISLAND_H
  // Build a rounded-rect path and hand it to roughPath — that gives us
  // a single Rough-traced outline rather than four straight sides.
  const d =
    `M ${x + r} ${y} ` +
    `L ${x + w - r} ${y} ` +
    `Q ${x + w} ${y} ${x + w} ${y + r} ` +
    `L ${x + w} ${y + h - r} ` +
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h} ` +
    `L ${x + r} ${y + h} ` +
    `Q ${x} ${y + h} ${x} ${y + h - r} ` +
    `L ${x} ${y + r} ` +
    `Q ${x} ${y} ${x + r} ${y} Z`
  return roughPath(d, {
    seed,
    strokeWidth: 1.5,
    roughness: 1.4,
  })
}

/* ── Component ───────────────────────────────────────────────────── */

export default function SeriesIslandIllustration() {
  const { t } = useTranslation('ui')

  const plates = useMemo(
    () => [
      plateStrokes(P1_X, 101),
      plateStrokes(P2_X, 207),
      plateStrokes(P3_X, 313),
      plateStrokes(P4_X, 419),
    ],
    [],
  )
  const wires = useMemo(() => wireStrokes(503), [])
  const island = useMemo(() => islandStrokes(617), [])

  return (
    <figure className="my-6 not-prose">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_5.seriesIslandAria')}
        style={{ display: 'block', maxWidth: 600, margin: '0 auto' }}
      >
        {/* Island cloud — drawn FIRST so it sits behind the plates/wires. */}
        <g style={{ color: svgTokens.note }}>
          {/* Soft translucent fill under the cloud outline for emphasis. */}
          <rect
            x={ISLAND_X}
            y={ISLAND_Y}
            width={ISLAND_W}
            height={ISLAND_H}
            rx={22}
            ry={22}
            fill="currentColor"
            opacity={0.08}
          />
          <RoughPaths paths={island} strokeDasharray="6 4" />
        </g>

        {/* Main row: plates + wires + battery terminals, in foreground colour. */}
        <g style={{ color: svgTokens.fg }}>
          <RoughPaths paths={wires} />
          <RoughPaths paths={plates[0]} />
          <RoughPaths paths={plates[1]} />
          <RoughPaths paths={plates[2]} />
          <RoughPaths paths={plates[3]} />
        </g>

        {/* Battery terminal labels («+» and «−»). */}
        <g
          fontFamily="Georgia, serif"
          fontSize="1.15em"
          fontWeight="700"
          textAnchor="middle"
          fill={svgTokens.fg}
        >
          <text x={BAT_POS_X} y={MAIN_Y - BAT_TICK_H / 2 - 8}>
            {t('ch1_5.seriesIslandBatteryPos')}
          </text>
          <text x={BAT_NEG_X} y={MAIN_Y - BAT_TICK_H / 2 - 8}>
            {t('ch1_5.seriesIslandBatteryNeg')}
          </text>
        </g>

        {/* Cap name labels C₁ / C₂ — above the two plate pairs. */}
        <g
          fontFamily="Georgia, serif"
          fontSize="1em"
          fontStyle="italic"
          textAnchor="middle"
          fill={svgTokens.mutedFg}
        >
          <text x={(P1_X + P2_X + PLATE_W) / 2} y={CAP_LABEL_Y}>
            {t('ch1_5.seriesIslandC1')}
          </text>
          <text x={(P3_X + P4_X + PLATE_W) / 2} y={CAP_LABEL_Y}>
            {t('ch1_5.seriesIslandC2')}
          </text>
        </g>

        {/* Charge labels under each plate. */}
        <g
          fontFamily="Georgia, serif"
          fontSize="0.95em"
          fontWeight="600"
          textAnchor="middle"
          fill={svgTokens.key}
        >
          <text x={P1_X + PLATE_W / 2} y={CHARGE_LABEL_Y}>+Q</text>
          <text x={P2_X + PLATE_W / 2} y={CHARGE_LABEL_Y}>−Q</text>
          <text x={P3_X + PLATE_W / 2} y={CHARGE_LABEL_Y}>+Q</text>
          <text x={P4_X + PLATE_W / 2} y={CHARGE_LABEL_Y}>−Q</text>
        </g>

        {/* Island caption, centred under the cloud. */}
        <text
          x={ISLAND_X + ISLAND_W / 2}
          y={ISLAND_CAPTION_Y}
          fontFamily="Georgia, serif"
          fontSize="0.9em"
          fontStyle="italic"
          textAnchor="middle"
          fill={svgTokens.note}
        >
          {t('ch1_5.seriesIslandCloudLabel')}
        </text>
      </svg>
    </figure>
  )
}
