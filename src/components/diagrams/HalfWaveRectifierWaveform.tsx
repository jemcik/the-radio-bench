/**
 * Chapter 1.10 §3 — Half-wave rectifier waveforms.
 *
 * Two stacked plots over a shared time axis:
 *   Top:    V_in(t) — the AC source's sine, swinging ±V_peak.
 *   Bottom: V_out(t) — what the load sees: the positive halves of the
 *           sine (slightly smaller because the diode drops ~V_F across
 *           itself), and zero during the negative halves.
 *
 * Static (a snapshot, not an animation) — the lesson is the *shape* of
 * each waveform, which is best read as a complete picture rather than
 * a moving trace. Per diagram-quality skill: animation is reserved for
 * time-evolving processes; waveform comparisons are snapshots.
 */
import { useId } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import SVGDiagram from './SVGDiagram'
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

function vInPath(): string {
  // Sine: y = sin(2π * cycles * t) where t ∈ [0, 1].
  let path = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const y = TOP_Y0 + PLOT_H / 2 - (PLOT_H / 2 - 4) * Math.sin(2 * Math.PI * CYCLES * t)
    path += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return path
}

function vOutPath(): string {
  // V_out = max(V_in - V_F, 0). Negative halves clamp to zero (the
  // diode is reverse-biased — load sees nothing).
  let path = ''
  let started = false
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const sineVal = Math.sin(2 * Math.PI * CYCLES * t)
    const ampNorm = Math.max(0, sineVal - VF_NORM)
    const x = PLOT_X0 + t * PLOT_W
    // Bottom plot: zero at the bottom of its band (V_out only goes positive)
    const y = BOT_Y0 + PLOT_H - 4 - (PLOT_H - 8) * (ampNorm / (1 - VF_NORM))
    path += !started ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
    started = true
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
      <SVGDiagram
        width={VB_W}
        height={VB_H}
        aria-label={t('ch1_10.halfWaveWaveformAria')}
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
          strokeWidth={1}
        />
        <g clipPath={`url(#${clipId})`}>
          <path
            d={inPath}
            fill="none"
            stroke={svgTokens.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {/* +V_peak / −V_peak labels */}
        <text
          x={PLOT_X0 - 10}
          y={TOP_Y0 + 8}
          fontSize="13"
          fill={svgTokens.fg}
          fillOpacity={0.85}
          textAnchor="end"
          fontFamily="Georgia, serif"
        >
          <tspan>+</tspan>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="9" fontStyle="normal">peak</tspan>
        </text>
        <text
          x={PLOT_X0 - 10}
          y={TOP_Y0 + PLOT_H - 2}
          fontSize="13"
          fill={svgTokens.fg}
          fillOpacity={0.85}
          textAnchor="end"
          fontFamily="Georgia, serif"
        >
          <tspan>−</tspan>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="9" fontStyle="normal">peak</tspan>
        </text>
        <text
          x={PLOT_X0 - 10}
          y={topZeroY + 4}
          fontSize="13"
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
          fontSize="14"
          fontWeight={600}
          fill={svgTokens.fg}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
          <tspan dy="3" fontSize="10" fontStyle="normal">in</tspan>
          <tspan dy="-3" fontSize="14"> — {t('ch1_10.halfWaveLabelInput')}</tspan>
        </text>

        {/* BOTTOM plot: V_out zero line + half-wave */}
        <line
          x1={PLOT_X0}
          y1={botZeroY}
          x2={PLOT_X1}
          y2={botZeroY}
          stroke={svgTokens.fg}
          strokeWidth={1}
        />
        <g clipPath={`url(#${clipId})`}>
          <path
            d={outPath}
            fill="none"
            stroke={svgTokens.experiment}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {/* +V_peak label on bottom plot */}
        <text
          x={PLOT_X0 - 10}
          y={BOT_Y0 + 8}
          fontSize="13"
          fill={svgTokens.fg}
          fillOpacity={0.85}
          textAnchor="end"
          fontFamily="Georgia, serif"
        >
          <tspan>+</tspan>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="9" fontStyle="normal">peak</tspan>
        </text>
        <text
          x={PLOT_X0 - 10}
          y={botZeroY + 4}
          fontSize="13"
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
          fontSize="14"
          fontWeight={600}
          fill={svgTokens.fg}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
          <tspan dy="3" fontSize="10" fontStyle="normal">out</tspan>
          <tspan dy="-3" fontSize="14"> — {t('ch1_10.halfWaveLabelOutput')}</tspan>
        </text>

        {/* Time-axis label below bottom plot */}
        <text
          x={PLOT_X0 + PLOT_W / 2}
          y={VB_H - 12}
          fontSize="13"
          fill={svgTokens.mutedFg}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t('ch1_10.halfWaveTimeAxis')}
        </text>
      </SVGDiagram>
    </DiagramFigure>
  )
}
