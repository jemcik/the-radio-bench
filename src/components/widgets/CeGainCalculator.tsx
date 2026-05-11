import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { withSubscripts } from '@/lib/text-with-subscripts'
import { MathVar } from '@/components/ui/math'

/**
 * Chapter 1.11 §6 — common-emitter gain calculator.
 *
 * Reader picks V_CC, R_C, R_E, and the divider (R_1, R_2). The widget
 * computes:
 *   – V_B  = V_CC · R_2 / (R_1 + R_2)
 *   – V_E  = V_B − V_BE
 *   – I_C  ≈ I_E = V_E / R_E
 *   – V_C  = V_CC − I_C · R_C
 *   – gain ≈ −R_C / R_E
 *   – maximum undistorted swing = min(V_C, V_CC − V_C) — i.e. the
 *     smaller of the two distances from V_C to the rails
 *
 * Plus a tone-flag on the Q-point: «saturated», «cutoff», or
 * «in active region — clean swing» — depending on whether V_C
 * lands within the working envelope.
 */

const V_BE = 0.7

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
        htmlFor={`ce-gain-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-44"
      >
        {withSubscripts(t(labelKey))}
      </label>
      <input
        id={`ce-gain-${idSuffix}`}
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

export default function CeGainCalculator() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()

  // Defaults from the worked example in the chapter prose:
  // V_CC = 9 V, R_C = 2.2 kΩ, R_E = 470 Ω, R_1 = 47 kΩ, R_2 = 10 kΩ
  // → V_B ≈ 1.6, V_E ≈ 0.9, I_C ≈ 1.9 mA, V_C ≈ 4.8, gain ≈ −4.7
  const [vcc, setVcc] = useState(9)
  const [rcKohm, setRcKohm] = useState(2.2)
  const [reOhm, setReOhm] = useState(470)
  const [r1Kohm, setR1Kohm] = useState(47)
  const [r2Kohm, setR2Kohm] = useState(10)

  const computed = useMemo(() => {
    const r1 = r1Kohm * 1e3
    const r2 = r2Kohm * 1e3
    const re = reOhm
    const rc = rcKohm * 1e3
    const v_b = (vcc * r2) / (r1 + r2)
    const v_e = Math.max(0, v_b - V_BE)
    const i_c = re > 0 ? v_e / re : 0  // A
    const v_c_raw = vcc - i_c * rc
    const v_c = Math.max(0, v_c_raw)
    const gain = re > 0 ? -rc / re : 0
    // Maximum undistorted output swing (peak): smaller of (V_C − V_CE_sat) and
    // (V_CC − V_C), where V_CE_sat ≈ 0.2 V is the saturation floor.
    const swingDown = Math.max(0, v_c - 0.2)
    const swingUp = Math.max(0, vcc - v_c)
    const swingPeak = Math.min(swingDown, swingUp)

    let tone: 'success' | 'warn' | 'error'
    let warnKey: string
    if (v_c < 0.5) {
      tone = 'error'
      warnKey = 'ch1_11.widget.ceGain.warnSaturated'
    } else if (vcc - v_c < 0.5) {
      tone = 'error'
      warnKey = 'ch1_11.widget.ceGain.warnCutoff'
    } else {
      tone = 'success'
      warnKey = 'ch1_11.widget.ceGain.warnGood'
    }

    return { v_b, v_e, v_c, i_c, gain, swingPeak, tone, warnKey }
  }, [vcc, rcKohm, reOhm, r1Kohm, r2Kohm])

  const fmtVolt = (v: number) => `${num(Math.round(v * 100) / 100)} V`
  const fmtCurrent = (a: number) => {
    if (a >= 1e-3) return `${num(Math.round(a * 1e3 * 100) / 100)} mA`
    if (a >= 1e-6) return `${num(Math.round(a * 1e6 * 10) / 10)} µA`
    return `${num(Math.round(a * 1e9))} nA`
  }
  const fmtGain = (g: number) => num(Math.round(g * 100) / 100)

  return (
    <Widget
      title={t('ch1_11.widget.ceGain.title')}
      description={
        <Trans
          i18nKey="ch1_11.widget.ceGain.description"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
    >
      <div className="grid grid-cols-1 gap-3">
        <SliderRow
          labelKey="ch1_11.widget.ceGain.vccLabel"
          min={3} max={15} step={0.5}
          value={vcc} onChange={setVcc}
          unit="V" display={num(Math.round(vcc * 10) / 10)}
          idSuffix="vcc" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.ceGain.rcLabel"
          min={0.5} max={10} step={0.1}
          value={rcKohm} onChange={setRcKohm}
          unit="kΩ" display={num(Math.round(rcKohm * 10) / 10)}
          idSuffix="rc" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.ceGain.reLabel"
          min={100} max={2200} step={10}
          value={reOhm} onChange={setReOhm}
          unit="Ω" display={num(reOhm)}
          idSuffix="re" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.ceGain.r1Label"
          min={10} max={150} step={1}
          value={r1Kohm} onChange={setR1Kohm}
          unit="kΩ" display={num(r1Kohm)}
          idSuffix="r1" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.ceGain.r2Label"
          min={1} max={47} step={1}
          value={r2Kohm} onChange={setR2Kohm}
          unit="kΩ" display={num(r2Kohm)}
          idSuffix="r2" t={t}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={withSubscripts(t('ch1_11.widget.ceGain.labelVb'))}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmtVolt(computed.v_b)}</p>
        </ResultBox>
        <ResultBox tone="info" label={withSubscripts(t('ch1_11.widget.ceGain.labelVe'))}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmtVolt(computed.v_e)}</p>
        </ResultBox>
        <ResultBox tone="info" label={withSubscripts(t('ch1_11.widget.ceGain.labelVc'))}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmtVolt(computed.v_c)}</p>
        </ResultBox>
        <ResultBox tone="warn" label={withSubscripts(t('ch1_11.widget.ceGain.labelIc'))}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmtCurrent(computed.i_c)}</p>
        </ResultBox>
        <ResultBox tone="success" label={withSubscripts(t('ch1_11.widget.ceGain.labelGain'))}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmtGain(computed.gain)}</p>
        </ResultBox>
        <ResultBox tone="primary" label={withSubscripts(t('ch1_11.widget.ceGain.labelSwing'))}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmtVolt(computed.swingPeak)}</p>
        </ResultBox>
      </div>

      <ResultBox tone={computed.tone} label="">
        <p className="text-sm text-foreground leading-6">
          {t(computed.warnKey)}
        </p>
      </ResultBox>
    </Widget>
  )
}
