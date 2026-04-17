/**
 * Chapter 1.1 hero — the water-pipe analogy made visual.
 *
 * Two parallel horizontal tubes stacked vertically:
 *  - Top: a water pipe with droplets inside
 *  - Bottom: a copper wire with electrons inside
 *
 * Each tube has the same structure — arrow indicator on the left
 * (pressure / voltage applied from outside), dots inside showing what
 * flows, dangling right end (cut-away — we're viewing one section of
 * a longer system), a material label above (ВОДА / МІДЬ) and a
 * direction label below (течія / дрейф).
 *
 * The whole point is visual parallelism: the reader opens the chapter,
 * sees "Voltage is pressure. Current is flow." in prose, and the hero
 * image above already says the same thing — two tubes, same shape,
 * same dots, same arrow, only the labels differ.
 *
 * Drawn with Rough.js for the hand-sketched aesthetic. Every stroke
 * path renders with `stroke="currentColor"` so the sketch inherits the
 * page's `--sketch-stroke` token and adapts to every theme.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  roughLine,
  roughLinearPath,
} from '@/lib/rough'

/** Geometry — shared between water row (y0) and copper row (y0). */
const TUBE_X_START = 100
const TUBE_X_END = 370
const TUBE_X_RIGHT_OUT = 395
const TUBE_HEIGHT = 20

/** y-offsets for each row's top edge. */
const WATER_TOP_Y = 22
const COPPER_TOP_Y = 101

/** Helper — build one tube's stroke set (top, bottom, caps, right dangle). */
function tubeStrokes(topY: number, seed: number) {
  const botY = topY + TUBE_HEIGHT
  const midY = topY + TUBE_HEIGHT / 2
  return {
    top: roughLine(TUBE_X_START, topY, TUBE_X_END, topY, { seed: seed + 0, strokeWidth: 1.4 }),
    bot: roughLine(TUBE_X_START, botY, TUBE_X_END, botY, { seed: seed + 1, strokeWidth: 1.4 }),
    leftCap: roughLine(TUBE_X_START, topY, TUBE_X_START, botY, { seed: seed + 2 }),
    rightCap: roughLine(TUBE_X_END, topY, TUBE_X_END, botY, { seed: seed + 3 }),
    rightOut: roughLine(TUBE_X_END, midY, TUBE_X_RIGHT_OUT, midY, { seed: seed + 4, roughness: 0.4 }),
  }
}

/** Helper — build a small "applied from left" arrow (shaft + wedge head). */
function leftArrow(midY: number, seed: number) {
  return {
    shaft: roughLine(55, midY, 85, midY, { seed: seed + 0 }),
    head: roughLinearPath(
      [[80, midY - 4], [85, midY], [80, midY + 4]],
      { seed: seed + 1 },
    ),
  }
}

/** Helper — build the "flow / drift" arrow that sits below a tube. */
function belowArrow(midX: number, y: number, seed: number) {
  return {
    shaft: roughLine(midX - 25, y, midX + 25, y, { seed: seed + 0, strokeWidth: 0.9, roughness: 0.3 }),
    head: roughLinearPath(
      [[midX + 19, y - 3], [midX + 25, y], [midX + 19, y + 3]],
      { seed: seed + 1, strokeWidth: 0.9, roughness: 0.3 },
    ),
  }
}

/** Helper — build a row of metallic sheen strokes inside a tube. */
function sheenStrokes(topY: number, seedBase: number) {
  const topSheenY = topY + 5
  const botSheenY = topY + 16
  const pairs: [number, number, number, number][] = [
    [118, topSheenY, 130, topSheenY],
    [160, topSheenY, 172, topSheenY],
    [220, topSheenY, 232, topSheenY],
    [280, topSheenY, 292, topSheenY],
    [340, topSheenY, 352, topSheenY],
    [140, botSheenY, 152, botSheenY],
    [200, botSheenY, 212, botSheenY],
    [260, botSheenY, 272, botSheenY],
    [320, botSheenY, 332, botSheenY],
  ]
  return pairs.map(([x1, y1, x2, y2], i) =>
    roughLine(x1, y1, x2, y2, { seed: seedBase + i, strokeWidth: 0.5, roughness: 0.4 }))
}

export default function Ch1_1Hero() {
  const { t } = useTranslation('ui')

  const s = useMemo(() => {
    const waterMidY = WATER_TOP_Y + TUBE_HEIGHT / 2
    const copperMidY = COPPER_TOP_Y + TUBE_HEIGHT / 2
    return {
      water: tubeStrokes(WATER_TOP_Y, 30),
      copper: tubeStrokes(COPPER_TOP_Y, 70),
      pressureArrow: leftArrow(waterMidY, 40),
      voltageArrow: leftArrow(copperMidY, 80),
      flowArrow: belowArrow(235, WATER_TOP_Y + TUBE_HEIGHT + 16, 50),
      driftArrow: belowArrow(235, COPPER_TOP_Y + TUBE_HEIGHT + 16, 90),
      waterSheen: sheenStrokes(WATER_TOP_Y, 100),
      copperSheen: sheenStrokes(COPPER_TOP_Y, 130),
    }
  }, [])

  const waterMidY = WATER_TOP_Y + TUBE_HEIGHT / 2
  const copperMidY = COPPER_TOP_Y + TUBE_HEIGHT / 2

  return (
    <svg
      width="540"
      height="212"
      viewBox="0 0 420 165"
      fill="none"
      aria-hidden
    >
      {/* ─── Water row (top) ──────────────────────────── */}
      {/* Material label above */}
      <text x="235" y="14" fontFamily="Georgia, serif"
            fontSize="8.5" fill="currentColor" textAnchor="middle"
            letterSpacing="4" opacity={0.7}>{t('ch1_1.heroWaterLabel')}</text>

      {/* Pipe body */}
      <RoughPaths paths={s.water.top} />
      <RoughPaths paths={s.water.bot} />
      <RoughPaths paths={s.water.leftCap} />
      <RoughPaths paths={s.water.rightCap} />
      <RoughPaths paths={s.water.rightOut} opacity={0.55} />

      {/* Pressure arrow on the left */}
      <RoughPaths paths={s.pressureArrow.shaft} />
      <RoughPaths paths={s.pressureArrow.head} />
      <text x="70" y="50" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="8" fill="currentColor" textAnchor="middle"
            opacity={0.7}>{t('ch1_1.heroPressureLabel')}</text>

      {/* Metallic / water sheen strokes */}
      <g opacity={0.35}>
        {s.waterSheen.map((ss, i) => <RoughPaths key={i} paths={ss} />)}
      </g>

      {/* Water droplets — identical dot style as electrons below to
          reinforce the visual analogy */}
      <circle cx="140" cy={waterMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <circle cx="205" cy={waterMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <circle cx="270" cy={waterMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <circle cx="335" cy={waterMidY} r="3.5" fill="currentColor" opacity={0.85} />

      {/* Flow arrow below water pipe */}
      <g opacity={0.55}>
        <RoughPaths paths={s.flowArrow.shaft} />
        <RoughPaths paths={s.flowArrow.head} />
      </g>
      <text x="235" y="72" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="8" fill="currentColor" textAnchor="middle"
            opacity={0.65}>{t('ch1_1.heroFlowLabel')}</text>

      {/* ─── Copper row (bottom) ──────────────────────── */}
      {/* Material label above */}
      <text x="235" y="93" fontFamily="Georgia, serif"
            fontSize="8.5" fill="currentColor" textAnchor="middle"
            letterSpacing="4" opacity={0.7}>{t('ch1_1.heroCopperLabel')}</text>

      {/* Wire body */}
      <RoughPaths paths={s.copper.top} />
      <RoughPaths paths={s.copper.bot} />
      <RoughPaths paths={s.copper.leftCap} />
      <RoughPaths paths={s.copper.rightCap} />
      <RoughPaths paths={s.copper.rightOut} opacity={0.55} />

      {/* Voltage arrow on the left */}
      <RoughPaths paths={s.voltageArrow.shaft} />
      <RoughPaths paths={s.voltageArrow.head} />
      <text x="70" y="129" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="8" fill="currentColor" textAnchor="middle"
            opacity={0.7}>{t('ch1_1.heroVoltageLabel')}</text>

      {/* Copper sheen strokes */}
      <g opacity={0.35}>
        {s.copperSheen.map((ss, i) => <RoughPaths key={i} paths={ss} />)}
      </g>

      {/* Electrons — same dot style as water droplets above to reinforce
          the visual analogy. Small "e⁻" label on one of them so the
          reader can anchor the symbol. */}
      <circle cx="140" cy={copperMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <text x="140" y="96" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="7.5" fill="currentColor" textAnchor="middle"
            opacity={0.75}>e⁻</text>
      <circle cx="205" cy={copperMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <circle cx="270" cy={copperMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <circle cx="335" cy={copperMidY} r="3.5" fill="currentColor" opacity={0.85} />

      {/* Drift arrow below copper wire */}
      <g opacity={0.55}>
        <RoughPaths paths={s.driftArrow.shaft} />
        <RoughPaths paths={s.driftArrow.head} />
      </g>
      <text x="235" y="151" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="8" fill="currentColor" textAnchor="middle"
            opacity={0.65}>{t('ch1_1.heroDriftLabel')}</text>
    </svg>
  )
}
