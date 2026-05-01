import { Fragment, type ReactNode } from 'react'
import { M } from './math'

/**
 * Render a plain i18n string with embedded math, producing proper
 * KaTeX-rendered output.
 *
 * Handles three input forms that all end up in raw-`t()` render paths
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
 *   3. <nowrap>…</nowrap> wrappers: render their contents inside a
 *      `<span style="white-space: nowrap">`, recursively running the
 *      var/bare-subscript passes on the inner text. Without this,
 *      `<nowrap>` would print as literal characters in the rendered
 *      output (caught on ch1.8 schematic captions).
 *
 * Subscript-form conventions (matches the rest of the project):
 *   - Digits («V_1»)           → `V_{1}`                 (KaTeX upright)
 *   - Latin letters («V_pk»)   → `V_{\mathrm{pk}}`       (upright)
 *   - Cyrillic («V_вх»)        → `V_{\text{вх}}`         (out of math mode)
 *
 * Plain strings without math pass through untouched.
 */

type TextChunk   = { kind: 'text'; value: string }
type TexChunk    = { kind: 'tex'; value: string }
type NowrapChunk = { kind: 'nowrap'; children: Chunk[] }
type Chunk = TextChunk | TexChunk | NowrapChunk

/** Normalise a bare subscript body into a full TeX fragment. */
function subToTex(base: string, sub: string): string {
  const hasCyrillic = /[\u0400-\u04FF]/.test(sub)
  if (/^\d+$/.test(sub)) return `${base}_{${sub}}`
  if (hasCyrillic) return `${base}_{\\text{${sub}}}`
  return `${base}_{\\mathrm{${sub}}}`
}

/** Pass 0: pull out `<nowrap>…</nowrap>` segments and recursively
 *  process their inner content. The non-greedy `[\s\S]*?` lets the
 *  inner segment contain other tags like `<var>…</var>`. */
function splitNowrap(s: string): Array<{ kind: 'nowrap'; raw: string } | { kind: 'plain'; raw: string }> {
  const out: Array<{ kind: 'nowrap'; raw: string } | { kind: 'plain'; raw: string }> = []
  const re = /<nowrap>([\s\S]*?)<\/nowrap>/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    if (m.index > lastIdx) out.push({ kind: 'plain', raw: s.slice(lastIdx, m.index) })
    out.push({ kind: 'nowrap', raw: m[1] })
    lastIdx = re.lastIndex
  }
  if (lastIdx < s.length) out.push({ kind: 'plain', raw: s.slice(lastIdx) })
  return out
}

/** Pass 1: pull out canonical `<var>…</var>` blocks and render their
 *  contents as KaTeX verbatim (the content is already valid TeX). */
function splitVarBlocks(s: string): Array<TextChunk | TexChunk> {
  const out: Array<TextChunk | TexChunk> = []
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
function splitBareSubscripts(s: string): Array<TextChunk | TexChunk> {
  const out: Array<TextChunk | TexChunk> = []
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

/** Run var-block + bare-subscript passes on a plain (no-nowrap) string. */
function processPlain(s: string): Array<TextChunk | TexChunk> {
  const pass1 = splitVarBlocks(s)
  const out: Array<TextChunk | TexChunk> = []
  for (const c of pass1) {
    if (c.kind === 'tex') out.push(c)
    else out.push(...splitBareSubscripts(c.value))
  }
  return out
}

/** Top-level processor: split on <nowrap>, then recursively process
 *  each segment's contents. Returns chunks ready for renderChunk. */
function processString(s: string): Chunk[] {
  const segments = splitNowrap(s)
  const out: Chunk[] = []
  for (const seg of segments) {
    if (seg.kind === 'nowrap') {
      out.push({ kind: 'nowrap', children: processPlain(seg.raw) })
    } else {
      out.push(...processPlain(seg.raw))
    }
  }
  return out
}

function renderChunk(c: Chunk, key: number): ReactNode {
  if (c.kind === 'text') return <Fragment key={key}>{c.value}</Fragment>
  if (c.kind === 'tex') return <M key={key} tex={c.value} />
  // nowrap-group
  return (
    <span key={key} style={{ whiteSpace: 'nowrap' }}>
      {c.children.map((ch, i) => renderChunk(ch, i))}
    </span>
  )
}

export function MathText({ children }: { children: string }) {
  // Three-pass split: nowrap groups → var blocks → bare subscripts.
  const chunks = processString(children)

  // If nothing matched (no <var>, no <nowrap>, no bare subscripts),
  // pass the original string through unwrapped so we don't add a
  // Fragment around every plain label.
  const hasMarkup = chunks.some(c => c.kind !== 'text')
  if (!hasMarkup) return <>{children}</>

  return <>{chunks.map((c, i) => renderChunk(c, i))}</>
}
