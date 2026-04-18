import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal, formatNumber } from '@/lib/format'

/**
 * Chapter 1.2 §5 — Battery Runtime Calculator
 *
 * Three inputs (capacity, nominal voltage, drain current) → two
 * outputs (stored energy in Wh, runtime at that drain, auto-scaled
 * to minutes / hours / days).
 *
 * Formula:
 *   energy (Wh)      = voltage (V) × capacity (mAh) / 1000
 *   runtime (hours)  = capacity (mAh) / drain (mA)
 *
 * Defaults: 2000 mAh × 1.2 V (typical AA NiMH) driving a 30 mA load
 * (small radio RX) → 2.4 Wh stored, 66.7 hours of runtime.
 *
 * No SVG; plain HTML form controls inside the `Widget` shell.
 */

/* ── Unit tables ──────────────────────────────────────────────────── */

const CAP_TO_MAH: Record<string, number> = { mah: 1, ah: 1000 }
const CAP_UNIT_ORDER = ['mah', 'ah']

const V_TO_V: Record<string, number> = { mv: 1e-3, v: 1, kv: 1e3 }
const V_UNIT_ORDER = ['mv', 'v', 'kv']

const I_TO_MA: Record<string, number> = { ua: 1e-3, ma: 1, a: 1000 }
const I_UNIT_ORDER = ['ua', 'ma', 'a']

/* ── Component ────────────────────────────────────────────────────── */

export default function RuntimeCalculator() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [capDisplay, setCapDisplay] = useState<string>('2000')
  const [capUnit, setCapUnit] = useState<string>('mah')
  const [vDisplay, setVDisplay] = useState<string>('1.2')
  const [vUnit, setVUnit] = useState<string>('v')
  const [iDisplay, setIDisplay] = useState<string>('30')
  const [iUnit, setIUnit] = useState<string>('ma')

  const parseDisp = (s: string): number => {
    const n = Number.parseFloat(s.replace(',', '.').trim())
    return Number.isFinite(n) ? n : 0
  }

  const capMah = parseDisp(capDisplay) * (CAP_TO_MAH[capUnit] ?? 1)
  const voltageV = parseDisp(vDisplay) * (V_TO_V[vUnit] ?? 1)
  const drainMa = parseDisp(iDisplay) * (I_TO_MA[iUnit] ?? 1)

  const energyWh = useMemo(
    () => (voltageV * capMah) / 1000,
    [voltageV, capMah],
  )
  const runtimeHours = useMemo(
    () => (drainMa > 0 ? capMah / drainMa : null),
    [capMah, drainMa],
  )

  const formatEnergy = (wh: number): string => {
    if (!Number.isFinite(wh) || wh <= 0) return '—'
    const digits = wh < 0.1 ? 3 : wh < 10 ? 2 : wh < 100 ? 1 : 0
    return `${formatDecimal(wh, digits, locale)} ${tUnit('wh')}`
  }

  // Runtime auto-scales: < 1 h → min; 1–48 h → hours; > 48 h → days.
  // The "days" unit is an i18n key (not in the units namespace) because
  // UA abbreviates differently ("дн" / "днів") than EN ("days").
  const formatRuntime = (h: number | null): string => {
    if (h == null || !Number.isFinite(h) || h < 0) return '—'
    if (h < 1) {
      const min = h * 60
      return `${formatNumber(Math.round(min), locale)} ${tUnit('min')}`
    }
    if (h < 48) {
      const digits = h < 10 ? 2 : 1
      return `${formatDecimal(h, digits, locale)} ${tUnit('h')}`
    }
    const days = h / 24
    const digits = days < 10 ? 2 : days < 100 ? 1 : 0
    return `${formatDecimal(days, digits, locale)} ${t('ch1_2.widget.runtime.daysUnit')}`
  }

  return (
    <Widget
      title={t('ch1_2.widget.runtime.title')}
      description={t('ch1_2.widget.runtime.description')}
    >
      {/* ── Inputs ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <NumericUnitRow
          idSuffix="cap"
          label={t('ch1_2.widget.runtime.capacityLabel')}
          value={capDisplay}
          onChange={setCapDisplay}
          unit={capUnit}
          onUnitChange={setCapUnit}
          unitOrder={CAP_UNIT_ORDER}
          tUnit={tUnit}
        />
        <NumericUnitRow
          idSuffix="v"
          label={t('ch1_2.widget.runtime.voltageLabel')}
          value={vDisplay}
          onChange={setVDisplay}
          unit={vUnit}
          onUnitChange={setVUnit}
          unitOrder={V_UNIT_ORDER}
          tUnit={tUnit}
        />
        <NumericUnitRow
          idSuffix="i"
          label={t('ch1_2.widget.runtime.drainLabel')}
          value={iDisplay}
          onChange={setIDisplay}
          unit={iUnit}
          onUnitChange={setIUnit}
          unitOrder={I_UNIT_ORDER}
          tUnit={tUnit}
        />
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="success">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-foreground">
                {t('ch1_2.widget.runtime.energyResultLabel')}
              </span>
              <span className="text-xl font-mono font-semibold text-foreground">
                {formatEnergy(energyWh)}
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground self-end">
              = V · Q
            </p>
          </div>
        </ResultBox>

        <ResultBox tone="success">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-foreground">
                {t('ch1_2.widget.runtime.runtimeResultLabel')}
              </span>
              <span className="text-xl font-mono font-semibold text-foreground">
                {formatRuntime(runtimeHours)}
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground self-end">
              = Q / I
            </p>
          </div>
        </ResultBox>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('ch1_2.widget.runtime.hint')}
      </p>
    </Widget>
  )
}

/* ── Input row sub-component ──────────────────────────────────────── */

interface RowProps {
  idSuffix: string
  label: string
  value: string
  onChange: (s: string) => void
  unit: string
  onUnitChange: (u: string) => void
  unitOrder: string[]
  tUnit: (k: string) => string
}

function NumericUnitRow({
  idSuffix, label, value, onChange, unit, onUnitChange, unitOrder, tUnit,
}: RowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label
        htmlFor={`rt-${idSuffix}`}
        className="text-foreground font-medium shrink-0 min-w-[10rem]"
      >
        {label}
      </label>
      <input
        id={`rt-${idSuffix}`}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground w-28 font-mono"
      />
      <select
        value={unit}
        onChange={e => onUnitChange(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground"
        aria-label={label}
      >
        {unitOrder.map(u => (
          <option key={u} value={u}>{tUnit(u)}</option>
        ))}
      </select>
    </div>
  )
}
