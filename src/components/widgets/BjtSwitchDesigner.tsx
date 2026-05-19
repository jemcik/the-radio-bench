import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { withSubscripts } from '@/lib/text-with-subscripts'
import { MathVar } from '@/components/ui/math'

/**
 * Chapter 1.11 §2 — BJT switch designer.
 *
 * Reader picks logic-input voltage V_in, target collector current I_C
 * (load), worst-case β, and the base overdrive factor; the widget
 * computes:
 *   – required base current      I_B  = (overdrive · I_C) / β
 *   – suggested base resistor     R_b  = (V_in − V_BE) / I_B
 *     (rounded down to the nearest E12 standard value)
 *   – β·I_B vs I_C check          (sanity: are we firmly saturated?)
 *
 * Pure-HTML form controls inside the Widget shell — no SVG, no
 * scaling. Same numeric-calculator pattern as CutoffCalculator and
 * OhmsCalculator.
 */

const V_BE = 0.7

// E12 standard resistor values (Ω) — used to snap R_b to the nearest
// commonly-stocked value. We pick the LARGEST E12 value that is ≤ the
// computed R_b, because picking a SMALLER R_b → MORE base current →
// MORE saturation, which is the safe direction.
const E12_BASE = [
  10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
]

function snapDownE12(rOhms: number): number {
  if (rOhms <= 0) return 0
  // Find decade
  const decade = Math.floor(Math.log10(rOhms))
  const norm = rOhms / Math.pow(10, decade)
  // Largest E12 base that is <= norm; if norm < 10 pick the largest base ≤ norm·10
  // (because norm is in [1, 10) for proper decade pick)
  // E12_BASE values are 10..82 → norm·10 lands in [10, 100); search there.
  const target = norm * 10
  let best = E12_BASE[0]
  for (const b of E12_BASE) {
    if (b <= target) best = b
  }
  return (best / 10) * Math.pow(10, decade)
}

function formatCurrent(amps: number, num: (n: number) => string): string {
  if (!Number.isFinite(amps) || amps <= 0) return `${num(0)} mA`
  if (amps >= 1) return `${num(Math.round(amps * 100) / 100)} A`
  if (amps >= 1e-3) return `${num(Math.round((amps * 1e3) * 100) / 100)} mA`
  if (amps >= 1e-6) return `${num(Math.round((amps * 1e6) * 10) / 10)} µA`
  return `${num(Math.round(amps * 1e9))} nA`
}

function formatOhms(ohms: number, num: (n: number) => string): string {
  if (!Number.isFinite(ohms) || ohms <= 0) return `${num(0)} Ω`
  if (ohms >= 1e6) return `${num(Math.round((ohms / 1e6) * 100) / 100)} MΩ`
  if (ohms >= 1e3) return `${num(Math.round((ohms / 1e3) * 100) / 100)} kΩ`
  return `${num(Math.round(ohms))} Ω`
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
        htmlFor={`bjt-switch-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-44"
      >
        {withSubscripts(t(labelKey))}
      </label>
      <input
        id={`bjt-switch-${idSuffix}`}
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

export default function BjtSwitchDesigner() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()

  // Defaults: 3.3 V logic input, 10 mA load (typical LED at 3 V),
  // β = 50 (worst-case 2N3904), 5× overdrive.
  const [vin, setVin] = useState(3.3)
  const [icMa, setIcMa] = useState(10)
  const [beta, setBeta] = useState(50)
  const [overdrive, setOverdrive] = useState(5)

  const computed = useMemo(() => {
    const ic = icMa * 1e-3
    const ib = (overdrive * ic) / beta
    const drive = vin - V_BE
    const rb = drive > 0 && ib > 0 ? drive / ib : 0
    const rbSnapped = snapDownE12(rb)
    const ibActual = drive > 0 && rbSnapped > 0 ? drive / rbSnapped : 0
    const betaIb = beta * ibActual
    const saturated = betaIb >= ic
    return { ic, ib, ibActual, rb, rbSnapped, betaIb, saturated }
  }, [vin, icMa, beta, overdrive])

  return (
    <Widget
      title={t('ch1_11.widget.bjtSwitch.title')}
      description={withSubscripts(t('ch1_11.widget.bjtSwitch.description'))}
    >
      <div className="grid grid-cols-1 gap-3">
        <SliderRow
          labelKey="ch1_11.widget.bjtSwitch.vinLabel"
          min={1.8} max={12} step={0.1}
          value={vin} onChange={setVin}
          unit="V" display={num(Math.round(vin * 10) / 10)}
          idSuffix="vin" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.bjtSwitch.icLabel"
          min={1} max={500} step={1}
          value={icMa} onChange={setIcMa}
          unit="mA" display={num(icMa)}
          idSuffix="ic" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.bjtSwitch.betaLabel"
          min={20} max={500} step={10}
          value={beta} onChange={setBeta}
          unit="" display={num(beta)}
          idSuffix="beta" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.bjtSwitch.overdriveLabel"
          min={1} max={20} step={1}
          value={overdrive} onChange={setOverdrive}
          unit="×" display={num(overdrive)}
          idSuffix="od" t={t}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={withSubscripts(t('ch1_11.widget.bjtSwitch.labelBaseCurrent'))}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatCurrent(computed.ib, num)}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={withSubscripts(t('ch1_11.widget.bjtSwitch.labelBaseResistor'))}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatOhms(computed.rbSnapped, num)}
          </p>
        </ResultBox>
        <ResultBox tone="warn" label={withSubscripts(t('ch1_11.widget.bjtSwitch.labelCollectorCurrent'))}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatCurrent(computed.ic, num)}
          </p>
        </ResultBox>
      </div>

      <ResultBox tone={computed.saturated ? 'success' : 'error'} label="">
        <p className="text-sm text-foreground leading-6">
          {computed.saturated ? (
            <Trans
              i18nKey="ch1_11.widget.bjtSwitch.readoutSaturated"
              ns="ui"
              values={{ beta_ib: formatCurrent(computed.betaIb, num) }}
              components={{ var: <MathVar />, strong: <strong /> }}
            />
          ) : (
            <Trans
              i18nKey="ch1_11.widget.bjtSwitch.readoutNotSaturated"
              ns="ui"
              values={{ beta_ib: formatCurrent(computed.betaIb, num) }}
              components={{ var: <MathVar />, strong: <strong /> }}
            />
          )}
        </p>
      </ResultBox>
    </Widget>
  )
}
