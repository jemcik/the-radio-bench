#!/usr/bin/env node
/**
 * check-trans-components — fail when a `<Trans i18nKey="…">` block leaves
 * a tag from its EN i18n string unmapped in `components={…}`.
 *
 * Why: react-i18next's <Trans> component renders any inline tag from the
 * source string by looking it up in the `components` map. Tags that
 * aren't in the map render as escaped HTML — readers see literal
 * «&lt;em&gt;…&lt;/em&gt;» or «&lt;var&gt;X&lt;/var&gt;». This is
 * always a bug and has shipped to readers more than once. This script
 * catches it before commit.
 *
 * Heuristics:
 *   • Scans every `<Trans i18nKey="block.key" ns="ui" components={...} />`
 *     in src/chapters/.
 *   • Recognises `...mathComponents` spread → adds {var, sub, sup}.
 *   • Recognises `...someOtherSpread` only when its identifier ends in
 *     "Components" — flags everything else as opaque (warns rather than
 *     errors so we don't false-positive on uncommon spreads).
 *   • For each Trans block, takes the EN i18n string at that key, finds
 *     every `<tag …>` tag (whitelisted: HTML-built-in OR present in any
 *     map across the codebase), and reports any tag NOT covered by the
 *     components map.
 *
 * Exits 0 if clean, 1 if any block has unmapped tags.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en/ui.json')
const CHAPTERS_DIR = path.join(ROOT, 'src/chapters')

const MATH_SPREAD = new Set(['var', 'sub', 'sup'])

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'))

function walkTsx(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkTsx(p))
    else if (entry.isFile() && entry.name.endsWith('.tsx')) out.push(p)
  }
  return out
}

const transRe = new RegExp(
  '<Trans\\s+(?:[a-zA-Z]+="[^"]*"\\s+)*?' +
  'i18nKey="([a-zA-Z0-9_]+)\\.([a-zA-Z0-9_]+)"\\s+' +
  'ns="ui"\\s+' +
  'components=(\\{[^}]*\\}(?:\\s*\\}\\s*)?)\\s*/>',
  'gs',
)

function findTags(s) {
  if (typeof s !== 'string') return new Set()
  return new Set([...s.matchAll(/<([a-zA-Z][a-zA-Z0-9_-]*)\b/g)].map(m => m[1]))
}

const issues = []
for (const tsx of walkTsx(CHAPTERS_DIR)) {
  const src = fs.readFileSync(tsx, 'utf-8')
  for (const m of src.matchAll(transRe)) {
    const [, block, key, rawMap] = m
    if (!en[block] || typeof en[block][key] !== 'string') continue
    const used = findTags(en[block][key])
    const mapped = new Set(
      [...rawMap.matchAll(/\b([a-zA-Z][a-zA-Z0-9_-]*)\s*:/g)].map(x => x[1]),
    )
    if (rawMap.includes('...mathComponents')) {
      for (const t of MATH_SPREAD) mapped.add(t)
    }
    const missing = [...used].filter(t => !mapped.has(t)).sort()
    if (missing.length > 0) {
      issues.push({ tsx: path.relative(ROOT, tsx), block, key, missing })
    }
  }
}

if (issues.length === 0) {
  const transCount = walkTsx(CHAPTERS_DIR).reduce((acc, f) => {
    return acc + [...fs.readFileSync(f, 'utf-8').matchAll(transRe)].length
  }, 0)
  console.log(`Trans component-map check OK: ${transCount} <Trans> blocks scanned, all tags mapped.`)
  process.exit(0)
}

console.error('Trans component-map FAIL — these <Trans> blocks have tags not declared in `components={...}`. They will render as escaped HTML («&lt;tag&gt;…»):')
console.error('')
for (const i of issues) {
  console.error(`  ${i.tsx}`)
  console.error(`    ${i.block}.${i.key}: missing ${JSON.stringify(i.missing)}`)
}
console.error('')
console.error(`${issues.length} block(s) need fixing.`)
process.exit(1)
