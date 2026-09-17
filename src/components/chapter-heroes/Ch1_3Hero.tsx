/**
 * Chapter 1.3 hero — two traces on one oscilloscope (animated).
 *
 * The chapter introduces the two kinds of electricity by the way they
 * look on a scope screen: a battery's output reads as a flat horizontal
 * line, a mains or RF source reads as an up-and-down sine. Both live on
 * the same time axis, so the comparison is immediate — and the AC trace
 * scrolls leftward at a readable pace, just like a live scope capture.
 *
 * Three structural elements:
 *
 *  1. The scope bezel — a rough rectangle with a faint dot-grid inside.
 *  2. The DC trace — a flat line in the upper third, tagged «DC».
 *  3. The AC trace — a sine wave in the lower two-thirds, tagged «AC»,
 *     scrolling leftward continuously. A clipPath hides the overflow
 *     outside the plot area; the underlying rough path is generated
 *     once (stable seed) and translated as a whole, so the hand-drawn
 *     wobble does NOT re-roll every frame.
 *
 * Animation respects `prefers-reduced-motion` — snapshot at translate(0).
 *
 * The scroll is written straight to the <g>'s transform attribute from the
 * animation-frame callback, never through React state. A `setState` per
 * frame is a default-priority update sixty times a second, and this hero
 * mounts OUTSIDE the chapter body's <Suspense>: React 19 gives the body's
 * retry render a lane that never expires, so the hero's updates restarted
 * that render on every frame, and whenever the body could not finish inside
 * one frame gap (cold dev server, slower machine, headless Chromium) the
 * spinner under this hero stayed forever. Found 2026-09-17; present since
 * the chapter's first commit. `check:animation-loop` now forbids the pattern.
 */
import { useMemo, useRef, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnimationLoop } from '@/lib/hooks/useAnimationLoop'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughPath,
  roughRect,
} from '@/lib/rough'

// ─── Geometry ─────────────────────────────────────────────────────────
const VB_W = 420
const VB_H = 148

// Scope bezel
const BEZEL_X = 36
const BEZEL_Y = 26
const BEZEL_W = 348
const BEZEL_H = 96

// Inner plot rect — 10 px inset from the bezel all around.
const PLOT_X0 = BEZEL_X + 10
const PLOT_Y0 = BEZEL_Y + 10
const PLOT_W = BEZEL_W - 20
const PLOT_H = BEZEL_H - 20
const PLOT_X1 = PLOT_X0 + PLOT_W

// DC trace — flat line in the upper third.
// 0.18, not 0.28: the AC tag sits between the DC trace and the sine crest, and
// at 0.28 the 19-unit gap could not hold a 15-unit-tall label — the tag ended up
// touching whichever line it was nudged towards. Lifting the flat DC line opens
// the band so the tag clears both.
const DC_Y = PLOT_Y0 + Math.round(PLOT_H * 0.18)

// AC trace geometry
const AC_CY = PLOT_Y0 + Math.round(PLOT_H * 0.70)
const AC_AMP = 13
// Visible cycles across the plot and generated cycles for the wide
// path. We generate enough extra so that after translating by exactly
// one visible cycle's width, the wave still fills the screen seamlessly.
const AC_CYCLES_VISIBLE = 2.5
const AC_CYCLES_GENERATED = 4    // visible + 1.5 extra on the right
const AC_X_START = PLOT_X0 + 6
const AC_X_END = PLOT_X1 - 6
const VISIBLE_CYCLE_PX = (AC_X_END - AC_X_START) / AC_CYCLES_VISIBLE
const GEN_X_END = AC_X_START + VISIBLE_CYCLE_PX * AC_CYCLES_GENERATED

// Time-axis hint position
const T_HINT_X = PLOT_X1 - 4
const T_HINT_Y = BEZEL_Y + BEZEL_H + 12

// ── Animation ────────────────────────────────────────────────────────
// Shift by exactly one visible cycle's width per PERIOD_MS → seamless
// loop (sine is periodic with that exact period at the chosen scale).
const PERIOD_MS = 5000

function bezelStrokes(seed: number): RoughPath[] {
  return roughRect(BEZEL_X, BEZEL_Y, BEZEL_W, BEZEL_H, {
    seed,
    strokeWidth: 1.4,
    roughness: 0.9,
  })
}

function dcTraceStrokes(seed: number): RoughPath[] {
  return roughLine(AC_X_START, DC_Y, AC_X_END, DC_Y, {
    seed,
    strokeWidth: 1.8,
    roughness: 0.7,
  })
}

function acTraceStrokes(seed: number): RoughPath[] {
  // Generate a WIDER-than-visible sine so that when translated leftward
  // by up to one visible cycle, the right side of the plot is still
  // filled. Dense sampling keeps the curve smooth; rough.js's wobble is
  // computed once from the seed and then merely translated each frame.
  const totalCycles = AC_CYCLES_GENERATED
  const steps = Math.ceil(totalCycles * 48)
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = AC_X_START + t * (GEN_X_END - AC_X_START)
    const y = AC_CY - AC_AMP * Math.sin(t * totalCycles * 2 * Math.PI)
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return roughPath(d, {
    seed,
    strokeWidth: 1.8,
    roughness: 0.75,
    bowing: 0.2,
  })
}

// A faint dot grid inside the plot rect — oscilloscope graticule.
type GridDot = { cx: number; cy: number }
function buildGridDots(): GridDot[] {
  const cols = 8
  const rows = 4
  const dots: GridDot[] = []
  for (let c = 1; c < cols; c++) {
    for (let r = 1; r < rows; r++) {
      dots.push({
        cx: PLOT_X0 + (c / cols) * PLOT_W,
        cy: PLOT_Y0 + (r / rows) * PLOT_H,
      })
    }
  }
  return dots
}

export default function Ch1_3Hero() {
  const { t } = useTranslation('ui')
  const clipId = useId()

  const strokes = useMemo(
    () => ({
      bezel: bezelStrokes(20),
      dc: dcTraceStrokes(40),
      ac: acTraceStrokes(60),
    }),
    [],
  )
  const gridDots = useMemo(() => buildGridDots(), [])

  // The AC group scrolls from 0 down to -VISIBLE_CYCLE_PX, then wraps to 0.
  // The wrap is seamless because sine has that exact period in x.
  const svgRef = useRef<SVGSVGElement>(null)
  const acGroupRef = useRef<SVGGElement>(null)
  useAnimationLoop(svgRef, ({ elapsed }) => {
    const scrollX = -((elapsed % PERIOD_MS) / PERIOD_MS) * VISIBLE_CYCLE_PX
    acGroupRef.current?.setAttribute('transform', `translate(${scrollX.toFixed(2)} 0)`)
  })

  return (
    <svg
      ref={svgRef}
      width="540"
      height="190"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      aria-hidden
    >
      {/* Clip path confining the scrolling AC trace to the plot area */}
      <defs>
        <clipPath id={clipId}>
          <rect x={PLOT_X0} y={PLOT_Y0} width={PLOT_W} height={PLOT_H} />
        </clipPath>
      </defs>

      {/* ─── SCOPE BEZEL ─────────────────────────────────────────── */}
      <RoughPaths paths={strokes.bezel} />

      {/* ─── INNER GRATICULE DOTS ────────────────────────────────── */}
      <g opacity={0.35}>
        {gridDots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={0.7} fill="currentColor" />
        ))}
      </g>

      {/* ─── DC TRACE (flat line, static) ────────────────────────── */}
      <RoughPaths paths={strokes.dc} />
      <text
        x={PLOT_X0 + 6}
        y={DC_Y - 5}
        fontFamily="inherit"
        fontSize="0.812em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="start"
      >
        {t('ch1_3.heroDcLabel')}
      </text>

      {/* ─── AC TRACE (scrolling sine, clipped to plot area) ─────── */}
      <g clipPath={`url(#${clipId})`}>
        <g ref={acGroupRef} transform="translate(0 0)">
          <RoughPaths paths={strokes.ac} />
        </g>
      </g>
      {/* AC tag at the RIGHT end, above the sine. At the left end it landed
          ~15 units under the DC label with the flat DC trace between the two,
          so the pair read as a two-line legend belonging to that one line —
          and the sine's nearest point was FURTHER from the «AC» tag than the
          DC trace was. Opposite corners remove the ambiguity: each tag is now
          nearest its own trace. The sine scrolls, so a peak sits under this
          tag at every moment. */}
      <text
        x={PLOT_X0 + PLOT_W - 6}
        y={AC_CY - AC_AMP - 6}
        fontFamily="inherit"
        fontSize="0.812em"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        textAnchor="end"
      >
        {t('ch1_3.heroAcLabel')}
      </text>

      {/* ─── TIME-AXIS HINT («t →» below bottom-right corner) ────── */}
      <text
        x={T_HINT_X}
        y={T_HINT_Y}
        fontFamily="inherit"
        fontSize="0.625em"
        fontStyle="italic"
        fill="currentColor"
        textAnchor="end"
        opacity={0.7}
      >
        {t('ch1_3.heroTimeLabel')} →
      </text>
    </svg>
  )
}
