/**
 * Chapter 0.3 hero — an open notebook with hand-written equations beside a
 * slide rule and a sharpened pencil. The toolkit of pre-calculator maths.
 *
 * Drawn with Rough.js for the hand-sketched aesthetic. Every stroke path
 * renders with `stroke="currentColor"` so the sketch inherits the page's
 * `--sketch-stroke` token and adapts to every theme. Text glyphs (digits,
 * powers, µ) stay as plain SVG `<text>` so they read as ink glyphs.
 */
import { useMemo } from 'react'
import { RoughPaths, roughLine, roughPath, roughRect } from '@/lib/rough'

export default function Ch0_3Hero() {
  const s = useMemo(() => ({
    desk: roughLine(20, 118, 400, 118, { seed: 1, strokeWidth: 1.1 }),
    hatches: [[30, 60], [70, 100], [110, 140], [150, 180], [190, 220],
              [230, 260], [270, 300], [310, 340], [350, 380]]
      .map(([x1, x2], i) =>
        roughLine(x1, 122, x2, 135, { seed: 10 + i, strokeWidth: 0.6, roughness: 0.5 })),

    // Open notebook
    notebook: roughRect(30, 48, 140, 62, { seed: 20 }),
    notebookSpine: roughLine(100, 48, 100, 110, { seed: 21, strokeWidth: 0.7, roughness: 0.4 }),
    notebookLines: [
      [40, 58, 92, 58], [40, 66, 92, 66], [40, 74, 88, 74],
      [40, 82, 92, 82], [40, 90, 80, 90], [40, 98, 90, 98],
    ].map(([x1, y1, x2, y2], i) =>
      roughLine(x1, y1, x2, y2, { seed: 30 + i, strokeWidth: 0.55, roughness: 0.4 })),

    // Hand-written equations (symbols as Rough, values as text)
    eqZigzag1: roughPath(
      'M 108 62 l 6 -4 l 6 8 l 6 -8 l 6 8',
      { seed: 40, strokeWidth: 0.9 },
    ),
    eqZigzag2: roughPath(
      'M 108 78 l 4 -4 l 4 8 l 4 -8 l 4 8 l 4 -8',
      { seed: 41, strokeWidth: 0.9 },
    ),
    eqUnderline: roughLine(108, 94, 160, 94, { seed: 42, strokeWidth: 0.9 }),
  }), [])

  // Slide rule (tilted -8°)
  const slideRule = useMemo(() => ({
    frame: roughRect(-50, -10, 160, 20, { seed: 50 }),
    slider: roughRect(-50, -4, 160, 8, { seed: 51, strokeWidth: 0.9 }),
    topTicks: [-40, -20, 0, 20, 40, 60, 80, 100].map((x, i) =>
      roughLine(x, -10, x, -6, { seed: 60 + i, strokeWidth: 0.6, roughness: 0.4 })),
    botTicks: [-40, -20, 0, 20, 40, 60, 80, 100].map((x, i) =>
      roughLine(x, 10, x, 6, { seed: 70 + i, strokeWidth: 0.6, roughness: 0.4 })),
    cursor: roughRect(28, -14, 12, 28, { seed: 80, strokeWidth: 1.2 }),
    cursorLine: roughLine(34, -14, 34, 14, { seed: 81, strokeWidth: 0.6, roughness: 0.3 }),
  }), [])

  // Pencil (tilted -38°)
  const pencil = useMemo(() => ({
    body: roughRect(-40, -4, 70, 8, { seed: 90 }),
    tip: roughPath('M 30 -4 L 40 0 L 30 4 Z', { seed: 91, strokeWidth: 1.1 }),
    tipLine1: roughLine(36, -1, 40, 0, { seed: 92, strokeWidth: 0.7, roughness: 0.3 }),
    tipLine2: roughLine(36, 1, 40, 0, { seed: 93, strokeWidth: 0.7, roughness: 0.3 }),
    eraser: roughRect(-40, -4, 8, 8, { seed: 94, strokeWidth: 0.9 }),
    ferrule1: roughLine(-32, -4, -32, 4, { seed: 95, strokeWidth: 0.6, roughness: 0.3 }),
    ferrule2: roughLine(-30, -4, -30, 4, { seed: 96, strokeWidth: 0.6, roughness: 0.3 }),
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

      {/* Notebook */}
      <RoughPaths paths={s.notebook} />
      <RoughPaths paths={s.notebookSpine} opacity={0.55} />
      <g opacity={0.65}>
        {s.notebookLines.map((l, i) => <RoughPaths key={i} paths={l} />)}
      </g>

      {/* Hand-written equations */}
      <RoughPaths paths={s.eqZigzag1} />
      <text x="128" y="66" fontFamily="Georgia, serif" fontStyle="italic" fontSize={9}
            fill="currentColor">= 10³</text>
      <RoughPaths paths={s.eqZigzag2} />
      <text x="130" y="82" fontFamily="Georgia, serif" fontStyle="italic" fontSize={9}
            fill="currentColor">µ = 10⁻⁶</text>
      <RoughPaths paths={s.eqUnderline} />

      {/* Slide rule */}
      <g transform="translate(220, 62) rotate(-8)">
        <RoughPaths paths={slideRule.frame} />
        <RoughPaths paths={slideRule.slider} />
        {slideRule.topTicks.map((t, i) => <RoughPaths key={`t${i}`} paths={t} />)}
        {slideRule.botTicks.map((t, i) => <RoughPaths key={`b${i}`} paths={t} />)}
        <RoughPaths paths={slideRule.cursor} />
        <RoughPaths paths={slideRule.cursorLine} opacity={0.7} />
      </g>

      {/* Pencil */}
      <g transform="translate(350, 96) rotate(-38)">
        <RoughPaths paths={pencil.body} />
        <RoughPaths paths={pencil.tip} />
        <RoughPaths paths={pencil.tipLine1} />
        <RoughPaths paths={pencil.tipLine2} />
        <RoughPaths paths={pencil.eraser} />
        <RoughPaths paths={pencil.ferrule1} />
        <RoughPaths paths={pencil.ferrule2} />
      </g>
    </svg>
  )
}
