import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSiLabels } from '@/features/si/useSiLabels'
import Widget from '@/components/ui/widget'
import { Input } from '@/components/ui/input'
import { ResultBox } from '@/components/ui/result-box'
import { cn } from '@/lib/utils'
import { withMinusSign } from '@/lib/format'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { SI_PREFIXES, type SIPrefix } from '@/features/si/prefixes'

type NotationResult =
  | { ok: false }
  | {
      ok: true
      /** Mantissa as an exact decimal string, already using the locale separator. */
      mantissa: string
      exponent: number
      engineeringMantissa: string
      engineeringExponent: number
      siPrefix?: SIPrefix
    }

/**
 * Split a decimal string into its significant digits and the exponent of the
 * leading one — exactly, by counting positions, with no floating point.
 *
 * `parseFloat` cannot do this job. A double holds ~17 significant digits, so
 * `parseFloat('11111222233333444455565544444444')` already stores
 * 11111222233333443505249379680256 — wrong from the 17th digit — and the widget
 * then rounded the mantissa to six decimals on top of that and printed
 * «input = 1,111122 × 10³¹» with an equals sign. The two sides differed by
 * 2.2 × 10²⁴. Reader-flagged, and fair: this is a chapter about notation, so the
 * one thing the widget must never do is lose the digits the reader typed.
 *
 * Returns null for anything that is not a decimal number. Zero (in any spelling
 * — «0», «0.000») comes back as digits «0», exponent 0.
 */
function decompose(raw: string): { sign: string; digits: string; exponent: number } | null {
  let s = raw.trim()
  let sign = ''
  if (s.startsWith('-')) { sign = '\u2212'; s = s.slice(1) }
  else if (s.startsWith('+')) s = s.slice(1)
  if (!/^\d*\.?\d*$/.test(s) || !/\d/.test(s)) return null

  const dot = s.indexOf('.')
  const intPart = dot === -1 ? s : s.slice(0, dot)
  const all = intPart + (dot === -1 ? '' : s.slice(dot + 1))
  const first = all.search(/[1-9]/)
  if (first === -1) return { sign: '', digits: '0', exponent: 0 }

  return {
    sign,
    digits: all.slice(first).replace(/0+$/, '') || '0',
    // The leading significant digit sits `first` places into the digit run; the
    // point sits after `intPart.length` of them.
    exponent: intPart.length - first - 1,
  }
}

/** Place the decimal point `intDigits` digits in, using the locale separator. */
function withPoint(digits: string, intDigits: number, locale: string): string {
  const padded = digits.padEnd(intDigits, '0')
  const tail = padded.slice(intDigits).replace(/0+$/, '')
  return tail ? `${padded.slice(0, intDigits)}${locale.startsWith('uk') ? ',' : '.'}${tail}` : padded.slice(0, intDigits)
}

/** Render a signed integer exponent using Unicode superscript glyphs. */
function toSuperscript(n: number): string {
  const MAP: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
  }
  return n.toString().split('').map(c => MAP[c] ?? c).join('')
}

export default function SciNotationExplorer() {
  const { t } = useTranslation('ui')
  const { sym } = useSiLabels()
  const { locale } = useLocaleFormatter()
  const [inputValue, setInputValue] = useState('')
  const [isEngineering, setIsEngineering] = useState(false)

  const result = useMemo<NotationResult>(() => {
    // Normalise: accept both "." and "," as decimal separators so
    // Ukrainian-style "1,5" parses. Input is `type="text"` so the raw
    // string arrives untouched by the browser.
    const trimmed = inputValue.trim().replace(',', '.')
    if (!trimmed) return { ok: false }

    const d = decompose(trimmed)
    if (!d) return { ok: false }

    // Zero is a valid input even though log10(0) is undefined.
    if (d.digits === '0') {
      return {
        ok: true,
        mantissa: '0', exponent: 0,
        engineeringMantissa: '0', engineeringExponent: 0,
        siPrefix: SI_PREFIXES.find(p => p.exponent === 0),
      }
    }

    // Standard: one digit before the point, so 1 ≤ |mantissa| < 10.
    // Engineering: the exponent drops to the multiple of 3 at or below it, and
    // the mantissa gains the 1 or 2 digits that shift left across the point.
    const engineeringExponent = Math.floor(d.exponent / 3) * 3

    return {
      ok: true,
      mantissa: d.sign + withPoint(d.digits, 1, locale),
      exponent: d.exponent,
      engineeringMantissa: d.sign + withPoint(d.digits, 1 + (d.exponent - engineeringExponent), locale),
      engineeringExponent,
      siPrefix: SI_PREFIXES.find(p => p.exponent === engineeringExponent),
    }
  }, [inputValue, locale])

  const currentExponent = result.ok ? (isEngineering ? result.engineeringExponent : result.exponent) : 0
  // Already an exact string carrying the locale separator and the sign.
  const currentMantissa = result.ok ? (isEngineering ? result.engineeringMantissa : result.mantissa) : '0'

  return (
    <Widget
      title={t('ch0_3.sciNotationTitle')}
      description={t('ch0_3.sciNotationDescription')}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('ch0_3.sciNotationEnter')}
          </label>
          <Input
            type="text"
            inputMode="decimal"
            value={inputValue}
            // Strip non-numeric chars (letters, symbols) at the input
            // layer so the field behaves like `type="number"` visually,
            // while we keep display-format control.
            onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.,-]/g, ''))}
            placeholder={t('ch0_3.sciNotationPlaceholder')}
          />
        </div>

        {/* Notation Type Toggle */}
        {result.ok && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsEngineering(false)}
              aria-pressed={!isEngineering}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors border',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                !isEngineering
                  ? 'bg-callout-note/20 border-callout-note/50 text-callout-note'
                  : 'bg-muted border-border text-muted-foreground',
              )}
            >
              {t('ch0_3.sciNotationStandard')}
            </button>
            <button
              onClick={() => setIsEngineering(true)}
              aria-pressed={isEngineering}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors border',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isEngineering
                  ? 'bg-callout-experiment/20 border-callout-experiment/50 text-callout-experiment'
                  : 'bg-muted border-border text-muted-foreground',
              )}
            >
              {t('ch0_3.sciNotationEngineering')}
            </button>
          </div>
        )}
      </div>

      {/* Result */}
      {result.ok ? (
        <div className="space-y-4 py-3 border-t border-border">
          <ResultBox
            tone="info"
            label={isEngineering ? t('ch0_3.sciNotationEngineering') : t('ch0_3.sciNotationStandard')}
          >
            {/* `break-all` + `min-w-0` are load-bearing: the mantissa now carries
                every digit the reader typed, so a 60-digit entry has to wrap
                inside its box instead of being clipped by it. */}
            <div className="text-3xl font-mono font-bold text-foreground flex items-baseline gap-2 flex-wrap">
              <span className="bg-callout-key/20 border border-callout-key/40 px-3 py-1 rounded text-callout-key break-all min-w-0">
                {currentMantissa}
              </span>
              <span className="text-2xl text-muted-foreground">×</span>
              <span className="text-lg">
                10<sup className="text-lg text-callout-onair font-bold">{toSuperscript(currentExponent)}</sup>
              </span>
            </div>
          </ResultBox>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <ResultBox tone="warn" label={t('ch0_3.sciNotationMantissa')} className="p-3">
              <p className="text-lg font-mono font-bold text-foreground break-all">{currentMantissa}</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {isEngineering
                  ? t('ch0_3.sciNotationMantissaEngDesc')
                  : t('ch0_3.sciNotationMantissaStdDesc')}
              </p>
            </ResultBox>

            <ResultBox tone="primary" label={t('ch0_3.sciNotationExponent')} className="p-3">
              <p className="text-lg font-mono font-bold text-foreground">{withMinusSign(String(currentExponent))}</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {isEngineering
                  ? t('ch0_3.sciNotationExponentEngDesc')
                  : t('ch0_3.sciNotationExponentStdDesc')}
              </p>
            </ResultBox>
          </div>

          {/* SI Prefix hint (engineering only) */}
          {isEngineering && result.siPrefix && result.siPrefix.symbol && (
            <ResultBox tone="success" label={t('ch0_3.sciNotationSIPrefix')}>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-mono font-bold text-foreground break-all min-w-0">
                  {currentMantissa}
                  <span className="text-callout-experiment text-xl ml-1">
                    {sym(result.siPrefix)}
                  </span>
                </p>
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    {t('ch0_3.sciNotationPrefix')}{' '}
                    <span className="font-semibold text-foreground">
                      {t(`ch0_3.prefixName_${result.siPrefix.name}`)}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {sym(result.siPrefix)} = 10<sup>{toSuperscript(result.siPrefix.exponent)}</sup>
                  </p>
                </div>
              </div>
            </ResultBox>
          )}

          {/* Comparison view */}
          {!isEngineering && result.engineeringExponent !== result.exponent && (
            <ResultBox tone="info" label={t('ch0_3.sciNotationAlsoWritten')}>
              <p className="text-lg font-mono font-bold text-foreground">
                <span className="bg-callout-key/20 border border-callout-key/40 px-2 py-0.5 rounded break-all">
                  {result.engineeringMantissa}
                </span>
                <span className="text-muted-foreground mx-2">×</span>
                <span>10</span>
                <span className="bg-callout-onair/20 border border-callout-onair/40 px-1 rounded">
                  {toSuperscript(result.engineeringExponent)}
                </span>
              </p>
            </ResultBox>
          )}

          {/* Formula line */}
          <ResultBox tone="success" label={t('ch0_3.sciNotationFormula')} className="p-3">
            <p className="text-sm font-mono text-muted-foreground break-all">
              {withMinusSign(inputValue)} = {currentMantissa} × 10<sup>{withMinusSign(String(currentExponent))}</sup>
            </p>
          </ResultBox>
        </div>
      ) : inputValue.trim() ? (
        <ResultBox tone="error" className="text-center">
          <p className="text-sm text-callout-danger">
            {t('ch0_3.sciNotationInvalid')}
          </p>
        </ResultBox>
      ) : null}

      {/* Quick Reference */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t('ch0_3.sciNotationReference')}
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <ResultBox tone="muted" className="p-3">
            <p className="font-semibold text-foreground mb-1">{t('ch0_3.sciNotationRefStandard')}</p>
            <p className="text-muted-foreground font-mono">{t('ch0_3.sciNotationRefStandardRule')}</p>
            <p className="text-muted-foreground font-mono">{t('ch0_3.sciNotationRefStandardExample')}</p>
          </ResultBox>
          <ResultBox tone="muted" className="p-3">
            <p className="font-semibold text-foreground mb-1">{t('ch0_3.sciNotationRefEngineering')}</p>
            <p className="text-muted-foreground font-mono">{t('ch0_3.sciNotationRefEngineeringRule')}</p>
            <p className="text-muted-foreground font-mono">{t('ch0_3.sciNotationRefEngineeringExample')}</p>
          </ResultBox>
        </div>
      </div>
    </Widget>
  )
}
