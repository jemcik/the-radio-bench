import { useId, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { withSubscripts } from '@/lib/text-with-subscripts'
import { svgTokens } from '@/components/diagrams/svgTokens'
import { MathVar } from '@/components/ui/math'

/**
 * Chapter 1.11 §5 — load line and the Q-point.
 *
 * Interactive overlay of:
 *   – Family of BJT output curves (4 curves at fixed I_B values)
 *   – User's load line (set by V_CC + R_C)
 *   – Highlighted curve at the user's chosen I_B
 *   – Q-point dot at the intersection
 *   – Headroom indicators showing distance to saturation / cutoff
 *
 * Curve model identical to `BjtOutputCurves`:
 *   I_C(V_CE) = β · I_B · tanh(V_CE / V_KNEE) · (1 + V_CE / V_EARLY)
 *
 * Q-point solver:
 *   Solve V_CC = I_C · R_C + V_CE for V_CE, given the active-region
 *   collector current I_C ≈ β · I_B · (1 + V_CE / V_EARLY). The Early
 *   correction is small enough that V_CE = V_CC − β·I_B·R_C is a
 *   second-order-accurate explicit answer; we use that and clamp into
 *   [V_CE_sat, V_CC] to handle saturation and cutoff edge cases.
 *
 * Plot domain matches `BjtOutputCurves` (V_CE up to 12 V, I_C up to
 * 6 mA) so the reader has the same reference frame as the static
 * diagram earlier in the chapter.
 */

const VB_W = 540
const VB_H = 360

const PAD_L = 64
const PAD_R = 24
const PAD_T = 28
const PAD_B = 50
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B
const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T + PLOT_H
const PLOT_X1 = PAD_L + PLOT_W

const VCE_MAX = 12
const IC_MAX = 6  // mA

const V_KNEE = 0.15
const V_EARLY = 100
const V_CE_SAT = 0.2

const SAMPLES = 200

const xToPx = (vce: number) => PLOT_X0 + (vce / VCE_MAX) * PLOT_W
const yToPx = (ic_mA: number) => PLOT_Y0 - (ic_mA / IC_MAX) * PLOT_H

function curvePath(beta: number, i_b_uA: number): string {
  const i_b_mA = i_b_uA / 1000
  let path = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const vce = (i / SAMPLES) * VCE_MAX
    const ic = beta * i_b_mA * Math.tanh(vce / V_KNEE) * (1 + vce / V_EARLY)
    const x = xToPx(vce)
    const y = yToPx(Math.min(ic, IC_MAX * 3))
    path += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return path
}

interface SliderRowProps {
  labelKey: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  unit: string
  display: string
  idSuffix: string
  t: (k: string) => string
}

function SliderRow({ labelKey, min, max, step, value, onChange, unit, display, idSuffix, t }: SliderRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label
        htmlFor={`load-line-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-44"
      >
        {withSubscripts(t(labelKey))}
      </label>
      <input
        id={`load-line-${idSuffix}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 min-w-[140px] accent-primary"
      />
      <span className="font-mono text-foreground w-24 text-right shrink-0">
        {display} {unit}
      </span>
    </div>
  )
}

export default function LoadLinePlotter() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const clipId = useId()

  const [vcc, setVcc] = useState(9)         // V — battery voltage
  const [rcKohm, setRcKohm] = useState(2.2) // kΩ — collector resistor
  const [ibUa, setIbUa] = useState(20)      // µA — base current
  const [beta, setBeta] = useState(100)     // current gain

  // ── Q-point solver ───────────────────────────────────────────
  // Active-region: I_C ≈ β · I_B (Early correction negligible for the
  // pedagogical pass). Then V_CE = V_CC − I_C · R_C. Clamp into
  // [V_CE_sat, V_CC] to handle saturation / cutoff edge cases.
  const computed = useMemo(() => {
    const i_b_mA = ibUa / 1000
    const i_c_active_mA = beta * i_b_mA   // mA
    const r_c_kohm = rcKohm
    const v_drop_active = i_c_active_mA * r_c_kohm  // mA × kΩ = V
    const v_ce_active = vcc - v_drop_active

    let v_ce: number
    let i_c: number
    let region: 'saturation' | 'active' | 'cutoff'
    if (i_c_active_mA <= 0) {
      v_ce = vcc
      i_c = 0
      region = 'cutoff'
    } else if (v_ce_active <= V_CE_SAT) {
      // Saturated — V_CE clamped, I_C set by load
      v_ce = V_CE_SAT
      i_c = (vcc - V_CE_SAT) / r_c_kohm
      region = 'saturation'
    } else {
      v_ce = v_ce_active
      i_c = i_c_active_mA
      region = 'active'
    }

    // Headroom
    const headroomUp = vcc - v_ce          // V (up to cutoff)
    const headroomDown = v_ce - V_CE_SAT   // V (down to saturation)

    return { v_ce, i_c, region, headroomUp, headroomDown }
  }, [vcc, rcKohm, ibUa, beta])

  // Load line endpoints in plot coordinates
  const loadLineX0 = xToPx(0)                              // V_CE = 0
  const loadLineY0 = yToPx(Math.min(vcc / rcKohm, IC_MAX)) // top intercept
  const loadLineX1 = xToPx(Math.min(vcc, VCE_MAX))         // bottom intercept
  const loadLineY1 = yToPx(0)

  // The fixed background curves (lighter)
  const backgroundIbs = [10, 20, 30, 40, 50]

  return (
    <Widget
      title={t('ch1_11.widget.loadLine.title')}
      description={
        <Trans
          i18nKey="ch1_11.widget.loadLine.description"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
    >
      <div className="grid grid-cols-1 gap-3">
        <SliderRow
          labelKey="ch1_11.widget.loadLine.vccLabel"
          min={3} max={12} step={0.5}
          value={vcc} onChange={setVcc}
          unit="V" display={num(Math.round(vcc * 10) / 10)}
          idSuffix="vcc" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.loadLine.rcLabel"
          min={0.5} max={10} step={0.1}
          value={rcKohm} onChange={setRcKohm}
          unit="kΩ" display={num(Math.round(rcKohm * 10) / 10)}
          idSuffix="rc" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.loadLine.ibLabel"
          min={5} max={50} step={1}
          value={ibUa} onChange={setIbUa}
          unit="µA" display={num(ibUa)}
          idSuffix="ib" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.loadLine.betaLabel"
          min={50} max={300} step={10}
          value={beta} onChange={setBeta}
          unit="" display={num(beta)}
          idSuffix="beta" t={t}
        />
      </div>

      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_11.widget.loadLine.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT_X0} y={PAD_T} width={PLOT_W} height={PLOT_H} />
          </clipPath>
        </defs>

        {/* Region shading — saturation */}
        <rect
          x={PLOT_X0} y={PAD_T}
          width={xToPx(0.5) - PLOT_X0} height={PLOT_H}
          fill={svgTokens.caution} opacity={0.08}
        />

        {/* Gridlines */}
        <g stroke={svgTokens.border} strokeWidth={0.5} opacity={0.4}>
          {[2, 4, 6, 8, 10, 12].map(v => (
            <line key={`gx-${v}`} x1={xToPx(v)} y1={PAD_T} x2={xToPx(v)} y2={PLOT_Y0} />
          ))}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <line key={`gy-${i}`} x1={PLOT_X0} y1={yToPx(i)} x2={PLOT_X1} y2={yToPx(i)} />
          ))}
        </g>

        {/* Axes */}
        <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X1} y2={PLOT_Y0} stroke={svgTokens.fg} strokeWidth={1} />
        <line x1={PLOT_X0} y1={PAD_T} x2={PLOT_X0} y2={PLOT_Y0} stroke={svgTokens.fg} strokeWidth={1} />

        {/* X ticks */}
        {[0, 2, 4, 6, 8, 10, 12].map(v => (
          <g key={`xt-${v}`}>
            <line x1={xToPx(v)} y1={PLOT_Y0} x2={xToPx(v)} y2={PLOT_Y0 + 5} stroke={svgTokens.fg} strokeWidth={0.8} />
            <text x={xToPx(v)} y={PLOT_Y0 + 18} fontSize="11" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif">{v}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <g key={`yt-${i}`}>
            <line x1={PLOT_X0 - 5} y1={yToPx(i)} x2={PLOT_X0} y2={yToPx(i)} stroke={svgTokens.fg} strokeWidth={0.8} />
            <text x={PLOT_X0 - 9} y={yToPx(i) + 4} fontSize="11" textAnchor="end" fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif">{i}</text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={(PLOT_X0 + PLOT_X1) / 2} y={VB_H - 12} fontSize="13" textAnchor="middle" fill={svgTokens.fg} fontFamily="Georgia, serif">
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="10">CE</tspan>
          <tspan dy="-3" fontSize="13"> (V)</tspan>
        </text>
        <text x={20} y={(PAD_T + PLOT_Y0) / 2} fontSize="13" textAnchor="middle" fill={svgTokens.fg} fontFamily="Georgia, serif" transform={`rotate(-90 20 ${(PAD_T + PLOT_Y0) / 2})`}>
          <tspan fontStyle="italic">I</tspan>
          <tspan dy="3" fontSize="10">C</tspan>
          <tspan dy="-3" fontSize="13"> (mA)</tspan>
        </text>

        {/* Background curves — fixed I_B values, faint */}
        <g clipPath={`url(#${clipId})`}>
          {backgroundIbs.map(ib => (
            <path
              key={`bg-${ib}`}
              d={curvePath(beta, ib)}
              fill="none"
              stroke={svgTokens.fg}
              strokeWidth={1}
              opacity={0.2}
            />
          ))}

          {/* Highlighted curve at user's chosen I_B */}
          <path
            d={curvePath(beta, ibUa)}
            fill="none"
            stroke={svgTokens.primary}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Load line — diagonal, dashed */}
          <line
            x1={loadLineX0} y1={loadLineY0}
            x2={loadLineX1} y2={loadLineY1}
            stroke={svgTokens.experiment}
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* Q-point — open circle at the intersection */}
          <circle
            cx={xToPx(computed.v_ce)}
            cy={yToPx(computed.i_c)}
            r={6}
            fill="hsl(var(--background))"
            stroke={svgTokens.primary}
            strokeWidth={2.4}
          />
        </g>

        {/* Load-line label, near the diagonal midpoint */}
        <text
          x={(loadLineX0 + loadLineX1) / 2 + 16}
          y={(loadLineY0 + loadLineY1) / 2 - 8}
          fontSize="12"
          fontStyle="italic"
          fill={svgTokens.experiment}
          fontFamily="Georgia, serif"
        >
          {t('ch1_11.widget.loadLine.loadLineLabel')}
        </text>

        {/* Q-point label — small offset to the right of the dot */}
        <text
          x={Math.min(xToPx(computed.v_ce) + 12, PLOT_X1 - 50)}
          y={yToPx(computed.i_c) - 8}
          fontSize="12"
          fontStyle="italic"
          fontWeight="600"
          fill={svgTokens.primary}
          fontFamily="Georgia, serif"
        >
          {t('ch1_11.widget.loadLine.qPointLabel')}
        </text>
      </svg>

      <ResultBox tone="info" label="">
        <div className="space-y-1.5 text-sm leading-6">
          <p>
            <Trans
              i18nKey="ch1_11.widget.loadLine.readoutQpoint"
              ns="ui"
              values={{
                v_ce: `${num(Math.round(computed.v_ce * 100) / 100)} V`,
                i_c: `${num(Math.round(computed.i_c * 100) / 100)} mA`,
              }}
              components={{ var: <MathVar />, strong: <strong /> }}
            />
          </p>
          <p>
            <Trans
              i18nKey="ch1_11.widget.loadLine.readoutSwingHeadroomUp"
              ns="ui"
              values={{ up: `${num(Math.round(computed.headroomUp * 100) / 100)} V` }}
              components={{ var: <MathVar />, strong: <strong /> }}
            />
            {' '}
            <Trans
              i18nKey="ch1_11.widget.loadLine.readoutSwingHeadroomDown"
              ns="ui"
              values={{ down: `${num(Math.round(computed.headroomDown * 100) / 100)} V` }}
              components={{ var: <MathVar />, strong: <strong /> }}
            />
          </p>
        </div>
      </ResultBox>
    </Widget>
  )
}
