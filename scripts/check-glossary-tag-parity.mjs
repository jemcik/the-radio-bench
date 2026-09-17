#!/usr/bin/env node
/**
 * check-glossary-tag-parity — fail when a glossary link exists in the English
 * value of a chapter string but not in the Ukrainian one.
 *
 * WHY THIS EXISTS
 *
 * `check:glossary-coverage` reads `en/ui.json` only — it is written to catch «this
 * chapter says «inductor» twelve times and never wraps it». That framing makes an
 * EN-only wrap invisible: the English reader gets the dotted underline and the
 * popover, the Ukrainian reader gets a bare word, and every gate stays green.
 *
 * Found in the ch1.3 pass (2026-08-13). `sineWaveIntro` wrapped `<lc>LC</lc>` and
 * `<ind>inductor</ind>` in English and neither in Ukrainian — so the one sentence
 * that introduces the LC circuit, two chapters before it gets its own chapter,
 * offered a Ukrainian reader no way to look either term up. `nonSineGalleryIntro`
 * lost `<dmm>` the same way. Repo-wide the scan found 25 such keys across seven
 * chapters.
 *
 * This is the same shape as the bug `check:tag-renders` had until the ch1.2 pass
 * widened it to both locales: a gate that reads one locale cannot see a defect
 * that lives in the other.
 *
 * WHAT IT MEASURES
 *
 * Per chapter block (`ch{N}_{M}`), per key present in both locales: count each
 * non-structural tag name in the EN value and in the UA value. Structural and
 * typographic tags are excluded — `<strong>`, `<var>`, `<nowrap>` and friends
 * legitimately differ when a sentence is restructured in translation. What is
 * left is the chapter-local glossary aliases (`<cap>`, `<ind>`, `<dmm>`, …) and
 * literal `<G>`, which are links: if the English sentence offers the reader a
 * definition, the Ukrainian sentence has to offer it too.
 *
 * A UA value carrying MORE wraps than EN is not flagged. Ukrainian often needs a
 * term spelled out where English can lean on context, and `check:glossary-overwrap`
 * already guards the other direction.
 *
 * HOW TO FIX A HIT
 *
 * Wrap the same term in the Ukrainian value. If the Ukrainian sentence genuinely
 * does not contain the term (a restructured translation), rephrase it so it does —
 * dropping the link silently is what this gate exists to stop. Then re-run the UA
 * linter for that block.
 *
 * Exits 0 if clean, 1 if any chapter string loses a link in translation.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en/ui.json')
const UK_PATH = path.join(ROOT, 'src/i18n/locales/uk/ui.json')

// Tags that carry formatting or maths rather than a link. A translation may add
// or drop these freely — only glossary aliases are load-bearing here.
const STRUCTURAL = new Set([
  'strong', 'em', 'b', 'i', 'u', 's', 'span', 'p', 'br', 'code', 'pre',
  'ul', 'ol', 'li', 'var', 'nowrap', 'sub', 'sup', 'small', 'mark', 'abbr',
])

const TAG_RE = /<([a-zA-Z][\w-]*)[\s>]/g

function flatten(node, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(node)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, `${prefix}${k}.`, out)
    else if (typeof v === 'string') out[`${prefix}${k}`] = v
  }
  return out
}

/** Count non-structural tag names in a string. */
function linkTags(s) {
  const counts = new Map()
  for (const m of s.matchAll(TAG_RE)) {
    const tag = m[1]
    if (STRUCTURAL.has(tag.toLowerCase())) continue
    counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return counts
}

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'))
const uk = JSON.parse(fs.readFileSync(UK_PATH, 'utf8'))

// ── Baseline of pre-existing debt ────────────────────────────────────────
// The scan that motivated this gate found 25 keys across seven chapters, all
// predating it. Each is a Ukrainian reader losing a popover, and each needs its
// sentence re-read (and often rephrased) rather than a mechanical tag insert —
// so they are worked off with their chapter's §2 review pass, not in a sweep.
// Regenerate after an intentional change with:  --update-baseline
const BASELINE_PATH = path.join(__dirname, 'glossary-tag-parity-baseline.json')
const UPDATE = process.argv.includes('--update-baseline')
const baseline = !UPDATE && fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  : {}

const findings = []
const current = {}

for (const [chapter, block] of Object.entries(en)) {
  if (!/^ch\d+_\d+$/.test(chapter)) continue
  const ukBlock = uk[chapter]
  if (!ukBlock || typeof ukBlock !== 'object') continue
  const flatEn = flatten(block)
  const flatUk = flatten(ukBlock)
  for (const [key, value] of Object.entries(flatEn)) {
    const ukValue = flatUk[key]
    if (typeof ukValue !== 'string') continue // check:i18n covers missing keys
    const wantTags = linkTags(value)
    if (wantTags.size === 0) continue
    const haveTags = linkTags(ukValue)
    const lost = []
    for (const [tag, n] of wantTags) {
      const have = haveTags.get(tag) ?? 0
      if (have < n) lost.push({ tag, en: n, uk: have })
    }
    if (lost.length === 0) continue
    const id = `${chapter}.${key}`
    current[id] = lost.length
    findings.push({ id, lost })
  }
}

// ── Snapshot mode ────────────────────────────────────────────────────────
if (UPDATE) {
  const sorted = Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + '\n')
  console.log(
    `baseline written: ${Object.keys(sorted).length} key(s) → ${path.relative(ROOT, BASELINE_PATH)}`,
  )
  process.exit(0)
}

// ── Enforce: fail on new keys, or on a key that lost MORE tags than baselined ──
const offending = findings.filter(f => (current[f.id] ?? 0) > (baseline[f.id] ?? 0))

if (offending.length === 0) {
  const grandfathered = Object.keys(baseline).length
  console.log(
    'check-glossary-tag-parity OK: no chapter string loses a glossary link in Ukrainian' +
      (grandfathered
        ? ` (${grandfathered} pre-existing key(s) baselined — see TECH_DEBT.md §10).`
        : '.'),
  )
  process.exit(0)
}

console.error('check-glossary-tag-parity FAIL — these strings offer the English reader a')
console.error('glossary link that the Ukrainian reader does not get:')
console.error('')
for (const f of offending) {
  console.error(`  ${f.id}`)
  for (const l of f.lost) console.error(`    <${l.tag}>  en: ${l.en}  uk: ${l.uk}`)
}
console.error('')
console.error('Fix: wrap the same term in the Ukrainian value. If the Ukrainian sentence does')
console.error('not contain the term at all, rephrase it so it does — dropping the link is the')
console.error('defect. After an intentional, verified change to pre-existing debt, re-snapshot:')
console.error('  node scripts/check-glossary-tag-parity.mjs --update-baseline')
console.error('The pre-existing backlog is tracked as TECH_DEBT.md §10.')
process.exit(1)
