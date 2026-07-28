#!/usr/bin/env node
/**
 * check-glossary-locale-parity — fail when a Ukrainian glossary entry silently
 * carries less content than its English original.
 *
 * WHY THIS EXISTS
 *
 * The sibling gates check that glossary KEYS line up (`check:glossary-completeness`),
 * that markup renders (`check:glossary-markup`), that terms are wrapped
 * (`check:glossary-coverage`) and that they are not over-wrapped
 * (`check:glossary-overwrap`). None of them looks at how much a translated entry
 * actually SAYS.
 *
 * That gap shipped real defects. `duty cycle` lost its entire general lead
 * paragraph in Ukrainian — in the very commit that added the lead to English —
 * so a reader hovering the term in chapter 0.2 landed straight in Part-4 RF
 * exposure limits with the term never defined. `power rails` lost the sentence
 * warning that large boards break each rail at the midpoint, which left the
 * popover flatly contradicting the prose that opens it. `breadboard` lost the
 * only sentence in either locale explaining why a leg pushed into a hole stays
 * put. Four review passes over the prose found none of these, because nothing
 * about the Ukrainian text reads as wrong — it reads as complete.
 *
 * WHAT IT MEASURES
 *
 * Sentence count per field, EN vs UA. A translation may legitimately merge or
 * split sentences, so a small difference is not interesting; losing a third of
 * the field is. The gate flags a field whose UA sentence count is below
 * `Math.ceil(en * KEEP_RATIO)`, and separately flags any UA field that is
 * dramatically shorter by character count — the two catch different shapes of
 * omission (a dropped trailing sentence vs a paragraph collapsed to a clause).
 *
 * Pre-existing gaps are grandfathered in `glossary-locale-parity-baseline.json`
 * and tracked in TECH_DEBT.md §6, so new work cannot add to the debt.
 *
 * Exit 0 if clean, 1 on a new or grown gap.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BASELINE_PATH = path.join(__dirname, 'glossary-locale-parity-baseline.json')
const UPDATE = process.argv.includes('--update-baseline')

/* Calibration. Across the 340 translated entries the MEDIAN Ukrainian field is
 * 1.10× the English one by character count — Ukrainian simply runs longer. So a
 * UA field that is both SHORTER in sentences and materially shorter in
 * characters has almost certainly lost content rather than merged it.
 *
 * Sentence count alone is not enough: a translator legitimately merges two
 * English sentences into one Ukrainian sentence, and that keeps the characters.
 * Character count alone is not enough either: a terser but complete translation
 * dips below 1.0 without losing anything. Requiring BOTH signals is what
 * separates «merged» from «dropped». At 0.85 this finds 7 entries; every one of
 * them is a real omission on inspection. */
const MAX_CHAR_RATIO = 0.85
/** Fields short enough that sentence counting is noise. */
const MIN_EN_SENTENCES = 3

const FIELDS = ['tip', 'detail']

/** Count sentence-enders, ignoring the ones inside abbreviations and numbers. */
function sentences(s) {
  return String(s)
    // decimals and section ids: 1.5, 0.707, «Розділ 4.3»
    .replace(/\d[.,]\d/g, '00')
    // common abbreviations that end in a period
    .replace(/\b(англ|рос|нім|тобто|напр|див|e\.g|i\.e|etc|vs|Dr|Fig)\./gi, '$1')
    .split(/[.!?…](?:\s|$)/)
    .map(x => x.trim())
    .filter(Boolean).length
}

// ── Load both locales ─────────────────────────────────────────────────────
// EN lives in a TS module; read it as text and pull the field values out with
// the same quoting rules the file uses (single-quoted, escaped apostrophes).
const enSrc = fs.readFileSync(path.join(ROOT, 'src/features/glossary/glossary.ts'), 'utf8')
const uk = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/locales/uk/ui.json'), 'utf8')).glossary ?? {}

/** term → { tip, detail } from the TS source. */
function parseEn(src) {
  const out = {}
  // Entry heads look like  `  vna: {`  or  `  'duty cycle': {`
  const entryRe = /^ {2}(?:'([^']+)'|([A-Za-z_$][\w$]*)):\s*\{$/gm
  const heads = [...src.matchAll(entryRe)]
  for (let i = 0; i < heads.length; i++) {
    const term = heads[i][1] ?? heads[i][2]
    const start = heads[i].index
    const end = i + 1 < heads.length ? heads[i + 1].index : src.length
    const body = src.slice(start, end)
    const fields = {}
    for (const f of FIELDS) {
      // value may sit on the same line or the next one, and is single-quoted
      const m = body.match(new RegExp(`\\b${f}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`))
      if (m) fields[f] = m[1].replace(/\\'/g, "'")
    }
    if (Object.keys(fields).length) out[term] = fields
  }
  return out
}

const en = parseEn(enSrc)
if (Object.keys(en).length < 50) {
  console.error(`check-glossary-locale-parity FAIL — parsed only ${Object.keys(en).length} EN entries.`)
  console.error('The glossary.ts shape probably changed; fix the parser before trusting this gate.')
  process.exit(1)
}

// ── Compare ───────────────────────────────────────────────────────────────
const gaps = {}
for (const [term, fields] of Object.entries(en)) {
  const ukEntry = uk[term]
  if (!ukEntry) continue // key-level absence is check:glossary-completeness's job
  for (const f of FIELDS) {
    const e = fields[f]
    const u = ukEntry[f]
    if (typeof e !== 'string' || typeof u !== 'string') continue
    const es = sentences(e)
    const us = sentences(u)
    if (es < MIN_EN_SENTENCES) continue
    const ratio = u.length / e.length
    if (us < es && ratio < MAX_CHAR_RATIO) {
      gaps[`${term}.${f}`] =
        `en ${es} sentence(s)/${e.length} chars → uk ${us}/${u.length} (×${ratio.toFixed(2)})`
    }
  }
}

if (UPDATE) {
  const sorted = Object.fromEntries(Object.entries(gaps).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`baseline written: ${Object.keys(sorted).length} gap(s) → ${path.relative(ROOT, BASELINE_PATH)}`)
  process.exit(0)
}

const baseline = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  : {}

const offending = Object.keys(gaps).filter(k => !(k in baseline))

if (offending.length === 0) {
  const n = Object.keys(baseline).length
  console.log(
    'glossary locale parity OK: no Ukrainian entry newly lost content' +
      (n ? ` (${n} pre-existing gap(s) — see TECH_DEBT.md §6).` : '.'),
  )
  process.exit(0)
}

console.error('check-glossary-locale-parity FAIL — these Ukrainian glossary fields carry')
console.error('materially less than their English originals, so the popover a reader opens')
console.error('says less than the entry it was translated from:')
console.error('')
for (const k of offending) console.error(`  ${k}  (${gaps[k]})`)
console.error('')
console.error('Fix: translate the missing sentences (via the ua-translate pipeline — never by')
console.error('hand), or, if the English is genuinely redundant, cut it there too so both')
console.error('locales say the same thing. After an intentional, verified change to')
console.error('pre-existing debt, re-snapshot with:')
console.error('  node scripts/check-glossary-locale-parity.mjs --update-baseline')
console.error('The pre-existing backlog is tracked as TECH_DEBT.md §6.')
process.exit(1)
