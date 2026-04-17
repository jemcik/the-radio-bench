/**
 * Chapter 0.2 hero — a workbench holding a multimeter, an oscilloscope
 * (with sine-wave trace), and a breadboard with a jumper wire arching over.
 *
 * Drawn with Rough.js for the hand-sketched aesthetic. Every stroke path
 * renders with `stroke="currentColor"` so the sketch inherits the page's
 * `--sketch-stroke` token and adapts to every theme.
 */
import { useMemo } from 'react'
import {
  RoughPaths,
  roughCircle,
  roughLine,
  roughPath,
  roughRect,
} from '@/lib/rough'

export default function Ch0_2Hero() {
  const s = useMemo(() => ({
    bench: roughLine(20, 110, 400, 110, { seed: 1, strokeWidth: 1.1 }),
    benchShadow: roughLine(40, 116, 380, 116, { seed: 2, strokeWidth: 0.8, roughness: 0.4 }),
    hatches: [[30, 60], [70, 100], [110, 140], [150, 180], [190, 220],
              [230, 260], [270, 300], [310, 340], [350, 380]]
      .map(([x1, x2], i) =>
        roughLine(x1, 118, x2, 132, { seed: 10 + i, strokeWidth: 0.6, roughness: 0.5 })),

    // Multimeter
    mmBody: roughRect(50, 58, 90, 52, { seed: 20 }),
    mmDisplay: roughRect(62, 64, 66, 10, { seed: 21, strokeWidth: 0.9 }),
    mmDial: roughCircle(95, 90, 20, { seed: 22, strokeWidth: 1 }),
    mmDialPointer: roughLine(95, 90, 102, 83, { seed: 23, strokeWidth: 0.9 }),
    mmProbeL: roughCircle(72, 104, 5, { seed: 24, strokeWidth: 0.9 }),
    mmProbeR: roughCircle(118, 104, 5, { seed: 25, strokeWidth: 0.9 }),

    // Oscilloscope
    oscBody: roughRect(160, 42, 130, 68, { seed: 30 }),
    oscScreen: roughRect(168, 52, 86, 48, { seed: 31, strokeWidth: 0.9 }),
    oscTrace: roughPath(
      'M 172 76 Q 183 58, 193 76 T 213 76 T 233 76 T 253 76',
      { seed: 32, strokeWidth: 1 },
    ),
    oscGraticule: [
      roughLine(189, 56, 189, 96, { seed: 33, strokeWidth: 0.5, roughness: 0.3 }),
      roughLine(211, 56, 211, 96, { seed: 34, strokeWidth: 0.5, roughness: 0.3 }),
      roughLine(233, 56, 233, 96, { seed: 35, strokeWidth: 0.5, roughness: 0.3 }),
      roughLine(168, 76, 254, 76, { seed: 36, strokeWidth: 0.5, roughness: 0.3 }),
    ],
    oscKnobs: [
      roughCircle(267, 62, 8, { seed: 40, strokeWidth: 0.9 }),
      roughCircle(279, 62, 8, { seed: 41, strokeWidth: 0.9 }),
      roughCircle(267, 78, 8, { seed: 42, strokeWidth: 0.9 }),
      roughCircle(279, 78, 8, { seed: 43, strokeWidth: 0.9 }),
    ],

    // Breadboard
    bbBody: roughRect(305, 78, 80, 32, { seed: 50 }),
    bbRows: [86, 92, 98, 104].map((y, i) =>
      roughLine(310, y, 380, y, {
        seed: 51 + i, strokeWidth: 0.5, roughness: 0.3,
      })),
    bbJumper: roughPath(
      'M 318 78 C 330 50, 360 50, 372 78',
      { seed: 60, strokeWidth: 1 },
    ),
  }), [])

  return (
    <svg
      width="540" height="180" viewBox="0 0 420 140"
      fill="none"
      aria-hidden
    >
      <RoughPaths paths={s.bench} />
      <RoughPaths paths={s.benchShadow} opacity={0.6} />
      <g opacity={0.45}>
        {s.hatches.map((h, i) => <RoughPaths key={i} paths={h} />)}
      </g>

      {/* Multimeter */}
      <RoughPaths paths={s.mmBody} />
      <RoughPaths paths={s.mmDisplay} />
      <RoughPaths paths={s.mmDial} />
      <RoughPaths paths={s.mmDialPointer} />
      <RoughPaths paths={s.mmProbeL} />
      <RoughPaths paths={s.mmProbeR} />

      {/* Oscilloscope */}
      <RoughPaths paths={s.oscBody} />
      <RoughPaths paths={s.oscScreen} />
      <RoughPaths paths={s.oscTrace} />
      <g opacity={0.5}>
        {s.oscGraticule.map((g, i) => <RoughPaths key={i} paths={g} />)}
      </g>
      {s.oscKnobs.map((k, i) => <RoughPaths key={i} paths={k} />)}

      {/* Breadboard */}
      <RoughPaths paths={s.bbBody} />
      <g opacity={0.55}>
        {s.bbRows.map((r, i) => <RoughPaths key={i} paths={r} />)}
      </g>
      <RoughPaths paths={s.bbJumper} />
    </svg>
  )
}
