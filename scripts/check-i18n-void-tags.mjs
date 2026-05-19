#!/usr/bin/env node
/**
 * check-i18n-void-tags — fail when an i18n string uses an HTML
 * void/self-closing/special-content element name as a <Trans> placeholder.
 *
 * Why: react-i18next's Trans component uses html-parse-stringify under the
 * hood, which respects HTML void-element semantics. A placeholder named
 * after an HTML void element (`<base>`, `<col>`, `<br>`, `<img>`, …) is
 * parsed as self-closing — the parser ignores the closing tag and the
 * text between opening and closing falls out as a sibling text node.
 *
 * Production failure shipped to readers (ch 1.11, 2026-05): the i18n
 * string «невеликий <base>струм бази</base> <var>I_B</var>» rendered as
 * «невеликий базаструм бази I_B»: <base> was treated as void, so
 * `<G k="base" />` was given no children, fell back to its default
 * glossary label «База», and «струм бази» followed as plain sibling text.
 * Same pattern with <col>колектора</col> → «колекторколектора».
 *
 * The fix is to rename the placeholder so it doesn't collide with an HTML
 * element name. The existing convention is `<bjtT>`, `<fetT>`, `<jfetT>`
 * — append `T` (or similar) when the natural name collides.
 *
 * Exits 0 if clean, 1 if any forbidden placeholder is found.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// HTML void elements + special-content elements whose Trans use is
// hazardous. Void elements (self-closing in HTML): the parser eats their
// closing tag and orphans the text. Raw-text elements (script, style,
// title, textarea): treat their contents as raw text, not nested tags.
const FORBIDDEN = new Set([
  // Void elements per HTML spec.
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr',
  // Raw-text elements — parser does not nest tags inside them.
  'script', 'style', 'title', 'textarea',
])

function collectIssues(json, file) {
  const issues = []
  function walk(node, pathSegs) {
    if (typeof node === 'string') {
      for (const m of node.matchAll(/<([a-zA-Z][a-zA-Z0-9_-]*)\b/g)) {
        const tag = m[1].toLowerCase()
        if (FORBIDDEN.has(tag)) {
          issues.push({ file, key: pathSegs.join('.'), tag, snippet: snippetAt(node, m.index) })
        }
      }
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        walk(v, [...pathSegs, k])
      }
    }
  }
  walk(json, [])
  return issues
}

function snippetAt(s, idx) {
  const start = Math.max(0, idx - 20)
  const end = Math.min(s.length, idx + 60)
  return (start > 0 ? '…' : '') + s.slice(start, end) + (end < s.length ? '…' : '')
}

const locales = [
  { name: 'en', path: path.join(ROOT, 'src/i18n/locales/en/ui.json') },
  { name: 'uk', path: path.join(ROOT, 'src/i18n/locales/uk/ui.json') },
]

const allIssues = []
for (const loc of locales) {
  const json = JSON.parse(fs.readFileSync(loc.path, 'utf-8'))
  allIssues.push(...collectIssues(json, loc.name))
}

if (allIssues.length === 0) {
  console.log(`i18n void-tag check OK: no forbidden placeholder names in EN or UA.`)
  process.exit(0)
}

console.error('i18n void-tag FAIL — these i18n strings use an HTML void/raw-text element name as a <Trans> placeholder. The browser/Trans parser will treat the tag as self-closing and orphan the inner text:')
console.error('')
for (const i of allIssues) {
  console.error(`  [${i.file}] ${i.key}  <${i.tag}>`)
  console.error(`    ${i.snippet}`)
}
console.error('')
console.error(`${allIssues.length} occurrence(s). Rename the placeholder (e.g. <base> → <baseT>, <col> → <colT>) in BOTH the i18n string and the chapter's Trans components map.`)
process.exit(1)
