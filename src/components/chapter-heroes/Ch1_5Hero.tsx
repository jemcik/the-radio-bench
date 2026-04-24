/**
 * Chapter 1.5 hero — parallel-plate capacitor cross-section.
 *
 * What the reader sees, left-to-right / top-to-bottom:
 *
 *   1. A positive lead (with a `+` marker) entering the top plate from
 *      the left side.
 *   2. The top plate — a solid, slightly rough horizontal bar labelled
 *      with `+` charge markers along its underside.
 *   3. A shaded dielectric layer between the plates (soft translucent
 *      fill, with the label "dielectric" floating inside it). Vertical
 *      arrows run from the top plate to the bottom plate to represent
 *      the electric field E.
 *   4. The bottom plate — a mirror of the top, with `−` markers on its
 *      topside.
 *   5. A negative lead (with a `−` marker) exiting to the right side
 *      of the bottom plate.
 *
 * The intent is to build physical intuition BEFORE any formula: the
 * charge lives on the plates, the field lives in the dielectric. Every
 * element uses `stroke="currentColor"` so the sketch flips with the
 * theme; the dielectric tint is kept deliberately light (opacity 0.25)
 * so the rough outline and field arrows remain clearly legible.
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

/* ── Overall layout ──────────────────────────────────────────────── */
const VB_W = 540
const VB_H = 210

/* Plate geometry — centre-horizontal, gapped vertically so the
 * dielectric has room for five field arrows plus a label. */
const PLATE_W = 260
const PLATE_H = 10
const PLATE_X = (VB_W - PLATE_W) / 2
const TOP_PLATE_Y = 58
const BOT_PLATE_Y = 128

/* Dielectric rectangle — sits BETWEEN the two plates (not over them). */
const DIEL_X = PLATE_X
const DIEL_Y = TOP_PLATE_Y + PLATE_H
const DIEL_W = PLATE_W
const DIEL_H = BOT_PLATE_Y - (TOP_PLATE_Y + PLATE_H)

/* Lead geometry — one horizontal segment exiting each plate, with a
 * terminal marker ( "+"  or "−" ) at its far end. */
const LEAD_LEN = 70
const TOP_LEAD_Y = TOP_PLATE_Y + PLATE_H / 2
const BOT_LEAD_Y = BOT_PLATE_Y + PLATE_H / 2

/* Label row baseline (under the bottom lead). */
const LABEL_Y = 188

/* Dielectric tint — same teal-leaning neutral used for other soft fills
 * in the book heroes. Opacity tuned so outline strokes stay crisp. */
const DIEL_FILL = '#4a9dbd'

/* ── Plate strokes ───────────────────────────────────────────────── */

function plateStrokes(seed: number, y: number): RoughPath[] {
  // A solid rectangle — but we draw only the *outline* with rough.js;
  // the solid fill is a plain SVG <rect> underneath (see the body).
  return roughRect(PLATE_X, y, PLATE_W, PLATE_H, {
    seed,
    strokeWidth: 1.3,
    roughness: 0.6,
  })
}

/* ── Lead strokes ────────────────────────────────────────────────── */

function leadStrokes(seed: number): RoughPath[] {
  // Top lead — exits LEFT from the top plate, terminates at (PLATE_X - LEAD_LEN, TOP_LEAD_Y).
  const topLead = roughLine(
    PLATE_X, TOP_LEAD_Y,
    PLATE_X - LEAD_LEN, TOP_LEAD_Y,
    { seed, strokeWidth: 1.4 },
  )
  // Bottom lead — exits RIGHT from the bottom plate, terminates at (PLATE_X + PLATE_W + LEAD_LEN, BOT_LEAD_Y).
  const botLead = roughLine(
    PLATE_X + PLATE_W, BOT_LEAD_Y,
    PLATE_X + PLATE_W + LEAD_LEN, BOT_LEAD_Y,
    { seed: seed + 1, strokeWidth: 1.4 },
  )
  return [...topLead, ...botLead]
}

/* ── Field arrows ────────────────────────────────────────────────── */

/**
 * Five vertical arrows spanning the dielectric, representing the E-field.
 * Drawn as plain paths so the arrowheads are crisp; only the stem is
 * "rough" (hand-drawn) to stay consistent with the rest of the figure.
 */
function fieldArrows(seed: number): RoughPath[] {
  const arrows: RoughPath[] = []
  // 5 arrows, evenly spaced. Start at x0 so the label has clear room
  // in the centre — the middle arrow is hidden so the dielectric label
  // can breathe.
  const ARROW_COUNT = 5
  const MARGIN = 30
  const spacing = (PLATE_W - 2 * MARGIN) / (ARROW_COUNT - 1)
  const tipY = BOT_PLATE_Y - 2
  const baseY = TOP_PLATE_Y + PLATE_H + 2
  for (let i = 0; i < ARROW_COUNT; i++) {
    // Drop the middle arrow (the "E" label sits there).
    if (i === Math.floor(ARROW_COUNT / 2)) continue
    const x = PLATE_X + MARGIN + i * spacing
    // Stem + arrowhead, described as one path so the triangle is sharp.
    const d = `M ${x} ${baseY} L ${x} ${tipY - 6} M ${x - 3} ${tipY - 6} L ${x} ${tipY} L ${x + 3} ${tipY - 6}`
    arrows.push(...roughPath(d, { seed: seed + i, strokeWidth: 1.1, roughness: 0.5 }))
  }
  return arrows
}

export default function Ch1_5Hero() {
  const { t } = useTranslation('ui')

  const strokes = useMemo(
    () => ({
      topPlate: plateStrokes(11, TOP_PLATE_Y),
      botPlate: plateStrokes(17, BOT_PLATE_Y),
      dielectric: roughRect(DIEL_X, DIEL_Y, DIEL_W, DIEL_H, {
        seed: 23, strokeWidth: 0.9, roughness: 0.8,
        // Horizontal hachure inside the rectangle would clutter; leave
        // the rectangle outline only.
      }),
      leads: leadStrokes(31),
      field: fieldArrows(41),
    }),
    [],
  )

  // Charge-tick markers — small "+" and "−" arranged along the inside
  // edge of each plate.
  const chargeTicks = Array.from({ length: 6 }, (_, i) => {
    const xFrac = (i + 1) / 7
    const x = PLATE_X + xFrac * PLATE_W
    return { x }
  })

  return (
    <svg
      width="540"
      height="210"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      aria-label={t('ch1_5.heroAriaLabel')}
      role="img"
    >
      {/* ── DIELECTRIC TINT (drawn FIRST so plates overlap it) ── */}
      <rect
        x={DIEL_X} y={DIEL_Y}
        width={DIEL_W} height={DIEL_H}
        fill={DIEL_FILL}
        opacity={0.18}
      />
      <RoughPaths paths={strokes.dielectric} opacity={0.55} />

      {/* ── FIELD ARROWS ──────────────────────────────────────── */}
      <g opacity={0.7}>
        <RoughPaths paths={strokes.field} />
      </g>
      {/* Field label — a single italic "E" sitting in the middle gap */}
      <text
        x={VB_W / 2}
        y={(TOP_PLATE_Y + BOT_PLATE_Y + PLATE_H) / 2 + 4}
        fontFamily="Georgia, serif"
        fontSize="0.95em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.85}
      >
        {t('ch1_5.heroFieldLabel')}
      </text>

      {/* ── DIELECTRIC LABEL ──────────────────────────────────────
          Original placement was `DIEL_Y + DIEL_H - 4` (inside the
          band, near the bottom). That collides with the "−" charge
          ticks on the upper side of the bottom plate (at `BOT_PLATE_Y
          - 3`, roughly the same vertical). Lift it ~14 px so the
          label sits BELOW the field-"E" label with a clear gap and
          well above the minus ticks. */}
      <text
        x={VB_W / 2}
        y={DIEL_Y + DIEL_H - 18}
        fontFamily="Georgia, serif"
        fontSize="0.75em"
        fontStyle="italic"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.55}
      >
        {t('ch1_5.heroDielectric')}
      </text>

      {/* ── TOP PLATE ─────────────────────────────────────────── */}
      <rect
        x={PLATE_X} y={TOP_PLATE_Y}
        width={PLATE_W} height={PLATE_H}
        fill="currentColor"
        opacity={0.12}
      />
      <RoughPaths paths={strokes.topPlate} />
      {/* Positive charge ticks on the underside of the top plate */}
      {chargeTicks.map(({ x }, i) => (
        <text
          key={`pos-${i}`}
          x={x} y={TOP_PLATE_Y + PLATE_H + 10}
          fontFamily="Menlo, Consolas, monospace"
          fontSize="0.7em"
          fontWeight="700"
          fill="currentColor"
          textAnchor="middle"
          opacity={0.8}
        >
          +
        </text>
      ))}

      {/* ── BOTTOM PLATE ─────────────────────────────────────── */}
      <rect
        x={PLATE_X} y={BOT_PLATE_Y}
        width={PLATE_W} height={PLATE_H}
        fill="currentColor"
        opacity={0.12}
      />
      <RoughPaths paths={strokes.botPlate} />
      {/* Negative charge ticks on the topside of the bottom plate */}
      {chargeTicks.map(({ x }, i) => (
        <text
          key={`neg-${i}`}
          x={x} y={BOT_PLATE_Y - 3}
          fontFamily="Menlo, Consolas, monospace"
          fontSize="0.85em"
          fontWeight="700"
          fill="currentColor"
          textAnchor="middle"
          opacity={0.8}
        >
          −
        </text>
      ))}

      {/* ── LEADS ─────────────────────────────────────────────── */}
      <RoughPaths paths={strokes.leads} />
      {/* Polarity markers at the far end of each lead */}
      <text
        x={PLATE_X - LEAD_LEN - 14}
        y={TOP_LEAD_Y + 5}
        fontFamily="Georgia, serif"
        fontSize="1.1em"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
      >
        {t('ch1_5.heroPlatePos')}
      </text>
      <text
        x={PLATE_X + PLATE_W + LEAD_LEN + 14}
        y={BOT_LEAD_Y + 5}
        fontFamily="Georgia, serif"
        fontSize="1.1em"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
      >
        {t('ch1_5.heroPlateNeg')}
      </text>

      {/* ── Section label under the figure ─────────────────────── */}
      <text
        x={VB_W / 2} y={LABEL_Y}
        fontFamily="Georgia, serif"
        fontSize="0.812em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.7}
      >
        Q = C · V
      </text>
    </svg>
  )
}
