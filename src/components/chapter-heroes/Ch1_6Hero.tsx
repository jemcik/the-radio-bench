/**
 * Chapter 1.6 hero — air-core inductor side view, dual of the Ch1.5
 * parallel-plate hero.
 *
 * What the reader sees, top-to-bottom:
 *
 *   1. A row of "bumps" along the top — the visible front of each wire
 *      wrap, the universally-recognised side view of a solenoid coil.
 *   2. A long horizontal cylinder body underneath — the air core of the
 *      coil, drawn as a soft-tinted rectangle.
 *   3. Inside the core, a row of horizontal field arrows pointing right
 *      — the B field along the solenoid's axis, the dual of Ch1.5's
 *      vertical E-field arrows between the plates. The middle arrow is
 *      omitted so the italic "B" label can sit cleanly in the centre.
 *   4. Two leads exit the top-left and top-right corners of the core
 *      (where the wire wraps begin and end). The left lead carries an
 *      "I" label with a current arrow showing direction.
 *   5. Caption equation V = L · dI/dt under the figure.
 *
 * No "n turns" / "core (air)" callouts — they cluttered the picture and
 * the chapter prose introduces those terms anyway. The hero's job is to
 * make "wire wrapped around a space → field inside" instantly readable.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughPath,
  roughRect,
} from '@/lib/rough'

/* ── Layout ────────────────────────────────────────────────────────── */
const VB_W = 540
const VB_H = 220

/* Air-core cylinder body — centred horizontally */
const CORE_W = 280
const CORE_H = 60
const CORE_X = (VB_W - CORE_W) / 2          // 130
const CORE_TOP = 70
const CORE_BOT = CORE_TOP + CORE_H          // 130
const CORE_CY = CORE_TOP + CORE_H / 2       // 100
const CORE_RIGHT = CORE_X + CORE_W          // 410
const CORE_CX = CORE_X + CORE_W / 2         // 270

/* Wire-wrap bumps along the top edge of the core */
const TURN_COUNT = 9
const TURN_W = CORE_W / TURN_COUNT          // ~31.1
const BUMP_H = 14

/* Leads — exit at the top-left and top-right corners of the core, where
 * the wire-wrap baseline lives. */
const LEAD_LEN = 70
const LEAD_Y = CORE_TOP

/* Core tint — same teal-leaning neutral as the dielectric in Ch1.5 */
const CORE_FILL = '#4a9dbd'

/* ── Coil-bumps path (single continuous spring silhouette) ─────────── */

function bumpsPath(): string {
  let d = `M ${CORE_X} ${CORE_TOP}`
  for (let i = 0; i < TURN_COUNT; i++) {
    d += ` a ${TURN_W / 2} ${BUMP_H} 0 0 1 ${TURN_W} 0`
  }
  return d
}

/* ── Lead strokes ──────────────────────────────────────────────────── */

function leadStrokes(seed: number): RoughPath[] {
  const left = roughLine(
    CORE_X, LEAD_Y,
    CORE_X - LEAD_LEN, LEAD_Y,
    { seed, strokeWidth: 1.4 },
  )
  const right = roughLine(
    CORE_RIGHT, LEAD_Y,
    CORE_RIGHT + LEAD_LEN, LEAD_Y,
    { seed: seed + 1, strokeWidth: 1.4 },
  )
  return [...left, ...right]
}

/* ── Field arrows inside the core (horizontal, pointing right) ─────── */

/**
 * Five horizontal arrows stacked top-to-bottom inside the core, evenly
 * spaced. The middle row is skipped so the italic "B" label can sit
 * cleanly in the centre. Mirror of Ch1_5's vertical E-field arrows.
 */
function fieldArrows(seed: number): RoughPath[] {
  const arrows: RoughPath[] = []
  const ARROW_COUNT = 5
  const Y_MARGIN = 8
  const yStart = CORE_TOP + Y_MARGIN
  const yEnd = CORE_BOT - Y_MARGIN
  const ySpacing = (yEnd - yStart) / (ARROW_COUNT - 1)
  const tipX = CORE_RIGHT - 10
  const baseX = CORE_X + 10
  for (let i = 0; i < ARROW_COUNT; i++) {
    if (i === Math.floor(ARROW_COUNT / 2)) continue   // skip middle for B label
    const y = yStart + i * ySpacing
    const d = `M ${baseX} ${y} L ${tipX - 7} ${y} M ${tipX - 7} ${y - 3.5} L ${tipX} ${y} L ${tipX - 7} ${y + 3.5}`
    arrows.push(...roughPath(d, { seed: seed + i, strokeWidth: 1.1, roughness: 0.5 }))
  }
  return arrows
}

/* ── Current arrow on the left lead (triangle, points right) ───────── */

function currentArrowStrokes(seed: number): RoughPath[] {
  const tipX = CORE_X - 14
  const baseX = tipX - 7
  const d = `M ${baseX} ${LEAD_Y - 4} L ${tipX} ${LEAD_Y} L ${baseX} ${LEAD_Y + 4}`
  return roughPath(d, { seed, strokeWidth: 1.2, roughness: 0.4 })
}

export default function Ch1_6Hero() {
  const { t } = useTranslation('ui')

  const strokes = useMemo(
    () => ({
      core: roughRect(CORE_X, CORE_TOP, CORE_W, CORE_H, {
        seed: 23, strokeWidth: 0.9, roughness: 0.8,
      }),
      bumps: roughPath(bumpsPath(), {
        seed: 211, strokeWidth: 1.6, roughness: 0.7, stroke: 'currentColor',
      }),
      leads: leadStrokes(311),
      field: fieldArrows(411),
      currentArrow: currentArrowStrokes(511),
    }),
    [],
  )

  return (
    <svg
      width="540"
      height="220"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      aria-label={t('ch1_6.heroAriaLabel')}
      role="img"
    >
      {/* ── CORE TINT (drawn first, so bumps and leads overlay it) ── */}
      <rect
        x={CORE_X} y={CORE_TOP}
        width={CORE_W} height={CORE_H}
        fill={CORE_FILL}
        opacity={0.18}
      />
      <RoughPaths paths={strokes.core} opacity={0.55} />

      {/* ── FIELD ARROWS (inside the core) ─────────────────────────── */}
      <g opacity={0.7}>
        <RoughPaths paths={strokes.field} />
      </g>
      {/* B label in the centre of the core */}
      <text
        x={CORE_CX}
        y={CORE_CY + 5}
        fontFamily="Georgia, serif"
        fontSize="0.95em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.85}
      >
        {t('ch1_6.heroFieldLabel')}
      </text>

      {/* ── COIL BUMPS along the top edge of the core ──────────────── */}
      <RoughPaths paths={strokes.bumps} />

      {/* ── LEADS ──────────────────────────────────────────────────── */}
      <RoughPaths paths={strokes.leads} />

      {/* ── CURRENT ARROW + LABEL on the left lead ─────────────────── */}
      <RoughPaths paths={strokes.currentArrow} />
      <text
        x={CORE_X - LEAD_LEN - 10}
        y={LEAD_Y + 5}
        fontFamily="Georgia, serif"
        fontSize="1.1em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
      >
        {t('ch1_6.heroCurrentLabel')}
      </text>

      {/* ── Caption equation under the figure ──────────────────────── */}
      <text
        x={VB_W / 2}
        y={VB_H - 14}
        fontFamily="Georgia, serif"
        fontSize="0.812em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.7}
      >
        V = L · dI/dt
      </text>
    </svg>
  )
}
