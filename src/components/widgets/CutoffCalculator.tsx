import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { withSubscripts } from '@/lib/text-with-subscripts'

/**
 * Chapter 1.8 — RC cutoff frequency calculator.
 *
 *   f_c = 1 / (2π · R · C)
 *   τ   = R · C        (RC time constant — the same number that drives Chapter 1.5)
 *
 * Three modes, picked with a segmented control:
 *   – Solve for f_c   (inputs R + C)
 *   – Solve for R     (inputs f_c + C)
 *   – Solve for C     (inputs f_c + R)
 *
 * Same formula works for both first-order RC low-pass and high-pass
 * filters — the cutoff frequency depends only on R·C, not on which
 * component is in series with the signal.
 */

type Mode = 'fc' | 'r' | 'c'

const R_SCALES: Record<string, { mult: number; unitKey: string }> = {
  ohm:  { mult: 1,    unitKey: 'ohm'  },
  kohm: { mult: 1e3,  unitKey: 'kohm' },
  mohm: { mult: 1e6,  unitKey: 'mohm' },
}

const C_SCALES: Record<string, { mult: number; unitKey: string }> = {
  pf: { mult: 1e-12, unitKey: 'pf' },
  nf: { mult: 1e-9,  unitKey: 'nf' },
  uf: { mult: 1e-6,  unitKey: 'uf' },
  mf: { mult: 1e-3,  unitKey: 'mf' },
}

const F_SCALES: Record<string, { mult: number; unitKey: string }> = {
  hz:  { mult: 1,   unitKey: 'hz'  },
  khz: { mult: 1e3, unitKey: 'khz' },
  mhz: { mult: 1e6, unitKey: 'mhz' },
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

function pickFarads(farads: number): { value: number; unitKey: string } {
  if (farads >= 1e-3) return { value: farads / 1e-3, unitKey: 'mf' }
  if (farads >= 1e-6) return { value: farads / 1e-6, unitKey: 'uf' }
  if (farads >= 1e-9) return { value: farads / 1e-9, unitKey: 'nf' }
  return { value: farads / 1e-12, unitKey: 'pf' }
}

function formatScaled(
  raw: number,
  pick: (n: number) => { value: number; unitKey: string },
  num: (n: number) => string,
  fallbackUnit: string,
): { display: string; unitKey: string } {
  if (!Number.isFinite(raw) || raw <= 0) return { display: num(0), unitKey: fallbackUnit }
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
        htmlFor={`cutoff-val-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-32"
      >
        {withSubscripts(t(labelKey))}
      </label>
      <input
        id={`cutoff-val-${idSuffix}`}
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

export default function CutoffCalculator() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [mode, setMode] = useState<Mode>('fc')

  // Default 1 kΩ × 100 nF → 1.59 kHz (the canonical telephone-quality LPF
  // example used in the prose). Each value also seeds the «target f_c»
  // input so switching modes lands on a sensible neighbourhood.
  const [rDisp, setRDisp] = useState('1')
  const [rUnit, setRUnit] = useState('kohm')
  const [cDisp, setCDisp] = useState('100')
  const [cUnit, setCUnit] = useState('nf')
  const [fcDisp, setFcDisp] = useState('1.59')
  const [fcUnit, setFcUnit] = useState('khz')

  const rOhm = parseValue(rDisp) * R_SCALES[rUnit].mult
  const cF = parseValue(cDisp) * C_SCALES[cUnit].mult
  const fcHz = parseValue(fcDisp) * F_SCALES[fcUnit].mult

  const computed = useMemo(() => {
    if (mode === 'fc') {
      if (rOhm <= 0 || cF <= 0) return { fcHz: 0, rOhm: 0, cF: 0, tauS: 0 }
      const fc = 1 / (2 * Math.PI * rOhm * cF)
      const tau = rOhm * cF
      return { fcHz: fc, rOhm, cF, tauS: tau }
    }
    if (mode === 'r') {
      if (fcHz <= 0 || cF <= 0) return { fcHz: 0, rOhm: 0, cF: 0, tauS: 0 }
      const r = 1 / (2 * Math.PI * fcHz * cF)
      const tau = r * cF
      return { fcHz, rOhm: r, cF, tauS: tau }
    }
    // mode === 'c'
    if (fcHz <= 0 || rOhm <= 0) return { fcHz: 0, rOhm: 0, cF: 0, tauS: 0 }
    const c = 1 / (2 * Math.PI * fcHz * rOhm)
    const tau = rOhm * c
    return { fcHz, rOhm, cF: c, tauS: tau }
  }, [mode, rOhm, cF, fcHz])

  const fcOut = formatScaled(computed.fcHz, pickFreq, num, 'hz')
  const rOut = formatScaled(computed.rOhm, pickOhms, num, 'ohm')
  const cOut = formatScaled(computed.cF, pickFarads, num, 'f')
  const tauOut = formatScaled(computed.tauS, pickTime, num, 's')

  return (
    <Widget
      title={withSubscripts(t('ch1_8.widget.cutoff.title'))}
      description={withSubscripts(t('ch1_8.widget.cutoff.description'))}
    >
      {/* Mode selector */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-foreground font-medium shrink-0 w-32">
          {t('ch1_8.widget.cutoff.modeLabel')}
        </span>
        {(['fc', 'r', 'c'] as const).map(m => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded border cursor-pointer transition-colors ${
              mode === m
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {withSubscripts(t(`ch1_8.widget.cutoff.mode${m.charAt(0).toUpperCase()}${m.slice(1)}`))}
          </button>
        ))}
      </div>

      {/* Inputs depend on mode */}
      <div className="grid grid-cols-1 gap-3">
        {(mode === 'fc' || mode === 'c') && (
          <InputRow
            labelKey="ch1_8.widget.cutoff.rLabel"
            disp={rDisp} setDisp={setRDisp}
            unit={rUnit} setUnit={setRUnit}
            units={['ohm', 'kohm', 'mohm']}
            idSuffix="r" t={t} tUnit={tUnit}
          />
        )}
        {(mode === 'fc' || mode === 'r') && (
          <InputRow
            labelKey="ch1_8.widget.cutoff.cLabel"
            disp={cDisp} setDisp={setCDisp}
            unit={cUnit} setUnit={setCUnit}
            units={['pf', 'nf', 'uf', 'mf']}
            idSuffix="c" t={t} tUnit={tUnit}
          />
        )}
        {(mode === 'r' || mode === 'c') && (
          <InputRow
            labelKey="ch1_8.widget.cutoff.fcLabel"
            disp={fcDisp} setDisp={setFcDisp}
            unit={fcUnit} setUnit={setFcUnit}
            units={['hz', 'khz', 'mhz']}
            idSuffix="fc" t={t} tUnit={tUnit}
          />
        )}
      </div>

      {/* Output panel — always shows the four derived values, with the
          mode's «solved» quantity highlighted by tone. The other two
          mirror the inputs so the row reads top-to-bottom as a complete
          picture. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultBox tone={mode === 'fc' ? 'success' : 'info'} label={withSubscripts(t('ch1_8.widget.cutoff.fcReadout'))}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fcOut.display} {tUnit(fcOut.unitKey)}
          </p>
        </ResultBox>
        <ResultBox tone={mode === 'r' ? 'success' : 'info'} label={t('ch1_8.widget.cutoff.rReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {rOut.display} {tUnit(rOut.unitKey)}
          </p>
        </ResultBox>
        <ResultBox tone={mode === 'c' ? 'success' : 'info'} label={t('ch1_8.widget.cutoff.cReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {cOut.display} {tUnit(cOut.unitKey)}
          </p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch1_8.widget.cutoff.tauReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {tauOut.display} {tUnit(tauOut.unitKey)}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {withSubscripts(t('ch1_8.widget.cutoff.hint'))}
      </p>
    </Widget>
  )
}
