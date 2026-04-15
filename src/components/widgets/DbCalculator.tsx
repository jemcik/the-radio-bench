import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ResultBox } from '@/components/ui/result-box'
import { cn } from '@/lib/utils'
import { formatDecimal, formatNumber } from '@/lib/format'

/**
 * Chapter 0.4 — interactive dB calculator with three modes:
 *   • power ratio:   ratio  ↔  dB   via 10·log₁₀(r)
 *   • voltage ratio: ratio  ↔  dB   via 20·log₁₀(r)
 *   • dBm ↔ watts:   power  ↔  dBm  via 10·log₁₀(P / 1 mW)
 *
 * Editing either field updates the other immediately. Empty / non-numeric
 * input simply hides the result panel rather than throwing.
 */

type Mode = 'power' | 'voltage' | 'dbm'

type Result =
  | { ok: false }
  | {
      ok: true
      /** The "natural" left-hand value (ratio for ratio modes; watts for dBm mode) */
      naturalValue: number
      /** Pretty-printed natural value (with unit suffix where relevant) */
      naturalFormatted: string
      /** dB or dBm value */
      dbValue: number
      /** Pretty-printed dB value (one decimal place) */
      dbFormatted: string
    }

/** Round to 4 decimals — enough for engineering, swallows fp drift. */
function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000
}

/**
 * Format a "natural" value (ratio or watts) compactly.
 *
 * `tUnit` resolves a unit symbol via i18n (e.g. `tUnit('w')` → "W" / "Вт").
 * Watt-prefix words must be locale-aware — UK uses Вт/мВт/мкВт/кВт.
 * `locale` controls the decimal separator — Ukrainian uses a comma.
 */
function formatNatural(
  n: number,
  mode: Mode,
  tUnit: (k: string) => string,
  locale: string,
): string {
  const num = (x: number) => formatNumber(round4(x), locale)
  if (mode === 'dbm') {
    // Pick a sensible SI prefix from W down to fW.
    const abs = Math.abs(n)
    if (abs === 0) return `0 ${tUnit('w')}`
    if (abs >= 1e3)  return `${num(n / 1e3)} ${tUnit('kw')}`
    if (abs >= 1)    return `${num(n)} ${tUnit('w')}`
    if (abs >= 1e-3) return `${num(n * 1e3)} ${tUnit('mw')}`
    if (abs >= 1e-6) return `${num(n * 1e6)} ${tUnit('uw')}`
    if (abs >= 1e-9) return `${num(n * 1e9)} ${tUnit('nw')}`
    if (abs >= 1e-12) return `${num(n * 1e12)} ${tUnit('pw')}`
    if (abs >= 1e-15) return `${num(n * 1e15)} ${tUnit('fw')}`
    // Exponential form: localize the mantissa's decimal separator too.
    const expStr = n.toExponential(2)
    return `${locale.startsWith('uk') ? expStr.replace('.', ',') : expStr} ${tUnit('w')}`
  }
  // Ratio modes — show as a plain number, with a "×" prefix for clarity.
  return `×${num(n)}`
}

/** Parse a string to a positive finite number, returning NaN otherwise. */
function parsePositive(raw: string): number {
  const trimmed = raw.trim()
  if (!trimmed) return NaN
  const n = parseFloat(trimmed)
  if (!isFinite(n) || n <= 0) return NaN
  return n
}

/** Parse a string to a finite number (any sign). */
function parseNumber(raw: string): number {
  const trimmed = raw.trim()
  if (!trimmed) return NaN
  const n = parseFloat(trimmed)
  return isFinite(n) ? n : NaN
}

export default function DbCalculator() {
  const { t, i18n } = useTranslation('ui')
  const locale = i18n.language
  // Helper to fetch a unit symbol from the shared `units` namespace.
  // Wrapped in useCallback so the identity is stable across renders —
  // otherwise the result useMemo below would have to take it as a dep
  // and recompute on every render (defeating the memo).
  const tUnit = useCallback((k: string) => t(`units.${k}`), [t])
  const [mode, setMode] = useState<Mode>('power')

  // We track which field the user last edited, then derive the other.
  // Storing strings (rather than numbers) preserves typing UX — the user can
  // type "1." or "-" on the way to a real number without flicker.
  const [naturalText, setNaturalText] = useState<string>('100')
  const [dbText, setDbText] = useState<string>('20')
  const [editing, setEditing] = useState<'natural' | 'db'>('natural')

  // Mode change resets to a sensible starting pair so the reader sees
  // the new mode's behaviour immediately rather than a stale conversion.
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    setEditing('natural')
    if (newMode === 'dbm') {
      setNaturalText('1')   // 1 W
      setDbText('30')        // = +30 dBm
    } else if (newMode === 'voltage') {
      setNaturalText('2')    // ×2
      setDbText('6')         // ≈ +6 dB
    } else {
      setNaturalText('100')  // ×100
      setDbText('20')        // = +20 dB
    }
  }

  const result = useMemo<Result>(() => {
    const naturalIsActive = editing === 'natural'
    if (naturalIsActive) {
      const natural = parsePositive(naturalText)
      if (isNaN(natural)) return { ok: false }
      let db: number
      if (mode === 'voltage') db = 20 * Math.log10(natural)
      else if (mode === 'power') db = 10 * Math.log10(natural)
      else db = 10 * Math.log10(natural / 0.001)  // watts → dBm
      return {
        ok: true,
        naturalValue: natural,
        naturalFormatted: formatNatural(natural, mode, tUnit, locale),
        dbValue: round4(db),
        // Machine-format (period) — feeds the <input type="number"> value.
        // Localized separator is applied at display time in the ResultBox.
        dbFormatted: db.toFixed(2),
      }
    }
    // Working from dB → natural
    const db = parseNumber(dbText)
    if (isNaN(db)) return { ok: false }
    let natural: number
    if (mode === 'voltage') natural = Math.pow(10, db / 20)
    else if (mode === 'power') natural = Math.pow(10, db / 10)
    else natural = 0.001 * Math.pow(10, db / 10)  // dBm → watts
    return {
      ok: true,
      naturalValue: natural,
      naturalFormatted: formatNatural(natural, mode, tUnit, locale),
      dbValue: round4(db),
      dbFormatted: db.toFixed(2),
    }
  }, [editing, naturalText, dbText, mode, tUnit, locale])

  const naturalLabel =
    mode === 'power'
      ? t('ch0_4.dbCalculatorRatioLabel')
      : mode === 'voltage'
        ? t('ch0_4.dbCalculatorVoltageLabel')
        : t('ch0_4.dbCalculatorPowerLabel')

  const dbLabel = mode === 'dbm' ? t('ch0_4.dbCalculatorDbmLabel') : t('ch0_4.dbCalculatorDbLabel')

  // Formulas use the localized unit symbols so a Ukrainian reader sees
  // "дБ = 20 · log₁₀(V₁ / V₂)" and "дБм = 10 · log₁₀(P / 1 мВт)" rather
  // than the English originals. Variables (V, P) stay universal.
  const formula =
    mode === 'voltage'
      ? `${tUnit('db')} = 20 · log₁₀(V₁ / V₂)`
      : mode === 'power'
        ? `${tUnit('db')} = 10 · log₁₀(P₁ / P₂)`
        : `${tUnit('dbm')} = 10 · log₁₀(P / 1 ${tUnit('mw')})`

  // When `editing === 'db'` the natural field is a derived display value;
  // mirror the result back so the input shows the converted figure.
  const naturalDisplay = editing === 'natural'
    ? naturalText
    : (result.ok ? round4(result.naturalValue).toString() : '')
  const dbDisplay = editing === 'db'
    ? dbText
    : (result.ok ? result.dbFormatted : '')

  // Power-ratio reference table — same eight landmarks the prose called out.
  // Used in all three modes; the units differ but the +/− dB landmarks are universal.
  const REF = [
    { key: 'dbCalculatorRefMinus20', accent: false },
    { key: 'dbCalculatorRefMinus10', accent: false },
    { key: 'dbCalculatorRefMinus3',  accent: false },
    { key: 'dbCalculatorRef0',       accent: true  },
    { key: 'dbCalculatorRefPlus3',   accent: false },
    { key: 'dbCalculatorRefPlus10',  accent: false },
    { key: 'dbCalculatorRefPlus20',  accent: false },
    { key: 'dbCalculatorRefPlus30',  accent: false },
  ] as const

  return (
    <Widget
      title={t('ch0_4.dbCalculatorTitle')}
      description={t('ch0_4.dbCalculatorDescription')}
    >
      {/* Mode selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="dbcalc-mode">
          {t('ch0_4.dbCalculatorMode')}
        </label>
        <Select
          id="dbcalc-mode"
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as Mode)}
        >
          <option value="power">{t('ch0_4.dbCalculatorModePower')}</option>
          <option value="voltage">{t('ch0_4.dbCalculatorModeVoltage')}</option>
          <option value="dbm">{t('ch0_4.dbCalculatorModeDbm')}</option>
        </Select>
      </div>

      {/* The two paired inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="dbcalc-natural">
            {naturalLabel}
            {mode === 'dbm' && (
              <span className="ml-1 text-xs text-muted-foreground">({tUnit('w')})</span>
            )}
          </label>
          <Input
            id="dbcalc-natural"
            type="number"
            value={naturalDisplay}
            onChange={(e) => {
              setEditing('natural')
              setNaturalText(e.target.value)
            }}
            placeholder={t('ch0_4.dbCalculatorPlaceholder')}
          />
        </div>

        <div className="hidden sm:flex items-center justify-center pb-2 text-muted-foreground text-xl">
          ↔
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="dbcalc-db">
            {dbLabel}
          </label>
          <Input
            id="dbcalc-db"
            type="number"
            value={dbDisplay}
            onChange={(e) => {
              setEditing('db')
              setDbText(e.target.value)
            }}
            placeholder={t('ch0_4.dbCalculatorPlaceholder')}
          />
        </div>
      </div>

      {/* Result panel */}
      {result.ok ? (
        <div className="space-y-3 pt-2 border-t border-border">
          <ResultBox tone="success" label={t('ch0_4.dbCalculatorResult')}>
            <p className="text-2xl font-mono font-bold text-foreground">
              <span className="bg-callout-experiment/20 border border-callout-experiment/40 px-2 py-0.5 rounded">
                {result.naturalFormatted}
              </span>
              <span className="text-muted-foreground mx-3 text-xl">↔</span>
              <span className="bg-callout-onair/20 border border-callout-onair/40 px-2 py-0.5 rounded">
                {formatDecimal(result.dbValue, 2, locale)}
                {' '}
                <span className="text-base font-semibold">
                  {mode === 'dbm' ? tUnit('dbm') : tUnit('db')}
                </span>
              </span>
            </p>
          </ResultBox>

          <ResultBox tone="info" label={t('ch0_4.dbCalculatorFormula')} className="p-3">
            <p className="font-mono text-sm text-foreground">{formula}</p>
          </ResultBox>

          {mode === 'voltage' && (
            <ResultBox tone="warn" className="p-3">
              <p className="text-xs text-foreground">{t('ch0_4.dbCalculatorTrap')}</p>
            </ResultBox>
          )}
        </div>
      ) : (
        <ResultBox tone="muted" className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('ch0_4.dbCalculatorInvalid')}
          </p>
        </ResultBox>
      )}

      {/* Quick reference — 8 landmark dB values */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {t('ch0_4.dbCalculatorReference')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {REF.map((r) => (
            <div
              key={r.key}
              className={cn(
                'px-2 py-1.5 rounded border text-center font-mono transition-colors',
                r.accent
                  ? 'bg-primary/10 border-primary/40 text-foreground font-semibold'
                  : 'bg-muted border-border text-foreground',
              )}
            >
              {t(`ch0_4.${r.key}`)}
            </div>
          ))}
        </div>
      </div>
    </Widget>
  )
}
