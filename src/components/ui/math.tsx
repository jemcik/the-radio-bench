import katex from 'katex'
import 'katex/dist/katex.min.css'

/** Inline math — renders inside a sentence */
export function M({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false })
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Block (display) math — centred on its own line */
export function MBlock({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true })
  return (
    <div
      className="my-4 overflow-x-auto text-center"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Inline math variable wrapper for use via <Trans> component mapping.
 * Write `<var>I</var>` / `<var>R</var>` / `<var>R_1</var>` inside an i18n
 * string and have it render as KaTeX math italic — the serif glyph that
 * can't be confused with lowercase `l` or `/`, which was the fate of plain
 * capital I (or `<i>I</i>`) in the site's sans-serif font.
 *
 * Use for both math variables (I, V, R, f, t, …) and schematic reference
 * designators (R, C, L, D, Q — and subscripted forms like R_1, C_2).
 */
export function MathVar({ children }: { children?: React.ReactNode }) {
  return <M tex={String(children ?? '')} />
}
