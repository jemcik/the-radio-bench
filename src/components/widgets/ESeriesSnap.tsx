import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.4 — Snap-to-preferred-value widget.
 *
 * Reader types an arbitrary resistance (in ohms) and a scale selector;
 * the widget finds the nearest value in each of the common E-series
 * (E12 ±10 %, E24 ±5 %, E48 ±2 %, E96 ±1 %) and reports the value plus
 * the percentage error from the target. Shown side by side, the rows
 * make the "tighter tolerance = finer grid" point immediately visible:
 * a target that's 6 % off the closest E12 value is almost always dead
 * on with E96.
 */

/* ── E-series tables — mantissas for one decade ──────────────────── */

const E12 = [
  1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2,
]

const E24 = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
]

const E48 = [
  1.00, 1.05, 1.10, 1.15, 1.21, 1.27, 1.33, 1.40, 1.47, 1.54, 1.62, 1.69,
  1.78, 1.87, 1.96, 2.05, 2.15, 2.26, 2.37, 2.49, 2.61, 2.74, 2.87, 3.01,
  3.16, 3.32, 3.48, 3.65, 3.83, 4.02, 4.22, 4.42, 4.64, 4.87, 5.11, 5.36,
  5.62, 5.90, 6.19, 6.49, 6.81, 7.15, 7.50, 7.87, 8.25, 8.66, 9.09, 9.53,
]

const E96 = [
  1.00, 1.02, 1.05, 1.07, 1.10, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27, 1.30,
  1.33, 1.37, 1.40, 1.43, 1.47, 1.50, 1.54, 1.58, 1.62, 1.65, 1.69, 1.74,
  1.78, 1.82, 1.87, 1.91, 1.96, 2.00, 2.05, 2.10, 2.15, 2.21, 2.26, 2.32,
  2.37, 2.43, 2.49, 2.55, 2.61, 2.67, 2.74, 2.80, 2.87, 2.94, 3.01, 3.09,
  3.16, 3.24, 3.32, 3.40, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92, 4.02, 4.12,
  4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99, 5.11, 5.23, 5.36, 5.49,
  5.62, 5.76, 5.90, 6.04, 6.19, 6.34, 6.49, 6.65, 6.81, 6.98, 7.15, 7.32,
  7.50, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87, 9.09, 9.31, 9.53, 9.76,
]

/* ── Snap algorithm ──────────────────────────────────────────────── */

/**
 * Find the closest preferred value (in ohms) in `series` to `target` ohms.
 * Works across any decade by searching the neighbours of target's own
 * decade.
 */
function snap(target: number, series: number[]): number {
  if (target <= 0) return 0
  const logT = Math.log10(target)
  const decade = Math.floor(logT)
  const scale = Math.pow(10, decade)
  // Search the mantissas in this decade AND the one above (for targets
  // near the top of their decade where the nearest value wraps into
  // the next decade, e.g. target=95 → E12 gives 100 from the next
  // decade, not 82 from this one).
  const candidates = [
    ...series.map(m => m * scale),
    ...series.map(m => m * scale * 10),
    series[0] * scale / 10,  // also one-below for targets near the bottom
  ]
  let best = candidates[0]
  let bestErr = Math.abs(best - target)
  for (const c of candidates) {
    const err = Math.abs(c - target)
    if (err < bestErr) {
      best = c
      bestErr = err
    }
  }
  return best
}

/** Pick the right unit scale for display. */
function pickUnit(ohms: number): { value: number; unitKey: string } {
  if (ohms >= 1e6) return { value: ohms / 1e6, unitKey: 'mohm' }
  if (ohms >= 1e3) return { value: ohms / 1e3, unitKey: 'kohm' }
  return { value: ohms, unitKey: 'ohm' }
}

/** Compact display for the value — trim trailing zeros via formatNumber. */
function formatValue(ohms: number, num: (n: number) => string): string {
  const { value } = pickUnit(ohms)
  const abs = Math.abs(value)
  const places = abs < 1 ? 3 : abs < 10 ? 2 : abs < 100 ? 1 : 0
  const factor = Math.pow(10, places)
  return num(Math.round(value * factor) / factor)
}

/* ── Component ────────────────────────────────────────────────────── */

const SERIES = [
  { id: 'e12', table: E12, labelKey: 'e12Label' as const },
  { id: 'e24', table: E24, labelKey: 'e24Label' as const },
  { id: 'e48', table: E48, labelKey: 'e48Label' as const },
  { id: 'e96', table: E96, labelKey: 'e96Label' as const },
]

const UNIT_SCALES: Record<string, { mult: number; unitKey: string }> = {
  ohm:  { mult: 1,    unitKey: 'ohm' },
  kohm: { mult: 1e3,  unitKey: 'kohm' },
  mohm: { mult: 1e6,  unitKey: 'mohm' },
}

export default function ESeriesSnap() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Default — the "5 kΩ that doesn't exist" example from the prose.
  const [rawInput, setRawInput] = useState('5000')
  const [unit, setUnit] = useState<'ohm' | 'kohm' | 'mohm'>('ohm')

  const parseInput = (s: string): number => {
    const n = Number.parseFloat(s.replace(',', '.').trim())
    return Number.isFinite(n) && n > 0 ? n : 0
  }

  const targetOhms = parseInput(rawInput) * UNIT_SCALES[unit].mult

  const snaps = useMemo(
    () => SERIES.map(s => {
      const value = snap(targetOhms, s.table)
      const errPct = targetOhms > 0 ? 100 * (value - targetOhms) / targetOhms : 0
      return { ...s, value, errPct }
    }),
    [targetOhms],
  )

  return (
    <Widget
      title={t('ch1_4.widget.eSeries.title')}
      description={t('ch1_4.widget.eSeries.description')}
    >
      {/* ── Target input ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="es-target" className="text-foreground font-medium shrink-0">
          {t('ch1_4.widget.eSeries.targetLabel')}
        </label>
        <input
          id="es-target"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          className="border border-border rounded px-2 py-1 bg-background text-foreground w-28 font-mono"
        />
        <select
          value={unit}
          onChange={e => setUnit(e.target.value as typeof unit)}
          className="border border-border rounded px-2 py-1 bg-background text-foreground"
          aria-label={t('ch1_4.widget.eSeries.unitPickerLabel')}
        >
          {(['ohm', 'kohm', 'mohm'] as const).map(u => (
            <option key={u} value={u}>{tUnit(u)}</option>
          ))}
        </select>
      </div>

      {/* ── E-series results ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {snaps.map(s => {
          const { unitKey } = pickUnit(s.value)
          const valueStr = `${formatValue(s.value, num)} ${tUnit(unitKey)}`
          const errStr = s.value > 0 ? `${fmt(s.errPct, 1)} %` : '—'
          // Tighter tolerance ⇒ smaller expected error ⇒ success tone.
          const tone = Math.abs(s.errPct) < 1
            ? 'success'
            : Math.abs(s.errPct) < 5
              ? 'info'
              : 'warn'
          return (
            <ResultBox
              key={s.id}
              tone={tone}
              label={t(`ch1_4.widget.eSeries.${s.labelKey}`)}
            >
              <p className="text-lg font-mono font-semibold text-foreground">{valueStr}</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {t('ch1_4.widget.eSeries.errorLabel')}: <span className="font-mono">{errStr}</span>
              </p>
            </ResultBox>
          )
        })}
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_4.widget.eSeries.hint')}
      </p>
    </Widget>
  )
}
