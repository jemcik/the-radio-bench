import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDecimal, formatNumber } from '../format'

/**
 * Bundle the boilerplate every locale-aware widget repeats:
 *
 *   const { t, i18n } = useTranslation('ui')
 *   const locale = i18n.language
 *   formatDecimal(value, 2, locale)
 *   formatNumber(value, locale)
 *
 * Returns memoized `fmt` / `num` callbacks so they can sit in `useMemo`
 * dependency arrays without recomputing every render.
 *
 * `t` is intentionally NOT bundled — widgets that need translation should
 * call `useTranslation` themselves so they can pick the namespace.
 *
 * @example
 *   const { locale, fmt, num } = useLocaleFormatter()
 *   const display = fmt(20, 2)         // "20.00" / "20,00"
 *   const ratio   = num(2.5)           // "2.5"   / "2,5"
 */
export function useLocaleFormatter() {
  const { i18n } = useTranslation()
  const locale = i18n.language

  const fmt = useCallback(
    (n: number, digits: number) => formatDecimal(n, digits, locale),
    [locale],
  )
  const num = useCallback(
    (n: number) => formatNumber(n, locale),
    [locale],
  )

  return useMemo(() => ({ locale, fmt, num }), [locale, fmt, num])
}

/**
 * Resolve a unit symbol from the shared `units.*` i18n namespace.
 * Returns a stable callback so it can sit in dep arrays without
 * re-invalidating memos every render.
 *
 * @example
 *   const tUnit = useUnitFormatter()
 *   tUnit('hz')   // → "Hz"  / "Гц"
 *   tUnit('dbm')  // → "dBm" / "дБм"
 */
export function useUnitFormatter(): (key: string) => string {
  const { t } = useTranslation('ui')
  return useCallback((k: string) => t(`units.${k}`), [t])
}
