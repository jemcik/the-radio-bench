/**
 * Chapter 1.10 §3 — Half-wave rectifier waveforms.
 *
 * Two stacked plots over a shared time axis:
 *   Top:    V_in(t) — the AC source's sine, swinging ±V_peak.
 *   Bottom: V_out(t) — what the load sees: the positive halves of the
 *           sine, dropped by V_F (visibly slightly lower than the input
 *           peak), and zero during the negative halves.
 *
 * IMPORTANT for the layout. Both plots use the SAME vertical pixels-per-volt
 * scale, so the «slightly smaller because of V_F» visual cue is honest:
 * input peak reaches +AMP_PX above its zero line; output peak reaches
 * (1 − V_F/V_peak) × AMP_PX above its zero line — a couple of pixels lower.
 * Earlier revision used a different scale for the bottom plot (full plot
 * height instead of half-height-equivalent), which made V_out look TALLER
 * than V_in — physically backwards. Reader-flagged on first review.
 *
 * Sizing per the diagram-quality skill: bare `<svg>` with fixed
 * width/height + maxWidth: 100% / height: auto. NOT the SVGDiagram
 * wrapper — that one passes `width="100%"` and the chapter container
 * (max-w-5xl ≈ 1024 px) inflates every fontSize ~2× and every
 * strokeWidth proportionally. Reader-flagged on first review.
 *
 * Static (a snapshot, not an animation) — the lesson is the *shape* of
 * each waveform, which is best read as a complete picture rather than
 * a moving trace. Per diagram-quality skill: animation is reserved for
 * time-evolving processes; waveform comparisons are snapshots.
 */
import { useId } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { MathVar } from '@/components/ui/math'

const VB_W = 540
const VB_H = 280

// Padding budget: left = "+V_peak" label + axis title; right = small.
const PAD_L = 70
const PAD_R = 20
const PAD_T = 16
const PAD_B = 36

// Two stacked plots, equal height, with a small gap between them.
const GAP_Y = 28
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = (VB_H - PAD_T - PAD_B - GAP_Y) / 2

const TOP_Y0 = PAD_T
const BOT_Y0 = PAD_T + PLOT_H + GAP_Y

const PLOT_X0 = PAD_L
const PLOT_X1 = PAD_L + PLOT_W

// Two full cycles displayed.
const CYCLES = 2
const SAMPLES = 360 // 180 per cycle

// Diode forward drop, in normalised amplitude units (V_F / V_peak).
// 0.1 means «if V_peak = 7 V, the diode drops 0.7 V» — visible without
// being so big that it dominates the visual.
const VF_NORM = 0.1

// Per-volt pixel scale, SHARED by both plots so V_in and V_out read on
// the same vertical scale (a 1 V tick is the same height in both).
// Top plot uses ±AMP_PX about its centre; bottom plot uses 0..AMP_PX
// above its zero line at the bottom of its band.
const AMP_PX = PLOT_H / 2 - 4

function vInPath(): string {
  // Sine: y = sin(2π * cycles * t) where t ∈ [0, 1]. Centred on the
  // top plot's mid-line.
  const topZeroY = TOP_Y0 + PLOT_H / 2
  let path = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const y = topZeroY - AMP_PX * Math.sin(2 * Math.PI * CYCLES * t)
    path += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return path
}

function vOutPath(): string {
  // V_out = max(V_in − V_F, 0). Negative halves clamp to zero (the
  // diode is reverse-biased — load sees nothing). Same volts-per-pixel
  // scale as the top plot, so the «slightly lower than V_in» drop reads
  // honestly. Peak ampNorm = 1 − VF_NORM ≈ 0.9, so peak y sits a few
  // pixels below where the V_in peak would land if mirrored down.
  const botZeroY = BOT_Y0 + PLOT_H - 4
  let path = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const sineVal = Math.sin(2 * Math.PI * CYCLES * t)
    const ampNorm = Math.max(0, sineVal - VF_NORM)
    const x = PLOT_X0 + t * PLOT_W
    const y = botZeroY - AMP_PX * ampNorm
    path += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return path
}

export default function HalfWaveRectifierWaveform() {
  const { t } = useTranslation('ui')
  const clipId = useId()

  const inPath = vInPath()
  const outPath = vOutPath()

  // Top plot: zero-line at vertical centre.
  const topZeroY = TOP_Y0 + PLOT_H / 2
  // Bottom plot: zero-line at the bottom of its band.
  const botZeroY = BOT_Y0 + PLOT_H - 4

  // Vertical guide lines at zero crossings of V_in (every half-cycle):
  // positions divide the time axis into 4 equal pieces (2 cycles ⇒ 4 halves).
  const guideXs = [0, 1, 2, 3, 4].map(i => PLOT_X0 + (i / (2 * CYCLES)) * PLOT_W)

  return (
    <DiagramFigure
      caption={
        <Trans
          i18nKey="ch1_10.halfWaveWaveformCaption"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
    >
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_10.halfWaveWaveformAria')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={PLOT_X0 - 3}
              y={PAD_T - 3}
              width={PLOT_W + 6}
              height={VB_H - PAD_T - PAD_B + 6}
            />
          </clipPath>
        </defs>

        {/* Vertical guide lines connecting the two plots — show how a
            zero crossing in V_in marks the moment V_out hands off
            between «conducting» and «blocked». */}
        <g
          stroke={svgTokens.border}
          strokeWidth={0.6}
          strokeDasharray="3 3"
          opacity={0.5}
        >
          {guideXs.map((x, i) => (
            <line key={i} x1={x} y1={TOP_Y0} x2={x} y2={BOT_Y0 + PLOT_H} />
          ))}
        </g>

        {/* TOP plot: V_in zero line + sine */}
        <line
          x1={PLOT_X0}
          y1={topZeroY}
          x2={PLOT_X1}
          y2={topZeroY}
          stroke={svgTokens.fg}
          strokeWidth={0.8}
        />
        <g clipPath={`url(#${clipId})`}>
          <path
            d={inPath}
            fill="none"
            stroke={svgTokens.primary}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {/* +V_peak / −V_peak labels */}
        <text
          x={PLOT_X0 - 10}
          y={TOP_Y0 + 8}
          fontSize="11"
          fill={svgTokens.fg}
          fillOpacity={0.85}
          textAnchor="end"
          fontFamily="Georgia, serif"
        >
          <tspan>+</tspan>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="8" fontStyle="normal">peak</tspan>
        </text>
        <text
          x={PLOT_X0 - 10}
          y={TOP_Y0 + PLOT_H - 2}
          fontSize="11"
          fill={svgTokens.fg}
          fillOpacity={0.85}
          textAnchor="end"
          fontFamily="Georgia, serif"
        >
          <tspan>−</tspan>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="8" fontStyle="normal">peak</tspan>
        </text>
        <text
          x={PLOT_X0 - 10}
          y={topZeroY + 4}
          fontSize="11"
          fill={svgTokens.mutedFg}
          textAnchor="end"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          0
        </text>

        {/* TOP-plot row title */}
        <text
          x={PLOT_X0}
          y={TOP_Y0 - 4}
          fontSize="12"
          fontWeight={600}
          fill={svgTokens.fg}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
          <tspan dy="3" fontSize="8" fontStyle="normal">in</tspan>
          <tspan dy="-3" fontSize="12"> — {t('ch1_10.halfWaveLabelInput')}</tspan>
        </text>

        {/* BOTTOM plot: V_out zero line + half-wave */}
        <line
          x1={PLOT_X0}
          y1={botZeroY}
          x2={PLOT_X1}
          y2={botZeroY}
          stroke={svgTokens.fg}
          strokeWidth={0.8}
        />
        <g clipPath={`url(#${clipId})`}>
          <path
            d={outPath}
            fill="none"
            stroke={svgTokens.experiment}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {/* +V_peak label on bottom plot — same vertical position as top */}
        <text
          x={PLOT_X0 - 10}
          y={botZeroY - AMP_PX + 4}
          fontSize="11"
          fill={svgTokens.fg}
          fillOpacity={0.5}
          textAnchor="end"
          fontFamily="Georgia, serif"
        >
          <tspan>+</tspan>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="8" fontStyle="normal">peak</tspan>
        </text>
        <text
          x={PLOT_X0 - 10}
          y={botZeroY + 4}
          fontSize="11"
          fill={svgTokens.mutedFg}
          textAnchor="end"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          0
        </text>

        {/* BOTTOM-plot row title */}
        <text
          x={PLOT_X0}
          y={BOT_Y0 - 4}
          fontSize="12"
          fontWeight={600}
          fill={svgTokens.fg}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
          <tspan dy="3" fontSize="8" fontStyle="normal">out</tspan>
          <tspan dy="-3" fontSize="12"> — {t('ch1_10.halfWaveLabelOutput')}</tspan>
        </text>

        {/* Time-axis label below bottom plot */}
        <text
          x={PLOT_X0 + PLOT_W / 2}
          y={VB_H - 12}
          fontSize="11"
          fill={svgTokens.mutedFg}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t('ch1_10.halfWaveTimeAxis')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
