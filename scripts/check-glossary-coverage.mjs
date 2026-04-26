#!/usr/bin/env node
/**
 * check-glossary-coverage — fail when a chapter's prose mentions a known
 * glossary term but never wraps any occurrence in a `<G>` / alias tag.
 *
 * Why: glossary tooltips are how readers explore terminology. A chapter
 * that mentions «inductor» 12 times but wraps it 0 times leaves readers
 * with an unstyled bare word — no underline, no tooltip, no popover.
 * That has shipped at least once (ch1.6 v1) and the human caught it.
 *
 * What it does, per chapter (`ch{X}_{Y}` blocks in en/ui.json):
 *   1. Concatenates every string value under the chapter block (skipping
 *      `widget` subtrees — those are widget UI labels, not prose).
 *   2. For each glossary key + display name, counts:
 *      a. Plain-text mentions: word-boundary matches outside of HTML
 *         attribute contexts (k="…", className="…", style attrs).
 *      b. Tag wraps: any chapter-local alias tag bound to this glossary
 *         key in the chapter's TSX (e.g. `<cap>` → `<G k="capacitor"/>`),
 *         plus literal `<G k="key">` usage.
 *   3. Flags terms with plain mentions ≥ 1 but wraps = 0.
 *
 * Exits 0 if clean, 1 if any chapter has unwrapped terms.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en/ui.json')
const GLOSSARY_PATH = path.join(ROOT, 'src/features/glossary/glossary.ts')
const CHAPTERS_DIR = path.join(ROOT, 'src/chapters')

// Generic / structural terms whose tooltips would feel intrusive on
// every chapter (band labels, ubiquitous units, the SI namespace).
// Glossary entries still exist; they just don't have to be wrapped
// in every chapter that mentions them.
const EXEMPT_TERMS = new Set([
  'si',
  'gnd', 'usb', 'ide',
  'hf', 'rf', 'vhf', 'fm', 'am', 'led',
  'arrl', 'cept', 'erc',
  'qrp', 'qso',
  'rms', 'pwm', 'esr',
  'ham radio',
  'mains',
  'sine wave', 'square wave',
  'volt/div', 'time/div',
  'true rms', 'peak-to-peak',
  'colour code', 'preferred value', 'power rating', 'surface mount',
  'dip chip', 'power rails',
  'dbm', 'dbd', 'dbi',
  'continuity', 'calibrated', 'cursor',
  'fourier', 'harmonic', 'logarithm', 'decade',
  'period', 'phase', 'amplitude', 'frequency',  // broad signal descriptors
  'voltage', 'current', 'resistance', 'power', 'watt', 'ampere', 'ohm', 'coulomb', 'charge',
  'conductor', 'insulator', 'semiconductor',
  'topology', 'tolerance',
  'antenna', 'dipole', 'yagi', 'isotropic', 'coax', 'transceiver',
  'ionosphere', 'skywave', 'ground wave',
  'rectification',
  'drift velocity', 'conventional current',
  'derivative', 'logarithm',
  'form factor', 'carrier',
  'multimeter', 'oscilloscope', 'breadboard', 'arduino', 'vna',
  'farad', 'henry', 'hertz',  // raw unit names
  'rc circuit',
  'dielectric', 'electrolytic',
  'coupling capacitor', 'bypass capacitor',
  'switch debouncing', 'debouncing',
])

function readGlossaryKeys() {
  const src = fs.readFileSync(GLOSSARY_PATH, 'utf-8')
  const out = []
  for (const line of src.split('\n')) {
    const m = line.match(/^\s{2}(?:'([^']+)'|"([^"]+)"|([a-zA-Z][\w-]*)):\s*\{/)
    if (m) out.push(m[1] ?? m[2] ?? m[3])
  }
  return out
}

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'))
const names = en.glossary?._names ?? {}

const glossaryKeys = readGlossaryKeys().filter(k => !EXEMPT_TERMS.has(k))

function* allStrings(node) {
  if (typeof node === 'string') yield node
  else if (Array.isArray(node)) for (const v of node) yield* allStrings(v)
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'widget') continue
      yield* allStrings(v)
    }
  }
}

const chapterIds = Object.keys(en).filter(k => /^ch\d+_\d+$/.test(k))

function findTsxForChapter(chId) {
  const want = chId.replace('ch', 'Chapter') + '.tsx'
  const stack = [CHAPTERS_DIR]
  while (stack.length) {
    const d = stack.pop()
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.isFile() && e.name === want) return p
    }
  }
  return null
}

// Strip HTML attribute contents from prose so a term that only appears
// inside a `k="..."` doesn't count as a plain mention.
function stripHtmlAttrs(s) {
  // Remove all `name="value"` and `name='value'` attribute pairs.
  return s.replace(/\b\w+\s*=\s*"[^"]*"|\b\w+\s*=\s*'[^']*'/g, '')
}

const issues = []

for (const chId of chapterIds) {
  const block = en[chId]
  const proseRaw = [...allStrings(block)].join('\n')
  const proseText = stripHtmlAttrs(proseRaw)

  const tsxPath = findTsxForChapter(chId)
  const tagToKey = new Map()
  if (tsxPath) {
    const src = fs.readFileSync(tsxPath, 'utf-8')
    for (const m of src.matchAll(/(\w+)\s*:\s*<G\s+k="([^"]+)"\s*\/>/g)) {
      tagToKey.set(m[1], m[2])
    }
  }
  const keyToTags = new Map()
  for (const [tag, key] of tagToKey) {
    if (!keyToTags.has(key)) keyToTags.set(key, new Set())
    keyToTags.get(key).add(tag)
  }

  for (const gKey of glossaryKeys) {
    const displayName = names[gKey] ?? gKey
    const needles = [gKey, displayName].filter((v, i, a) => a.indexOf(v) === i)

    let plainHits = 0
    for (const n of needles) {
      // Build a word-boundary regex. For multi-word phrases the spaces
      // are literal; for single words use \b on both sides.
      const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`\\b${escaped}\\b`, 'gi')
      plainHits += (proseText.match(re) ?? []).length
    }
    if (plainHits === 0) continue

    const tags = keyToTags.get(gKey) ?? new Set()
    let wrapHits = 0
    for (const tag of tags) {
      const tagRe = new RegExp(`<${tag}\\b`, 'g')
      wrapHits += (proseRaw.match(tagRe) ?? []).length
    }
    const literalRe = new RegExp(
      `<G\\s+k=["']${gKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g',
    )
    wrapHits += (proseRaw.match(literalRe) ?? []).length

    if (wrapHits === 0) {
      issues.push({ chId, gKey, displayName, plainHits })
    }
  }
}

if (issues.length === 0) {
  console.log(`Glossary coverage OK: ${chapterIds.length} chapters scanned against ${glossaryKeys.length} glossary terms (${EXEMPT_TERMS.size} exempt).`)
  process.exit(0)
}

console.error('Glossary coverage FAIL — these chapters mention glossary terms in prose but never wrap any occurrence as <G> (no tooltip, no popover):')
console.error('')
const byChapter = new Map()
for (const i of issues) {
  if (!byChapter.has(i.chId)) byChapter.set(i.chId, [])
  byChapter.get(i.chId).push(i)
}
for (const [chId, items] of [...byChapter].sort()) {
  console.error(`  ${chId}:`)
  for (const i of items) {
    const note = i.displayName !== i.gKey ? ` («${i.displayName}»)` : ''
    console.error(`    ${i.gKey}${note} — ${i.plainHits} mention(s), 0 wraps`)
  }
}
console.error('')
console.error(`${issues.length} unwrapped term(s) across ${byChapter.size} chapter(s).`)
console.error('Wrap each first occurrence with <G k="..."> (or a chapter-local tag mapped to it).')
process.exit(1)
