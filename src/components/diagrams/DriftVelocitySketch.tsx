import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import {
  RoughPaths,
  roughLine,
  roughLinearPath,
} from '@/lib/rough'

/**
 * Chapter 1.1 — Drift velocity sketch (Section 3: Current)
 *
 * Visual backbone for the chapter's hardest-to-grasp claim: that an
 * individual electron in a current-carrying wire is NOT marching along
 * at the speed of the signal. Thermally it is bouncing randomly at
 * ~10⁶ m/s between ion cores; the external field adds a tiny rightward
 * bias that, averaged over many carriers, amounts to a drift of
 * ~0.1 mm/s — many orders of magnitude slower than the thermal zigzag.
 *
 * LAYOUT RULES (consistent for both sub-visuals):
 *   label-block (title + subtitle, stacked) → visual below.
 *   Both label blocks are left-aligned at the same x so the two
 *   sections read as parallel sub-figures rather than a chaotic
 *   scatter of floating text.
 *
 * Sizing (per feedback_svg_font_minimum_on_screen): viewBox 620 × 240
 * rendered 1:1 — `maxWidth` equals the viewBox width, so there is no
 * CSS scaling. Every fontSize in source is the fontSize on screen.
 * Primary labels at 15; sub-labels at 13 (the project's floor).
 */
export default function DriftVelocitySketch() {
  const { t } = useTranslation('ui')

  // ── Geometry ────────────────────────────────────────────────────
  const W = 620
  const H = 240

  // Shared left-alignment line for both label blocks and both visuals.
  const alignX = 40

  // Thermal section: labels at top, wire below
  const thermalTitleY = 22
  const thermalSubY = 44
  const wireTop = 62
  const wireBot = 142
  const wireL = alignX
  const wireR = W - alignX

  // Drift section: labels first, arrow below
  const driftTitleY = 166
  const driftSubY = 188
  const arrowY = 212

  // Ion lattice: 3 rows × 9 columns inside the wire
  const ionRows = [wireTop + 16, (wireTop + wireBot) / 2, wireBot - 16]
  const ionCols = Array.from(
    { length: 9 },
    (_, i) => wireL + 20 + i * ((wireR - wireL - 40) / 8),
  )

  // Electron zigzag waypoints — cover the wire's full width with a
  // visibly random bounce pattern. Rough.js wobble on top does the
  // rest.
  const zigzag: [number, number][] = [
    [wireL + 8, (wireTop + wireBot) / 2],
    [wireL + 24, wireTop + 10],
    [wireL + 44, wireBot - 12],
    [wireL + 66, wireTop + 20],
    [wireL + 88, wireBot - 8],
    [wireL + 112, wireTop + 6],
    [wireL + 136, wireBot - 18],
    [wireL + 162, wireTop + 22],
    [wireL + 188, wireBot - 6],
    [wireL + 214, wireTop + 14],
    [wireL + 242, wireBot - 14],
    [wireL + 270, wireTop + 8],
    [wireL + 298, wireBot - 20],
    [wireL + 326, wireTop + 18],
    [wireL + 354, wireBot - 10],
    [wireL + 382, wireTop + 12],
    [wireL + 410, wireBot - 16],
    [wireL + 438, wireTop + 8],
    [wireL + 464, wireBot - 8],
    [wireL + 488, wireTop + 20],
    [wireL + 512, wireBot - 12],
    [wireL + 534, wireTop + 10],
  ]

  // ── Rough.js geometry ──────────────────────────────────────────
  const sketch = useMemo(() => ({
    wireTopLine: roughLine(wireL, wireTop, wireR, wireTop, {
      seed: 1, strokeWidth: 1.2, roughness: 0.5,
    }),
    wireBotLine: roughLine(wireL, wireBot, wireR, wireBot, {
      seed: 2, strokeWidth: 1.2, roughness: 0.5,
    }),
    wireCapL: roughLine(wireL, wireTop, wireL, wireBot, {
      seed: 3, strokeWidth: 1.1, roughness: 0.4,
    }),
    wireCapR: roughLine(wireR, wireTop, wireR, wireBot, {
      seed: 4, strokeWidth: 1.1, roughness: 0.4,
    }),
    // Zigzag keeps the "drawn by hand" wobble — it's deliberately
    // messy, that's the whole point.
    path: roughLinearPath(zigzag, {
      seed: 20, strokeWidth: 1.6, roughness: 0.9, bowing: 0.4,
    }),
    // The drift arrow is the OPPOSITE — the reader must see it as
    // cleanly horizontal. Roughness kept low (0.2) so the shaft
    // doesn't appear bent.
    driftShaft: roughLine(wireL + 10, arrowY, wireR - 16, arrowY, {
      seed: 30, strokeWidth: 1.5, roughness: 0.2, bowing: 0.2,
    }),
    driftHead: roughLinearPath([
      [wireR - 26, arrowY - 7],
      [wireR - 16, arrowY],
      [wireR - 26, arrowY + 7],
    ], { seed: 31, strokeWidth: 1.5, roughness: 0.15 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  return (
    <DiagramFigure caption={t('ch1_1.driftSketchCaption')}>
      <SVGDiagram
        width={W}
        height={H}
        aria-label={t('ch1_1.driftSketchAriaLabel')}
        style={{ maxWidth: W, margin: '0 auto' }}
      >
        {/* ═══ Thermal section ═════════════════════════════════ */}
        <text
          x={alignX} y={thermalTitleY}
          fontSize={15} fontWeight={700}
          fill={svgTokens.note}
        >
          {t('ch1_1.driftSketchThermalLabel')}
        </text>
        <text
          x={alignX} y={thermalSubY}
          fontSize={13} fill={svgTokens.mutedFg}
        >
          {t('ch1_1.driftSketchThermalSpeed')}
        </text>

        {/* Wire band fill */}
        <rect
          x={wireL + 1} y={wireTop + 1}
          width={wireR - wireL - 2} height={wireBot - wireTop - 2}
          fill="hsl(var(--primary) / 0.08)"
        />

        {/* Wire outline */}
        <g style={{ color: svgTokens.fg }}>
          <RoughPaths paths={sketch.wireTopLine} />
          <RoughPaths paths={sketch.wireBotLine} />
          <RoughPaths paths={sketch.wireCapL} />
          <RoughPaths paths={sketch.wireCapR} />
        </g>

        {/* Ion cores */}
        <g fill={svgTokens.mutedFg} opacity={0.5}>
          {ionRows.map((y) =>
            ionCols.map((x) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={3} />
            )),
          )}
        </g>

        {/* Electron zigzag */}
        <g style={{ color: svgTokens.note }}>
          <RoughPaths paths={sketch.path} />
        </g>
        {/* Electron head — dot at the end of the path */}
        <circle
          cx={zigzag[zigzag.length - 1][0]}
          cy={zigzag[zigzag.length - 1][1]}
          r={4}
          fill="hsl(var(--callout-note))"
        />

        {/* ═══ Drift section ═══════════════════════════════════ */}
        <text
          x={alignX} y={driftTitleY}
          fontSize={15} fontWeight={700}
          fill={svgTokens.caution}
        >
          {t('ch1_1.driftSketchDriftLabel')}
        </text>
        <text
          x={alignX} y={driftSubY}
          fontSize={13} fill={svgTokens.mutedFg}
        >
          {t('ch1_1.driftSketchDriftSpeed')}
        </text>

        {/* Drift arrow — horizontal, full wire width */}
        <g style={{ color: svgTokens.caution }}>
          <RoughPaths paths={sketch.driftShaft} />
          <RoughPaths paths={sketch.driftHead} />
        </g>
      </SVGDiagram>
    </DiagramFigure>
  )
}
