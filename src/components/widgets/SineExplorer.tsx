import { useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal, formatNumber } from '@/lib/format'
import { svgTokens } from '@/components/diagrams/svgTokens'

/**
 * Chapter 1.3 — Sine Wave Explorer
 *
 * Two sliders — amplitude and frequency — drive a sine wave plotted
 * against a fixed 20-ms time window. The plot annotates both
 * quantities directly on the waveform:
 *
 *   • A vertical double-arrow from the zero line up to the first peak,
 *     labelled A, makes amplitude readable at a glance.
 *   • A horizontal double-arrow spanning one full period T on the zero
 *     line, labelled T, turns the "period = time for one cycle"
 *     definition into something the reader can measure with a ruler
 *     right on the screen.
 *
 * The readout below the plot repeats A and f as numbers and shows
 * T = 1/f worked out — tying the picture to the formula the prose
 * gives. Frequency is log-scaled on the slider (50 Hz → 500 Hz, one
 * decade) so the reader can move cleanly through the ham-audio range
 * at equal effort per decade.
 */

// ── Slider ranges ──────────────────────────────────────────────────
const A_MIN = 1
const A_MAX = 10
const A_STEP = 0.1
const A_DEFAULT = 5

const F_LOG_MIN = Math.log10(50)   // 50 Hz
const F_LOG_MAX = Math.log10(500)  // 500 Hz
const F_LOG_STEP = 0.01
const F_LOG_DEFAULT = 2             // 10^2 = 100 Hz

// ── Plot geometry ──────────────────────────────────────────────────
// viewBox = on-screen size, no scaling. fontSize 13 for tick labels,
// fontSize 14 for axis titles — the 13 px floor is respected.
const VB_W = 520
const VB_H = 240
// PAD_L budget (worst case UK):
//   Y-tick "−10" — 3 chars × 7 px ≈ 21 px, anchored at PLOT_X0 − 8.
//   Rotated Y-axis title "напруга (В)" 11 chars × 7 ≈ 77 px → rotated
//   column 14 px wide at x ≈ 14. Together + 10 px margin → PAD_L = 46.
const PAD_L = 46
const PAD_R = 18
const PAD_T = 22
const PAD_B = 44

const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B

const T_VIEW_MS = 20                 // time window shown on the plot
const V_MAX = 10                     // labelled max on the y-axis
// Small headroom beyond ±V_MAX so the curve's peaks at A = V_MAX don't
// graze the clipPath boundary — without it, stroke-width/2 of the peak
// gets clipped and the wave looks «flat-topped». 10% headroom is
// invisible-by-default and prevents the artefact completely.
const V_AXIS_MAX = V_MAX * 1.1

const X_TICKS_MS = [0, 4, 8, 12, 16, 20]
const Y_TICKS_V = [-10, -5, 0, 5, 10]

// Playhead sweep — one pass across the visible 20 ms in PLAYHEAD_PERIOD_MS.
// Slow enough to follow, fast enough to feel alive.
const PLAYHEAD_PERIOD_MS = 3500

function tMsToX(tMs: number): number {
  return PLOT_X0 + (tMs / T_VIEW_MS) * PLOT_W
}
function vToY(v: number): number {
  return PLOT_Y0 + PLOT_H / 2 - (v / V_AXIS_MAX) * (PLOT_H / 2)
}

export default function SineExplorer() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const clipId = useId()

  const [amplitude, setAmplitude] = useState<number>(A_DEFAULT)
  // Playhead: a vertical cursor that sweeps the plot left-to-right to
  // show «time is flowing». Does not disturb the static wave or the
  // A/T markers — it just advances the reader's sense of «where in
  // the signal we are right now». Sweeps from 0 to T_VIEW_MS in
  // PLAYHEAD_PERIOD_MS, then wraps.
  const [playheadMs, setPlayheadMs] = useState<number>(0)
  const [fLog, setFLog] = useState<number>(F_LOG_DEFAULT)
  const frequency = Math.pow(10, fLog)      // Hz
  const periodMs = 1000 / frequency         // ms

  // Playhead animation: sweeps 0 → T_VIEW_MS repeatedly.
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    let rafId = 0
    let startTime: number | null = null
    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const elapsed = (now - startTime) % PLAYHEAD_PERIOD_MS
      setPlayheadMs((elapsed / PLAYHEAD_PERIOD_MS) * T_VIEW_MS)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Playhead position on the plot
  const playheadX = tMsToX(playheadMs)
  const playheadV = amplitude * Math.sin(2 * Math.PI * frequency * (playheadMs / 1000))
  const playheadY = vToY(playheadV)

  // ── Waveform path ────────────────────────────────────────────────
  // 600 samples across the 20 ms window — dense enough that even 500 Hz
  // (ten cycles) renders smoothly without visible polyline kinks.
  const path = useMemo(() => {
    const N = 600
    let d = ''
    for (let i = 0; i <= N; i++) {
      const tMs = (i / N) * T_VIEW_MS
      const v = amplitude * Math.sin(2 * Math.PI * frequency * (tMs / 1000))
      const x = tMsToX(tMs)
      const y = vToY(v)
      d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    }
    return d
  }, [amplitude, frequency])

  // ── Amplitude marker: vertical arrow from zero to first peak ─────
  // First peak is at t = T/4 — one quarter of a cycle after t = 0.
  const firstPeakMs = periodMs / 4
  const ampMarkerX = tMsToX(firstPeakMs)
  const ampMarkerY0 = vToY(0)
  const ampMarkerY1 = vToY(amplitude)

  // ── Period marker: horizontal arrow spanning one cycle on zero line
  // Start at the second zero-crossing (t = T/2, going negative-to-positive
  // skipped — use t = T to t = 2T so it sits AFTER the first peak and
  // doesn't overlap the amplitude arrow).
  const periodMarkerT0 = periodMs
  const periodMarkerT1 = 2 * periodMs
  // Only show the period marker when both ends fit within the plot.
  // At the lowest frequency (50 Hz, T = 20 ms) t=T already pushes the
  // right arrow-tip past the plot — fall back to [0, T] then.
  const periodFits = periodMarkerT1 <= T_VIEW_MS
  const periodX0 = periodFits ? tMsToX(periodMarkerT0) : tMsToX(0)
  const periodX1 = periodFits ? tMsToX(periodMarkerT1) : tMsToX(periodMs)
  const periodY = vToY(0) + 18  // 18 px below the zero line (clear of any trace wiggle)

  return (
    <Widget
      title={t('ch1_3.widget.sineExplorer.title')}
      description={t('ch1_3.widget.sineExplorer.description')}
    >
      {/* ── Amplitude slider ──────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="sx-a" className="text-sm font-medium text-foreground">
            {t('ch1_3.widget.sineExplorer.amplitudeLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">
            {formatDecimal(amplitude, 1, locale)} {tUnit('v')}
          </span>
        </div>
        <Slider
          id="sx-a"
          min={A_MIN}
          max={A_MAX}
          step={A_STEP}
          value={[amplitude]}
          onValueChange={([v]) => setAmplitude(v ?? A_DEFAULT)}
          aria-label={t('ch1_3.widget.sineExplorer.amplitudeLabel')}
        />
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
          <span>1 {tUnit('v')}</span>
          <span>10 {tUnit('v')}</span>
        </div>
      </div>

      {/* ── Frequency slider ──────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="sx-f" className="text-sm font-medium text-foreground">
            {t('ch1_3.widget.sineExplorer.frequencyLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">
            {formatNumber(Math.round(frequency), locale)} {tUnit('hz')}
          </span>
        </div>
        <Slider
          id="sx-f"
          min={F_LOG_MIN}
          max={F_LOG_MAX}
          step={F_LOG_STEP}
          value={[fLog]}
          onValueChange={([v]) => setFLog(v ?? F_LOG_DEFAULT)}
          aria-label={t('ch1_3.widget.sineExplorer.frequencyLabel')}
        />
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
          <span>50 {tUnit('hz')}</span>
          <span>500 {tUnit('hz')}</span>
        </div>
      </div>

      {/* ── Plot ──────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card/60 p-3">
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t('ch1_3.widget.sineExplorer.ariaLabel')}
          style={{ display: 'block', margin: '0 auto' }}
        >
          <defs>
            {/* Clip extends 3 px beyond the data rect on all sides so
                the stroke half-width never grazes the boundary
                (belt + braces — V_AXIS_MAX already gives vertical
                headroom for the slider's A=10 V peak). */}
            <clipPath id={clipId}>
              <rect
                x={PLOT_X0 - 3}
                y={PLOT_Y0 - 3}
                width={PLOT_W + 6}
                height={PLOT_H + 6}
              />
            </clipPath>
          </defs>

          {/* Gridlines (skip the ones that coincide with the axes/zero) */}
          <g stroke={svgTokens.border} strokeWidth={0.5} opacity={0.55}>
            {X_TICKS_MS.slice(1).map((x) => (
              <line
                key={`gx${x}`}
                x1={tMsToX(x)}
                y1={PLOT_Y0}
                x2={tMsToX(x)}
                y2={PLOT_Y0 + PLOT_H}
              />
            ))}
            {Y_TICKS_V.filter((y) => y !== 0).map((y) => (
              <line
                key={`gy${y}`}
                x1={PLOT_X0}
                y1={vToY(y)}
                x2={PLOT_X0 + PLOT_W}
                y2={vToY(y)}
              />
            ))}
          </g>

          {/* Zero line — emphasised slightly above the ordinary grid */}
          <line
            x1={PLOT_X0}
            y1={vToY(0)}
            x2={PLOT_X0 + PLOT_W}
            y2={vToY(0)}
            stroke={svgTokens.fg}
            strokeWidth={1}
            opacity={0.6}
          />

          {/* Axes */}
          <g stroke={svgTokens.fg} strokeWidth={1} fill="none">
            <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X0} y2={PLOT_Y0 + PLOT_H} />
            <line
              x1={PLOT_X0}
              y1={PLOT_Y0 + PLOT_H}
              x2={PLOT_X0 + PLOT_W}
              y2={PLOT_Y0 + PLOT_H}
            />
          </g>

          {/* Tick labels */}
          <g fill={svgTokens.mutedFg} fontSize="13" fontFamily="ui-sans-serif, system-ui, sans-serif">
            {X_TICKS_MS.map((x) => (
              <text
                key={`tx${x}`}
                x={tMsToX(x)}
                y={PLOT_Y0 + PLOT_H + 16}
                textAnchor="middle"
              >
                {x}
              </text>
            ))}
            {Y_TICKS_V.map((y) => (
              <text
                key={`ty${y}`}
                x={PLOT_X0 - 8}
                y={vToY(y) + 4}
                textAnchor="end"
              >
                {y}
              </text>
            ))}
          </g>

          {/* Axis titles */}
          <text
            x={PLOT_X0 + PLOT_W / 2}
            y={PLOT_Y0 + PLOT_H + 34}
            fontSize="14"
            fill={svgTokens.fg}
            textAnchor="middle"
          >
            <tspan fontStyle="italic" fontFamily="Georgia, serif">t</tspan>
            <tspan fontFamily="ui-sans-serif, system-ui, sans-serif">
              {'\u00a0('}{tUnit('ms')}{')'}
            </tspan>
          </text>
          <text
            x={16}
            y={PLOT_Y0 + PLOT_H / 2}
            fontSize="14"
            fill={svgTokens.fg}
            textAnchor="middle"
            transform={`rotate(-90 16 ${PLOT_Y0 + PLOT_H / 2})`}
          >
            <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
            <tspan fontFamily="ui-sans-serif, system-ui, sans-serif">
              {'\u00a0('}{tUnit('v')}{')'}
            </tspan>
          </text>

          {/* Waveform — clipped so large amplitudes can't escape the rect */}
          <g clipPath={`url(#${clipId})`}>
            <path
              d={path}
              fill="none"
              stroke={svgTokens.primary}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* Time playhead — subtle vertical line that sweeps left→right,
              with a tracker dot where it crosses the sine curve. Conveys
              "time is flowing" without disturbing the static A/T markers. */}
          <g clipPath={`url(#${clipId})`} opacity={0.85}>
            <line
              x1={playheadX}
              y1={PLOT_Y0}
              x2={playheadX}
              y2={PLOT_Y0 + PLOT_H}
              stroke={svgTokens.mutedFg}
              strokeWidth={1}
              strokeDasharray="2 3"
              opacity={0.55}
            />
            <circle
              cx={playheadX}
              cy={playheadY}
              r={3.5}
              fill={svgTokens.primary}
            />
          </g>

          {/* Amplitude marker — vertical double-arrow at first peak */}
          <g stroke={svgTokens.key} strokeWidth={1.4} fill={svgTokens.key}>
            <line x1={ampMarkerX} y1={ampMarkerY0} x2={ampMarkerX} y2={ampMarkerY1} />
            {/* Arrowhead at the top (peak) */}
            <polygon
              points={`${ampMarkerX - 3},${ampMarkerY1 + 5} ${ampMarkerX + 3},${ampMarkerY1 + 5} ${ampMarkerX},${ampMarkerY1}`}
            />
            {/* Arrowhead at the bottom (zero) */}
            <polygon
              points={`${ampMarkerX - 3},${ampMarkerY0 - 5} ${ampMarkerX + 3},${ampMarkerY0 - 5} ${ampMarkerX},${ampMarkerY0}`}
            />
          </g>
          <text
            x={ampMarkerX + 7}
            y={(ampMarkerY0 + ampMarkerY1) / 2 + 4}
            fontSize="14"
            fontStyle="italic"
            fontFamily="Georgia, serif"
            fontWeight="700"
            fill={svgTokens.key}
          >
            A
          </text>

          {/* Period marker — horizontal double-arrow below zero line */}
          <g stroke={svgTokens.note} strokeWidth={1.4} fill={svgTokens.note}>
            <line x1={periodX0} y1={periodY} x2={periodX1} y2={periodY} />
            {/* Left arrowhead */}
            <polygon
              points={`${periodX0 + 5},${periodY - 3} ${periodX0 + 5},${periodY + 3} ${periodX0},${periodY}`}
            />
            {/* Right arrowhead */}
            <polygon
              points={`${periodX1 - 5},${periodY - 3} ${periodX1 - 5},${periodY + 3} ${periodX1},${periodY}`}
            />
          </g>
          <text
            x={(periodX0 + periodX1) / 2}
            y={periodY + 15}
            fontSize="14"
            fontStyle="italic"
            fontFamily="Georgia, serif"
            fontWeight="700"
            fill={svgTokens.note}
            textAnchor="middle"
          >
            T
          </text>
        </svg>
      </div>

      {/* ── Readout ──────────────────────────────────────────────── */}
      <ResultBox tone="success">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-foreground">
            {t('ch1_3.widget.sineExplorer.readoutAmplitude')} ={' '}
            <span className="font-mono">{formatDecimal(amplitude, 1, locale)} {tUnit('v')}</span>
            {'  ·  '}
            {t('ch1_3.widget.sineExplorer.readoutFrequency')} ={' '}
            <span className="font-mono">{formatNumber(Math.round(frequency), locale)} {tUnit('hz')}</span>
          </p>
          <p className="text-xs font-mono text-muted-foreground">
            T = 1 / f = 1 / {formatNumber(Math.round(frequency), locale)} {tUnit('hz')} ={' '}
            {formatDecimal(periodMs, 2, locale)} {tUnit('ms')}
          </p>
        </div>
      </ResultBox>

      <p className="text-xs text-muted-foreground">
        {t('ch1_3.widget.sineExplorer.hint')}
      </p>
    </Widget>
  )
}
