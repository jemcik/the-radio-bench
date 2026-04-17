import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import {
  RoughPaths,
  roughLine,
  roughLinearPath,
  roughRect,
} from '@/lib/rough'

/**
 * Chapter 1.1 — Water-pipe analogy illustration
 *
 * Renders the chapter's central mental model as a single picture:
 *   • Tank on the left sitting on a platform, filled with water
 *   • Horizontal pipe exiting the RIGHT WALL of the tank at the
 *     bottom (a hole in the tank wall where water flows into the pipe)
 *   • Narrow restriction midway along the pipe — RESISTANCE
 *   • Parabolic water stream pouring out the open end — CURRENT
 *
 * Three labels, coloured by CSS token so every theme renders cleanly:
 *   V — primary (amber)   — pressure (water level in the tank)
 *   R — caution (orange)  — narrow section
 *   I — note (blue)       — stream coming out
 *
 * SIZING: viewBox 540 × 240, rendered at maxWidth 540 (1:1 scale per
 * feedback_svg_font_minimum_on_screen). Every fontSize in the source
 * is the fontSize on screen — hero glyphs at 17, sub-labels at 13.
 *
 * STYLE: structural outlines (tank walls, pipe walls, platform, ground,
 * hatching) render through Rough.js at low roughness so the analogy
 * matches the hand-drawn aesthetic of the chapter hero. The water FILL
 * stays as a single smooth path (seam-free per earlier bug); the stream
 * parabola, droplets and text labels stay clean so the motion and
 * vocabulary read crisply. This is an analogy, not a blueprint.
 */
export default function WaterPipeDiagram() {
  const { t } = useTranslation('ui')

  const W = 540
  const H = 240

  // Tank ("water tower")
  const tankX = 48
  const tankY = 40
  const tankW = 120
  const tankH = 116
  const waterLevelY = 64 // higher fill → more "pressure"

  // Pipe — horizontal run exiting the tank's right wall near the bottom
  const pipeTopY = 126
  const pipeBottomY = 146
  const pipeEndX = 476

  // Restriction — narrow pinched section midway along the pipe,
  // labelled R. Pinch comes in 7 px from the outer pipe walls.
  const restrictStartX = 270
  const restrictEndX = 330
  const restrictInset = 7        // horizontal inset of restriction entry/exit ramp
  const restrictNarrow = 7       // vertical pinch from pipe walls
  const restrictTopY = pipeTopY + restrictNarrow
  const restrictBottomY = pipeBottomY - restrictNarrow

  // Platform / ground reference lines at the bottom
  const platformTopY = tankY + tankH       // 156
  const groundY = H - 16                   // 224

  // ── Rough.js geometry (memoised, stable seeds) ──────────────────────
  const sketch = useMemo(() => {
    const R = 0.55
    const TINY = 0.35

    return {
      ground: roughLine(16, groundY, W - 16, groundY, {
        seed: 1, strokeWidth: 1, roughness: R,
      }),
      groundHatches: [32, 80, 128, 176, 224, 272, 320, 368, 416, 464, 512]
        .map((x, i) =>
          roughLine(x, groundY + 2, x - 8, groundY + 10, {
            seed: 10 + i, strokeWidth: 0.7, roughness: TINY,
          })),

      platformOutline: roughRect(
        tankX - 5, platformTopY, tankW + 10, groundY - platformTopY,
        { seed: 30, strokeWidth: 1.2, roughness: R },
      ),
      platformHatches: [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
        roughLine(
          tankX - 5 + i * 18, platformTopY + 2,
          tankX - 5 + i * 18 - 8, groundY - 2,
          { seed: 40 + i, strokeWidth: 0.55, roughness: TINY },
        )),

      // Tank walls (left, bottom; right wall is combined with pipe below)
      tankLeft: roughLine(tankX, tankY, tankX, tankY + tankH, {
        seed: 50, strokeWidth: 1.3, roughness: R,
      }),
      tankBottom: roughLine(tankX, tankY + tankH, tankX + tankW, tankY + tankH, {
        seed: 51, strokeWidth: 1.3, roughness: R,
      }),
      tankLipL: roughLine(tankX - 3, tankY, tankX + 5, tankY, {
        seed: 52, strokeWidth: 1.3, roughness: R,
      }),
      tankLipR: roughLine(tankX + tankW - 5, tankY, tankX + tankW + 3, tankY, {
        seed: 53, strokeWidth: 1.3, roughness: R,
      }),

      // Pipe top (tank right wall upper + pipe top + restriction top)
      pipeTop: roughLinearPath([
        [tankX + tankW, tankY],
        [tankX + tankW, pipeTopY],
        [restrictStartX, pipeTopY],
        [restrictStartX + restrictInset, restrictTopY],
        [restrictEndX - restrictInset, restrictTopY],
        [restrictEndX, pipeTopY],
        [pipeEndX, pipeTopY],
      ], { seed: 60, strokeWidth: 1.3, roughness: R }),

      // Pipe bottom (tank right wall lower + pipe bottom + restriction bottom)
      pipeBottom: roughLinearPath([
        [tankX + tankW, tankY + tankH],
        [tankX + tankW, pipeBottomY],
        [restrictStartX, pipeBottomY],
        [restrictStartX + restrictInset, restrictBottomY],
        [restrictEndX - restrictInset, restrictBottomY],
        [restrictEndX, pipeBottomY],
        [pipeEndX, pipeBottomY],
      ], { seed: 61, strokeWidth: 1.3, roughness: R }),

      restrictOutline: roughRect(
        restrictStartX + restrictInset, restrictTopY,
        (restrictEndX - restrictInset) - (restrictStartX + restrictInset),
        restrictBottomY - restrictTopY,
        { seed: 70, strokeWidth: 1, roughness: 0.4 },
      ),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DiagramFigure caption={t('ch1_1.waterPipeCaption')}>
      <SVGDiagram
        width={W}
        height={H}
        aria-label={t('ch1_1.waterPipeAriaLabel')}
        style={{ maxWidth: W, margin: '0 auto' }}
      >
        {/* ── Platform fill (under everything) ─────────────────────── */}
        <defs>
          <clipPath id="waterpipe-platform-clip">
            <rect
              x={tankX - 5}
              y={platformTopY}
              width={tankW + 10}
              height={groundY - platformTopY}
            />
          </clipPath>
        </defs>
        <rect
          x={tankX - 5}
          y={platformTopY}
          width={tankW + 10}
          height={groundY - platformTopY}
          fill="hsl(var(--muted) / 0.5)"
        />
        <g
          style={{ color: 'hsl(var(--foreground))' }}
          clipPath="url(#waterpipe-platform-clip)"
          opacity={0.35}
        >
          {sketch.platformHatches.map((h, i) => <RoughPaths key={i} paths={h} />)}
        </g>
        <g style={{ color: 'hsl(var(--foreground))' }}>
          <RoughPaths paths={sketch.platformOutline} />
        </g>

        {/* ── Ground line + hatching ────────────────────────────── */}
        <g style={{ color: 'hsl(var(--border))' }}>
          <RoughPaths paths={sketch.ground} />
          <g opacity={0.4}>
            {sketch.groundHatches.map((h, i) => (
              <RoughPaths key={i} paths={h} />
            ))}
          </g>
        </g>

        {/* ── Tank walls ─────────────────────────────────────────── */}
        <g style={{ color: 'hsl(var(--foreground))' }}>
          <RoughPaths paths={sketch.tankLeft} />
          <RoughPaths paths={sketch.tankBottom} />
          <RoughPaths paths={sketch.tankLipL} />
          <RoughPaths paths={sketch.tankLipR} />
        </g>

        {/* ── Water fill — single continuous path (tank + pipe) ─── */}
        <path
          d={`
            M ${tankX + 1} ${waterLevelY}
            L ${tankX + tankW - 1} ${waterLevelY}
            L ${tankX + tankW - 1} ${pipeTopY + 1}
            L ${restrictStartX} ${pipeTopY + 1}
            L ${restrictStartX + restrictInset} ${restrictTopY + 1}
            L ${restrictEndX - restrictInset} ${restrictTopY + 1}
            L ${restrictEndX} ${pipeTopY + 1}
            L ${pipeEndX} ${pipeTopY + 1}
            L ${pipeEndX} ${pipeBottomY - 1}
            L ${restrictEndX} ${pipeBottomY - 1}
            L ${restrictEndX - restrictInset} ${restrictBottomY - 1}
            L ${restrictStartX + restrictInset} ${restrictBottomY - 1}
            L ${restrictStartX} ${pipeBottomY - 1}
            L ${tankX + tankW - 1} ${pipeBottomY - 1}
            L ${tankX + tankW - 1} ${tankY + tankH - 1}
            L ${tankX + 1} ${tankY + tankH - 1}
            Z
          `}
          fill="hsl(var(--primary) / 0.22)"
        />
        {/* Water surface line */}
        <line
          x1={tankX + 1} y1={waterLevelY}
          x2={tankX + tankW - 1} y2={waterLevelY}
          stroke={svgTokens.primary}
          strokeWidth={1.6}
        />

        {/* ── Pipe outlines ─────────────────────────────────────── */}
        <g style={{ color: 'hsl(var(--foreground))' }}>
          <RoughPaths paths={sketch.pipeTop} />
          <RoughPaths paths={sketch.pipeBottom} />
        </g>

        {/* ── Restriction band (fill + outline) ─────────────────── */}
        <rect
          x={restrictStartX + restrictInset}
          y={restrictTopY}
          width={(restrictEndX - restrictInset) - (restrictStartX + restrictInset)}
          height={restrictBottomY - restrictTopY}
          fill="hsl(var(--callout-caution) / 0.55)"
        />
        <g style={{ color: 'hsl(var(--callout-caution))' }}>
          <RoughPaths paths={sketch.restrictOutline} />
        </g>

        {/* Friction tick marks around the restriction */}
        <g stroke="hsl(var(--callout-caution))" strokeWidth={0.9} opacity={0.7}>
          {[0, 1, 2, 3].map(i => {
            const x = restrictStartX + 11 + i * 13
            return (
              <g key={i}>
                <line x1={x} y1={restrictTopY} x2={x + 3} y2={restrictTopY - 3} />
                <line x1={x} y1={restrictBottomY} x2={x + 3} y2={restrictBottomY + 3} />
              </g>
            )
          })}
        </g>

        {/* ── Water stream — parabolic trajectory (kept clean) ──── */}
        {(() => {
          const exitX = pipeEndX
          const exitTopY = pipeTopY + 2
          const exitBotY = pipeBottomY - 2
          const steps = 14
          // Land the stream on the ground at (exitX + arcLenX, groundY).
          // arcLenX = 48 keeps landing inside viewBox (476 + 48 = 524 < 540).
          const arcLenX = 48
          const botDropY = groundY - exitBotY        // bottom hits ground
          const topDropY = groundY - exitTopY - 3    // top lands 3 px above bottom
          // Contracting jet: top drops MORE than bottom so the 20-px
          // stream tapers to a ~3-px tip at ground level. Without it,
          // the stream closed into a flat horizontal "laser-cut" edge.
          const topPts: string[] = []
          const botPts: string[] = []
          for (let i = 0; i <= steps; i++) {
            const tt = i / steps
            const x = exitX + tt * arcLenX
            topPts.push(`${x.toFixed(1)},${(exitTopY + topDropY * tt * tt).toFixed(1)}`)
            botPts.push(`${x.toFixed(1)},${(exitBotY + botDropY * tt * tt).toFixed(1)}`)
          }
          const streamPath =
            'M ' + topPts.join(' L ') +
            ' L ' + botPts.reverse().join(' L ') +
            ' Z'
          return (
            <>
              <path
                d={streamPath}
                fill="hsl(var(--callout-note) / 0.40)"
                stroke="hsl(var(--callout-note))"
                strokeWidth={1.1}
                strokeLinejoin="round"
              />
              <polyline
                points={topPts.join(' ')}
                fill="none"
                stroke="hsl(var(--callout-note))"
                strokeWidth={0.8}
                opacity={0.7}
                strokeLinejoin="round"
              />
              {/* Splash droplets clustered around the landing point
                  at (exitX+48, exitBotY+botDropY) = (524, groundY). */}
              {[
                { x: 38, y: 72, r: 1.5 },
                { x: 44, y: 78, r: 1.3 },
                { x: 50, y: 74, r: 1   },
                { x: 56, y: 80, r: 1.2 },
                { x: 42, y: 84, r: 1.4 },
                { x: 58, y: 82, r: 0.9 },
              ].map((d, i) => (
                <circle
                  key={i}
                  cx={exitX + d.x}
                  cy={exitBotY + d.y}
                  r={d.r}
                  fill="hsl(var(--callout-note) / 0.55)"
                />
              ))}
            </>
          )
        })()}

        {/* ── Labels ────────────────────────────────────────────── *
             On-screen font sizes (1:1 scale):
               hero glyph V/R/I = 17    →  matches CLAUDE.md hero target
               sub-label         = 13    →  above the 11 px floor, preferred range
             Label-pair baselines are 18–20 viewBox apart so the stacked
             text never collides. */}

        {/* V (pressure) — above the tank */}
        <text
          x={tankX + tankW / 2}
          y={tankY - 22}
          textAnchor="middle"
          fontSize={17}
          fontWeight={700}
          fill={svgTokens.primary}
        >V</text>
        <text
          x={tankX + tankW / 2}
          y={tankY - 4}
          textAnchor="middle"
          fontSize={13}
          fill={svgTokens.mutedFg}
        >
          {t('ch1_1.waterPipeLabelVoltage')}
        </text>

        {/* R (resistance) — above the narrow pipe section */}
        <text
          x={(restrictStartX + restrictEndX) / 2}
          y={pipeTopY - 36}
          textAnchor="middle"
          fontSize={17}
          fontWeight={700}
          fill={svgTokens.caution}
        >R</text>
        <text
          x={(restrictStartX + restrictEndX) / 2}
          y={pipeTopY - 18}
          textAnchor="middle"
          fontSize={13}
          fill={svgTokens.mutedFg}
        >
          {t('ch1_1.waterPipeLabelResistance')}
        </text>
        <line
          x1={(restrictStartX + restrictEndX) / 2}
          y1={pipeTopY - 12}
          x2={(restrictStartX + restrictEndX) / 2}
          y2={restrictTopY - 2}
          stroke={svgTokens.caution}
          strokeWidth={1}
          strokeDasharray="2 2"
          opacity={0.7}
        />

        {/* I (current) — above the pipe near its exit */}
        <text
          x={pipeEndX - 12}
          y={pipeTopY - 22}
          textAnchor="middle"
          fontSize={17}
          fontWeight={700}
          fill={svgTokens.note}
        >I</text>
        <text
          x={pipeEndX - 12}
          y={pipeTopY - 4}
          textAnchor="middle"
          fontSize={13}
          fill={svgTokens.mutedFg}
        >
          {t('ch1_1.waterPipeLabelCurrent')}
        </text>
      </SVGDiagram>
    </DiagramFigure>
  )
}
