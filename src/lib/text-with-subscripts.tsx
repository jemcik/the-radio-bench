import { Fragment, type ReactNode } from 'react'

/**
 * Render plain text containing bare subscript patterns like `X_L`,
 * `R_loss`, `Q_U` with the subscript portion as a real `<sub>` /
 * `<tspan baseline-shift>` element instead of a literal underscore.
 *
 * WHY THIS EXISTS
 * ───────────────
 * i18n values are stored as plain strings. They render via JSX
 * interpolation (`{t('...')}`), so HTML / SVG tags inside the string
 * would render as literal text. KaTeX is overkill for one or two
 * subscripts in a tooltip / heading / SVG marker, and most physics-
 * style subscripts use capital letters (X_L, X_C, R_S, V_C, Q_L,
 * f_L, f_H) that have no Unicode subscript form — so we can't rely
 * on Unicode either.
 *
 * Two render targets:
 *   - `withSubscripts(s)`     → emits `X<sub>L</sub>` (HTML).
 *                               Use in headings, descriptions, prose
 *                               rendered via `<span>` / `<p>` / `<h2>`.
 *   - `withSubscriptsSvg(s)`  → emits `X<tspan baseline-shift="sub">L</tspan>`
 *                               (SVG). Use inside `<text>` nodes — HTML
 *                               `<sub>` does not render in SVG.
 *
 * MATCH RULES
 * ───────────
 * - Base must be a SINGLE Latin letter (so `co_2` inside a word does
 *   not split — only standalone variable names like `X` or `f` match).
 * - Subscript must be 1+ word characters (letters, digits, no
 *   underscores).
 * - Lookbehind ensures the base is at a token boundary (start of
 *   string, whitespace, or punctuation) — guards against in-word
 *   underscores being misread as subscripts.
 *
 * Examples that match:   X_L, X_C, V_C, R_loss, Q_U, f_0, f_H
 * Examples that DON'T:   co_2 (inside a word), file_name (no upper),
 *                        `_underscored_` (no leading letter at boundary)
 */

const SUB_PATTERN = /(?<![A-Za-z])([A-Za-z])_([A-Za-z0-9]+)/g

interface TextToken { type: 'text'; value: string }
interface SubToken  { type: 'sub';  base: string; sub: string }
type Token = TextToken | SubToken

function tokenise(s: string): Token[] {
  const tokens: Token[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  // Each `exec` call advances `lastIndex` for the global flag. Using a
  // local copy of the regex per-call keeps state isolated even under
  // concurrent renders.
  const re = new RegExp(SUB_PATTERN.source, SUB_PATTERN.flags)

  while ((match = re.exec(s)) !== null) {
    const start = match.index
    if (start > lastIndex) {
      tokens.push({ type: 'text', value: s.slice(lastIndex, start) })
    }
    tokens.push({ type: 'sub', base: match[1], sub: match[2] })
    lastIndex = start + match[0].length
  }
  if (lastIndex < s.length) {
    tokens.push({ type: 'text', value: s.slice(lastIndex) })
  }
  return tokens
}

export function withSubscripts(s: string | undefined): ReactNode {
  if (!s) return s ?? ''
  const tokens = tokenise(s)
  if (!tokens.some(t => t.type === 'sub')) return s
  return tokens.map((t, i) =>
    t.type === 'text'
      ? t.value
      : (
          <Fragment key={i}>
            {t.base}
            <sub>{t.sub}</sub>
          </Fragment>
        ),
  )
}

/**
 * SVG variant — emits `<tspan baseline-shift="sub" font-size="…">` instead
 * of HTML `<sub>`. Use inside SVG `<text>` nodes (e.g., chart markers,
 * axis labels, in-plot annotations) where the HTML `<sub>` element is
 * not rendered.
 */
export function withSubscriptsSvg(
  s: string | undefined,
  subFontSize: string = '0.7em',
): ReactNode {
  if (!s) return s ?? ''
  const tokens = tokenise(s)
  if (!tokens.some(t => t.type === 'sub')) return s
  return tokens.map((t, i) =>
    t.type === 'text'
      ? t.value
      : (
          <Fragment key={i}>
            {t.base}
            <tspan baselineShift="sub" fontSize={subFontSize}>{t.sub}</tspan>
          </Fragment>
        ),
  )
}
