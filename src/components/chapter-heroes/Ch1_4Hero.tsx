/**
 * Chapter 1.4 hero — resistor package gallery.
 *
 * Three resistor styles laid out side by side with their labels
 * underneath. Chosen to span the reader's likely parts-bin experience:
 *
 *   1. Through-hole axial — the classic hobby-shelf resistor with
 *      coloured bands. Default bands match the chapter's worked
 *      example: red / violet / orange / gold → 27 kΩ ±5 %.
 *   2. Surface-mount (SMD) chip — tiny flat rectangle with a printed
 *      3-digit code ("472" = 4.7 kΩ). Scale is roughly to-life so the
 *      reader sees that an SMD chip is smaller than a pinhead next to
 *      the axial.
 *   3. Rotary potentiometer — round body with shaft + three pins,
 *      previewing the section later in the chapter on adjustable
 *      dividers.
 *
 * The drawings use Rough.js for the hand-sketched aesthetic consistent
 * with the rest of Part 1. Each element is stroked with
 * `currentColor` wrappers so it follows the theme.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughRect,
  roughPath,
  roughCircle,
} from '@/lib/rough'

/* ── Overall layout ───────────────────────────────────────────────── */
const VB_W = 540
const VB_H = 190

/* Axial resistor — centre-left */
const AX_CENTRE_X = 120
const AX_CENTRE_Y = 72
const AX_BODY_W = 110
const AX_BODY_H = 28
const AX_LEAD_LEN = 24

/* SMD chip — centre.
 * Not at viewport midpoint (270): the axial on the left extends ~24 px
 * further than its body thanks to its leads, so equal centres yield
 * unequal visual gaps. Shifted right of centre to even the edge-to-edge
 * gaps between axial→SMD and SMD→pot. */
const SMD_CENTRE_X = 291
const SMD_CENTRE_Y = 72
const SMD_BODY_W = 60
const SMD_BODY_H = 30

/* Potentiometer — right */
const POT_CENTRE_X = 420
const POT_CENTRE_Y = 68
const POT_RADIUS = 26

/* Label row baseline */
const LABEL_BASELINE_Y = 140

/* ── Physical colours for the resistor bands ──────────────────────── */
// Match the worked-example bands in the chapter: red / violet / orange / gold.
const BAND_RED = '#c41e3a'
const BAND_VIOLET = '#6a3d9a'
const BAND_ORANGE = '#e87722'
const BAND_GOLD = '#c9a833'
const BODY_BEIGE = '#e8d9b8'

/* Potentiometer ceramic body — the signature blue of Arduino-set
 * trimmers (Bourns 3362P and similar). Opacity is tuned so the blue
 * reads as a soft pastel on light backgrounds (blends around
 * rgb(167, 199, 251) on white) and as a legible medium navy on
 * dark backgrounds (blends around rgb(27, 62, 117) on near-black).
 * The hand-drawn outline stays in `currentColor` so it still
 * follows the theme. */
const POT_CERAMIC_BLUE = '#3b82f6'

/* ── Axial resistor strokes ──────────────────────────────────────── */

function axialStrokes(seed: number): RoughPath[] {
  const bodyX = AX_CENTRE_X - AX_BODY_W / 2
  const bodyY = AX_CENTRE_Y - AX_BODY_H / 2
  // Rough body edges; ends drawn as small bulges via a path.
  const bodyRect = roughRect(bodyX, bodyY, AX_BODY_W, AX_BODY_H, {
    seed, strokeWidth: 1.2, roughness: 0.7,
  })
  // Leads
  const leftLead = roughLine(
    bodyX - AX_LEAD_LEN, AX_CENTRE_Y,
    bodyX, AX_CENTRE_Y,
    { seed: seed + 1, strokeWidth: 1.4 },
  )
  const rightLead = roughLine(
    bodyX + AX_BODY_W, AX_CENTRE_Y,
    bodyX + AX_BODY_W + AX_LEAD_LEN, AX_CENTRE_Y,
    { seed: seed + 2, strokeWidth: 1.4 },
  )
  return [...bodyRect, ...leftLead, ...rightLead]
}

/** Coloured bands on the axial body. Uses plain SVG rects (not rough.js)
 *  because the bands should read as solid paint, not pencil strokes. */
function AxialBands() {
  const bodyX = AX_CENTRE_X - AX_BODY_W / 2
  const bodyY = AX_CENTRE_Y - AX_BODY_H / 2
  // 4 bands: three in the digit group on the left, tolerance band
  // slightly separated on the right. Widths and gaps tuned so the
  // bands group visually.
  const BAND_W = 7
  const digitGroupStart = bodyX + 18
  const digitGap = 10
  const tolX = bodyX + AX_BODY_W - 20
  return (
    <g>
      <rect x={digitGroupStart + 0 * (BAND_W + digitGap)} y={bodyY} width={BAND_W} height={AX_BODY_H} fill={BAND_RED} />
      <rect x={digitGroupStart + 1 * (BAND_W + digitGap)} y={bodyY} width={BAND_W} height={AX_BODY_H} fill={BAND_VIOLET} />
      <rect x={digitGroupStart + 2 * (BAND_W + digitGap)} y={bodyY} width={BAND_W} height={AX_BODY_H} fill={BAND_ORANGE} />
      <rect x={tolX} y={bodyY} width={BAND_W} height={AX_BODY_H} fill={BAND_GOLD} />
    </g>
  )
}

/* ── SMD chip strokes ────────────────────────────────────────────── */

function smdStrokes(seed: number): RoughPath[] {
  const x = SMD_CENTRE_X - SMD_BODY_W / 2
  const y = SMD_CENTRE_Y - SMD_BODY_H / 2
  const body = roughRect(x, y, SMD_BODY_W, SMD_BODY_H, {
    seed, strokeWidth: 1.2, roughness: 0.6,
  })
  // End-caps — thin metallised strips on each short side
  const CAP_W = 6
  const leftCap = roughRect(x, y, CAP_W, SMD_BODY_H, {
    seed: seed + 1, strokeWidth: 0.9, roughness: 0.5,
  })
  const rightCap = roughRect(x + SMD_BODY_W - CAP_W, y, CAP_W, SMD_BODY_H, {
    seed: seed + 2, strokeWidth: 0.9, roughness: 0.5,
  })
  return [...body, ...leftCap, ...rightCap]
}

/* ── Potentiometer strokes ───────────────────────────────────────── */

function potStrokes(seed: number): RoughPath[] {
  const body = roughCircle(POT_CENTRE_X, POT_CENTRE_Y, POT_RADIUS * 2, {
    seed, strokeWidth: 1.3, roughness: 0.7,
  })
  // Shaft coming out the top — short vertical line + small shaft tip
  const shaft = roughLine(
    POT_CENTRE_X, POT_CENTRE_Y - POT_RADIUS,
    POT_CENTRE_X, POT_CENTRE_Y - POT_RADIUS - 14,
    { seed: seed + 1, strokeWidth: 1.4 },
  )
  // Shaft indicator line — the little mark on top that shows the
  // knob's current angle
  const shaftMark = roughLine(
    POT_CENTRE_X - 4, POT_CENTRE_Y - POT_RADIUS - 14,
    POT_CENTRE_X + 4, POT_CENTRE_Y - POT_RADIUS - 14,
    { seed: seed + 2, strokeWidth: 1.4 },
  )
  // Three pins coming out the bottom — the two ends of the resistive
  // track plus the wiper
  const pinY = POT_CENTRE_Y + POT_RADIUS
  const pin1 = roughLine(POT_CENTRE_X - 14, pinY, POT_CENTRE_X - 14, pinY + 10, { seed: seed + 3 })
  const pin2 = roughLine(POT_CENTRE_X,      pinY, POT_CENTRE_X,      pinY + 10, { seed: seed + 4 })
  const pin3 = roughLine(POT_CENTRE_X + 14, pinY, POT_CENTRE_X + 14, pinY + 10, { seed: seed + 5 })
  // Small dimple / wiper mark near the top-right edge of the circle
  // (the arrow on a schematic symbol's wiper) — optional flourish
  const wiper = roughPath(
    `M ${POT_CENTRE_X + 8} ${POT_CENTRE_Y - 10} L ${POT_CENTRE_X + 16} ${POT_CENTRE_Y - 14}`,
    { seed: seed + 6, strokeWidth: 0.9, roughness: 0.5 },
  )
  return [...body, ...shaft, ...shaftMark, ...pin1, ...pin2, ...pin3, ...wiper]
}

export default function Ch1_4Hero() {
  const { t } = useTranslation('ui')

  const strokes = useMemo(
    () => ({
      axial: axialStrokes(30),
      smd: smdStrokes(50),
      pot: potStrokes(70),
    }),
    [],
  )

  return (
    <svg
      width="540"
      height="190"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      aria-label={t('ch1_4.heroAriaLabel')}
      role="img"
    >
      {/* ── AXIAL RESISTOR ──────────────────────────────────────── */}
      {/* Body fill sits under the rough outline so the beige shows
          through the sketchy edges without covering them. */}
      <rect
        x={AX_CENTRE_X - AX_BODY_W / 2}
        y={AX_CENTRE_Y - AX_BODY_H / 2}
        width={AX_BODY_W}
        height={AX_BODY_H}
        rx={6}
        fill={BODY_BEIGE}
        opacity={0.75}
      />
      <RoughPaths paths={strokes.axial} />
      <AxialBands />

      <text
        x={AX_CENTRE_X} y={LABEL_BASELINE_Y}
        fontFamily="inherit" fontSize="0.812em" fontStyle="italic" fontWeight="700"
        fill="currentColor" textAnchor="middle"
      >
        {t('ch1_4.heroThroughHole')}
      </text>

      {/* ── SMD CHIP ────────────────────────────────────────────── */}
      <rect
        x={SMD_CENTRE_X - SMD_BODY_W / 2}
        y={SMD_CENTRE_Y - SMD_BODY_H / 2}
        width={SMD_BODY_W}
        height={SMD_BODY_H}
        rx={2}
        fill="#1a1a1a"
      />
      <RoughPaths paths={strokes.smd} />
      {/* Printed value — "472" = 4.7 kΩ in SMD coding */}
      <text
        x={SMD_CENTRE_X} y={SMD_CENTRE_Y + 5}
        fontFamily="Menlo, Consolas, monospace" fontSize="0.75em" fontWeight="700"
        fill="#f0e6d0" textAnchor="middle"
        style={{ letterSpacing: '0.05em' }}
      >
        472
      </text>

      <text
        x={SMD_CENTRE_X} y={LABEL_BASELINE_Y}
        fontFamily="inherit" fontSize="0.812em" fontStyle="italic" fontWeight="700"
        fill="currentColor" textAnchor="middle"
      >
        {t('ch1_4.heroSMT')}
      </text>

      {/* ── POTENTIOMETER ──────────────────────────────────────── */}
      {/* Ceramic blue fill sits behind the rough outline — conveys the
          "Arduino trimmer" identity without fighting the sketch aesthetic. */}
      <circle
        cx={POT_CENTRE_X} cy={POT_CENTRE_Y} r={POT_RADIUS}
        fill={POT_CERAMIC_BLUE}
        opacity={0.45}
      />
      <RoughPaths paths={strokes.pot} />

      <text
        x={POT_CENTRE_X} y={LABEL_BASELINE_Y}
        fontFamily="inherit" fontSize="0.812em" fontStyle="italic" fontWeight="700"
        fill="currentColor" textAnchor="middle"
      >
        {t('ch1_4.heroPot')}
      </text>
    </svg>
  )
}
