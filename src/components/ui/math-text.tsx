import { Fragment } from 'react'
import { M } from './math'

/**
 * Render a plain i18n string with embedded math, producing proper
 * KaTeX-rendered output.
 *
 * Handles two input forms that both end up in raw-`t()` render paths
 * around the codebase:
 *
 *   1. Canonical wrapped form: «…drops <var>V_{\mathrm{pk}}</var> onto…»
 *      — what `<Trans>` with `{ var: <MathVar /> }` would render, but
 *      we're in a raw-`t()` site without Trans.
 *
 *   2. Legacy bare form: «V_out / V_in should be 0.5»
 *      — from i18n strings that never got wrapped; we parse the bare
 *      «letter_sub» pattern inline.
 *
 * Subscript-form conventions (matches the rest of the project):
 *   - Digits («V_1»)           → `V_{1}`                 (KaTeX upright)
 *   - Latin letters («V_pk»)   → `V_{\mathrm{pk}}`       (upright)
 *   - Cyrillic («V_вх»)        → `V_{\text{вх}}`         (out of math mode)
 *
 * Plain strings without math pass through untouched.
 */

type Chunk = { kind: 'text'; value: string } | { kind: 'tex'; value: string }

/** Normalise a bare subscript body into a full TeX fragment. */
function subToTex(base: string, sub: string): string {
  const hasCyrillic = /[\u0400-\u04FF]/.test(sub)
  if (/^\d+$/.test(sub)) return `${base}_{${sub}}`
  if (hasCyrillic) return `${base}_{\\text{${sub}}}`
  return `${base}_{\\mathrm{${sub}}}`
}

/** Pass 1: pull out canonical `<var>…</var>` blocks and render their
 *  contents as KaTeX verbatim (the content is already valid TeX). */
function splitVarBlocks(s: string): Chunk[] {
  const out: Chunk[] = []
  const re = /<var>([^<]+)<\/var>/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    if (m.index > lastIdx) out.push({ kind: 'text', value: s.slice(lastIdx, m.index) })
    out.push({ kind: 'tex', value: m[1] })
    lastIdx = re.lastIndex
  }
  if (lastIdx < s.length) out.push({ kind: 'text', value: s.slice(lastIdx) })
  return out
}

/** Pass 2: within a text chunk, split on bare `X_Y` / `X_{Y}` patterns
 *  and convert each match into a TeX chunk. */
function splitBareSubscripts(s: string): Chunk[] {
  const out: Chunk[] = []
  // Base = a single Latin letter, to avoid false-positive snake_case
  // like «rms_selector». Subscript body = Latin/Cyrillic/digits, or
  // anything (including backslashes for \mathrm{…}) inside braces.
  const re = /([A-Za-z])_(?:\{([^{}]+)\}|([A-Za-z0-9\u0400-\u04FF]+))/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    if (m.index > lastIdx) out.push({ kind: 'text', value: s.slice(lastIdx, m.index) })
    const base = m[1]
    const braced = m[2]
    const bare = m[3]
    // If the user already typed `X_{...}` with braces, trust the body.
    // If it's a bare X_Y, wrap the Y per the convention.
    out.push({
      kind: 'tex',
      value: braced !== undefined ? `${base}_{${braced}}` : subToTex(base, bare),
    })
    lastIdx = re.lastIndex
  }
  if (lastIdx < s.length) out.push({ kind: 'text', value: s.slice(lastIdx) })
  return out
}

export function MathText({ children }: { children: string }) {
  // Two-pass split: first isolate <var>…</var> blocks (already TeX),
  // then within text runs look for bare `X_Y` patterns.
  const pass1 = splitVarBlocks(children)
  const chunks: Chunk[] = []
  for (const c of pass1) {
    if (c.kind === 'tex') chunks.push(c)
    else chunks.push(...splitBareSubscripts(c.value))
  }

  // If nothing matched, pass the original string through so we don't
  // wrap every label in a Fragment unnecessarily.
  if (chunks.every(c => c.kind === 'text')) return <>{children}</>

  return (
    <>
      {chunks.map((c, i) => (
        <Fragment key={i}>
          {c.kind === 'tex' ? <M tex={c.value} /> : c.value}
        </Fragment>
      ))}
    </>
  )
}
