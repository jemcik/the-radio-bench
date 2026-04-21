import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Input } from '@/components/ui/input'
import { ResultBox } from '@/components/ui/result-box'
import { cn } from '@/lib/utils'
import { formatNumber, roundTo } from '@/lib/format'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { SI_PREFIXES, type SIPrefix } from '@/features/si/prefixes'

type NotationResult =
  | { ok: false }
  | {
      ok: true
      mantissa: number
      exponent: number
      engineeringMantissa: number
      engineeringExponent: number
      siPrefix?: SIPrefix
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
  const { locale } = useLocaleFormatter()
  const [inputValue, setInputValue] = useState('')
  const [isEngineering, setIsEngineering] = useState(false)

  const result = useMemo<NotationResult>(() => {
    // Normalise: accept both "." and "," as decimal separators so
    // Ukrainian-style "1,5" parses. Input is `type="text"` so the raw
    // string arrives untouched by the browser.
    const trimmed = inputValue.trim().replace(',', '.')
    if (!trimmed) return { ok: false }

    const num = parseFloat(trimmed)
    if (isNaN(num)) return { ok: false }

    // Zero is a valid input even though log10(0) is undefined.
    if (num === 0) {
      return {
        ok: true,
        mantissa: 0, exponent: 0,
        engineeringMantissa: 0, engineeringExponent: 0,
        siPrefix: SI_PREFIXES.find(p => p.exponent === 0),
      }
    }

    // Standard: 1 ≤ |mantissa| < 10
    const exponent = Math.floor(Math.log10(Math.abs(num)))
    const mantissa = num / Math.pow(10, exponent)

    // Engineering: exponent is a multiple of 3
    const engineeringExponent = Math.floor(exponent / 3) * 3
    const engineeringMantissa = num / Math.pow(10, engineeringExponent)

    return {
      ok: true,
      mantissa: roundTo(mantissa, 6),
      exponent,
      engineeringMantissa: roundTo(engineeringMantissa, 6),
      engineeringExponent,
      siPrefix: SI_PREFIXES.find(p => p.exponent === engineeringExponent),
    }
  }, [inputValue])

  const currentExponent = result.ok ? (isEngineering ? result.engineeringExponent : result.exponent) : 0
  const currentMantissaRaw = result.ok ? (isEngineering ? result.engineeringMantissa : result.mantissa) : 0
  // Localize the decimal separator so a uk reader sees "2,4 × 10⁹".
  const currentMantissa = formatNumber(currentMantissaRaw, locale)

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
            <div className="text-3xl font-mono font-bold text-foreground flex items-baseline gap-2">
              <span className="bg-callout-key/20 border border-callout-key/40 px-3 py-1 rounded text-callout-key">
                {currentMantissa}
              </span>
              <span className="text-2xl text-muted-foreground">×</span>
              <span className="text-lg">
                10<sup className="text-lg text-callout-onair font-bold">{currentExponent}</sup>
              </span>
            </div>
          </ResultBox>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <ResultBox tone="warn" label={t('ch0_3.sciNotationMantissa')} className="p-3">
              <p className="text-lg font-mono font-bold text-foreground">{currentMantissa}</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {isEngineering
                  ? t('ch0_3.sciNotationMantissaEngDesc')
                  : t('ch0_3.sciNotationMantissaStdDesc')}
              </p>
            </ResultBox>

            <ResultBox tone="primary" label={t('ch0_3.sciNotationExponent')} className="p-3">
              <p className="text-lg font-mono font-bold text-foreground">{currentExponent}</p>
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
                <p className="text-2xl font-mono font-bold text-foreground">
                  {currentMantissa}
                  <span className="text-callout-experiment text-xl ml-1">
                    {result.siPrefix.symbol}
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
                    {result.siPrefix.symbol} = 10<sup>{result.siPrefix.exponent}</sup>
                  </p>
                </div>
              </div>
            </ResultBox>
          )}

          {/* Comparison view */}
          {!isEngineering && result.engineeringExponent !== result.exponent && (
            <ResultBox tone="info" label={t('ch0_3.sciNotationAlsoWritten')}>
              <p className="text-lg font-mono font-bold text-foreground">
                <span className="bg-callout-key/20 border border-callout-key/40 px-2 py-0.5 rounded">
                  {formatNumber(result.engineeringMantissa, locale)}
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
            <p className="text-sm font-mono text-muted-foreground">
              {inputValue} = {currentMantissa} × 10<sup>{currentExponent}</sup>
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
