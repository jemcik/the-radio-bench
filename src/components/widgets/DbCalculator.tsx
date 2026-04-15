import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ResultBox } from '@/components/ui/result-box'
import { cn } from '@/lib/utils'
import { formatDecimal, formatNumber, roundTo } from '@/lib/format'
import { dbToNatural, naturalToDb, type DbMode } from '@/lib/decibel'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 0.4 — interactive dB calculator with three modes:
 *   • power ratio:   ratio  ↔  dB   via 10·log₁₀(r)
 *   • voltage ratio: ratio  ↔  dB   via 20·log₁₀(r)
 *   • dBm ↔ watts:   power  ↔  dBm  via 10·log₁₀(P / 1 mW)
 *
 * Editing either field updates the other immediately. Empty / non-numeric
 * input simply hides the result panel rather than throwing.
 */

type Mode = DbMode

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
  const num = (x: number) => formatNumber(roundTo(x, 4), locale)
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

/**
 * Normalise a number string: trim whitespace, convert a comma decimal
 * separator to a period so `parseFloat` can read Ukrainian-style input
 * like "20,5". We use `type="text"` inputs (not `type="number"`) because
 * Chrome ignores the `lang` attribute on number inputs and always uses
 * the OS locale — which gave UK users' commas to EN-page readers.
 */
function normaliseDecimalString(raw: string): string {
  return raw.trim().replace(',', '.')
}

/**
 * Strip anything that isn't a digit, decimal separator (. or ,), or a
 * leading minus sign. Applied in onChange so that typing letters or
 * symbols is silently ignored at the input layer — same end-user feel as
 * `type="number"` but under our own control (so locale formatting stays
 * consistent). The parser still validates semantic correctness.
 */
function stripNonNumeric(raw: string): string {
  return raw.replace(/[^0-9.,-]/g, '')
}

/** Parse a string to a positive finite number, returning NaN otherwise. */
function parsePositive(raw: string): number {
  const trimmed = normaliseDecimalString(raw)
  if (!trimmed) return NaN
  const n = parseFloat(trimmed)
  if (!isFinite(n) || n <= 0) return NaN
  return n
}

/** Parse a string to a finite number (any sign). */
function parseNumber(raw: string): number {
  const trimmed = normaliseDecimalString(raw)
  if (!trimmed) return NaN
  const n = parseFloat(trimmed)
  return isFinite(n) ? n : NaN
}

export default function DbCalculator() {
  const { t } = useTranslation('ui')
  const { locale, fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
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
      const db = naturalToDb(natural, mode)
      return {
        ok: true,
        naturalValue: natural,
        naturalFormatted: formatNatural(natural, mode, tUnit, locale),
        dbValue: roundTo(db, 4),
        // One decimal place — matches the chapter's teaching landmarks
        // (+3 dB = ×2, +10 dB = ×10). Showing "3.01" for ratio 2 is
        // mathematically exact but clashes with the "+3 dB = ×2" rule
        // the reader has just been told to memorise. One decimal still
        // shows non-landmark ratios truthfully (ratio 3 → 4.8 dB) while
        // letting landmark values ("3.0", "6.0", "20.0") line up with
        // prose. Locale-aware — feeds the text input directly so the
        // user sees "3.0" in EN and "3,0" in UK regardless of OS.
        dbFormatted: formatDecimal(db, 1, locale),
      }
    }
    // Working from dB → natural
    const db = parseNumber(dbText)
    if (isNaN(db)) return { ok: false }
    const natural = dbToNatural(db, mode)
    return {
      ok: true,
      naturalValue: natural,
      naturalFormatted: formatNatural(natural, mode, tUnit, locale),
      dbValue: roundTo(db, 4),
      dbFormatted: formatDecimal(db, 1, locale),
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
    : (result.ok ? formatNumber(roundTo(result.naturalValue, 4), locale) : '')
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
            type="text"
            inputMode="decimal"
            value={naturalDisplay}
            onChange={(e) => {
              setEditing('natural')
              setNaturalText(stripNonNumeric(e.target.value))
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
            type="text"
            inputMode="decimal"
            value={dbDisplay}
            onChange={(e) => {
              setEditing('db')
              setDbText(stripNonNumeric(e.target.value))
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
                {fmt(result.dbValue, 1)}
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

          {/* Technical footnote — acknowledges that the displayed dB is
              rounded, and shows the exact values for readers who want
              to reconcile with textbook references that quote 3.01 dB
              and 6.02 dB. Kept deliberately small and muted so it reads
              as fine print rather than an instruction. */}
          <p className="text-[11px] leading-relaxed text-muted-foreground px-1">
            {t('ch0_4.dbCalculatorPrecisionNote')}
          </p>
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
