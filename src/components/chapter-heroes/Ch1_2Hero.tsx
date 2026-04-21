/**
 * Chapter 1.2 hero — the water-and-wheel analogy made visual.
 *
 * Continues the water metaphor introduced in Chapter 1.1's hero (where a
 * water pipe sat alongside a copper wire), and adds the missing piece:
 * what the flow actually DOES at the far end. Three structures:
 *
 *  1. Tank on the left (open top, water surface visible) — the source
 *     of pressure. Bears the math glyph V (voltage).
 *  2. Pipe across the middle, water flowing through it (sine waves) —
 *     bears the math glyph I (current). Water exits the pipe's open
 *     end horizontally.
 *  3. Paddle wheel sits below the pipe, so the horizontal jet falls in
 *     a gravitational parabola (no up-phase — starts horizontal, only
 *     gravity acts), arcs over the wheel's near rim, and lands on the
 *     far side. A curved arrow shows the resulting clockwise spin;
 *     the whole construct bears the math glyph P (power).
 *
 * Each structure is also captioned in italic Georgia at the top
 * (`напруга / voltage`, `струм / current`, `потужність / power`) — the
 * same atmospheric-label convention used in Ch1_1Hero.
 *
 * Drawn with Rough.js for the hand-sketched aesthetic; every stroke
 * inherits `currentColor` from the chapter's theme token, so the hero
 * works in light and dark modes without recolouring.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughLinearPath,
  roughCircle,
  roughPath,
} from '@/lib/rough'

// ─── Geometry ─────────────────────────────────────────────────────────
// viewBox 420 × 148, displayed at 540 × 190 (≈1.286× scale, matching
// Ch1_1Hero so this hero reads as a sibling of the previous chapter's).
const TANK_X = 35
const TANK_W = 50
const TANK_TOP_Y = 24
const TANK_BOT_Y = 92
const TANK_WATER_Y = 34   // y of water surface inside the tank

const PIPE_X_START = TANK_X + TANK_W       // 85
const PIPE_X_END = 275
// Pipe sits in the upper-middle of the tank so its horizontal jet has
// enough altitude above the wheel top (y=93) to arc visibly over the
// wheel before landing on the far rim.
const PIPE_TOP_Y = 56
const PIPE_BOT_Y = 70
const PIPE_MID_Y = (PIPE_TOP_Y + PIPE_BOT_Y) / 2  // 63

const WHEEL_CX = 320
const WHEEL_CY = 115
const WHEEL_R = 22

// Water-jet landing point: upper-far rim of the wheel (angle ≈ −39°
// from east). With pipe exit at y=63 and landing at (337, 101), the
// gravitational parabola passes through y≈83 at the wheel's centre x,
// clearing the wheel top (y=93) by ~10 units — enough to read as
// arcing OVER the wheel, not grazing it.
const ARC_LAND_X = 337
const ARC_LAND_Y = 101

// Label width budget (worst case Ukrainian, ~7.5 px per char @ 8.5 viewBox sans):
//   "напруга"      7 chars × 7.5 ≈ 52 px → centered at x=60  spans 34..86   (tank x=35..85, fits)
//   "струм"        5 chars × 7.5 ≈ 38 px → centered at x=180 spans 161..199 (pipe x=85..275, fits)
//   "потужність"  10 chars × 7.5 ≈ 75 px → centered at x=320 spans 283..358 (overflows wheel x=298..342, fine for atmosphere)

function tankStrokes(seed: number) {
  return {
    left: roughLine(TANK_X, TANK_TOP_Y, TANK_X, TANK_BOT_Y, { seed: seed + 0, strokeWidth: 1.4 }),
    right: roughLine(TANK_X + TANK_W, TANK_TOP_Y, TANK_X + TANK_W, TANK_BOT_Y, { seed: seed + 1, strokeWidth: 1.4 }),
    bottom: roughLine(TANK_X, TANK_BOT_Y, TANK_X + TANK_W, TANK_BOT_Y, { seed: seed + 2, strokeWidth: 1.4 }),
    // Top is open — we see the water surface, suggesting an open
    // reservoir (gravity is the "pressure" mechanism).
    surface: waterWave(TANK_WATER_Y, TANK_X + 4, TANK_X + TANK_W - 4, seed + 3, 1.5),
  }
}

function waterWave(y: number, xStart: number, xEnd: number, seed: number, amplitude = 1.6): RoughPath[] {
  let d = `M ${xStart} ${y} Q ${xStart + 5} ${y - amplitude} ${xStart + 10} ${y}`
  for (let x = xStart + 20; x <= xEnd; x += 10) {
    d += ` T ${x} ${y}`
  }
  return roughPath(d, { seed, strokeWidth: 0.9, roughness: 0.6, bowing: 0.3 })
}

function pipeStrokes(seed: number) {
  return {
    top: roughLine(PIPE_X_START, PIPE_TOP_Y, PIPE_X_END, PIPE_TOP_Y, { seed: seed + 0, strokeWidth: 1.4 }),
    bot: roughLine(PIPE_X_START, PIPE_BOT_Y, PIPE_X_END, PIPE_BOT_Y, { seed: seed + 1, strokeWidth: 1.4 }),
    // Sine-wave flow inside the pipe — same idiom as the tank's water
    // surface so the reader instantly reads "fluid".
    flow: waterWave(PIPE_MID_Y, PIPE_X_START + 6, PIPE_X_END - 4, seed + 2, 1.2),
  }
}

function arcStrokes(seed: number) {
  // Gravitational parabola: water leaves horizontally, falls under
  // gravity only. The trajectory is y(x) = y0 + k·(x − x0)².
  // Drawn as a quadratic Bezier M P0 Q C P1 with control C =
  // ((x0+x1)/2, y0). With that control, x(t) is linear in t and
  // y(t) = y0 + t²·(y1 − y0) — an exact parabola in screen space. The
  // starting tangent is horizontal (B'(0) ∝ C − P0, which has zero y),
  // so there's no unphysical up-phase.
  const cx = (PIPE_X_END + ARC_LAND_X) / 2
  return roughPath(
    `M ${PIPE_X_END} ${PIPE_MID_Y} Q ${cx} ${PIPE_MID_Y} ${ARC_LAND_X} ${ARC_LAND_Y}`,
    { seed: seed + 0, strokeWidth: 1.3, roughness: 0.55, bowing: 0.4 },
  )
}

function wheelStrokes(seed: number) {
  const rim = roughCircle(WHEEL_CX, WHEEL_CY, WHEEL_R * 2, { seed: seed + 0, strokeWidth: 1.4 })
  // Eight paddles, each a radial line from centre to (just inside the)
  // rim. Per-paddle seed offset so adjacent paddles don't read as a
  // perfectly clean star.
  const paddles: RoughPath[][] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI
    const x2 = WHEEL_CX + (WHEEL_R - 1) * Math.cos(angle)
    const y2 = WHEEL_CY + (WHEEL_R - 1) * Math.sin(angle)
    paddles.push(
      roughLine(WHEEL_CX, WHEEL_CY, x2, y2, { seed: seed + 10 + i, strokeWidth: 1.0, roughness: 0.5 }),
    )
  }
  return { rim, paddles }
}

function rotationArrow(seed: number) {
  // Curved arrow above the wheel, sweeping clockwise to show the
  // direction the cascading water spins it.
  const cx = WHEEL_CX
  const cy = WHEEL_CY
  const r = WHEEL_R + 7
  const startX = cx - r + 6
  const startY = cy - r + 4
  const endX = cx + r - 2
  const endY = cy - r + 8
  const arc = roughPath(
    `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`,
    { seed: seed + 0, strokeWidth: 0.9, roughness: 0.5 },
  )
  // Arrowhead at end pointing tangent-down (continuing the spin).
  const head = roughLinearPath(
    [[endX - 4, endY - 3], [endX, endY], [endX - 2, endY + 5]],
    { seed: seed + 1, strokeWidth: 0.9, roughness: 0.4 },
  )
  return { arc, head }
}

export default function Ch1_2Hero() {
  const { t } = useTranslation('ui')

  const s = useMemo(
    () => ({
      tank: tankStrokes(20),
      pipe: pipeStrokes(40),
      arc: arcStrokes(60),
      wheel: wheelStrokes(80),
      rotation: rotationArrow(110),
    }),
    [],
  )

  return (
    <svg
      width="540"
      height="190"
      viewBox="0 0 420 148"
      fill="none"
      aria-hidden
    >
      {/* ─── TANK (voltage / pressure source) ─────────────────────── */}
      <text
        x={TANK_X + TANK_W / 2}
        y={14}
        fontFamily="Georgia, serif"
        fontSize="0.531em"
        fontStyle="italic"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.7}
      >
        {t('ch1_2.heroTankLabel')}
      </text>
      <RoughPaths paths={s.tank.left} />
      <RoughPaths paths={s.tank.right} />
      <RoughPaths paths={s.tank.bottom} />
      <g opacity={0.6}>
        <RoughPaths paths={s.tank.surface} />
      </g>
      {/* Big italic V glyph centred inside the tank. fontSize=13 weight 700
          renders ~17 px on screen at the 1.286× display scale — the
          hero-glyph anchor size from the diagram-quality skill. */}
      <text
        x={TANK_X + TANK_W / 2}
        y={68}
        fontFamily="Georgia, serif"
        fontSize="0.812em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
      >
        V
      </text>

      {/* ─── PIPE (current flow) ──────────────────────────────────── */}
      <text
        x={(PIPE_X_START + PIPE_X_END) / 2}
        y={48}
        fontFamily="Georgia, serif"
        fontSize="0.531em"
        fontStyle="italic"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.7}
      >
        {t('ch1_2.heroPipeLabel')}
      </text>
      <RoughPaths paths={s.pipe.top} />
      <RoughPaths paths={s.pipe.bot} />
      <g opacity={0.6}>
        <RoughPaths paths={s.pipe.flow} />
      </g>
      {/* I glyph below the pipe midpoint, in the open space between the
          pipe and the wheel. */}
      <text
        x={(PIPE_X_START + PIPE_X_END) / 2}
        y={92}
        fontFamily="Georgia, serif"
        fontSize="0.812em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
      >
        I
      </text>

      {/* ─── WATER JET (gravitational parabola → wheel far rim) ───── */}
      <RoughPaths paths={s.arc} />
      <g opacity={0.7}>
        <circle cx={ARC_LAND_X + 1} cy={ARC_LAND_Y + 3} r={0.9} fill="currentColor" />
        <circle cx={ARC_LAND_X + 4} cy={ARC_LAND_Y + 1} r={0.7} fill="currentColor" />
        <circle cx={ARC_LAND_X - 2} cy={ARC_LAND_Y + 4} r={0.8} fill="currentColor" />
      </g>

      {/* ─── WHEEL (resistance / power dissipated) ────────────────── */}
      <text
        x={WHEEL_CX}
        y={48}
        fontFamily="Georgia, serif"
        fontSize="0.531em"
        fontStyle="italic"
        fill="currentColor"
        textAnchor="middle"
        opacity={0.7}
      >
        {t('ch1_2.heroWheelLabel')}
      </text>
      <RoughPaths paths={s.wheel.rim} />
      {s.wheel.paddles.map((p, i) => (
        <RoughPaths key={i} paths={p} />
      ))}
      {/* Solid axle dot — plain SVG circle since the rough wrapper
          doesn't fill. Same idiom used for electron dots in Ch1_1Hero. */}
      <circle cx={WHEEL_CX} cy={WHEEL_CY} r="2.5" fill="currentColor" opacity={0.85} />
      {/* Rotation arrow */}
      <g opacity={0.55}>
        <RoughPaths paths={s.rotation.arc} />
        <RoughPaths paths={s.rotation.head} />
      </g>
      {/* P glyph to the right of the wheel — the wheel interior is too
          busy with paddles for an inset glyph. */}
      <text
        x={WHEEL_CX + WHEEL_R + 8}
        y={WHEEL_CY + 4}
        fontFamily="Georgia, serif"
        fontSize="0.812em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
      >
        P
      </text>
    </svg>
  )
}
