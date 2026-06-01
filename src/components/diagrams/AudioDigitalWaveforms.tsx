/**
 * Chapter 2.2 §1 — Analog vs digital baseband signals.
 *
 * Two stacked plots over a shared time axis:
 *   Top:    a smooth analog waveform (a sum of a few sines — voice-like).
 *   Bottom: a digital waveform switching between a low and a high level.
 *
 * Static snapshot — the lesson is the *shape* of each kind of signal, best
 * read as a complete picture (per the diagram-quality skill: animation is
 * reserved for time-evolving processes; waveform comparisons are snapshots).
 *
 * Sizing per the diagram-quality skill: bare <svg> with fixed width/height
 * + maxWidth: 100% / height: auto — NOT the SVGDiagram wrapper, which would
 * inflate fontSizes ~2× inside the chapter container.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 540
const VB_H = 250

const PAD_L = 16
const PAD_R = 16
const PAD_T = 24
const PAD_B = 34

const GAP_Y = 40
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = (VB_H - PAD_T - PAD_B - GAP_Y) / 2

const TOP_Y0 = PAD_T
const BOT_Y0 = PAD_T + PLOT_H + GAP_Y

const PLOT_X0 = PAD_L
const PLOT_X1 = PAD_L + PLOT_W

const SAMPLES = 360

/** A voice-like analog squiggle: a fundamental plus two quieter overtones. */
function analogPath(): string {
  const midY = TOP_Y0 + PLOT_H / 2
  const amp = PLOT_H / 2 - 4
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const v =
      0.62 * Math.sin(2 * Math.PI * 1.5 * t) +
      0.28 * Math.sin(2 * Math.PI * 3.7 * t + 1.1) +
      0.16 * Math.sin(2 * Math.PI * 6.3 * t + 0.4)
    const x = PLOT_X0 + t * PLOT_W
    const y = midY - amp * v
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

/** A digital bit pattern as a clean square wave (1 0 1 1 0 1 0 0). */
function digitalPath(): string {
  const bits = [1, 0, 1, 1, 0, 1, 0, 0]
  const lowY = BOT_Y0 + PLOT_H - 4
  const highY = BOT_Y0 + 4
  const stepW = PLOT_W / bits.length
  let d = `M${PLOT_X0.toFixed(2)} ${(bits[0] ? highY : lowY).toFixed(2)}`
  for (let i = 0; i < bits.length; i++) {
    const x0 = PLOT_X0 + i * stepW
    const x1 = PLOT_X0 + (i + 1) * stepW
    const y = bits[i] ? highY : lowY
    // horizontal run for this bit
    d += ` L${x0.toFixed(2)} ${y.toFixed(2)} L${x1.toFixed(2)} ${y.toFixed(2)}`
    // vertical transition to next bit
    const next = i + 1 < bits.length ? bits[i + 1] : bits[i]
    const yNext = next ? highY : lowY
    d += ` L${x1.toFixed(2)} ${yNext.toFixed(2)}`
  }
  return d
}

export default function AudioDigitalWaveforms() {
  const { t } = useTranslation('ui')

  const topMid = TOP_Y0 + PLOT_H / 2

  return (
    <DiagramFigure caption={t('ch2_2.audioDigital.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_2.audioDigital.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* TOP — analog row title */}
        <text
          x={PLOT_X0}
          y={TOP_Y0 - 8}
          fontSize="14"
          fontWeight={600}
          fill={svgTokens.fg}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t('ch2_2.audioDigital.analogTitle')}
          <tspan fontSize="13" fontWeight={400} fill={svgTokens.mutedFg}>
            {'  — '}
            {t('ch2_2.audioDigital.analogSub')}
          </tspan>
        </text>
        {/* analog zero line */}
        <line x1={PLOT_X0} y1={topMid} x2={PLOT_X1} y2={topMid} stroke={svgTokens.border} strokeWidth={0.8} />
        <path
          d={analogPath()}
          fill="none"
          stroke={svgTokens.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* BOTTOM — digital row title */}
        <text
          x={PLOT_X0}
          y={BOT_Y0 - 8}
          fontSize="14"
          fontWeight={600}
          fill={svgTokens.fg}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t('ch2_2.audioDigital.digitalTitle')}
          <tspan fontSize="13" fontWeight={400} fill={svgTokens.mutedFg}>
            {'  — '}
            {t('ch2_2.audioDigital.digitalSub')}
          </tspan>
        </text>
        <path
          d={digitalPath()}
          fill="none"
          stroke={svgTokens.experiment}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Shared time axis label */}
        <text
          x={PLOT_X0 + PLOT_W / 2}
          y={VB_H - 10}
          fontSize="13"
          fill={svgTokens.mutedFg}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t('ch2_2.audioDigital.timeAxis')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
