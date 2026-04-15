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
