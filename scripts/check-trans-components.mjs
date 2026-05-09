#!/usr/bin/env node
/**
 * check-trans-components — fail when a `<Trans i18nKey="…">` block leaves
 * a tag from its EN/UA i18n string unmapped in `components={…}`.
 *
 * Why: react-i18next's <Trans> component renders any inline tag from the
 * source string by looking it up in the `components` map. Tags that
 * aren't in the map render as escaped HTML — readers see literal
 * «&lt;em&gt;…&lt;/em&gt;» or «&lt;nowrap&gt;…&lt;/nowrap&gt;». This is
 * always a bug and has shipped to readers more than once.
 *
 * Scope: every `.tsx` under `src/`. Earlier versions only scanned
 * `src/chapters/`, which let `<nowrap>` slip through inside a
 * `Circuit caption={<Trans …/>}` written from a diagram component
 * (`src/components/diagrams/VaractorTunerSchematic.tsx`). A diagram's
 * caption renders the same way prose does — narrowing scope to chapters
 * was the structural gap that shipped the bug. Now scans everywhere.
 *
 * Parser: the components prop value can contain nested JSX braces
 * (`<span style={{ whiteSpace: 'nowrap' }} />`), so a regex with
 * `[^}]*` cannot capture it. We do brace-balanced extraction instead:
 *   1. Find a `<Trans` opening tag.
 *   2. Find the matching `/>` or `>` end of the JSX element, respecting
 *      nested `{...}` blocks.
 *   3. Inside that span, locate `components=` and brace-balance to grab
 *      the entire prop value.
 *   4. Inside the prop value, collect top-level keys (`name:` at brace
 *      depth 1) and known spreads.
 *
 * Spread resolution:
 *   • `...mathComponents` → {var, sub, sup}
 *   • Anything else: warn (we don't error so authors can use bespoke
 *     spreads without a special-case here, but flag it so we don't
 *     silently swallow unknown shapes).
 *
 * Exits 0 if clean, 1 if any block has unmapped tags.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en/ui.json')
const UK_PATH = path.join(ROOT, 'src/i18n/locales/uk/ui.json')
const SRC_DIR = path.join(ROOT, 'src')

const SPREAD_RESOLUTIONS = {
  mathComponents: new Set(['var', 'sub', 'sup']),
}

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'))
const uk = JSON.parse(fs.readFileSync(UK_PATH, 'utf-8'))

function walkTsx(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip test scaffolding and storybook artefacts — those use
      // `<Trans>` only in mock/fixture form and would false-positive.
      if (entry.name === '__tests__' || entry.name === 'test') continue
      out.push(...walkTsx(p))
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      out.push(p)
    }
  }
  return out
}

/**
 * Brace-balanced scan: starting at `start` (which must be the index of
 * an opening `{`), return the index of the matching closing `}`.
 * Honours nested `{...}` and string literals (single/double/backtick).
 */
function scanBraces(src, start) {
  if (src[start] !== '{') return -1
  let depth = 0
  let i = start
  while (i < src.length) {
    const c = src[i]
    if (c === '"' || c === "'" || c === '`') {
      const quote = c
      i++
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i++
        i++
      }
    } else if (c === '{') {
      depth++
    } else if (c === '}') {
      depth--
      if (depth === 0) return i
    }
    i++
  }
  return -1
}

/**
 * Find every `<Trans …/>` or `<Trans …>…</Trans>` opening element in
 * `src` and yield {openStart, openEnd} byte offsets pointing at the
 * opening tag (`<Trans` … `>` or `/>`). Multi-line tolerant.
 */
function* findTransOpenings(src) {
  const re = /<Trans\b/g
  let m
  while ((m = re.exec(src)) !== null) {
    const start = m.index
    // Walk forward to find the matching `>` that ends the opening tag,
    // respecting nested `{...}` JSX expressions and string literals.
    let i = m.index + '<Trans'.length
    while (i < src.length) {
      const c = src[i]
      if (c === '{') {
        const close = scanBraces(src, i)
        if (close === -1) { i = src.length; break }
        i = close + 1
        continue
      }
      if (c === '"' || c === "'") {
        const quote = c
        i++
        while (i < src.length && src[i] !== quote) {
          if (src[i] === '\\') i++
          i++
        }
        i++
        continue
      }
      if (c === '>') {
        yield { openStart: start, openEnd: i + 1 }
        break
      }
      i++
    }
  }
}

/** Extract all top-level prop assignments from an opening-tag span. */
function parseProps(open) {
  // open looks like `<Trans key="val" components={{…}} ns="ui" />`
  const props = {}
  let i = '<Trans'.length
  while (i < open.length) {
    while (i < open.length && /\s/.test(open[i])) i++
    if (open[i] === '/' || open[i] === '>') break
    // Read prop name.
    const nameStart = i
    while (i < open.length && /[a-zA-Z0-9_]/.test(open[i])) i++
    const name = open.slice(nameStart, i)
    if (!name) break
    if (open[i] !== '=') { props[name] = true; continue }
    i++ // skip '='
    if (open[i] === '"' || open[i] === "'") {
      const quote = open[i]
      const valStart = ++i
      while (i < open.length && open[i] !== quote) {
        if (open[i] === '\\') i++
        i++
      }
      props[name] = { kind: 'string', value: open.slice(valStart, i) }
      i++ // skip close-quote
    } else if (open[i] === '{') {
      const close = scanBraces(open, i)
      if (close === -1) break
      props[name] = { kind: 'jsx', value: open.slice(i + 1, close) }
      i = close + 1
    } else {
      break
    }
  }
  return props
}

/**
 * From a `components={{ key: <X/>, ...spread, key2: <Y/> }}` value,
 * extract the set of top-level keys and any spread identifiers.
 *
 * The outer braces of `{{…}}` are: outer = JSX expression, inner =
 * object literal. The string passed in here is the JSX-expression body,
 * so we expect it to start with `{` (the object literal).
 */
function parseComponentsMap(rawJsx) {
  const trimmed = rawJsx.trim()
  if (!trimmed.startsWith('{')) return { keys: new Set(), spreads: [] }
  // Find the matching closing brace of the inner object literal.
  const close = scanBraces(trimmed, 0)
  if (close === -1) return { keys: new Set(), spreads: [] }
  const body = trimmed.slice(1, close)

  const keys = new Set()
  const spreads = []
  // Walk top-level (depth-0) tokens, splitting on commas.
  let depth = 0
  let segStart = 0
  const segments = []
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (c === '"' || c === "'" || c === '`') {
      const quote = c
      i++
      while (i < body.length && body[i] !== quote) {
        if (body[i] === '\\') i++
        i++
      }
    } else if (c === '{' || c === '(' || c === '[' || c === '<') {
      depth++
    } else if (c === '}' || c === ')' || c === ']' || c === '>') {
      depth--
    } else if (c === ',' && depth === 0) {
      segments.push(body.slice(segStart, i))
      segStart = i + 1
    }
  }
  segments.push(body.slice(segStart))

  for (const segRaw of segments) {
    const seg = segRaw.trim()
    if (!seg) continue
    if (seg.startsWith('...')) {
      const ident = seg.slice(3).trim().replace(/[^a-zA-Z0-9_]/g, '')
      if (ident) spreads.push(ident)
      continue
    }
    // `name:` — possibly quoted-string key.
    const named = seg.match(/^["']?([a-zA-Z][a-zA-Z0-9_-]*)["']?\s*:/)
    if (named) {
      keys.add(named[1])
      continue
    }
    // Shorthand property: `{ nowrap, strong }` is sugar for
    // `{ nowrap: nowrap, strong: strong }`. Match a bare identifier
    // that's the entire segment (no `:` follows because we already
    // handled that branch). Skip if the segment is anything else
    // (function call, expression, etc.) — we only count obvious
    // shorthand-property identifiers.
    const shorthand = seg.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*$/)
    if (shorthand) keys.add(shorthand[1])
  }
  return { keys, spreads }
}

function findTags(s) {
  if (typeof s !== 'string') return new Set()
  return new Set([...s.matchAll(/<([a-zA-Z][a-zA-Z0-9_-]*)\b/g)].map(m => m[1]))
}

function lookupKey(json, dotted) {
  // Resolve `block.key` (possibly nested deeper) — first try exact 2-level,
  // then walk dotted path for nested blocks (e.g. `quiz.q1.stem`).
  if (typeof dotted !== 'string') return undefined
  const parts = dotted.split('.')
  let cur = json
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
    else return undefined
  }
  return cur
}

const issues = []
const warnings = []
let scanned = 0

for (const tsx of walkTsx(SRC_DIR)) {
  const src = fs.readFileSync(tsx, 'utf-8')
  for (const { openStart, openEnd } of findTransOpenings(src)) {
    const open = src.slice(openStart, openEnd)
    const props = parseProps(open)
    const keyProp = props.i18nKey
    const compsProp = props.components
    if (!keyProp || keyProp.kind !== 'string') continue
    if (!compsProp || compsProp.kind !== 'jsx') continue
    scanned++

    const i18nKey = keyProp.value
    const enVal = lookupKey(en, i18nKey)
    const ukVal = lookupKey(uk, i18nKey)
    if (typeof enVal !== 'string' && typeof ukVal !== 'string') continue

    const enTags = findTags(enVal)
    const ukTags = findTags(ukVal)
    const used = new Set([...enTags, ...ukTags])
    if (used.size === 0) continue

    const { keys: mapped, spreads } = parseComponentsMap(compsProp.value)
    for (const sp of spreads) {
      if (SPREAD_RESOLUTIONS[sp]) {
        for (const t of SPREAD_RESOLUTIONS[sp]) mapped.add(t)
      } else {
        warnings.push({
          tsx: path.relative(ROOT, tsx),
          i18nKey,
          spread: sp,
        })
      }
    }

    const missing = [...used].filter(t => !mapped.has(t)).sort()
    if (missing.length > 0) {
      issues.push({
        tsx: path.relative(ROOT, tsx),
        i18nKey,
        missing,
        enOnly: missing.filter(t => enTags.has(t) && !ukTags.has(t)),
        ukOnly: missing.filter(t => ukTags.has(t) && !enTags.has(t)),
      })
    }
  }
}

if (warnings.length > 0) {
  console.warn('Trans component-map: unknown spreads (treated as opaque, may hide unmapped tags):')
  for (const w of warnings) {
    console.warn(`  ${w.tsx}  ${w.i18nKey}: ...${w.spread}`)
  }
  console.warn('  → Add the spread identifier and its resolved keys to SPREAD_RESOLUTIONS in this script.')
  console.warn('')
}

if (issues.length === 0) {
  console.log(`Trans component-map check OK: ${scanned} <Trans> blocks scanned, all tags mapped.`)
  process.exit(0)
}

console.error('Trans component-map FAIL — these <Trans> blocks have tags not declared in `components={...}`. They will render as escaped HTML («&lt;tag&gt;…»):')
console.error('')
for (const i of issues) {
  console.error(`  ${i.tsx}`)
  const sources = []
  if (i.enOnly.length) sources.push(`EN-only: ${JSON.stringify(i.enOnly)}`)
  if (i.ukOnly.length) sources.push(`UA-only: ${JSON.stringify(i.ukOnly)}`)
  const both = i.missing.filter(t => !i.enOnly.includes(t) && !i.ukOnly.includes(t))
  if (both.length) sources.push(`both: ${JSON.stringify(both)}`)
  console.error(`    ${i.i18nKey}: missing ${JSON.stringify(i.missing)}` + (sources.length ? `  (${sources.join('; ')})` : ''))
}
console.error('')
console.error(`${issues.length} block(s) need fixing.`)
process.exit(1)
