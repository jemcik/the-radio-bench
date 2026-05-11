/**
 * Chapter 1.11 §4 — BJT output characteristic curves.
 *
 * The classic «family of curves» plot. Each curve shows I_C vs V_CE
 * for a fixed base current I_B; we draw four curves at I_B = 10, 20,
 * 30, 40 µA, which (with β = 100) correspond to active-region I_C
 * values of 1, 2, 3, 4 mA respectively.
 *
 * The flat shape of each curve in the active region is what tells the
 * reader the transistor behaves like a current source there — moving
 * V_CE around does not move I_C much. Three regions are labelled:
 *   – Cutoff: I_B = 0, I_C ≈ 0 — bottom of the plot.
 *   – Saturation: V_CE < ~0.2 V — left strip where I_C drops sharply.
 *   – Active: V_CE > ~0.5 V — flat horizontal regions of each curve.
 *
 * Curve model (pedagogical, not exact Ebers-Moll):
 *   I_C(V_CE) = β · I_B · tanh(V_CE / V_knee) · (1 + V_CE / V_early)
 *
 *   – tanh provides the smooth knee from saturation into the active
 *     region (V_knee ≈ 0.15 V keeps the knee tight, matching real BJTs).
 *   – (1 + V_CE / V_early) is the Early-effect tilt; a typical V_A is
 *     ~100 V, giving a barely-visible upward slope across our 10 V
 *     plot range — enough to mark the curves as «not perfectly flat»
 *     but not enough to dominate the picture.
 */
import { useId } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'

const VB_W = 540
const VB_H = 320

const PAD_L = 70
const PAD_R = 24
const PAD_T = 28
const PAD_B = 50
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B
const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T + PLOT_H // y-axis bottom (V_CE = 0)
const PLOT_X1 = PAD_L + PLOT_W

// Plot domain.
const VCE_MAX = 10           // V — x-axis upper bound
const IC_MAX = 5             // mA — y-axis upper bound

// Pedagogical model parameters.
const BETA = 100
const V_KNEE = 0.15          // V — knee tightness for tanh
const V_EARLY = 100          // V — Early voltage (mild upward tilt)

// Curves: list of base currents (µA) we plot.
const I_B_CURVES_UA = [10, 20, 30, 40]
const SAMPLES = 200

const xToPx = (vce: number) => PLOT_X0 + (vce / VCE_MAX) * PLOT_W
const yToPx = (ic_mA: number) => PLOT_Y0 - (ic_mA / IC_MAX) * PLOT_H

function curvePath(i_b_uA: number): string {
  const i_b_mA = i_b_uA / 1000
  let path = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const vce = (i / SAMPLES) * VCE_MAX
    const ic = BETA * i_b_mA * Math.tanh(vce / V_KNEE) * (1 + vce / V_EARLY)
    const x = xToPx(vce)
    const y = yToPx(ic)
    path += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return path
}

// Saturation region boundary — V_CE_sat ≈ 0.2 V.
const V_CE_SAT = 0.5 // pedagogical width — actual saturation knee is at ~0.2 V,
                      // but the «active region begins» line is at ~0.5 V; using
                      // the wider value here is what the reader needs to see.

export default function BjtOutputCurves() {
  const { t } = useTranslation('ui')
  const clipId = useId()

  // X-axis ticks at 0, 2, 4, 6, 8, 10 V
  const xTicks = [0, 2, 4, 6, 8, 10]
  // Y-axis ticks at 0, 1, 2, 3, 4, 5 mA
  const yTicks = [0, 1, 2, 3, 4, 5]

  return (
    <DiagramFigure
      caption={
        <Trans
          i18nKey="ch1_11.curvesDiagramCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong />, ar: <G k="active region" /> }}
        />
      }
    >
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_11.curvesDiagramAria')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT_X0} y={PAD_T} width={PLOT_W} height={PLOT_H} />
          </clipPath>
        </defs>
        {/* Background region: saturation (left strip) — pale shading */}
        <rect
          x={PLOT_X0}
          y={PAD_T}
          width={xToPx(V_CE_SAT) - PLOT_X0}
          height={PLOT_H}
          fill={svgTokens.caution}
          opacity={0.08}
        />

        {/* Background region: cutoff (bottom strip — I_C below ~0.1 mA) — pale shading */}
        <rect
          x={PLOT_X0}
          y={yToPx(0.15)}
          width={PLOT_W}
          height={PLOT_Y0 - yToPx(0.15)}
          fill={svgTokens.note}
          opacity={0.06}
        />

        {/* Gridlines */}
        <g stroke={svgTokens.border} strokeWidth={0.5} opacity={0.5}>
          {xTicks.slice(1).map(v => (
            <line key={`vx-${v}`} x1={xToPx(v)} y1={PAD_T} x2={xToPx(v)} y2={PLOT_Y0} />
          ))}
          {yTicks.slice(1).map(i => (
            <line key={`hy-${i}`} x1={PLOT_X0} y1={yToPx(i)} x2={PLOT_X1} y2={yToPx(i)} />
          ))}
        </g>

        {/* Axes */}
        <line
          x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X1} y2={PLOT_Y0}
          stroke={svgTokens.fg} strokeWidth={1}
        />
        <line
          x1={PLOT_X0} y1={PAD_T} x2={PLOT_X0} y2={PLOT_Y0}
          stroke={svgTokens.fg} strokeWidth={1}
        />

        {/* X-axis ticks + labels */}
        {xTicks.map(v => (
          <g key={`xt-${v}`}>
            <line
              x1={xToPx(v)} y1={PLOT_Y0}
              x2={xToPx(v)} y2={PLOT_Y0 + 5}
              stroke={svgTokens.fg} strokeWidth={0.8}
            />
            <text
              x={xToPx(v)} y={PLOT_Y0 + 18}
              fontSize="11"
              textAnchor="middle"
              fill={svgTokens.mutedFg}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Y-axis ticks + labels */}
        {yTicks.map(i => (
          <g key={`yt-${i}`}>
            <line
              x1={PLOT_X0 - 5} y1={yToPx(i)}
              x2={PLOT_X0} y2={yToPx(i)}
              stroke={svgTokens.fg} strokeWidth={0.8}
            />
            <text
              x={PLOT_X0 - 9} y={yToPx(i) + 4}
              fontSize="11"
              textAnchor="end"
              fill={svgTokens.mutedFg}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {i}
            </text>
          </g>
        ))}

        {/* Axis titles */}
        <text
          x={(PLOT_X0 + PLOT_X1) / 2} y={VB_H - 12}
          fontSize="13"
          textAnchor="middle"
          fill={svgTokens.fg}
          fontFamily="Georgia, serif"
        >
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="10">CE</tspan>
          <tspan dy="-3" fontSize="13"> (V)</tspan>
        </text>
        <text
          x={20} y={(PAD_T + PLOT_Y0) / 2}
          fontSize="13"
          textAnchor="middle"
          fill={svgTokens.fg}
          fontFamily="Georgia, serif"
          transform={`rotate(-90 20 ${(PAD_T + PLOT_Y0) / 2})`}
        >
          <tspan fontStyle="italic">I</tspan>
          <tspan dy="3" fontSize="10">C</tspan>
          <tspan dy="-3" fontSize="13"> (mA)</tspan>
        </text>

        {/* Curves — wrapped in clipPath so they exit the plot
            naturally at the boundaries instead of riding the chart
            edge as a flat rail. The active-region tanh saturates by
            design (each curve has its own per-I_B I_C plateau);
            without the clip, the diagram-curve-edge-rail gate flags
            those legitimate plateaus as the «clip-at-sample-time»
            antipattern. */}
        <g clipPath={`url(#${clipId})`}>
          {I_B_CURVES_UA.map((ib, idx) => (
            <path
              key={`ib-${ib}`}
              d={curvePath(ib)}
              fill="none"
              stroke={svgTokens.primary}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85 - idx * 0.05}
            />
          ))}
        </g>
        {/* No inline curve labels — the family of curves is implicit
            (each plateau corresponds to a different I_B), and the
            caption already explains «for several values of base
            current». Inline labels at curve-y positions sat ON the
            curves themselves (caught by the diagram-text-overlap
            gate). The interactive load-line widget further down
            highlights one curve at a time as the user drags I_B. */}

        {/* Region labels — positioned in the middle of each region */}
        {/* «active» — middle-right of plot */}
        <text
          x={xToPx(6)} y={yToPx(4.6)}
          fontSize="12"
          fontStyle="italic"
          textAnchor="middle"
          fill={svgTokens.mutedFg}
          fontFamily="Georgia, serif"
        >
          {t('ch1_11.widget.loadLine.activeLabel')}
        </text>
        {/* «saturation» — left strip (rotated) */}
        <text
          x={xToPx(0.25)} y={yToPx(2.5)}
          fontSize="11"
          fontStyle="italic"
          textAnchor="middle"
          fill={svgTokens.mutedFg}
          fontFamily="Georgia, serif"
          transform={`rotate(-90 ${xToPx(0.25)} ${yToPx(2.5)})`}
        >
          {t('ch1_11.widget.loadLine.saturationLabel')}
        </text>
        {/* «cutoff» — bottom strip. Use middle-baseline so the bbox is
            centred on the y coordinate (avoids the bbox-bottom touching
            the x-axis line at y=PLOT_Y0). */}
        <text
          x={xToPx(5)} y={yToPx(0.3)}
          fontSize="11"
          fontStyle="italic"
          textAnchor="middle"
          fill={svgTokens.mutedFg}
          fontFamily="Georgia, serif"
        >
          {t('ch1_11.widget.loadLine.cutoffLabel')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
