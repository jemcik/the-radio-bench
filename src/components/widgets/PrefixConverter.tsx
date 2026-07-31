import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSiLabels } from '@/features/si/useSiLabels'
import { ArrowRight } from 'lucide-react'
import Widget from '@/components/ui/widget'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ResultBox } from '@/components/ui/result-box'
import { cn } from '@/lib/utils'
import { formatNumber, formatScientific } from '@/lib/format'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { SI_PREFIXES, UNITY_PREFIX_INDEX } from '@/features/si/prefixes'

// Converter offers the full pico → tera range used in radio
// (terahertz appears in the prefix ladder; keep the converter in step).
const PREFIXES = SI_PREFIXES
const DEFAULT_SOURCE = UNITY_PREFIX_INDEX
const DEFAULT_TARGET = UNITY_PREFIX_INDEX + 1  // 'kilo'

interface PrefixConverterProps {
  /** Base unit symbol (e.g., "Ω" for ohms) */
  /** `units.*` key for the base unit (`ohm`, `hz`, …), so it localises with the prefix. */
  baseUnitKey?: string
}

type Result =
  | { ok: false }
  | {
      ok: true
      value: number
      formatted: string
      decimalMovement: number
    }

export default function PrefixConverter({ baseUnitKey = 'ohm' }: PrefixConverterProps) {
  const { t } = useTranslation('ui')
  const { sym, symBoth, nameOnly, unit } = useSiLabels()
  const baseUnit = unit(baseUnitKey)
  /** Render a signed integer with a real minus sign, parenthesised when negative. */
  const fmtSigned = (n: number) => (n < 0 ? `(−${Math.abs(n)})` : String(n))
  /** Same minus sign, no parentheses — for a result, which needs no bracketing. */
  const signed = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n))
  const { locale } = useLocaleFormatter()
  const [inputValue, setInputValue] = useState('')
  const [sourceIndex, setSourceIndex] = useState(DEFAULT_SOURCE)
  const [targetIndex, setTargetIndex] = useState(DEFAULT_TARGET)

  const source = PREFIXES[sourceIndex]
  const target = PREFIXES[targetIndex]

  /**
   * Reader-flagged: the step said «зсунути кому на 3 позиції вправо» over
   * «47 МОм → 47000 кОм» — and 47 has no comma to move. Printing one («47,»)
   * only swapped the problem: in Ukrainian a comma followed by a space reads as
   * an enumeration. So the numbers stay as typed and the step says where the
   * separator is instead, and only when it is not already on screen.
   * MUST stay below the `useState` above it — reading `inputValue` before its
   * declaration is a temporal-dead-zone crash that `tsc`, the gates and the unit
   * tests all pass clean.
   */
  const pointIsImplicit = !/[.,]/.test(inputValue)

  const result = useMemo<Result>(() => {
    // Normalise: comma decimal separators (Ukrainian-style "1,5") are
    // accepted in addition to period. The input is `type="text"` so the
    // raw string arrives exactly as typed, without browser re-formatting.
    const trimmed = inputValue.trim().replace(',', '.')
    if (!trimmed) return { ok: false }

    const num = parseFloat(trimmed)
    if (isNaN(num)) return { ok: false }

    // Convert via base unit so rounding doesn't compound.
    const baseValue = num * Math.pow(10, source.exponent)
    const converted = baseValue / Math.pow(10, target.exponent)
    const decimalMovement = source.exponent - target.exponent

    let formatted: string
    if (Math.abs(converted) < 0.00001 && converted !== 0) {
      // Use scientific notation for very small numbers
      formatted = formatScientific(converted, 7, locale)
    } else if (converted % 1 === 0) {
      formatted = formatNumber(converted, locale)
    } else {
      // Max 8 significant figures, trim trailing zeros, then localize separator.
      const trimmed = converted.toPrecision(8).replace(/\.?0+$/, '')
      formatted = locale.startsWith('uk') ? trimmed.replace('.', ',') : trimmed
    }

    return { ok: true, value: converted, formatted, decimalMovement }
  }, [inputValue, source.exponent, target.exponent, locale])

  return (
    <Widget
      title={t('ch0_3.prefixConverterTitle')}
      description={t('ch0_3.prefixConverterDescription')}
    >
      <div className="space-y-4">
        {/* Number Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('ch0_3.prefixConverterEnter')}
          </label>
          <Input
            type="text"
            inputMode="decimal"
            value={inputValue}
            // Strip anything that isn't a digit, decimal separator, or
            // minus sign — silently ignore letters/symbols the way a
            // `type="number"` input would, while we keep display-format
            // control (Chrome ignores `lang` on number inputs).
            onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.,-]/g, ''))}
            placeholder={t('ch0_3.prefixConverterPlaceholder')}
          />
        </div>

        {/* From / To selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('ch0_3.prefixConverterFrom')}
            </label>
            <Select
              value={sourceIndex}
              onChange={(e) => setSourceIndex(parseInt(e.target.value))}
            >
              {PREFIXES.map((prefix, idx) => (
                <option key={idx} value={idx}>
                  {t(`ch0_3.prefixName_${prefix.name}`)}
                  {prefix.exponent !== 0 && ` ${prefix.powerLabel}`}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('ch0_3.prefixConverterTo')}
            </label>
            <Select
              value={targetIndex}
              onChange={(e) => setTargetIndex(parseInt(e.target.value))}
            >
              {PREFIXES.map((prefix, idx) => (
                <option key={idx} value={idx}>
                  {t(`ch0_3.prefixName_${prefix.name}`)}
                  {prefix.exponent !== 0 && ` ${prefix.powerLabel}`}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Result */}
      {result.ok && (
        <div className="space-y-4 pt-2 border-t border-border">
          <ResultBox tone="success" label={t('ch0_3.prefixConverterResult')}>
            <p className="text-2xl font-mono font-bold text-foreground">
              {result.formatted}{' '}
              <span className="text-callout-experiment">
                {sym(target)}{baseUnit}
              </span>
            </p>
          </ResultBox>

          {/* Step-by-step visualization */}
          <ResultBox tone="info" label={t('ch0_3.prefixConverterSteps')}>
            <div className="flex flex-wrap items-center justify-start gap-3">
              <span className="font-mono bg-callout-note/10 px-2 py-1 rounded border border-callout-note/30 text-sm">
                {inputValue} {sym(source)}{baseUnit}
              </span>

              {result.decimalMovement !== 0 && (
                <>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground text-center">
                    <span className="block">{t('ch0_3.prefixConverterMoveDecimal')}</span>
                    <span className="block font-semibold text-foreground">
                      {t('ch0_3.prefixConverterPlaces', {
                        count: Math.abs(result.decimalMovement),
                        direction: t(
                          result.decimalMovement > 0
                            ? 'ch0_3.prefixConverterDirectionRight'
                            : 'ch0_3.prefixConverterDirectionLeft',
                        ),
                      })}
                    </span>
                    {pointIsImplicit && (
                      <span className="block text-[11px] leading-tight opacity-80">
                        {t('ch0_3.prefixConverterImplicitPoint')}
                      </span>
                    )}
                  </div>
                </>
              )}

              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono bg-callout-experiment/10 px-2 py-1 rounded border border-callout-experiment/30 text-sm">
                {result.formatted} {sym(target)}{baseUnit}
              </span>
            </div>
          </ResultBox>

          {/* Exponent Explanation */}
          {result.decimalMovement !== 0 && (
            <ResultBox tone="warn" className="p-3">
              <p className="text-[13px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {t('ch0_3.prefixConverterExponentDiff')}
                </span>{' '}
                {/* All three numbers use U+2212 MINUS; a bare `-3` from JS number
                    formatting put an ASCII hyphen next to a real minus in the same
                    nine-character expression. Parentheses only where a sign needs them. */}
                {fmtSigned(source.exponent)} − {fmtSigned(target.exponent)} = {signed(result.decimalMovement)}
              </p>
            </ResultBox>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result.ok && (
        <ResultBox tone="muted" className="text-center">
          <p className="text-sm text-muted-foreground">
            {inputValue.trim()
              ? t('ch0_3.prefixConverterInvalid')
              : t('ch0_3.prefixConverterEmpty')}
          </p>
        </ResultBox>
      )}

      {/* Reference Table */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {t('ch0_3.prefixConverterReference')}
        </p>
        {/* Reference grid intentionally omits the unity (10⁰) row — it has
            no symbol to decode, so a card explaining "no prefix means no
            prefix" adds noise. Unity is still selectable in the dropdowns
            and remains the default source. */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {PREFIXES.map((prefix, idx) => {
            if (prefix.exponent === 0) return null
            return (
              <div
                key={idx}
                className={cn(
                  'px-2 py-1.5 rounded border text-center transition-colors',
                  sourceIndex === idx
                    ? 'bg-callout-note/10 border-callout-note/30 font-semibold'
                    : targetIndex === idx
                      ? 'bg-callout-experiment/10 border-callout-experiment/30 font-semibold'
                      : 'bg-muted border-border',
                )}
              >
                <div className="font-mono text-foreground">{symBoth(prefix)}</div>
                <div className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                  {/* Name only — the symbol is already the line above. */}
                  {nameOnly(prefix)}
                </div>
                <div className="text-muted-foreground">{prefix.powerLabel}</div>
              </div>
            )
          })}
        </div>
      </div>
    </Widget>
  )
}
