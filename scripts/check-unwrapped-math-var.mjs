#!/usr/bin/env node
/**
 * check-unwrapped-math-var — fail when chapter prose contains a math
 * variable that is NOT wrapped in <var> (so it ships as upright body text
 * instead of the KaTeX math-italic glyph readers expect).
 *
 * Why this gate exists (reader-flagged, ch 2.1, 2026-05): the speed of
 * light was written «…written c.» and «λ = c / f» as bare letters. The
 * lowercase `c` blended into the surrounding sans-serif prose; the reader
 * could not tell it was the variable. Every other chapter wraps math
 * variables in `<var>` (→ <MathVar> → KaTeX italic); ch 2.1's new symbols
 * (c, f, λ) were authored as plain text and slipped through EVERY existing
 * gate, because all the <var>-related gates check the RENDER SAFETY of
 * markup that is already present (check:tag-renders, check:bare-subscript-
 * renders, check:var-multichar-subscripts) — none check for the ABSENCE of
 * <var> on a bare variable. beginner-review targets clarity, not typography.
 *
 * What it flags, in chapter blocks (top-level keys matching /^ch\d+_\d+$/)
 * only, AFTER removing every <var>…</var> span and stripping all other
 * markup tags (so a properly-wrapped variable is invisible to the scan):
 *
 *   Rule A — a lone Greek variable letter (λ, ω, τ, φ, …). In this course
 *            a bare Greek letter in prose is essentially always a variable.
 *            Unit symbols Ω (ohm) and µ/μ (micro) are deliberately NOT in
 *            the flag set, so «100 Ω» / «10 µF» never trip it.
 *
 *   Rule B — a single Latin letter sitting next to a math operator from
 *            { = · × ≈ ÷ }. That is the signature of a formula fragment
 *            («= c», «c ×», «λ ≈»). The slash `/` is intentionally NOT an
 *            operator here, because units (m/s, м/с, V/m) would false-flag.
 *            Formulas almost always also contain «=», so the real bug class
 *            is still caught even without `/`.
 *
 * Glossary / units namespaces are NOT scanned: check:glossary-markup
 * forbids <var> inside glossary, so a bare Greek letter there is correct.
 *
 * The fix is always the same: wrap the variable — <var>c</var>,
 * <var>λ</var>, <var>f</var> — and render the value through <Trans> (prose,
 * summary) or buildQuizFromI18n (quiz), both of which map `var` → <MathVar>.
 *
 * Exits 0 if clean, 1 if any unwrapped variable is found.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Greek letters treated as variables. Ω (U+03A9 / U+2126 ohm) and µ/μ
// (U+00B5 / U+03BC micro) are omitted on purpose — they are unit symbols.
const GREEK_VARS = 'αβγδεζηθικλνξπρστφχψωΓΔΘΛΞΠΣΦΨ'
const GREEK_RE = new RegExp(`[${GREEK_VARS}]`, 'u')

// Math operators whose adjacency to a single Latin letter marks a formula.
// `/` excluded (unit false positives: m/s, м/с, V/m …).
const OP = '=·×≈÷'
// Single Latin letter immediately before an operator. Not part of a longer
// word, and NOT preceded by a number — «0.001 s =» / «5 V =» are measured
// quantities (the letter is a unit), not formula variables.
const LETTER_THEN_OP = new RegExp(`(?<![\\p{L}])(?<!\\d)(?<!\\d\\s)([A-Za-z])\\s?[${OP}]`, 'gu')
// Operator immediately before a single Latin letter.
const OP_THEN_LETTER = new RegExp(`[${OP}]\\s?([A-Za-z])(?![\\p{L}])`, 'gu')

// Rule C — a standalone single lowercase Latin letter in prose (e.g. the bare
// «c» in «written c.»). Lowercase only: uppercase singletons are ambiguous
// (field designators E/B set in <strong>, English «A»/«I», section letters).
// Excludes the article «a»; letters glued to a digit («2 m», unit), a degree
// sign («°c»), an unspaced slash (unit numerator/denominator «m/s», «pF/m»),
// a hyphen/dash («x-ray», «p–n»), an apostrophe (English contractions/
// possessives «it's», «don't»), or an abbreviation dot («e.g.», «i.e.»).
const STANDALONE_LC = /(?<![\p{L}\d°.'’/\-–—])(?<!\d\s)([b-z])(?![\p{L}'’/\-–—])(?!\.[\p{L}])/gu

// A lone letter inside parentheses is a SYMBOL GLOSS, not a formula fragment:
// «kilo (k)», «nano (n)», «47 × 10³ (k)», «micro (µ)». SI prefix and unit
// symbols are set UPRIGHT by convention, so <var> — which renders math-italic
// — would be the wrong markup, not the missing one. A real variable never
// appears this way; formulas bring an operator with them.
const SYMBOL_GLOSS = /\((\p{L})\)/gu

// ── Baseline of pre-existing debt ────────────────────────────────────────
// Part 0–1 was authored before this gate and carries ~hundreds of bare
// variables in formulas (P = I²R, β, τ, …). Rewriting them all is a separate
// project (each occurrence needs its render path verified so a new <var>
// doesn't ship literally). So we snapshot the current count per key into a
// baseline; the gate fails only when a key's count GROWS or a NEW key
// appears — i.e. it guards new/edited content without forcing a retro-fix.
// Regenerate after an intentional change with:  --update-baseline
const BASELINE_PATH = path.join(__dirname, 'unwrapped-math-var-baseline.json')
const UPDATE = process.argv.includes('--update-baseline')
const baseline = !UPDATE && fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'))
  : {}

/** Remove safe <var>…</var> spans, symbol glosses, then all other markup. */
function strip(s) {
  return s
    .replace(/<var>[\s\S]*?<\/var>/g, ' ')
    .replace(SYMBOL_GLOSS, ' ')
    .replace(/<[^>]+>/g, ' ')
}

function snippet(s, idx) {
  const a = Math.max(0, idx - 24)
  const b = Math.min(s.length, idx + 24)
  return (a > 0 ? '…' : '') + s.slice(a, b).replace(/\s+/g, ' ').trim() + (b < s.length ? '…' : '')
}

/** Flagged letter positions in a stripped string, deduped (one per glyph). */
function findIssues(text) {
  const hits = new Map() // position → { rule, token }
  // Rule A — lone Greek variable letters.
  for (const m of text.matchAll(new RegExp(GREEK_RE.source, 'gu'))) {
    hits.set(m.index, { rule: 'greek', token: m[0] })
  }
  // Rule B — single Latin letter adjacent to a math operator.
  for (const m of text.matchAll(LETTER_THEN_OP)) {
    hits.set(m.index, { rule: 'latin', token: m[1] })
  }
  for (const m of text.matchAll(OP_THEN_LETTER)) {
    const pos = m.index + m[0].length - 1 // letter is the last char of the match
    hits.set(pos, { rule: 'latin', token: m[1] })
  }
  // Rule C — standalone lowercase Latin letter (do not overwrite an operator hit).
  for (const m of text.matchAll(STANDALONE_LC)) {
    if (!hits.has(m.index)) hits.set(m.index, { rule: 'prose', token: m[1] })
  }
  return [...hits.entries()].map(([pos, v]) => ({ ...v, pos }))
}

function collect(json, file, perKey, issues) {
  function walk(node, segs) {
    if (typeof node === 'string') {
      const key = segs.join('.')
      const text = strip(node)
      const hits = findIssues(text)
      if (hits.length === 0) return
      perKey[`${file}:${key}`] = hits.length
      for (const h of hits) {
        issues.push({ file, key, rule: h.rule, token: h.token, where: snippet(text, h.pos) })
      }
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        // Only descend into chapter blocks at the top level.
        if (segs.length === 0 && !/^ch\d+_\d+$/.test(k)) continue
        walk(v, [...segs, k])
      }
    }
  }
  walk(json, [])
}

const locales = [
  { name: 'en', path: path.join(ROOT, 'src/i18n/locales/en/ui.json') },
  { name: 'uk', path: path.join(ROOT, 'src/i18n/locales/uk/ui.json') },
]

const all = []
const perKey = {} // "locale:key" → current occurrence count
for (const loc of locales) {
  const json = JSON.parse(fs.readFileSync(loc.path, 'utf-8'))
  collect(json, loc.name, perKey, all)
}

// ── Snapshot mode ────────────────────────────────────────────────────────
if (UPDATE) {
  const sorted = Object.fromEntries(Object.entries(perKey).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + '\n')
  const total = Object.values(sorted).reduce((a, b) => a + b, 0)
  console.log(`baseline written: ${Object.keys(sorted).length} key(s), ${total} occurrence(s) → ${path.relative(ROOT, BASELINE_PATH)}`)
  process.exit(0)
}

// ── Enforce: fail only on keys whose count grew, or new keys ──────────────
const offending = all.filter(i => (perKey[`${i.file}:${i.key}`] ?? 0) > (baseline[`${i.file}:${i.key}`] ?? 0))

if (offending.length === 0) {
  const grandfathered = Object.keys(baseline).length
  console.log(
    `check-unwrapped-math-var OK: no new unwrapped math variables` +
      (grandfathered
        ? ` (${grandfathered} pre-existing key(s) baselined — see TECH_DEBT.md §3).`
        : '.'),
  )
  process.exit(0)
}

// Group offending issues by key for a readable report.
const byKey = new Map()
for (const i of offending) {
  const k = `${i.file}:${i.key}`
  if (!byKey.has(k)) byKey.set(k, [])
  byKey.get(k).push(i)
}

console.error('check-unwrapped-math-var FAIL — new (or grown) chapter strings contain a math')
console.error('variable that is NOT wrapped in <var>, so it ships as upright body text:')
console.error('')
for (const [k, items] of byKey) {
  const [file, key] = k.split(/:(.+)/)
  console.error(`  [${file}] ${key}  (was ${baseline[k] ?? 0}, now ${perKey[k]})`)
  for (const i of items) console.error(`    ${i.rule} «${i.token}»: …${i.where}`)
}
console.error('')
console.error('Fix: wrap the variable — c → <var>c</var>, λ → <var>λ</var>, f → <var>f</var> —')
console.error('and render the value via <Trans> (prose/summary) or buildQuizFromI18n (quiz),')
console.error('both of which map `var` → <MathVar>. After an intentional, verified change to')
console.error('pre-existing debt, re-snapshot with:  node scripts/check-unwrapped-math-var.mjs --update-baseline')
console.error('The pre-existing backlog is tracked as TECH_DEBT.md §3.')
process.exit(1)
