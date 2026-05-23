/**
 * Chapter 2.1 — wavelength ↔ frequency converter.
 *
 *   λ (m) = c / f      with c ≈ 3 × 10⁸ m/s
 *   → the ham shortcut: λ (m) = 300 / f (MHz)
 *
 * We use the rounded teaching value c = 3 × 10⁸ m/s on purpose, so the
 * widget agrees exactly with the «300 / f(MHz)» mnemonic the prose teaches.
 *
 * Two modes: enter a frequency → get a wavelength, or enter a wavelength →
 * get a frequency. When the frequency lands inside an amateur band the
 * widget names it (IARU Region 1 edges, approximate — cf. ARRL Handbook
 * 2023 band-plan tables).
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { MathVar } from '@/components/ui/math'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const C = 3e8 // speed of light, m/s (rounded → matches the 300/f(MHz) shortcut)

type Mode = 'lambda' | 'freq'

const F_SCALES: Record<string, number> = { khz: 1e3, mhz: 1e6, ghz: 1e9 }
const L_SCALES: Record<string, number> = { km: 1e3, m: 1, cm: 1e-2, mm: 1e-3 }

// Amateur bands, IARU Region 1 (Ukraine), approximate edges in MHz.
const BANDS: { lo: number; hi: number; n: number; u: string }[] = [
  { lo: 1.81, hi: 2.0, n: 160, u: 'm' },
  { lo: 3.5, hi: 3.8, n: 80, u: 'm' },
  { lo: 5.351, hi: 5.367, n: 60, u: 'm' },
  { lo: 7.0, hi: 7.2, n: 40, u: 'm' },
  { lo: 10.1, hi: 10.15, n: 30, u: 'm' },
  { lo: 14.0, hi: 14.35, n: 20, u: 'm' },
  { lo: 18.068, hi: 18.168, n: 17, u: 'm' },
  { lo: 21.0, hi: 21.45, n: 15, u: 'm' },
  { lo: 24.89, hi: 24.99, n: 12, u: 'm' },
  { lo: 28.0, hi: 29.7, n: 10, u: 'm' },
  { lo: 50.0, hi: 52.0, n: 6, u: 'm' },
  { lo: 144.0, hi: 146.0, n: 2, u: 'm' },
  { lo: 430.0, hi: 440.0, n: 70, u: 'cm' },
]

function findBand(hz: number) {
  const mhz = hz / 1e6
  return BANDS.find(b => mhz >= b.lo && mhz <= b.hi)
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

function pickLen(m: number): { value: number; unitKey: string } {
  if (m >= 1000) return { value: m / 1000, unitKey: 'km' }
  if (m >= 1) return { value: m, unitKey: 'm' }
  if (m >= 0.01) return { value: m * 100, unitKey: 'cm' }
  return { value: m * 1000, unitKey: 'mm' }
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
  /** Math symbol for the quantity, rendered italic (KaTeX) after the label. */
  symbol: string
  disp: string
  setDisp: (s: string) => void
  unit: string
  setUnit: (u: string) => void
  units: string[]
  idSuffix: string
  t: (k: string) => string
  tUnit: (k: string) => string
}

function InputRow({ labelKey, symbol, disp, setDisp, unit, setUnit, units, idSuffix, t, tUnit }: InputRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label htmlFor={`lf-val-${idSuffix}`} className="text-foreground font-medium shrink-0 w-36">
        {t(labelKey)} <MathVar>{symbol}</MathVar>
      </label>
      <input
        id={`lf-val-${idSuffix}`}
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

export default function WavelengthFrequencyConverter() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [mode, setMode] = useState<Mode>('lambda')
  // Default: 14.2 MHz (20-metre band) → λ ≈ 21.1 m.
  const [fDisp, setFDisp] = useState('14.2')
  const [fUnit, setFUnit] = useState('mhz')
  const [lDisp, setLDisp] = useState('21.1')
  const [lUnit, setLUnit] = useState('m')

  const computed = useMemo(() => {
    if (mode === 'lambda') {
      const fHz = parseValue(fDisp) * F_SCALES[fUnit]
      const lambdaM = fHz > 0 ? C / fHz : 0
      return { fHz, lambdaM }
    }
    const lambdaM = parseValue(lDisp) * L_SCALES[lUnit]
    const fHz = lambdaM > 0 ? C / lambdaM : 0
    return { fHz, lambdaM }
  }, [mode, fDisp, fUnit, lDisp, lUnit])

  const fOut = formatScaled(computed.fHz, pickFreq, num, 'hz')
  const lOut = formatScaled(computed.lambdaM, pickLen, num, 'm')
  const band = findBand(computed.fHz)

  return (
    <Widget
      title={t('ch2_1.widget.lambdaF.title')}
      description={<Trans i18nKey="ch2_1.widget.lambdaF.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* Mode selector */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-foreground font-medium shrink-0 w-36">{t('ch2_1.widget.lambdaF.modeLabel')}</span>
        {(['lambda', 'freq'] as const).map(m => (
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
            {t(m === 'lambda' ? 'ch2_1.widget.lambdaF.modeLambda' : 'ch2_1.widget.lambdaF.modeFreq')}
          </button>
        ))}
      </div>

      {/* Input depends on mode */}
      <div className="grid grid-cols-1 gap-3">
        {mode === 'lambda' ? (
          <InputRow
            labelKey="ch2_1.widget.lambdaF.freqLabel"
            symbol="f"
            disp={fDisp} setDisp={setFDisp}
            unit={fUnit} setUnit={setFUnit}
            units={['khz', 'mhz', 'ghz']}
            idSuffix="f" t={t} tUnit={tUnit}
          />
        ) : (
          <InputRow
            labelKey="ch2_1.widget.lambdaF.wavelengthLabel"
            symbol="λ"
            disp={lDisp} setDisp={setLDisp}
            unit={lUnit} setUnit={setLUnit}
            units={['km', 'm', 'cm', 'mm']}
            idSuffix="l" t={t} tUnit={tUnit}
          />
        )}
      </div>

      {/* Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone={mode === 'freq' ? 'success' : 'info'} label={t('ch2_1.widget.lambdaF.freqReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">{fOut.display} {tUnit(fOut.unitKey)}</p>
        </ResultBox>
        <ResultBox tone={mode === 'lambda' ? 'success' : 'info'} label={t('ch2_1.widget.lambdaF.wavelengthReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">{lOut.display} {tUnit(lOut.unitKey)}</p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch2_1.widget.lambdaF.bandReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {band ? `${band.n} ${tUnit(band.u)}` : t('ch2_1.widget.lambdaF.bandNone')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch2_1.widget.lambdaF.hint" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
