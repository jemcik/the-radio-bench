#!/usr/bin/env node
/**
 * check-var-multichar-subscripts — fail when an i18n string contains
 * `<var>X_yyy</var>` with a bare multi-character subscript.
 *
 * Why: `<var>` is wired to <MathVar> in Trans, which renders its contents
 * through KaTeX. KaTeX (and standard LaTeX) interprets `V_CE` as «V with
 * subscript C, followed by E at the baseline» — only the first character
 * after `_` becomes the subscript. Multi-character subscripts must be
 * braced: `V_{CE}`.
 *
 * Production failure shipped to readers (ch 1.11, 2026-05): «<var>V_CE</var>»
 * rendered with a large baseline-height «E» — the user pointed at the
 * literal output «V_C E» and asked «why is E capital?». The whole class
 * of bug affects every collector–emitter, gate–source, base–emitter and
 * in/out subscript in the chapter.
 *
 * The fix is to brace the subscript: `<var>V_CE</var>` → `<var>V_{CE}</var>`.
 *
 * Exits 0 if clean, 1 if any unbrazed multi-char subscript is found.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Bare multi-char subscript inside <var>…</var>:
//   Letter, underscore, then 2+ chars (letters/digits/parens) NOT
//   immediately followed by `{` — i.e. NOT already in `X_{…}` form.
const PAT = /<var>([A-Za-z])_([A-Za-z0-9()_]{2,})<\/var>/g

function collect(json, file) {
  const issues = []
  function walk(node, segs) {
    if (typeof node === 'string') {
      for (const m of node.matchAll(PAT)) {
        issues.push({ file, key: segs.join('.'), bad: m[0], suggest: `<var>${m[1]}_{${m[2]}}</var>` })
      }
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, [...segs, k])
    }
  }
  walk(json, [])
  return issues
}

const locales = [
  { name: 'en', path: path.join(ROOT, 'src/i18n/locales/en/ui.json') },
  { name: 'uk', path: path.join(ROOT, 'src/i18n/locales/uk/ui.json') },
]

const all = []
for (const loc of locales) {
  const json = JSON.parse(fs.readFileSync(loc.path, 'utf-8'))
  all.push(...collect(json, loc.name))
}

if (all.length === 0) {
  console.log('i18n <var> subscript check OK: every multi-char subscript inside <var> is braced.')
  process.exit(0)
}

console.error('i18n <var> subscript FAIL — these <var>X_yyy</var> strings have a bare multi-character subscript. KaTeX renders only the first char after `_` as a subscript; the rest sits at the baseline:')
console.error('')
for (const i of all) {
  console.error(`  [${i.file}] ${i.key}`)
  console.error(`    have: ${i.bad}`)
  console.error(`    want: ${i.suggest}`)
}
console.error('')
console.error(`${all.length} occurrence(s). Brace the subscript: <var>X_YY</var> → <var>X_{YY}</var>.`)
process.exit(1)
