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
