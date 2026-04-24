import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.5 — Capacitors in series and in parallel.
 *
 * Sibling of ch 1.4's SeriesParallelCalc, but for capacitance and with
 * the formulas FLIPPED:
 *
 *   Parallel   — C₁ + C₂             (always larger than either)
 *   Series     — C₁·C₂ / (C₁ + C₂)   (always smaller than either)
 *
 * Values are entered in pF/nF/µF and the readout autoscales the unit.
 * The layout deliberately mirrors SeriesParallelCalc so readers who
 * have just finished ch 1.4 see that only the two column LABELS and
 * the two FORMULAS have swapped — everything else is identical.
 */

const UNIT_SCALES: Record<string, { mult: number; unitKey: string }> = {
  pf:  { mult: 1e-12, unitKey: 'pf' },
  nf:  { mult: 1e-9,  unitKey: 'nf' },
  uf:  { mult: 1e-6,  unitKey: 'uf' },
}

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Pick an appropriate display unit for a farad value.
 *  Mirrors `pickUnit` in SeriesParallelCalc, for caps. */
function pickUnit(farads: number): { value: number; unitKey: string } {
  if (farads >= 1e-6) return { value: farads / 1e-6, unitKey: 'uf' }
  if (farads >= 1e-9) return { value: farads / 1e-9, unitKey: 'nf' }
  return { value: farads / 1e-12, unitKey: 'pf' }
}

function formatValue(farads: number, num: (n: number) => string): string {
  if (farads === 0) return num(0)
  const { value } = pickUnit(farads)
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
        htmlFor={`spc-val-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-24"
      >
        {t(labelKey)}
      </label>
      <input
        id={`spc-val-${idSuffix}`}
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
        {(['pf', 'nf', 'uf'] as const).map(u => (
          <option key={u} value={u}>{tUnit(u)}</option>
        ))}
      </select>
    </div>
  )
}

export default function SeriesParallelCapCalc() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Defaults: 10 µF and 22 µF — a common mismatched pair; parallel 32 µF,
  // series ≈ 6.875 µF — both in the same decade so the comparison reads
  // cleanly.
  const [disp1, setDisp1] = useState('10')
  const [unit1, setUnit1] = useState('uf')
  const [disp2, setDisp2] = useState('22')
  const [unit2, setUnit2] = useState('uf')

  const c1 = parseValue(disp1) * UNIT_SCALES[unit1].mult
  const c2 = parseValue(disp2) * UNIT_SCALES[unit2].mult

  const { parallelF, seriesF } = useMemo(() => {
    const parallel = c1 + c2
    const series = c1 > 0 && c2 > 0 ? (c1 * c2) / (c1 + c2) : 0
    return { parallelF: parallel, seriesF: series }
  }, [c1, c2])

  const parallelUnit = pickUnit(parallelF).unitKey
  const seriesUnit = pickUnit(seriesF).unitKey

  return (
    <Widget
      title={t('ch1_5.widget.combine.title')}
      description={t('ch1_5.widget.combine.description')}
    >
      {/* ── Inputs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <InputRow
          labelKey="ch1_5.widget.combine.c1Label"
          disp={disp1} setDisp={setDisp1}
          unit={unit1} setUnit={setUnit1}
          idSuffix="1" t={t} tUnit={tUnit}
        />
        <InputRow
          labelKey="ch1_5.widget.combine.c2Label"
          disp={disp2} setDisp={setDisp2}
          unit={unit2} setUnit={setUnit2}
          idSuffix="2" t={t} tUnit={tUnit}
        />
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="info" label={t('ch1_5.widget.combine.parallelLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {formatValue(parallelF, num)} {tUnit(parallelUnit)}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t('ch1_5.widget.combine.parallelFormulaLabel')}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch1_5.widget.combine.seriesLabel')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {formatValue(seriesF, num)} {tUnit(seriesUnit)}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t('ch1_5.widget.combine.seriesFormulaLabel')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_5.widget.combine.hint')}
      </p>
    </Widget>
  )
}
