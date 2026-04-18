import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal } from '@/lib/format'

/**
 * Chapter 1.2 §4 — Resistor Safe-Zone Calculator
 *
 * The reader enters a supply voltage and picks a resistor's wattage
 * rating; the widget computes R_min = V² / P_rated — the smallest
 * resistor value you can put across that supply without exceeding
 * the rating. Any R ≥ R_min is safe.
 *
 * This is AoE Exercise 1.5 generalised: "what is the minimum-safe R
 * on a given supply with a given rating?" The power form used is
 * P = V² / R rearranged for R — which is why this widget lives in
 * §4 AFTER the three-form discussion in §2.
 *
 * Design: same two-control pattern as OhmsCalculator but simpler —
 * one numeric input (voltage) + one dropdown (standard rating). The
 * result is a single R_min readout with the substituted formula
 * shown underneath for pedagogy. Plain HTML, no scaling.
 */

/* ── Data ─────────────────────────────────────────────────────────── */

/** Standard resistor power ratings the reader will actually encounter. */
const STANDARD_RATINGS: { value: number; label: string }[] = [
  { value: 1 / 16, label: '1/16' },
  { value: 1 / 8, label: '1/8' },
  { value: 1 / 4, label: '1/4' },
  { value: 1 / 2, label: '1/2' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
]
const DEFAULT_RATING_IDX = 2 // 1/4 W — the everyday through-hole value

const V_UNITS: Record<string, number> = { mv: 1e-3, v: 1, kv: 1e3 }
const V_UNIT_ORDER = ['mv', 'v', 'kv']

/* ── Formatting ───────────────────────────────────────────────────── */

function formatResistance(
  ohms: number,
  tUnit: (k: string) => string,
  locale: string,
): string {
  if (!Number.isFinite(ohms) || ohms <= 0) return '—'
  if (ohms < 1000) {
    const digits = ohms < 10 ? 2 : ohms < 100 ? 1 : 0
    return `${formatDecimal(ohms, digits, locale)} ${tUnit('ohm')}`
  }
  if (ohms < 1e6) {
    const k = ohms / 1000
    const digits = k < 10 ? 2 : k < 100 ? 1 : 0
    return `${formatDecimal(k, digits, locale)} ${tUnit('kohm')}`
  }
  const m = ohms / 1e6
  return `${formatDecimal(m, 2, locale)} ${tUnit('mohm')}`
}

/* ── Component ────────────────────────────────────────────────────── */

export default function SafeZoneCalculator() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Defaults: V = 12 V (ham-radio / hobby typical), rating = 1/4 W →
  // R_min = 144 / 0.25 = 576 Ω.
  const [vDisplay, setVDisplay] = useState<string>('12')
  const [vUnit, setVUnit] = useState<string>('v')
  const [ratingIdx, setRatingIdx] = useState<number>(DEFAULT_RATING_IDX)

  const parseDisplay = (s: string): number => {
    const n = Number.parseFloat(s.replace(',', '.').trim())
    return Number.isFinite(n) ? n : 0
  }
  const vSI = parseDisplay(vDisplay) * (V_UNITS[vUnit] ?? 1)
  const rating = STANDARD_RATINGS[ratingIdx]

  const rMin = useMemo(
    () => (rating.value > 0 ? (vSI * vSI) / rating.value : 0),
    [vSI, rating.value],
  )

  return (
    <Widget
      title={t('ch1_2.widget.safeZone.title')}
      description={t('ch1_2.widget.safeZone.description')}
    >
      {/* ── Inputs ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Voltage row */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label
            htmlFor="sz-v"
            className="text-foreground font-medium shrink-0"
          >
            {t('ch1_2.widget.safeZone.voltageLabel')}
          </label>
          <input
            id="sz-v"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={vDisplay}
            onChange={e => setVDisplay(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <select
            value={vUnit}
            onChange={e => setVUnit(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground"
            aria-label={t('ch1_2.widget.safeZone.unitPickerLabel')}
          >
            {V_UNIT_ORDER.map(u => (
              <option key={u} value={u}>{tUnit(u)}</option>
            ))}
          </select>
        </div>

        {/* Rating row */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label
            htmlFor="sz-rating"
            className="text-foreground font-medium shrink-0"
          >
            {t('ch1_2.widget.safeZone.ratingLabel')}
          </label>
          <select
            id="sz-rating"
            value={ratingIdx}
            onChange={e => setRatingIdx(Number(e.target.value))}
            className="border border-border rounded px-2 py-1 bg-background text-foreground"
          >
            {STANDARD_RATINGS.map((r, i) => (
              <option key={i} value={i}>
                {r.label} {tUnit('w')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Result ───────────────────────────────────────────────── */}
      <ResultBox tone="success">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-foreground">
              {t('ch1_2.widget.safeZone.resultLabel')}
            </span>
            <span className="text-xl font-mono font-semibold text-foreground">
              ≥ {formatResistance(rMin, tUnit, locale)}
            </span>
          </div>
          <p className="text-xs font-mono text-muted-foreground self-end">
            R ≥ V² / P = ({formatDecimal(vSI, vSI < 10 ? 1 : 0, locale)} {tUnit('v')})² / {rating.label} {tUnit('w')}
          </p>
        </div>
      </ResultBox>

      <p className="text-xs text-muted-foreground">
        {t('ch1_2.widget.safeZone.hint')}
      </p>
    </Widget>
  )
}
