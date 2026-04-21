import { useEffect, useMemo, useRef } from 'react'
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
 *
 * ANIMATION — small flow indicators carry the "this is moving water"
 * feeling that static fill cannot. Twelve subtle droplets tile through
 * the pipe on a ~3 s cycle, their cx attribute written imperatively
 * via rAF to avoid per-frame React re-renders. The droplet cycle ends
 * exactly at the pipe exit — from there the existing splash droplets
 * complete the visual story. Respects `prefers-reduced-motion`: the
 * rAF loop simply doesn't start, and droplets sit at their mount
 * positions (tiled across the pipe as a static snapshot).
 */

const FLOW_PERIOD_MS = 3000
const DROPLET_COUNT = 12
const STREAM_PERIOD_MS = 900
const STREAM_DROPLET_COUNT = 5
const SPLASH_PERIOD_MS = 700
// Varying droplet sizes break the perceptual uniformity of an
// evenly-tiled stream — without this the circles look frozen on
// the parabola even while the rAF loop updates them every frame.
const STREAM_DROPLET_RADII = [1.4, 2.1, 1.5, 1.9, 1.3]
export default function WaterPipeDiagram() {
  const { t } = useTranslation('ui')
  const dropletRefs = useRef<(SVGCircleElement | null)[]>([])
  const streamRefs = useRef<(SVGCircleElement | null)[]>([])
  const splashRefs = useRef<(SVGCircleElement | null)[]>([])
  // Deterministic vertical jitter within each lane so droplets don't
  // align to a single row. Bounded to ±3 px so even a droplet passing
  // through the restriction (where the water column is only 6 px tall)
  // stays inside it. Index mod DROPLET_COUNT selects from this.
  const dropletJitterY = useMemo(
    () => [0, 3, -2, 2, -3, 1, -3, 3, 2, -3, 0, 2],
    [],
  )

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

  // ── Droplet flow animation ──────────────────────────────────────────
  // Pipe horizontal span: from the tank's right wall to the pipe exit.
  const pipeStartX = tankX + tankW + 2
  const pipeSpanX = pipeEndX - pipeStartX - 2

  // Stream parabola geometry — matches the visual stream drawn below.
  // Exit point is the mid-line of the pipe at its right edge; arc spans
  // arcLenX horizontally and lands on the ground.
  const streamExitX = pipeEndX
  const streamExitY = (pipeTopY + pipeBottomY) / 2
  const streamArcLenX = 48
  const streamDropY = groundY - streamExitY
  // Splash droplet anchor positions, stored as [dx, dy] offsets from
  // (streamExitX, streamExitY + streamDropY). Both the static render
  // and the rAF bounce animation reference the same list.
  const splashAnchors: { dx: number; dy: number; r: number }[] = [
    { dx: 38, dy: -16, r: 1.5 },
    { dx: 44, dy: -10, r: 1.3 },
    { dx: 50, dy: -14, r: 1   },
    { dx: 56, dy:  -8, r: 1.2 },
    { dx: 42, dy:  -4, r: 1.4 },
    { dx: 58, dy:  -6, r: 0.9 },
  ]

  // How much of the assigned jitter a droplet can use at horizontal
  // position x — 1 in the wide pipe, ~0.25 in the 6-px-tall restriction,
  // linear through the two 7-px ramps. Without this droplets with
  // large jitter poke outside the restriction (6 px tall is tighter
  // than any ±3 px jitter + droplet radius).
  const compressionAt = (x: number): number => {
    if (x >= restrictStartX + restrictInset && x <= restrictEndX - restrictInset) return 0.25
    if (x >= restrictStartX && x < restrictStartX + restrictInset) {
      const t = (x - restrictStartX) / restrictInset
      return 1 - 0.75 * t
    }
    if (x > restrictEndX - restrictInset && x <= restrictEndX) {
      const t = (x - (restrictEndX - restrictInset)) / restrictInset
      return 0.25 + 0.75 * t
    }
    return 1
  }
  const pipeCenterY = (pipeTopY + pipeBottomY) / 2

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    let raf = 0
    let start: number | null = null
    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start

      // Pipe droplets — constant-speed flow along the horizontal pipe.
      // cy is compressed as the droplet transits the restriction so it
      // never pokes outside the narrow section.
      const pipePhase = (elapsed % FLOW_PERIOD_MS) / FLOW_PERIOD_MS
      for (let i = 0; i < DROPLET_COUNT; i++) {
        const p = (pipePhase + i / DROPLET_COUNT) % 1
        const cx = pipeStartX + p * pipeSpanX
        const jitter = dropletJitterY[i] ?? 0
        const cy = pipeCenterY + jitter * compressionAt(cx)
        const el = dropletRefs.current[i]
        if (el) {
          el.setAttribute('cx', String(cx))
          el.setAttribute('cy', String(cy))
        }
      }

      // Stream droplets — falling along the parabola from pipe exit to
      // ground. x is linear in phase (constant horizontal velocity),
      // y accelerates as p², matching projectile motion. Opacity fades
      // in over the first 15 % and out over the last 15 % so the eye
      // can track individual droplets; without this the uniform tiled
      // pattern reads as frozen even while it updates every frame.
      const streamPhase = (elapsed % STREAM_PERIOD_MS) / STREAM_PERIOD_MS
      for (let i = 0; i < STREAM_DROPLET_COUNT; i++) {
        const p = (streamPhase + i / STREAM_DROPLET_COUNT) % 1
        const el = streamRefs.current[i]
        if (!el) continue
        el.setAttribute('cx', String(streamExitX + p * streamArcLenX))
        el.setAttribute('cy', String(streamExitY + streamDropY * p * p))
        const fadeIn = Math.min(1, p / 0.15)
        const fadeOut = Math.min(1, (1 - p) / 0.15)
        const alpha = Math.min(fadeIn, fadeOut)
        el.setAttribute('opacity', alpha.toFixed(2))
      }

      // Splash droplets — small vertical bounce at the landing point,
      // phase-shifted so the six droplets don't pulse in unison.
      const splashBase = (elapsed % SPLASH_PERIOD_MS) / SPLASH_PERIOD_MS
      for (let i = 0; i < splashAnchors.length; i++) {
        const a = splashAnchors[i]
        const phase = (splashBase + i / splashAnchors.length) * 2 * Math.PI
        const bounce = 1.6 * Math.abs(Math.sin(phase))
        const el = splashRefs.current[i]
        if (el) el.setAttribute('cy', String(streamExitY + streamDropY + a.dy - bounce))
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeStartX, pipeSpanX, streamExitX, streamExitY, streamArcLenX, streamDropY])

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
          fill="hsl(var(--callout-note) / 0.22)"
        />
        {/* Water surface line — amber even though the water below is
            blue, because this line specifically marks the water LEVEL,
            which encodes pressure (V). The blue water + amber surface
            line reads as "blue water whose level is the V quantity". */}
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

        {/* ── Flowing droplets inside the pipe ───────────────────── *
             Twelve tiled droplets cycling through the pipe so the
             water reads as moving, not static. Initial cx spread
             (even phase tiling) doubles as the static snapshot when
             prefers-reduced-motion is enabled. The rAF loop writes
             cx imperatively to avoid per-frame React re-renders. */}
        <g>
          {Array.from({ length: DROPLET_COUNT }).map((_, i) => {
            const p0 = i / DROPLET_COUNT
            return (
              <circle
                key={i}
                ref={el => { dropletRefs.current[i] = el }}
                cx={pipeStartX + p0 * pipeSpanX}
                cy={(pipeTopY + pipeBottomY) / 2 + (dropletJitterY[i] ?? 0)}
                r={1.6}
                fill="hsl(var(--callout-note) / 0.85)"
              />
            )
          })}
        </g>

        {/* ── Water stream — parabolic trajectory ──────────────── *
             The static envelope (filled parabola + top outline)
             stays drawn so the stream's SHAPE is readable even under
             prefers-reduced-motion; the animated falling droplets on
             top make it feel like moving water. */}
        {(() => {
          const exitX = pipeEndX
          const exitTopY = pipeTopY + 2
          const exitBotY = pipeBottomY - 2
          const steps = 14
          const arcLenX = streamArcLenX
          const botDropY = groundY - exitBotY
          const topDropY = groundY - exitTopY - 3
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
                fill="hsl(var(--callout-note) / 0.35)"
                stroke="hsl(var(--callout-note))"
                strokeWidth={1.1}
                strokeLinejoin="round"
                opacity={0.7}
              />
              <polyline
                points={topPts.join(' ')}
                fill="none"
                stroke="hsl(var(--callout-note))"
                strokeWidth={0.8}
                opacity={0.55}
                strokeLinejoin="round"
              />
              {/* Falling droplets — tiled along the parabola from exit
                  to landing. Varying radii + opacity fade-in/out
                  (applied in the rAF loop) let the eye track
                  individual droplets instead of perceiving the uniform
                  tiled pattern as frozen. Initial cx/cy/opacity here
                  double as the prefers-reduced-motion snapshot. */}
              {Array.from({ length: STREAM_DROPLET_COUNT }).map((_, i) => {
                const p0 = i / STREAM_DROPLET_COUNT
                const fadeIn = Math.min(1, p0 / 0.15)
                const fadeOut = Math.min(1, (1 - p0) / 0.15)
                return (
                  <circle
                    key={`stream-${i}`}
                    ref={el => { streamRefs.current[i] = el }}
                    cx={streamExitX + p0 * streamArcLenX}
                    cy={streamExitY + streamDropY * p0 * p0}
                    r={STREAM_DROPLET_RADII[i] ?? 1.6}
                    fill="hsl(var(--callout-note))"
                    opacity={Math.min(fadeIn, fadeOut)}
                  />
                )
              })}
              {/* Splash droplets — bounce around the landing point on
                  a sub-second cycle to keep the splash visually alive. */}
              {splashAnchors.map((a, i) => (
                <circle
                  key={`splash-${i}`}
                  ref={el => { splashRefs.current[i] = el }}
                  cx={streamExitX + a.dx}
                  cy={streamExitY + streamDropY + a.dy}
                  r={a.r}
                  fill="hsl(var(--callout-note) / 0.7)"
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
          fontSize="1.062em"
          fontWeight={700}
          fill={svgTokens.primary}
        >V</text>
        <text
          x={tankX + tankW / 2}
          y={tankY - 4}
          textAnchor="middle"
          fontSize="0.812em"
          fill={svgTokens.mutedFg}
        >
          {t('ch1_1.waterPipeLabelVoltage')}
        </text>

        {/* R (resistance) — above the narrow pipe section */}
        <text
          x={(restrictStartX + restrictEndX) / 2}
          y={pipeTopY - 36}
          textAnchor="middle"
          fontSize="1.062em"
          fontWeight={700}
          fill={svgTokens.caution}
        >R</text>
        <text
          x={(restrictStartX + restrictEndX) / 2}
          y={pipeTopY - 18}
          textAnchor="middle"
          fontSize="0.812em"
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
          fontSize="1.062em"
          fontWeight={700}
          fill={svgTokens.note}
        >I</text>
        <text
          x={pipeEndX - 12}
          y={pipeTopY - 4}
          textAnchor="middle"
          fontSize="0.812em"
          fill={svgTokens.mutedFg}
        >
          {t('ch1_1.waterPipeLabelCurrent')}
        </text>
      </SVGDiagram>
    </DiagramFigure>
  )
}
