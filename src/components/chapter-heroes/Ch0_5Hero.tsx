/**
 * Chapter 0.5 hero — a schematic sheet and pencil. The circuit on the
 * sheet is a deliberate miniature of the chapter's walkthrough example:
 * battery → current-limiting resistor → LED → back. The pencil evokes
 * "you'll be reading these by hand very soon".
 *
 * Drawn with Rough.js for the hand-sketched aesthetic. Every stroke path
 * renders with `stroke="currentColor"` so the sketch inherits the page's
 * `--sketch-stroke` token and adapts to every theme.
 */
import { useMemo } from 'react'
import { RoughPaths, roughLine, roughPath, roughRect } from '@/lib/rough'

export default function Ch0_5Hero() {
  const desk = useMemo(() => ({
    line: roughLine(20, 118, 400, 118, { seed: 1, strokeWidth: 1.1 }),
    hatches: [[30, 60], [70, 100], [110, 140], [150, 180], [190, 220],
              [230, 260], [270, 300], [310, 340], [350, 380]]
      .map(([x1, x2], i) =>
        roughLine(x1, 122, x2, 135, { seed: 10 + i, strokeWidth: 0.6, roughness: 0.5 })),
  }), [])

  // Sheet (tilted -3°). Local coordinates.
  const sheet = useMemo(() => ({
    outline: roughRect(0, 0, 240, 78, { seed: 20, strokeWidth: 1.1 }),
    ruling: [14, 28, 42, 56, 70].map((y, i) =>
      roughLine(0, y, 240, y, { seed: 30 + i, strokeWidth: 0.4, roughness: 0.3 })),
    topWire: roughLine(42, 28, 70, 28, { seed: 40, strokeWidth: 1.1 }),
    resistor: roughPath(
      'M 70 28 l 3 -5 l 6 10 l 6 -10 l 6 10 l 6 -10 l 3 5',
      { seed: 41, strokeWidth: 1.1 },
    ),
    midWire: roughLine(100, 28, 130, 28, { seed: 42, strokeWidth: 1.1 }),
    ledTri: roughPath(
      'M 130 22 L 130 34 L 142 28 Z',
      { seed: 43, strokeWidth: 1.1 },
    ),
    ledBar: roughLine(142, 22, 142, 34, { seed: 44, strokeWidth: 1.1 }),
    ledArrow1: roughLine(136, 18, 146, 12, { seed: 45, strokeWidth: 0.8, roughness: 0.4 }),
    ledArrow1Head: roughPath('M 143 12 L 146 12 L 146 15', { seed: 46, strokeWidth: 0.8, roughness: 0.4 }),
    ledArrow2: roughLine(140, 16, 150, 10, { seed: 47, strokeWidth: 0.8, roughness: 0.4 }),
    ledArrow2Head: roughPath('M 147 10 L 150 10 L 150 13', { seed: 48, strokeWidth: 0.8, roughness: 0.4 }),
    rightWire: roughLine(142, 28, 160, 28, { seed: 49, strokeWidth: 1.1 }),
    rightDown: roughLine(160, 28, 160, 58, { seed: 50, strokeWidth: 1.1 }),
    bottomWire: roughLine(160, 58, 42, 58, { seed: 51, strokeWidth: 1.1 }),
    leftUp: roughLine(42, 28, 42, 48, { seed: 52, strokeWidth: 1.1 }),
    batStem: roughLine(42, 48, 42, 58, { seed: 53, strokeWidth: 1.1 }),
    batLong: roughLine(36, 48, 48, 48, { seed: 54, strokeWidth: 1.4 }),
    batShort: roughLine(38, 53, 46, 53, { seed: 55, strokeWidth: 1.1 }),
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
      <RoughPaths paths={desk.line} />
      <g opacity={0.45}>
        {desk.hatches.map((h, i) => <RoughPaths key={i} paths={h} />)}
      </g>

      {/* Schematic sheet */}
      <g transform="translate(60, 34) rotate(-3)">
        <RoughPaths paths={sheet.outline} />
        <g opacity={0.4}>
          {sheet.ruling.map((r, i) => <RoughPaths key={i} paths={r} />)}
        </g>

        {/* Circuit */}
        <RoughPaths paths={sheet.topWire} />
        <RoughPaths paths={sheet.resistor} />
        <RoughPaths paths={sheet.midWire} />
        <RoughPaths paths={sheet.ledTri} />
        <RoughPaths paths={sheet.ledBar} />
        <RoughPaths paths={sheet.ledArrow1} />
        <RoughPaths paths={sheet.ledArrow1Head} />
        <RoughPaths paths={sheet.ledArrow2} />
        <RoughPaths paths={sheet.ledArrow2Head} />
        <RoughPaths paths={sheet.rightWire} />
        <RoughPaths paths={sheet.rightDown} />
        <RoughPaths paths={sheet.bottomWire} />
        <RoughPaths paths={sheet.leftUp} />
        <RoughPaths paths={sheet.batStem} />
        <RoughPaths paths={sheet.batLong} />
        <RoughPaths paths={sheet.batShort} />

        {/* Reference designators */}
        <text x="85"  y="18" fontFamily="Georgia, serif" fontStyle="italic" fontSize={8}
              fill="currentColor" textAnchor="middle">R₁</text>
        <text x="136" y="45" fontFamily="Georgia, serif" fontStyle="italic" fontSize={8}
              fill="currentColor" textAnchor="middle">D₁</text>
        <text x="28"  y="55" fontFamily="Georgia, serif" fontStyle="italic" fontSize={8}
              fill="currentColor" textAnchor="middle">B₁</text>

        <text x="220" y="10" fontFamily="Georgia, serif" fontStyle="italic" fontSize={7.5}
              fill="currentColor" textAnchor="end" opacity={0.75}>
          Fig. 0.5
        </text>
      </g>

      {/* Pencil */}
      <g transform="translate(340, 96) rotate(-38)">
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
