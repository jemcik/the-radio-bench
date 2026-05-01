/**
 * Chapter 1.8 §5 — annotated Bode-plot reading guide.
 *
 * A static illustration paired with the «Як читати діаграму Боде»
 * prose. The text teaches three facts: (1) −3 dB at f_c, (2) far
 * from f_c the response is a straight line of slope −20 dB/decade
 * per pole, (3) the corner is rounded, not a wall. Without a
 * diagram the reader has nothing to look at — the interactive
 * BodePlotter widget lives in the NEXT section, so this section
 * needs its own static reference.
 *
 * Annotations included:
 *   – Frequency axis on a log scale, with f_c/100 … f_c×100 decade
 *     ticks
 *   – Magnitude axis in dB (0, −3, −20, −40, −60)
 *   – First-order LPF magnitude curve (the canonical shape)
 *   – Vertical hairline at f_c, labelled
 *   – Horizontal dashed line at −3 dB, labelled
 *   – Asymptote line in the stopband, labelled «−20 дБ/декаду»
 *   – Passband / stopband zone labels
 *
 * No interactivity. The same i18n labels as the hero / FilterTypeGallery
 * are reused where applicable.
 */
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { withSubscriptsSvg } from '@/lib/text-with-subscripts'

const VB_W = 680
const VB_H = 340

const PAD_L = 80
const PAD_R = 56
// Top padding intentionally generous: we need ~30 px between the plot
// frame top and the 0 dB line so the «passband» zone label doesn't
// collide with the curve at low frequencies (the curve hugs 0 dB
// throughout the passband). Y_MAX_DB extended to 10 to push 0 dB
// further down the frame.
const PAD_T = 36
const PAD_B = 56

const PLOT_L = PAD_L
const PLOT_R = VB_W - PAD_R
const PLOT_T = PAD_T
const PLOT_B = VB_H - PAD_B
const PLOT_W = PLOT_R - PLOT_L
const PLOT_H = PLOT_B - PLOT_T

// X axis: 4 decades, with f_c at the centre. Logarithmic ratio u = f / f_c
// from 10^-2 (f_c/100) to 10^+2 (f_c×100). Each decade is one quarter
// of the plot width.
const X_DECADES = 4 // total span
const X_HALF_DECADES = X_DECADES / 2

// Y axis: dB range. Y_MAX_DB extended to 10 (was 5) so there is
// vertical breathing room above the 0 dB line for the «passband»
// zone label without crossing the curve.
const Y_MAX_DB = 10
const Y_MIN_DB = -60

function uToX(u: number): number {
  const logU = Math.log10(Math.max(u, 1e-9))
  const t = (logU + X_HALF_DECADES) / X_DECADES
  return PLOT_L + t * PLOT_W
}

function dbToY(db: number): number {
  const clamped = Math.max(Y_MIN_DB, Math.min(Y_MAX_DB, db))
  const t = (Y_MAX_DB - clamped) / (Y_MAX_DB - Y_MIN_DB)
  return PLOT_T + t * PLOT_H
}

function buildLpfCurve(): string {
  // First-order LPF: dB(u) = −10·log10(1 + u^2)
  const STEPS = 280
  const parts: string[] = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const logU = -X_HALF_DECADES + t * X_DECADES
    const u = Math.pow(10, logU)
    const db = -10 * Math.log10(1 + u * u)
    const x = uToX(u)
    const y = dbToY(db)
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

function buildAsymptote(): string {
  // Stopband asymptote: dB(u) = −20·log10(u) for u >> 1.
  // Draw from u=1 (where it would intersect 0 dB) to the right edge.
  // Visually it begins at (xFc, 0 dB) and slopes down −20 dB per decade.
  const xStart = uToX(1)
  const yStart = dbToY(0)
  const xEnd = uToX(Math.pow(10, X_HALF_DECADES))
  const yEnd = dbToY(-20 * X_HALF_DECADES)
  return `M ${xStart.toFixed(2)} ${yStart.toFixed(2)} L ${xEnd.toFixed(2)} ${yEnd.toFixed(2)}`
}

const X_TICK_DECADES = [-2, -1, 0, 1, 2] as const
const Y_TICK_DBS = [0, -3, -20, -40, -60] as const

export default function BodePlotReadingGuide() {
  const { t } = useTranslation('ui')

  const xFc = uToX(1)
  const yMinus3 = dbToY(-3)

  // Decade labels go inside SVG <text> elements, so the bare `f_c`
  // pattern in the i18n value needs SVG-aware subscript rendering
  // (HTML <sub> doesn't render in SVG; we use <tspan baseline-shift>
  // via withSubscriptsSvg).
  const decadeLabel = (decade: number): ReactNode => {
    if (decade === 0) return withSubscriptsSvg(t('ch1_8.bodeGuide.fcLabel'))
    if (decade < 0) return withSubscriptsSvg(t('ch1_8.bodeGuide.fcOver', { factor: Math.pow(10, -decade) }))
    return withSubscriptsSvg(t('ch1_8.bodeGuide.fcTimes', { factor: Math.pow(10, decade) }))
  }

  return (
    <figure className="my-6">
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_8.bodeGuide.aria')}
        style={{
          display: 'block',
          margin: '0 auto',
          maxWidth: '100%',
          height: 'auto',
          // Anchor SVG-internal em units to the document root font-size
          // so axis/tick labels render at the same absolute size as in
          // sibling diagrams (LcResponseCurve, BodePlotter etc.) which
          // use this same pattern. Without this, em inside the SVG
          // resolves against the SVG's own font-size and scales with
          // the SVG, producing labels that grow on wider screens.
          fontSize: '1rem',
        }}
      >
        {/* Plot frame: bottom + left axis lines */}
        <path
          d={`M ${PLOT_L} ${PLOT_T} L ${PLOT_L} ${PLOT_B} L ${PLOT_R} ${PLOT_B}`}
          stroke={svgTokens.border}
          strokeWidth={1}
          fill="none"
        />

        {/* Subtle decade gridlines (vertical) */}
        {X_TICK_DECADES.map(decade => {
          if (decade === 0) return null
          const u = Math.pow(10, decade)
          const x = uToX(u)
          return (
            <line
              key={decade}
              x1={x} x2={x}
              y1={PLOT_T} y2={PLOT_B}
              stroke={svgTokens.border}
              strokeWidth={0.6}
              strokeDasharray="2 4"
            />
          )
        })}

        {/* Subtle dB gridlines (horizontal) */}
        {Y_TICK_DBS.map(db => {
          if (db === 0 || db === -3) return null
          const y = dbToY(db)
          return (
            <line
              key={db}
              x1={PLOT_L} x2={PLOT_R}
              y1={y} y2={y}
              stroke={svgTokens.border}
              strokeWidth={0.6}
              strokeDasharray="2 4"
            />
          )
        })}

        {/* −3 dB horizontal guide */}
        <line
          x1={PLOT_L} x2={PLOT_R}
          y1={yMinus3} y2={yMinus3}
          stroke={svgTokens.note}
          strokeWidth={1.2}
          strokeDasharray="4 3"
          opacity={0.7}
        />

        {/* f_c vertical hairline */}
        <line
          x1={xFc} x2={xFc}
          y1={PLOT_T} y2={PLOT_B}
          stroke={svgTokens.primary}
          strokeWidth={1.2}
          strokeDasharray="3 3"
          opacity={0.7}
        />

        {/* Stopband −20 dB/decade asymptote (thin dashed line) */}
        <path
          d={buildAsymptote()}
          stroke={svgTokens.mutedFg}
          strokeWidth={1}
          strokeDasharray="5 4"
          fill="none"
          opacity={0.7}
        />

        {/* The actual magnitude curve */}
        <path
          d={buildLpfCurve()}
          stroke={svgTokens.primary}
          strokeWidth={2.2}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* dB-axis tick labels (left of plot) */}
        {Y_TICK_DBS.map(db => (
          <text
            key={db}
            x={PLOT_L - 8}
            y={dbToY(db) + 4}
            fontSize="0.75em"
            textAnchor="end"
            fill={db === -3 ? svgTokens.note : svgTokens.mutedFg}
            fontWeight={db === -3 ? 600 : 400}
          >
            {db === -3 ? t('ch1_8.bodeGuide.minus3dbTick') : `${db} ${t('ch1_8.bodeGuide.dbUnit')}`}
          </text>
        ))}

        {/* Y-axis label rotated on the far left */}
        <text
          x={PAD_L - 56}
          y={(PLOT_T + PLOT_B) / 2}
          fontSize="0.812em"
          textAnchor="middle"
          fill={svgTokens.fg}
          opacity={0.85}
          transform={`rotate(-90 ${PAD_L - 56} ${(PLOT_T + PLOT_B) / 2})`}
        >
          {t('ch1_8.bodeGuide.yAxisLabel')}
        </text>

        {/* X-axis tick labels (decade markers) */}
        {X_TICK_DECADES.map(decade => {
          const u = Math.pow(10, decade)
          const x = uToX(u)
          const isCenter = decade === 0
          return (
            <text
              key={decade}
              x={x}
              y={PLOT_B + 18}
              fontSize="0.75em"
              textAnchor="middle"
              fill={isCenter ? svgTokens.primary : svgTokens.mutedFg}
              fontWeight={isCenter ? 700 : 400}
              fontStyle={isCenter ? 'italic' : 'normal'}
            >
              {decadeLabel(decade)}
            </text>
          )
        })}

        {/* X-axis label */}
        <text
          x={(PLOT_L + PLOT_R) / 2}
          y={PLOT_B + 38}
          fontSize="0.812em"
          textAnchor="middle"
          fill={svgTokens.fg}
          opacity={0.85}
        >
          {t('ch1_8.bodeGuide.xAxisLabel')}
        </text>

        {/* Passband zone label (top-left of plot, in the flat region) */}
        <text
          x={PLOT_L + PLOT_W * 0.15}
          y={PLOT_T + 18}
          fontSize="0.812em"
          textAnchor="middle"
          fill={svgTokens.fg}
          fontStyle="italic"
          opacity={0.75}
        >
          {t('ch1_8.bodeGuide.passbandZone')}
        </text>

        {/* Stopband zone label (bottom-right of plot, in the rolled-off region) */}
        <text
          x={PLOT_L + PLOT_W * 0.82}
          y={PLOT_B - 14}
          fontSize="0.812em"
          textAnchor="middle"
          fill={svgTokens.fg}
          fontStyle="italic"
          opacity={0.75}
        >
          {t('ch1_8.bodeGuide.stopbandZone')}
        </text>

        {/* Slope annotation alongside the asymptote.
            Offset of 26 SVG units above the asymptote — generous because
            SVG coordinates scale with the rendered SVG, but text size
            (anchored to 1rem) stays constant in display px. At smaller
            display scales (mobile), 26 SVG units shrinks proportionally
            while the 12-px-display text stays fixed, so a small SVG-unit
            offset would let the asymptote cross the text. 26 keeps the
            text clearly separated even at ~50 % scale. */}
        <text
          x={uToX(Math.pow(10, 1.4))}
          y={dbToY(-20 * 1.4) - 26}
          fontSize="0.75em"
          textAnchor="middle"
          fill={svgTokens.mutedFg}
          fontWeight={600}
        >
          {t('ch1_8.bodeGuide.slopeAnnotation')}
        </text>
      </svg>
    </figure>
  )
}
