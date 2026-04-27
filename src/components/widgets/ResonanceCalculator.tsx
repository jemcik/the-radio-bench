import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.7 — Resonance frequency calculator.
 *
 *   f₀ = 1 / (2π√(LC))
 *   T  = 1 / f₀
 *   Z₀ = √(L / C)   — characteristic impedance (= |X_L| = |X_C| at f₀)
 *
 * Inputs: L (nH / µH / mH) and C (pF / nF / µF).
 * Outputs auto-scale to Hz / kHz / MHz / GHz, s / ms / µs / ns,
 * and Ω / kΩ / MΩ.
 */

const L_SCALES: Record<string, { mult: number; unitKey: string }> = {
  nh: { mult: 1e-9, unitKey: 'nh' },
  uh: { mult: 1e-6, unitKey: 'uh' },
  mh: { mult: 1e-3, unitKey: 'mh' },
}

const C_SCALES: Record<string, { mult: number; unitKey: string }> = {
  pf: { mult: 1e-12, unitKey: 'pf' },
  nf: { mult: 1e-9, unitKey: 'nf' },
  uf: { mult: 1e-6, unitKey: 'uf' },
}

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

function pickFreq(hz: number): { value: number; unitKey: string } {
  if (hz >= 1e9) return { value: hz / 1e9, unitKey: 'ghz' }
  if (hz >= 1e6) return { value: hz / 1e6, unitKey: 'mhz' }
  if (hz >= 1e3) return { value: hz / 1e3, unitKey: 'khz' }
  return { value: hz, unitKey: 'hz' }
}

function pickTime(s: number): { value: number; unitKey: string } {
  if (s >= 1) return { value: s, unitKey: 's' }
  if (s >= 1e-3) return { value: s / 1e-3, unitKey: 'ms' }
  if (s >= 1e-6) return { value: s / 1e-6, unitKey: 'us' }
  return { value: s / 1e-9, unitKey: 'ns' }
}

function pickOhms(ohms: number): { value: number; unitKey: string } {
  if (ohms >= 1e6) return { value: ohms / 1e6, unitKey: 'mohm' }
  if (ohms >= 1e3) return { value: ohms / 1e3, unitKey: 'kohm' }
  return { value: ohms, unitKey: 'ohm' }
}

function formatScaled(
  raw: number,
  pick: (n: number) => { value: number; unitKey: string },
  num: (n: number) => string,
): { display: string; unitKey: string } {
  if (!Number.isFinite(raw) || raw <= 0) return { display: num(0), unitKey: 'hz' }
  const { value, unitKey } = pick(raw)
  const abs = Math.abs(value)
  const places = abs < 1 ? 3 : abs < 10 ? 2 : abs < 100 ? 1 : 0
  const factor = Math.pow(10, places)
  return { display: num(Math.round(value * factor) / factor), unitKey }
}

interface InputRowProps {
  labelKey: string
  disp: string
  setDisp: (s: string) => void
  unit: string
  setUnit: (u: string) => void
  units: readonly string[]
  idSuffix: string
  t: (k: string) => string
  tUnit: (k: string) => string
}

function InputRow({ labelKey, disp, setDisp, unit, setUnit, units, idSuffix, t, tUnit }: InputRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label
        htmlFor={`rescalc-val-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-32"
      >
        {t(labelKey)}
      </label>
      <input
        id={`rescalc-val-${idSuffix}`}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        value={disp}
        onChange={e => setDisp(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
      />
      <select
        value={unit}
        onChange={e => setUnit(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground"
        aria-label={`${t(labelKey)} unit`}
      >
        {units.map(u => (
          <option key={u} value={u}>{tUnit(u)}</option>
        ))}
      </select>
    </div>
  )
}

export default function ResonanceCalculator() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Defaults: 4 µH × 130 pF — lands very close to 7 MHz (40-m amateur band).
  const [lDisp, setLDisp] = useState('4')
  const [lUnit, setLUnit] = useState('uh')
  const [cDisp, setCDisp] = useState('130')
  const [cUnit, setCUnit] = useState('pf')

  const lH = parseValue(lDisp) * L_SCALES[lUnit].mult
  const cF = parseValue(cDisp) * C_SCALES[cUnit].mult

  const { f0Hz, periodS, z0Ohm } = useMemo(() => {
    if (lH <= 0 || cF <= 0) return { f0Hz: 0, periodS: 0, z0Ohm: 0 }
    const omega = 1 / Math.sqrt(lH * cF)
    const f0 = omega / (2 * Math.PI)
    const T = 1 / f0
    const Z0 = Math.sqrt(lH / cF)
    return { f0Hz: f0, periodS: T, z0Ohm: Z0 }
  }, [lH, cF])

  const f0 = formatScaled(f0Hz, pickFreq, num)
  const T = formatScaled(periodS, pickTime, num)
  const Z0 = formatScaled(z0Ohm, pickOhms, num)

  return (
    <Widget
      title={t('ch1_7.widget.calc.title')}
      description={t('ch1_7.widget.calc.description')}
    >
      <div className="grid grid-cols-1 gap-3">
        <InputRow
          labelKey="ch1_7.widget.calc.lLabel"
          disp={lDisp} setDisp={setLDisp}
          unit={lUnit} setUnit={setLUnit}
          units={['nh', 'uh', 'mh']}
          idSuffix="l" t={t} tUnit={tUnit}
        />
        <InputRow
          labelKey="ch1_7.widget.calc.cLabel"
          disp={cDisp} setDisp={setCDisp}
          unit={cUnit} setUnit={setCUnit}
          units={['pf', 'nf', 'uf']}
          idSuffix="c" t={t} tUnit={tUnit}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={t('ch1_7.widget.calc.fLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {f0.display} {tUnit(f0.unitKey)}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_7.widget.calc.tLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {T.display} {tUnit(T.unitKey)}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch1_7.widget.calc.z0Label')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {Z0.display} {tUnit(Z0.unitKey)}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_7.widget.calc.hint')}
      </p>
    </Widget>
  )
}
