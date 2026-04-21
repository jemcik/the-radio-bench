import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.4 — Series and parallel calculator.
 *
 * Two resistor inputs; two computed results displayed side by side:
 *
 *   Series      — R₁ + R₂   (always larger than either)
 *   Parallel    — R₁·R₂/(R₁+R₂)   (always smaller than either)
 *
 * The whole point of putting them side by side is so the reader can see
 * the asymmetry between the two combinations when R₁ ≫ R₂ or R₁ ≪ R₂,
 * which is the content of the "shortcut" callout in the prose.
 */

const UNIT_SCALES: Record<string, { mult: number; unitKey: string }> = {
  ohm:  { mult: 1,    unitKey: 'ohm' },
  kohm: { mult: 1e3,  unitKey: 'kohm' },
  mohm: { mult: 1e6,  unitKey: 'mohm' },
}

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

function pickUnit(ohms: number): { value: number; unitKey: string } {
  if (ohms >= 1e6) return { value: ohms / 1e6, unitKey: 'mohm' }
  if (ohms >= 1e3) return { value: ohms / 1e3, unitKey: 'kohm' }
  return { value: ohms, unitKey: 'ohm' }
}

function formatValue(ohms: number, num: (n: number) => string): string {
  if (ohms === 0) return num(0)
  const { value } = pickUnit(ohms)
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
        htmlFor={`sp-val-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-24"
      >
        {t(labelKey)}
      </label>
      <input
        id={`sp-val-${idSuffix}`}
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
        {(['ohm', 'kohm', 'mohm'] as const).map(u => (
          <option key={u} value={u}>{tUnit(u)}</option>
        ))}
      </select>
    </div>
  )
}

export default function SeriesParallelCalc() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Defaults: 1 kΩ + 4.7 kΩ — a mix that shows asymmetry immediately.
  const [disp1, setDisp1] = useState('1')
  const [unit1, setUnit1] = useState('kohm')
  const [disp2, setDisp2] = useState('4.7')
  const [unit2, setUnit2] = useState('kohm')

  const r1 = parseValue(disp1) * UNIT_SCALES[unit1].mult
  const r2 = parseValue(disp2) * UNIT_SCALES[unit2].mult

  const { seriesOhms, parallelOhms } = useMemo(() => {
    const series = r1 + r2
    const parallel = r1 > 0 && r2 > 0 ? (r1 * r2) / (r1 + r2) : 0
    return { seriesOhms: series, parallelOhms: parallel }
  }, [r1, r2])

  const seriesUnit = pickUnit(seriesOhms).unitKey
  const parallelUnit = pickUnit(parallelOhms).unitKey

  return (
    <Widget
      title={t('ch1_4.widget.combine.title')}
      description={t('ch1_4.widget.combine.description')}
    >
      {/* ── Inputs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <InputRow
          labelKey="ch1_4.widget.combine.r1Label"
          disp={disp1} setDisp={setDisp1}
          unit={unit1} setUnit={setUnit1}
          idSuffix="1" t={t} tUnit={tUnit}
        />
        <InputRow
          labelKey="ch1_4.widget.combine.r2Label"
          disp={disp2} setDisp={setDisp2}
          unit={unit2} setUnit={setUnit2}
          idSuffix="2" t={t} tUnit={tUnit}
        />
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="info" label={t('ch1_4.widget.combine.seriesLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {formatValue(seriesOhms, num)} {tUnit(seriesUnit)}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t('ch1_4.widget.combine.seriesFormulaLabel')}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_4.widget.combine.parallelLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {formatValue(parallelOhms, num)} {tUnit(parallelUnit)}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t('ch1_4.widget.combine.parallelFormulaLabel')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_4.widget.combine.hint')}
      </p>
    </Widget>
  )
}
