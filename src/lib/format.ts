/**
 * Locale-aware number formatting helpers.
 *
 * Ukrainian (and most European locales) use a **comma** as the decimal
 * separator: 1,5 В, 20,00 дБ, 2,15 дБі. Writing `.toFixed(2)` hard-codes a
 * period and leaks English typography into the Ukrainian UI. Use these
 * helpers anywhere a number becomes user-visible text.
 *
 * IMPORTANT: Do **not** feed the localized string back into an HTML
 * `<input type="number">` — that element expects the canonical machine
 * format (period, no grouping) regardless of the page's display locale.
 * Use the raw `n.toFixed(d)` for input values, and these helpers only for
 * read-only display (ResultBox text, SVG tick labels, etc.).
 *
 * Thousands separators are NOT added — radio / EE numbers usually look
 * better without grouping (1000 Гц, not 1 000 Гц), and when grouping IS
 * desired the caller can build it explicitly.
 */

/**
 * Format a number with a fixed number of fractional digits, using the
 * locale's decimal separator.
 *
 *   formatDecimal(20,    2, 'en')  → "20.00"
 *   formatDecimal(20,    2, 'uk')  → "20,00"
 *   formatDecimal(3.014, 2, 'uk')  → "3,01"
 */
export function formatDecimal(n: number, digits: number, locale: string): string {
  const s = n.toFixed(digits)
  return locale.startsWith('uk') ? s.replace('.', ',') : s
}

/**
 * Format a number preserving its natural precision (trailing zeros are
 * trimmed). Use when `.toString()` would produce the right width but the
 * separator needs to be localized.
 *
 *   formatNumber(2.5,  'uk')  → "2,5"
 *   formatNumber(100,  'uk')  → "100"
 *   formatNumber(3.14, 'en')  → "3.14"
 */
export function formatNumber(n: number, locale: string): string {
  const s = String(n)
  return locale.startsWith('uk') ? s.replace('.', ',') : s
}

/**
 * Round to a fixed number of decimal places, returning a number (not a
 * string). Use to swallow floating-point drift before display:
 *
 *   roundTo(0.1 + 0.2, 4)  → 0.3
 *   roundTo(1.23456, 2)    → 1.23
 *
 * Use `formatDecimal` when you want a string with locale separator.
 */
export function roundTo(n: number, decimals: number): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

/**
 * Format a number in scientific notation with the given number of
 * significant figures, trimming trailing zeros from the mantissa, and
 * localizing the decimal separator.
 *
 *   formatScientific(1.23e-9,  6, 'en')  → "1.23e-9"
 *   formatScientific(1.230e-9, 6, 'uk')  → "1,23e-9"
 *   formatScientific(0,        6, 'en')  → "0"
 */
export function formatScientific(n: number, sigFigs: number, locale: string): string {
  if (n === 0) return '0'
  // .toExponential(d) gives mantissa with d fractional digits → d+1 sig figs.
  const raw = n.toExponential(Math.max(0, sigFigs - 1))
  // Trim trailing zeros in the mantissa, e.g. "1.230e-9" → "1.23e-9", "1.000e0" → "1e0".
  const trimmed = raw.replace(/\.?0+e/, 'e')
  return locale.startsWith('uk') ? trimmed.replace('.', ',') : trimmed
}

/**
 * Format a frequency in Hz with the appropriate SI prefix (Hz / kHz / MHz),
 * pulling localized unit symbols from the i18n `units.*` namespace.
 *
 *   formatHz(440,       tUnit, 'en')  → "440 Hz"
 *   formatHz(1_500,     tUnit, 'uk')  → "1,5 кГц"
 *   formatHz(2_400_000, tUnit, 'en')  → "2.40 MHz"
 *
 * `tUnit` is typically `useUnitFormatter()`. Decimals shrink as the value
 * grows so the readout stays compact.
 */
export function formatHz(
  hz: number,
  tUnit: (key: string) => string,
  locale: string,
): string {
  if (hz >= 1_000_000) return `${formatDecimal(hz / 1_000_000, hz >= 10_000_000 ? 0 : 2, locale)} ${tUnit('mhz')}`
  if (hz >= 1_000)     return `${formatDecimal(hz / 1_000,     hz >= 10_000     ? 0 : 1, locale)} ${tUnit('khz')}`
  return `${formatDecimal(hz, 0, locale)} ${tUnit('hz')}`
}
