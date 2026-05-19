#!/usr/bin/env node
/**
 * check-acronym-parity.mjs
 * ────────────────────────
 * Catches the «EN-introduces-acronym, UA-drops-it» regression class.
 *
 * Background: ch 1.11 EN intro shipped «<bjtT>bipolar junction
 * transistor (BJT)</bjtT>» — a textbook first-mention with the
 * full term followed by the acronym in parentheses. Gemini's UA
 * translation collapsed it to «<bjtT>Біполярний транзистор</bjtT>»,
 * dropping the «(BJT)» as redundant — but the chapter then used
 * bare «BJT» a dozen times further down. The Ukrainian reader saw
 * «Біполярний транзистор» in the intro and had no way to connect
 * it with «BJT» appearing later in `mosfetSwitchVsBjt`, the quiz,
 * etc. `check:undefined-acronyms` didn't fire because BJT/FET
 * exist in `glossary._names`.
 *
 * Rule
 * ────
 * For every EN value that contains a parenthesised acronym
 * — pattern `(ACR)` where ACR is 2+ uppercase letters / digits —
 * the corresponding UA value MUST contain the same `(ACR)` literal
 * somewhere in its body. This guarantees that the UA reader meets
 * the acronym INSIDE its full-form context, the same way the EN
 * reader does, and not as a bare token several paragraphs later.
 *
 * Exemptions
 * ──────────
 * `EXEMPT` — acronyms that the project deliberately leaves
 * un-parenthesised in UA (e.g. SI / DIY / NPN where the form is
 * universally recognised in UA technical prose without expansion).
 * Add sparingly; the default policy is «keep parity».
 *
 * Exits 0 if clean, 1 if any value is missing the parens.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en/ui.json')
const UK_PATH = path.join(ROOT, 'src/i18n/locales/uk/ui.json')

// Pattern: a parenthesised acronym — 2+ uppercase ASCII letters,
// optionally with digits / hyphens, surrounded by parens. Examples:
//   «(BJT)», «(FET)», «(MOSFET)», «(2N3904)» — but the digit-only
// case is filtered later. We require at least one uppercase letter
// at the start to avoid matching pure part numbers.
const PAREN_ACR = /\(([A-Z][A-Z0-9-]{1,})\)/g

// Acronyms that the project leaves bare in UA on purpose. Most of
// these are SI symbols or universally-recognised abbreviations whose
// expansion would patronise the reader. Add with a one-line comment
// tying the decision to a specific past discussion.
const EXEMPT = new Set([
  // Reserved for future entries — keep the empty-list scaffold so
  // the gate's intent is documented even when the list is empty.
])

// Keys where the UA translation deliberately uses a different
// disambiguator than the EN parens-acronym. Each entry needs a
// one-line note tying the decision to past review.
const EXEMPT_KEYS = new Set([
  // ch1_1 lab step calls «(DC)» as a clarifier on a battery; UA
  // body text already uses «постійний струм» throughout the
  // chapter, so the parens marker is dropped to avoid stutter.
  'ch1_1.labStep4',
  // ch1_2 Kirchhoff laws — UA has «KCL»/«KVL» inside a longer
  // parenthetical «(англ. Kirchhoff's Current Law, KCL)» that the
  // strict «(KCL)» literal check doesn't match. The acronym IS
  // present in the UA string, just embedded.
  'ch1_2.kirchhoffKcl',
  'ch1_2.kirchhoffKvl',
  // ch1_9 «(VHF)» — UA chapter introduces VHF earlier as «УКХ»
  // (Ukrainian-language abbreviation for Very High Frequency)
  // and uses that throughout. The bare «VHF» acronym is not
  // re-introduced in the ferrite paragraph.
  'ch1_9.coresFerrite',
  // ch1_9 quiz: EN «(DC)» translated as «(постійна напруга)» —
  // expanding the acronym in UA prose was the chosen strategy
  // for quiz answers (compactness over symbol-symmetry).
  'ch1_9.quiz_q1_b',
  // ch1_9 quiz: EN «(E-I)» refers to E-I shape; UA uses the
  // Cyrillic-equivalent «Ш-подібне» (since Cyrillic Ш visually
  // matches the laminate shape better than Latin E-I in UA prose).
  'ch1_9.quiz_q7_a',
])

function flatten(obj, prefix = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, p))
    else if (typeof v === 'string') out[p] = v
  }
  return out
}

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'))
const uk = JSON.parse(fs.readFileSync(UK_PATH, 'utf8'))
const enFlat = flatten(en)
const ukFlat = flatten(uk)

const issues = []

for (const [key, enVal] of Object.entries(enFlat)) {
  if (EXEMPT_KEYS.has(key)) continue
  if (!key.match(/^(ch\d+_\d+|glossary)\b/)) continue  // chapter + glossary only
  const ukVal = ukFlat[key]
  if (typeof ukVal !== 'string') continue

  const enAcros = new Set()
  for (const m of enVal.matchAll(PAREN_ACR)) {
    if (EXEMPT.has(m[1])) continue
    enAcros.add(m[1])
  }
  if (enAcros.size === 0) continue

  for (const a of enAcros) {
    if (!ukVal.includes(`(${a})`) && !ukVal.includes(`(${a},`) && !ukVal.includes(`(${a};`)) {
      issues.push({
        key,
        acronym: a,
        en: enVal.slice(0, 200),
        uk: ukVal.slice(0, 200),
      })
    }
  }
}

if (issues.length === 0) {
  console.log(`Acronym parity OK: every EN «(ACRONYM)» first-mention is mirrored in the UA value.`)
  process.exit(0)
}

console.log(`check:acronym-parity FAIL — ${issues.length} EN/UA pair(s) where the EN value introduces an acronym in parens but the UA value never contains «(ACRONYM)»:\n`)
for (const it of issues) {
  console.log(`  [${it.key}] missing «(${it.acronym})» in UA`)
  console.log(`    EN: …${it.en}…`)
  console.log(`    UA: …${it.uk}…`)
  console.log()
}

console.log('Fix:')
console.log('  • Restore the «(ACRONYM)» literal in the UA value at the same position the EN has it.')
console.log('  • For EN «<tag>full form (ABBR)</tag>», the UA pattern is «<tag>повна форма (ABBR)</tag>»')
console.log('    — keep BOTH the full UA name AND the original-language acronym in parens, so the')
console.log('    reader meets the acronym inside its full-form context the way the EN reader does.')
console.log('  • If the project should deliberately drop a specific acronym from UA, add it to the')
console.log('    EXEMPT set in scripts/check-acronym-parity.mjs with a one-line comment naming the')
console.log('    past discussion that authorised the exemption.')
process.exit(1)
