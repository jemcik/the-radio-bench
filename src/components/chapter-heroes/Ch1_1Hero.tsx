/**
 * Chapter 1.1 hero — the water-pipe analogy made visual.
 *
 * Two parallel horizontal tubes stacked vertically:
 *  - Top: a water pipe with sine-wave strokes inside (liquid flowing)
 *  - Bottom: a copper wire with discrete electron dots inside
 *
 * Each tube has the same structure — arrow indicator on the left
 * (pressure / voltage applied from outside), material label above
 * (ВОДА / МІДЬ), direction label below (течія / дрейф), and closed
 * rectangular caps on both ends (no trailing stub — the sketch reads
 * as a self-contained fragment rather than a broken conduit).
 *
 * The visual distinction between the two rows is deliberate: water is
 * a continuous medium, so it gets wavy lines. Current is made of
 * discrete charge carriers, so the copper row gets dots. Same overall
 * silhouette and supporting labels drive the analogy, the internal
 * pattern differentiates what's flowing.
 *
 * Drawn with Rough.js for the hand-sketched aesthetic. Every stroke
 * path renders with `stroke="currentColor"` so the sketch inherits the
 * page's `--sketch-stroke` token and adapts to every theme.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughLinearPath,
  roughPath,
} from '@/lib/rough'

/** Geometry — shared between water row (y0) and copper row (y0). */
const TUBE_X_START = 100
const TUBE_X_END = 370
const TUBE_HEIGHT = 20

/** y-offsets for each row's top edge. Compact layout keeps the two rows
 *  close enough to be parsed as one composed analogy, but with enough
 *  breathing room between them that the reader's eye doesn't merge them
 *  into one visual object. */
const WATER_TOP_Y = 18
const COPPER_TOP_Y = 94

/** Build one tube's stroke set (top, bottom, left + right caps). */
function tubeStrokes(topY: number, seed: number) {
  const botY = topY + TUBE_HEIGHT
  return {
    top: roughLine(TUBE_X_START, topY, TUBE_X_END, topY, { seed: seed + 0, strokeWidth: 1.4 }),
    bot: roughLine(TUBE_X_START, botY, TUBE_X_END, botY, { seed: seed + 1, strokeWidth: 1.4 }),
    leftCap: roughLine(TUBE_X_START, topY, TUBE_X_START, botY, { seed: seed + 2 }),
    rightCap: roughLine(TUBE_X_END, topY, TUBE_X_END, botY, { seed: seed + 3 }),
  }
}

/**
 * Build a sine-like wavy stroke across the water pipe's interior. The
 * quadratic-+-smooth-T path alternates up/down wavelets each 10 units
 * wide — enough to read as "water flowing" even at small scale.
 */
function waterWave(y: number, seed: number, amplitude = 1.8): RoughPath[] {
  const xStart = 115
  const xEnd = 355
  let d = `M ${xStart} ${y} Q ${xStart + 5} ${y - amplitude} ${xStart + 10} ${y}`
  for (let x = xStart + 20; x <= xEnd; x += 10) {
    d += ` T ${x} ${y}`
  }
  return roughPath(d, { seed, strokeWidth: 0.9, roughness: 0.6, bowing: 0.3 })
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
      // Two sine-wave strokes inside the water pipe at slight y-offsets —
      // reads as "water flowing" (continuous medium) vs "electrons" (discrete
      // dots in the copper row). The waves replace the dots/sheen that used
      // to live here; dots-as-water was confusing.
      waterWaveTop: waterWave(waterMidY - 3, 100),
      waterWaveBot: waterWave(waterMidY + 3, 101),
      copperSheen: sheenStrokes(COPPER_TOP_Y, 130),
    }
  }, [])

  const copperMidY = COPPER_TOP_Y + TUBE_HEIGHT / 2

  return (
    <svg
      width="540"
      height="190"
      viewBox="0 0 420 148"
      fill="none"
      aria-hidden
    >
      {/* ─── Water row (top) ──────────────────────────── */}
      {/* Material label above — y=12 so the top padding inside the SVG
          matches the bottom padding (drift label baseline at y=136,
          viewBox bottom at y=140, gives 4 units each side, symmetric). */}
      <text x="235" y="12" fontFamily="Georgia, serif"
            fontSize="0.531em" fill="currentColor" textAnchor="middle"
            letterSpacing="4" opacity={0.7}>{t('ch1_1.heroWaterLabel')}</text>

      {/* Pipe body */}
      <RoughPaths paths={s.water.top} />
      <RoughPaths paths={s.water.bot} />
      <RoughPaths paths={s.water.leftCap} />
      <RoughPaths paths={s.water.rightCap} />

      {/* Pressure arrow on the left */}
      <RoughPaths paths={s.pressureArrow.shaft} />
      <RoughPaths paths={s.pressureArrow.head} />
      <text x="70" y="46" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="0.5em" fill="currentColor" textAnchor="middle"
            opacity={0.7}>{t('ch1_1.heroPressureLabel')}</text>

      {/* Sine-wave water strokes — two parallel waves at slight y-offsets
          so the reader instantly reads "liquid flowing" instead of
          "particles in a wire". */}
      <g opacity={0.6}>
        <RoughPaths paths={s.waterWaveTop} />
        <RoughPaths paths={s.waterWaveBot} />
      </g>

      {/* Flow arrow below water pipe */}
      <g opacity={0.55}>
        <RoughPaths paths={s.flowArrow.shaft} />
        <RoughPaths paths={s.flowArrow.head} />
      </g>
      <text x="235" y="66" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="0.5em" fill="currentColor" textAnchor="middle"
            opacity={0.65}>{t('ch1_1.heroFlowLabel')}</text>

      {/* ─── Copper row (bottom) ──────────────────────── */}
      {/* Material label above */}
      <text x="235" y="88" fontFamily="Georgia, serif"
            fontSize="0.531em" fill="currentColor" textAnchor="middle"
            letterSpacing="4" opacity={0.7}>{t('ch1_1.heroCopperLabel')}</text>

      {/* Wire body */}
      <RoughPaths paths={s.copper.top} />
      <RoughPaths paths={s.copper.bot} />
      <RoughPaths paths={s.copper.leftCap} />
      <RoughPaths paths={s.copper.rightCap} />

      {/* Voltage arrow on the left */}
      <RoughPaths paths={s.voltageArrow.shaft} />
      <RoughPaths paths={s.voltageArrow.head} />
      <text x="70" y="122" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="0.5em" fill="currentColor" textAnchor="middle"
            opacity={0.7}>{t('ch1_1.heroVoltageLabel')}</text>

      {/* Copper sheen strokes */}
      <g opacity={0.35}>
        {s.copperSheen.map((ss, i) => <RoughPaths key={i} paths={ss} />)}
      </g>

      {/* Electrons — same dot style as water droplets above to reinforce
          the visual analogy. Small "e⁻" label on one of them so the
          reader can anchor the symbol. */}
      <circle cx="140" cy={copperMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <text x="140" y="91" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="0.468em" fill="currentColor" textAnchor="middle"
            opacity={0.75}>e⁻</text>
      <circle cx="205" cy={copperMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <circle cx="270" cy={copperMidY} r="3.5" fill="currentColor" opacity={0.85} />
      <circle cx="335" cy={copperMidY} r="3.5" fill="currentColor" opacity={0.85} />

      {/* Drift arrow below copper wire */}
      <g opacity={0.55}>
        <RoughPaths paths={s.driftArrow.shaft} />
        <RoughPaths paths={s.driftArrow.head} />
      </g>
      <text x="235" y="144" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="0.5em" fill="currentColor" textAnchor="middle"
            opacity={0.65}>{t('ch1_1.heroDriftLabel')}</text>
    </svg>
  )
}
