import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.6 — Inductors in series and in parallel.
 *
 * Mirror of ch 1.5's SeriesParallelCapCalc, but the formulas are the
 * SAME as resistors (and the OPPOSITE of caps):
 *
 *   Series     — L₁ + L₂              (always larger than either)
 *   Parallel   — L₁·L₂ / (L₁ + L₂)    (always smaller than either)
 *
 * Values are entered in nH/µH/mH and the readout autoscales the unit.
 * Layout deliberately matches SeriesParallelCapCalc so the reader who
 * just compared the two side-by-side notices that only the column
 * labels and the formulas have flipped.
 */

const UNIT_SCALES: Record<string, { mult: number; unitKey: string }> = {
  nh: { mult: 1e-9, unitKey: 'nh' },
  uh: { mult: 1e-6, unitKey: 'uh' },
  mh: { mult: 1e-3, unitKey: 'mh' },
}

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

function pickUnit(henries: number): { value: number; unitKey: string } {
  if (henries >= 1e-3) return { value: henries / 1e-3, unitKey: 'mh' }
  if (henries >= 1e-6) return { value: henries / 1e-6, unitKey: 'uh' }
  return { value: henries / 1e-9, unitKey: 'nh' }
}

function formatValue(henries: number, num: (n: number) => string): string {
  if (henries === 0) return num(0)
  const { value } = pickUnit(henries)
  const abs = Math.abs(value)
  const places = abs < 1 ? 3 : abs < 10 ? 2 : abs < 100 ? 1 : 0
  const factor = Math.pow(10, places)
  return num(Math.round(value * factor) / factor)
}

interface RowProps {
  labelKey: string
  disp: string
  setDisp: (s: string) => void
  unit: string
  setUnit: (u: string) => void
  idSuffix: string
  t: (k: string) => string
  tUnit: (k: string) => string
}

function InputRow({ labelKey, disp, setDisp, unit, setUnit, idSuffix, t, tUnit }: RowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label
        htmlFor={`spi-val-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-24"
      >
        {t(labelKey)}
      </label>
      <input
        id={`spi-val-${idSuffix}`}
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
        {(['nh', 'uh', 'mh'] as const).map(u => (
          <option key={u} value={u}>{tUnit(u)}</option>
        ))}
      </select>
    </div>
  )
}

export default function SeriesParallelInductorCalc() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Defaults: 1 mH and 4.7 mH — a common mismatched pair; series 5.7 mH,
  // parallel ≈ 0.825 mH — both clearly in different decades for visibility.
  const [disp1, setDisp1] = useState('1')
  const [unit1, setUnit1] = useState('mh')
  const [disp2, setDisp2] = useState('4.7')
  const [unit2, setUnit2] = useState('mh')

  const l1 = parseValue(disp1) * UNIT_SCALES[unit1].mult
  const l2 = parseValue(disp2) * UNIT_SCALES[unit2].mult

  const { seriesH, parallelH } = useMemo(() => {
    const series = l1 + l2
    const parallel = l1 > 0 && l2 > 0 ? (l1 * l2) / (l1 + l2) : 0
    return { seriesH: series, parallelH: parallel }
  }, [l1, l2])

  const seriesUnit = pickUnit(seriesH).unitKey
  const parallelUnit = pickUnit(parallelH).unitKey

  return (
    <Widget
      title={t('ch1_6.widget.combine.title')}
      description={t('ch1_6.widget.combine.description')}
    >
      <div className="grid grid-cols-1 gap-3">
        <InputRow
          labelKey="ch1_6.widget.combine.l1Label"
          disp={disp1} setDisp={setDisp1}
          unit={unit1} setUnit={setUnit1}
          idSuffix="1" t={t} tUnit={tUnit}
        />
        <InputRow
          labelKey="ch1_6.widget.combine.l2Label"
          disp={disp2} setDisp={setDisp2}
          unit={unit2} setUnit={setUnit2}
          idSuffix="2" t={t} tUnit={tUnit}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="info" label={t('ch1_6.widget.combine.seriesLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {formatValue(seriesH, num)} {tUnit(seriesUnit)}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t('ch1_6.widget.combine.seriesFormulaLabel')}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_6.widget.combine.parallelLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {formatValue(parallelH, num)} {tUnit(parallelUnit)}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t('ch1_6.widget.combine.parallelFormulaLabel')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_6.widget.combine.hint')}
      </p>
    </Widget>
  )
}
