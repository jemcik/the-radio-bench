/**
 * Chapter 1.6 hero — air-core inductor cross-section with magnetic
 * field loops.
 *
 * What the reader sees:
 *
 *   1. A horizontal cylindrical coil (drawn as a row of arcs/bumps —
 *      the IEC inductor symbol scaled up). The coil is the "active"
 *      element; current flows through its leads.
 *   2. Magnetic field lines (B) threading through the centre of the
 *      coil and curving back around the outside, forming closed
 *      loops above and below — the inductor's defining picture, the
 *      dual of the capacitor's electric-field arrows. Field labelled
 *      "B" in the centre of the coil where the lines are densest.
 *   3. Two leads exiting left and right, with a current arrow on the
 *      left lead labelled "I" — establishes the direction of current
 *      flow that creates the field.
 *   4. Labels — "n turns" pointing at the coil, "core (air)" inside it.
 *
 * The picture builds physical intuition before any formula: the
 * energy lives in the magnetic field, not in the wire.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughPath,
  roughEllipse,
} from '@/lib/rough'

const VB_W = 540
const VB_H = 240

/* Coil geometry */
const COIL_CX = VB_W / 2
const COIL_CY = 120
const TURN_COUNT = 9
const TURN_W = 22
const TURN_H = 14
const COIL_W = TURN_COUNT * TURN_W
const COIL_LEFT = COIL_CX - COIL_W / 2

/* Lead geometry */
const LEAD_LEN = 50
const LEAD_Y = COIL_CY + TURN_H * 1.2 // dropped below the coil cross-section axis

/* Field-loop geometry — three nested loops above the coil and three
 * mirrored below, all sharing the same horizontal centre. */
const LOOP_RADII_X = [40, 70, 100]
const LOOP_RADII_Y = [50, 75, 105]

/* ── Coil strokes ────────────────────────────────────────────────── */

function coilStrokes(seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  // Each turn is an ellipse drawn end-to-end along the coil's length.
  // Drawn as ellipses to suggest the cross-section view (perspective).
  for (let i = 0; i < TURN_COUNT; i++) {
    const cx = COIL_LEFT + i * TURN_W + TURN_W / 2
    paths.push(...roughEllipse(cx, COIL_CY, TURN_W, TURN_H * 2.2, {
      seed: seed + i,
      strokeWidth: 1.3,
      roughness: 0.5,
      stroke: 'currentColor',
    }))
  }
  return paths
}

/* ── Lead strokes ────────────────────────────────────────────────── */

function leadStrokes(seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  // Left lead exits the LEFT side of the coil at the bottom-back of the
  // first turn, runs left and slightly down, ending with a current arrow.
  paths.push(...roughLine(
    COIL_LEFT, LEAD_Y,
    COIL_LEFT - LEAD_LEN, LEAD_Y,
    { seed, strokeWidth: 1.4 },
  ))
  // Right lead — exits the RIGHT side, runs right.
  paths.push(...roughLine(
    COIL_LEFT + COIL_W, LEAD_Y,
    COIL_LEFT + COIL_W + LEAD_LEN, LEAD_Y,
    { seed: seed + 1, strokeWidth: 1.4 },
  ))
  return paths
}

/* ── Field-loop strokes ──────────────────────────────────────────── */

/**
 * Draw three nested closed magnetic-field loops. Each loop is the full
 * dipole-pattern oval that threads through the centre of the coil and
 * curves back around the outside — the standard "magnetic field of a
 * solenoid" picture. Drawn as ellipses centred on the coil.
 */
function fieldLoopStrokes(seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  for (let i = 0; i < LOOP_RADII_X.length; i++) {
    const rx = LOOP_RADII_X[i]
    const ry = LOOP_RADII_Y[i]
    paths.push(...roughEllipse(COIL_CX, COIL_CY, rx * 2, ry * 2, {
      seed: seed + i * 7,
      strokeWidth: 0.9,
      roughness: 0.7,
      stroke: 'currentColor',
    }))
  }
  return paths
}

/* ── Current arrow on the left lead ──────────────────────────────── */

function currentArrowStrokes(seed: number): RoughPath[] {
  // Triangle arrow on the left lead pointing INTO the coil (rightward).
  const tipX = COIL_LEFT - 14
  const baseX = tipX - 6
  const d = `M ${baseX} ${LEAD_Y - 4} L ${tipX} ${LEAD_Y} L ${baseX} ${LEAD_Y + 4}`
  return roughPath(d, { seed, strokeWidth: 1.2, roughness: 0.4 })
}

export default function Ch1_6Hero() {
  const { t } = useTranslation('ui')

  const strokes = useMemo(
    () => ({
      field: fieldLoopStrokes(101),
      coil: coilStrokes(211),
      leads: leadStrokes(311),
      currentArrow: currentArrowStrokes(411),
    }),
    [],
  )

  return (
    <svg
      width="540"
      height="240"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      aria-label={t('ch1_6.heroAriaLabel')}
      role="img"
    >
      {/* ── FIELD LOOPS (drawn behind everything) ────────────────── */}
      <g opacity={0.45}>
        <RoughPaths paths={strokes.field} />
      </g>

      {/* ── COIL TURNS ────────────────────────────────────────────── */}
      <RoughPaths paths={strokes.coil} />

      {/* ── LEADS ────────────────────────────────────────────────── */}
      <RoughPaths paths={strokes.leads} />

      {/* ── CURRENT ARROW + LABEL ────────────────────────────────── */}
      <RoughPaths paths={strokes.currentArrow} />
      <text
        x={COIL_LEFT - LEAD_LEN - 8}
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

      {/* ── B-FIELD LABEL (in the centre of the coil where the
          field lines are densest) ─────────────────────────────── */}
      <text
        x={COIL_CX}
        y={COIL_CY - TURN_H * 0.2}
        fontFamily="Georgia, serif"
        fontSize="1.05em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.85}
      >
        {t('ch1_6.heroFieldLabel')}
      </text>

      {/* ── "core (air)" label below the B label ─────────────────── */}
      <text
        x={COIL_CX}
        y={COIL_CY + TURN_H * 1.5}
        fontFamily="Georgia, serif"
        fontSize="0.7em"
        fontStyle="italic"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.55}
      >
        {t('ch1_6.heroCoreLabel')}
      </text>

      {/* ── "n turns" label above the coil ───────────────────────── */}
      <text
        x={COIL_CX}
        y={COIL_CY - TURN_H * 2.6 - 4}
        fontFamily="Georgia, serif"
        fontSize="0.78em"
        fontStyle="italic"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.75}
      >
        {t('ch1_6.heroTurnsLabel')}
      </text>

      {/* ── Caption equation under the figure ────────────────────── */}
      <text
        x={VB_W / 2}
        y={VB_H - 10}
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
