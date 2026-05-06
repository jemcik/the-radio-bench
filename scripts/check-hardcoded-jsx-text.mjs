#!/usr/bin/env node
/**
 * check-hardcoded-jsx-text — fail when an English-looking literal sits
 * inside an SVG text/tspan body (or a UI-text attribute) without going
 * through `t(...)`.
 *
 * Why this exists: i18n parity scripts (`check:i18n`, `check:i18n-usage`,
 * `check:trans`) verify that EN/UA i18n blocks match each other AND
 * that every i18n key is referenced. None of them notice when an
 * author hardcodes English prose directly in JSX, e.g.:
 *
 *     <text>magnitude (dB)</text>          // ← shipped to UA readers
 *     <text>log frequency →</text>          // ← shipped to UA readers
 *
 * Such literals render the same in every locale because they bypass
 * i18n entirely. Ch 1.8's hero shipped with three of these before the
 * gap was caught visually by the user. This check closes that gap
 * mechanically.
 *
 * Scope: SVG-bearing files only — heroes, diagrams, widgets, and the
 * rare chapter file that draws raw SVG inline. Also catches UI-text
 * attributes (aria-label, title, alt, placeholder) anywhere in
 * src/components/ and src/chapters/.
 *
 * What we look for:
 *   – Body text inside <text>…</text>, <tspan>…</tspan>, <title>…</title>
 *     (the SVG text-bearing elements). Body must be a single string
 *     literal — anything containing `{…}` JSX expressions is skipped
 *     (the expression presumably resolves via `t()`).
 *   – UI-text attribute values: aria-label / title / alt / placeholder
 *     given as a string literal (not a `{...}` expression).
 *
 * Heuristic for "English literal":
 *   – Two consecutive lowercase Latin letters AND a vowel (rules out
 *     `R`, `0 V`, `GND`, hex codes).
 *   – Not in a small whitelist of unit symbols / abbreviations that
 *     legitimately appear identically across locales.
 *
 * Opt-out: a line comment `// hardcoded-jsx-text-ok: <reason>` on the
 * line directly above silences the next match.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const SCAN_DIRS = [
  'src/components/chapter-heroes',
  'src/components/diagrams',
  'src/components/widgets',
  'src/components/ui',
  'src/chapters',
  'src/features',
  'src/pages',
]

const SKIP_FILE_RE = /\.(test|stories)\.tsx?$/

// Literal values that look English-ish but are intentionally identical
// across locales (unit symbols, technical abbreviations, math notation).
const WHITELIST_EXACT = new Set([
  'GND', 'VCC', 'V+', 'V-', 'OUT', 'IN', 'EN',
  'AC', 'DC', 'RF', 'IF',
])

// Patterns that always pass.
const WHITELIST_RE = [
  /^[A-Z][_₀-₉][A-Za-z0-9]+$/,        // V_in, V_out, X_C
  /^[A-Z][a-z]?[0-9]+$/,              // R1, C2, Q3
  /^\d+(\.\d+)?\s*[A-Za-zµΩ°]+$/,     // "10 kHz"
  /^[\d.\s+\-·×÷=≈°π√√]+$/,           // pure math
  /^[—–\-·.,:;()[\]{}]+$/,            // pure punctuation
  /^V_?(in|out|cc|ee|dd|ss|ref|bias|pp|cm|dm)$/i,
]

function looksEnglish(text) {
  if (!text) return false
  // Strip leading/trailing whitespace AND common SVG entities
  const trimmed = text.trim()
  if (trimmed.length < 2) return false
  if (WHITELIST_EXACT.has(trimmed)) return false
  if (WHITELIST_RE.some(re => re.test(trimmed))) return false
  if (!/[a-z]{2}/.test(trimmed)) return false
  if (!/[aeiouy]/i.test(trimmed)) return false
  return true
}

function walkTsx(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkTsx(p))
    else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !SKIP_FILE_RE.test(entry.name)) {
      out.push(p)
    }
  }
  return out
}

// SVG text-bearing elements: <text>…</text>, <tspan>…</tspan>, <title>…</title>.
// The body must NOT contain `{` — that means it's a pure literal, not a
// JSX expression. Allow attributes on the open tag. Multi-line bodies
// are OK as long as they have no `{`.
//
// We expose BOTH `tagStart` (position of the opening `<`) and `start`
// (position of the body inside the tag). The opt-out lookup uses
// `tagStart` so a comment placed directly above the `<text>` line
// works for multi-line tags too — otherwise `lineOf(start)` would
// land on the body line, several lines below the tag.
function findSvgTextBodies(src) {
  const tags = ['text', 'tspan', 'title']
  const out = []
  for (const tag of tags) {
    const re = new RegExp(`<${tag}\\b([^>]*)>([^{}<]*?)</${tag}>`, 'gs')
    for (const m of src.matchAll(re)) {
      const body = m[2]
      if (!body.trim()) continue
      out.push({
        tagStart: m.index,
        start: m.index + m[0].lastIndexOf(body),
        text: body,
        tag,
      })
    }
  }
  return out
}

// UI-text attributes carrying string-literal prose.
function findAttrLiterals(src) {
  const re = /\b(aria-label|title|alt|placeholder)=(["'])((?:[^"'\\]|\\.)*?)\2/g
  const out = []
  for (const m of src.matchAll(re)) {
    out.push({ start: m.index, text: m[3], attr: m[1] })
  }
  return out
}

const issues = []
let scanned = 0

for (const scanDir of SCAN_DIRS) {
  for (const f of walkTsx(path.join(ROOT, scanDir))) {
    scanned++
    const src = fs.readFileSync(f, 'utf-8')
    const lines = src.split('\n')
    // Opt-out lines (comment on line ABOVE the offending text).
    const optOut = new Set()
    lines.forEach((line, i) => {
      if (/hardcoded-jsx-text-ok\b/.test(line)) optOut.add(i + 2)
    })
    function lineOf(pos) {
      return src.slice(0, pos).split('\n').length
    }

    for (const { tagStart, start, text, tag } of findSvgTextBodies(src)) {
      const tagLn = lineOf(tagStart)
      const bodyLn = lineOf(start)
      // Honour an opt-out comment whether it's above the open tag
      // (works for multi-line `<text>` blocks) or directly above the
      // body line (works for single-line `<text>literal</text>`).
      if (optOut.has(tagLn) || optOut.has(bodyLn)) continue
      if (looksEnglish(text)) {
        issues.push({ file: path.relative(ROOT, f), line: bodyLn, text: text.trim(), kind: `<${tag}>` })
      }
    }

    for (const { start, text, attr } of findAttrLiterals(src)) {
      const ln = lineOf(start)
      if (optOut.has(ln)) continue
      if (looksEnglish(text)) {
        issues.push({ file: path.relative(ROOT, f), line: ln, text, kind: attr })
      }
    }
  }
}

// `--strict` flag promotes findings to a hard failure. Default mode is
// advisory (prints findings, exits 0) — matches the precedent set by
// `check:hardcoded-units`. The strict mode is what new code should run
// against; the advisory mode lets pre-existing tech debt surface
// without blocking unrelated PRs.
const strict = process.argv.includes('--strict')

if (issues.length === 0) {
  console.log(`check:hardcoded-jsx OK — ${scanned} file(s) scanned, no English literals in SVG text or UI-text attributes.`)
  process.exit(0)
}

const headline = strict
  ? 'check:hardcoded-jsx FAIL — these literals look like English prose hardcoded in JSX. They will appear unchanged in every locale, including UA. Move them to i18n via t(...).'
  : `Found ${issues.length} potential English literal${issues.length === 1 ? '' : 's'} hardcoded in JSX (advisory — they bypass i18n and will appear identically in every locale):`
console[strict ? 'error' : 'log'](headline)
console.log('')
for (const i of issues) {
  console.log(`  ${i.file}:${i.line}  [${i.kind}]  ${JSON.stringify(i.text)}`)
}
console.log('')
console.log('To silence a deliberate exception (e.g. an instrument-panel mock), add `// hardcoded-jsx-text-ok: <reason>` on the line directly above.')
process.exit(strict ? 1 : 0)
