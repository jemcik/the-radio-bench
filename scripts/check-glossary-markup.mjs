#!/usr/bin/env node
/**
 * check-glossary-markup — fail when a glossary `tip` / `detail` /
 * `formula` / `unit` field contains an HTML/JSX tag.
 *
 * Why this exists: glossary fields are rendered as plain text via
 * `withSubscripts(...)` — no HTML parsing. Any `<em>`, `<strong>`,
 * `<var>`, etc. inside a glossary value is shown to the reader as the
 * literal characters `<em>...</em>`. This has shipped twice now
 * (ch1.8 notch + several pre-existing entries).
 *
 * Render path (verified): `src/features/glossary/term.tsx:314` —
 *   <p>{withSubscripts(entry.detail)}</p>
 * `withSubscripts` only converts bare-subscript patterns (`X_Y` →
 * `X<sub>Y</sub>`); everything else passes through as text.
 *
 * Scope: every entry in
 *   – `src/features/glossary/glossary.ts` (the EN base data)
 *   – `glossary.<term>.{tip,detail,formula,unit}` in en/ui.json
 *   – `glossary.<term>.{tip,detail,formula,unit}` in uk/ui.json
 *
 * Exit 1 (strict) on any tag found. This isn't advisory tech debt —
 * the literal markup ships to readers and looks broken.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const FIELDS = ['tip', 'detail', 'formula', 'unit']
// Match any HTML-ish opening tag: <name…>, <name/>, </name>. Also catch
// the legacy «<var>X_{...}</var>» that some entries still carry.
const TAG_RE = /<\/?[a-zA-Z][a-zA-Z0-9]*\b[^>]*>/g

const issues = []

// ── 1. EN base glossary in glossary.ts ───────────────────────────────
{
  const file = path.join(ROOT, 'src/features/glossary/glossary.ts')
  const src = fs.readFileSync(file, 'utf-8')
  // Find each `<key>: { … }` block. Heuristic: capture each line
  // containing a field name + a string literal so we can flag tags.
  // Pull every string literal that follows a `<field>:` token,
  // collect its content, and flag tags.
  for (const field of FIELDS) {
    const re = new RegExp(`(['"\`]?)(${field})\\1\\s*:\\s*('([^'\\\\]|\\\\.)*'|"([^"\\\\]|\\\\.)*"|\`([^\`\\\\]|\\\\.)*\`)`, 'gs')
    for (const m of src.matchAll(re)) {
      const literal = m[3]
      const tagMatches = literal.matchAll(TAG_RE)
      for (const tm of tagMatches) {
        const ln = src.slice(0, m.index + m[0].indexOf(literal) + tm.index).split('\n').length
        issues.push({
          source: 'glossary.ts',
          file: path.relative(ROOT, file),
          line: ln,
          field,
          tag: tm[0],
          excerpt: literal.slice(Math.max(0, tm.index - 30), tm.index + tm[0].length + 30).replace(/\s+/g, ' '),
        })
      }
    }
  }
}

// ── 2. EN + UA i18n glossary blocks ──────────────────────────────────
for (const locale of ['en', 'uk']) {
  const file = path.join(ROOT, `src/i18n/locales/${locale}/ui.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
  const glossary = data.glossary ?? {}
  for (const [term, entry] of Object.entries(glossary)) {
    if (term.startsWith('_')) continue // _names, _ui meta blocks
    if (!entry || typeof entry !== 'object') continue
    for (const field of FIELDS) {
      const v = entry[field]
      if (typeof v !== 'string') continue
      for (const tm of v.matchAll(TAG_RE)) {
        issues.push({
          source: `${locale}/ui.json`,
          file: path.relative(ROOT, file),
          term,
          field,
          tag: tm[0],
          excerpt: v.slice(Math.max(0, tm.index - 30), tm.index + tm[0].length + 30).replace(/\s+/g, ' '),
        })
      }
    }
  }
}

if (issues.length === 0) {
  console.log('check:glossary-markup OK — no HTML/JSX tags in any glossary tip/detail/formula/unit field.')
  process.exit(0)
}

console.error('check:glossary-markup FAIL — these glossary fields contain HTML/JSX tags. Glossary text is rendered as plain text via `withSubscripts()` (see src/features/glossary/term.tsx); HTML tags ship to readers as literal characters.')
console.error('')
for (const i of issues) {
  const where = i.term ? `glossary.${i.term}.${i.field}` : `${i.field} (line ${i.line})`
  console.error(`  ${i.file}  ${where}  →  ${i.tag}`)
  console.error(`    …${i.excerpt}…`)
}
console.error('')
console.error(`${issues.length} tag occurrence(s) in glossary fields.`)
console.error('Fix: replace «<em>X</em>» / «<strong>X</strong>» with guillemets «X», and rewrite «<var>X_{Y}</var>» as bare «X_Y» (withSubscripts handles that automatically).')
process.exit(1)
