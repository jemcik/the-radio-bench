/**
 * Chapter 0.1 hero — an open book with a magnifying glass hovering over a
 * small circuit diagram on the right-hand page. "Reader exploring the text."
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
} from '@/lib/rough'

export default function Ch0_1Hero() {
  const s = useMemo(() => ({
    desk: roughLine(20, 118, 400, 118, { seed: 1, strokeWidth: 1.1 }),
    hatches: [[30, 60], [70, 100], [110, 140], [150, 180], [190, 220],
              [230, 260], [270, 300], [310, 340], [350, 380]]
      .map(([x1, x2], i) =>
        roughLine(x1, 122, x2, 135, { seed: 10 + i, strokeWidth: 0.6, roughness: 0.5 })),
    leftPage: roughPath(
      'M 90 108 L 90 54 Q 90 48, 98 46 L 200 42 Q 212 42, 212 54 L 212 108 Z',
      { seed: 20 },
    ),
    rightPage: roughPath(
      'M 212 108 L 212 54 Q 212 42, 224 42 L 326 46 Q 334 48, 334 54 L 334 108 Z',
      { seed: 21 },
    ),
    binding: roughLine(212, 42, 212, 108, { seed: 22 }),
    pageLines: [
      [104, 60, 200, 58], [104, 68, 200, 66], [104, 76, 200, 74],
      [104, 84, 170, 82], [104, 92, 190, 90], [104, 100, 150, 98],
    ].map(([x1, y1, x2, y2], i) =>
      roughLine(x1, y1, x2, y2, {
        seed: 30 + i, strokeWidth: 0.55, roughness: 0.4,
      })),
    schemWireL: roughLine(232, 72, 248, 72, { seed: 40, strokeWidth: 0.9 }),
    schemResistor: roughPath(
      'M 248 72 l 3 -5 l 6 10 l 6 -10 l 6 10 l 6 -10 l 3 5',
      { seed: 41, strokeWidth: 0.9 },
    ),
    schemWireR: roughLine(278, 72, 298, 72, { seed: 42, strokeWidth: 0.9 }),
    schemWave: roughPath(
      'M 232 92 Q 246 78, 260 92 T 288 92 T 316 92',
      { seed: 43, strokeWidth: 0.9 },
    ),
    magGlass: roughCircle(298, 76, 44, { seed: 50, strokeWidth: 1.4 }),
    magHandle: roughLine(314, 92, 342, 118, { seed: 51, strokeWidth: 1.4 }),
    magGrip1: roughLine(328, 104, 336, 112, { seed: 52, strokeWidth: 1.6 }),
    magGrip2: roughLine(322, 98, 330, 106, { seed: 53, strokeWidth: 1.6 }),
    glassHighlight: roughPath(
      'M 282 66 A 16 16 0 0 1 296 58',
      { seed: 54, strokeWidth: 0.6, roughness: 0.4 },
    ),
  }), [])

  return (
    <svg
      width="540" height="180" viewBox="0 0 420 140"
      fill="none"
      aria-hidden
    >
      <RoughPaths paths={s.desk} />
      <g opacity={0.45}>
        {s.hatches.map((h, i) => <RoughPaths key={i} paths={h} />)}
      </g>

      {/* Book */}
      <RoughPaths paths={s.leftPage} />
      <RoughPaths paths={s.rightPage} />
      <RoughPaths paths={s.binding} />

      {/* Page lines */}
      <g opacity={0.65}>
        {s.pageLines.map((l, i) => <RoughPaths key={i} paths={l} />)}
      </g>

      {/* Schematic on the right page */}
      <RoughPaths paths={s.schemWireL} />
      <RoughPaths paths={s.schemResistor} />
      <RoughPaths paths={s.schemWireR} />
      <RoughPaths paths={s.schemWave} />

      {/* Magnifier */}
      <RoughPaths paths={s.magGlass} />
      <RoughPaths paths={s.magHandle} />
      <RoughPaths paths={s.magGrip1} />
      <RoughPaths paths={s.magGrip2} />
      <RoughPaths paths={s.glassHighlight} opacity={0.55} />
    </svg>
  )
}
