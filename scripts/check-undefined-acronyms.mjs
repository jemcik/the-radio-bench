#!/usr/bin/env node
/**
 * check-undefined-acronyms.mjs
 * ────────────────────────────
 * Catches all-caps acronyms (3+ letters) used in chapter prose without
 * either (a) a glossary entry registered in `glossary._names`, or
 * (b) an inline expansion right after the first occurrence.
 *
 * Background: ch 1.9 review caught «EFHW» appearing in `keyTakeaway4`
 * with no expansion and no glossary entry — beginners had no way to
 * know what it stood for. The author had defined the acronym in their
 * head as «End-Fed Half-Wave» and forgot to surface that to the reader.
 * `check:glossary-coverage` cannot help here: it only reports terms
 * that ARE in the glossary; brand-new acronyms are invisible to it.
 *
 * Heuristic
 * ─────────
 * For each EN/UA i18n value under any `chN_M` block:
 *   1. Find all-caps tokens of 3+ letters (Latin or Cyrillic):
 *      `EFHW`, `SWR`, `КСХ`, `RF`, `АМ`, `ARRL`, etc.
 *   2. Filter out:
 *      - Tokens registered in `glossary._names` (case-insensitive).
 *      - Tokens already wrapped in `<G k="...">` at this position.
 *      - Common-prose noise: «I», «II», roman numerals; pure-digit
 *        runs; CSS-style words like `RGB`; SI prefixes; HTML attribute
 *        values; React-tag names.
 *   3. For each surviving token: check the SAME value (or value
 *      immediately following) for an inline expansion — either
 *      a parenthetical `EFHW (End-Fed Half-Wave)` form, or the
 *      acronym in parens after its full form `End-Fed Half-Wave (EFHW)`.
 *      If present: SAFE.
 *   4. Otherwise: report as «undefined acronym».
 *
 * Exit code: 0 on clean, 1 on findings.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')
const EN_PATH = path.join(REPO, 'src/i18n/locales/en/ui.json')
const UK_PATH = path.join(REPO, 'src/i18n/locales/uk/ui.json')

// ── Acronym pattern ──────────────────────────────────────────────────
//
// Latin: 3+ uppercase letters at a token boundary, optionally followed
//        by digits or hyphenated continuation (`UHF-2`, `EFHW`).
// Cyrillic: 3+ uppercase Cyrillic letters (`КСХ`, `АМ`).
const ACRONYM_RE = /(?<![A-Za-z0-9А-ЯІЇЄҐа-яіїєґ])[A-ZА-ЯІЇЄҐ][A-ZА-ЯІЇЄҐ0-9-]{2,}(?![A-Za-zА-ЯІЇЄҐа-яіїєґ])/g

// ── Stoplist: never flag these ───────────────────────────────────────
//
// • Roman numerals up to a few hundred (so chapter / version refs read
//   cleanly: «II», «III», «XVIII»).
// • Common HTML/CSS/file-format terms that are not domain glossary
//   candidates («HTML», «PDF», «CSS», «JSON», «GPS» — these are
//   ubiquitous enough that defining them in chapter prose adds friction).
// • Project-internal markers we don't gloss («WIP», «TODO»).
const STOPLIST = new Set([
  'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII', 'XIII', 'XIV',
  'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV',
  'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX',
  'HTML', 'CSS', 'JSON', 'PDF', 'PNG', 'JPG', 'SVG', 'GIF', 'CSV', 'XML',
  'URL', 'URI', 'API', 'SDK', 'CLI', 'GUI', 'OS', 'IDE',
  'WIP', 'TODO', 'FIXME', 'XXX', 'NOTE',
  // Frequently-recurring measurement/RF prefixes that are NOT domain
  // glossary candidates by themselves (they always come with units).
  'NPN', 'PNP', 'OCF',
  // English common words frequently CAPITALISED for emphasis in prose —
  // they read as shouting, not as acronyms. Add new entries as the lint
  // surfaces them.
  'ALL', 'AND', 'OR', 'NOT', 'IF', 'BUT', 'FOR', 'NEW', 'OLD', 'BIG',
  'TOP', 'NOW', 'OFF', 'YES', 'ONE', 'TWO', 'OUT', 'HIGH', 'LOW', 'SEE',
  'SUM', 'AMP', 'CHIP', 'COPPER', 'WATER', 'EXP', 'MIC',
  'SQUARE', 'OUTPUT', 'INPUT', 'LEVEL', 'BEFORE', 'AFTER', 'NEVER',
  'ALWAYS', 'WITH', 'INTO', 'UNDER', 'OVER', 'DIFFERENT', 'SAME',
  'SIMILAR', 'GOOD', 'BAD', 'FAST', 'SLOW', 'INDIVIDUALLY', 'MINIMUM',
  'MAXIMUM',
  // Ukrainian Cyrillic words sometimes written ALL-CAPS for emphasis.
  // Add as the lint surfaces real false positives in UA prose.
  'КВАДРАТА', 'КВАДРАТ', 'НЕ', 'ТАК', 'НІ',
])

// Component / part-number pattern. Things like `FT-37-43`, `T-50-2`,
// `2N3904`, `LM741`, `RG-58` are catalogue SKUs — not glossary
// candidates. Heuristic: contains a hyphen followed by digits, OR
// contains a digit-letter mix that's not a clean acronym.
const PART_NUMBER_RE = /-\d|\d[A-Z]/

function flatten(obj, prefix = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, p))
    else if (typeof v === 'string') out[p] = v
  }
  return out
}

const en = JSON.parse(readFileSync(EN_PATH, 'utf8'))
const uk = JSON.parse(readFileSync(UK_PATH, 'utf8'))

const namesEn = new Set(
  Object.keys(en.glossary?._names || {}).map(k => k.toUpperCase()),
)
const namesUk = new Set(
  Object.keys(uk.glossary?._names || {}).map(k => k.toUpperCase()),
)

const flatEn = flatten(en)
const flatUk = flatten(uk)

// Inline-expansion check. For an acronym `EFHW` in a value, an inline
// expansion is one of:
//   - `<full form> (EFHW)`        → e.g. «End-Fed Half-Wave (EFHW)»
//   - `EFHW (<full form>)`        → e.g. «EFHW (End-Fed Half-Wave)»
// Heuristic: look in a 120-char window around the acronym for a
// `(` … `)` group containing at least 2 capitalised words OR the
// acronym's letters spelled out hyphen-separated (E-F-H-W).
function hasInlineExpansion(value, acronym, idx) {
  const start = Math.max(0, idx - 120)
  const end = Math.min(value.length, idx + acronym.length + 120)
  const window = value.slice(start, end)
  // (a) Acronym followed by «(...)» containing 2+ capitalised words.
  const after = new RegExp(
    `\\b${acronym}\\b[^(]{0,5}\\(([^)]{4,80})\\)`,
  )
  const am = after.exec(window)
  if (am && /(?:[A-ZА-ЯІЇЄҐ][a-zа-яіїєґ-]+\s*){2,}/.test(am[1])) return true
  // (b) `(...)` immediately before the acronym, containing 2+ caps.
  const before = new RegExp(
    `\\(([^)]{4,80})\\)[^(]{0,5}\\b${acronym}\\b`,
  )
  const bm = before.exec(window)
  if (bm && /(?:[A-ZА-ЯІЇЄҐ][a-zа-яіїєґ-]+\s*){2,}/.test(bm[1])) return true
  return false
}

// Detect that an acronym is wrapped in a glossary tag (`<G k="…">EFHW</G>`)
// or a chapter-local custom tag at this position.
function isGlossWrapped(value, acronym, idx) {
  // Look back up to 80 chars for `<G k="..." > or a short `<xxx>` tag opener.
  const back = value.slice(Math.max(0, idx - 80), idx)
  // Match unmatched-open tag right before the acronym.
  if (/<G\b[^>]*>$/.test(back)) return true
  // Custom 2–8-letter tag immediately before (e.g. `<efhw>`, `<bln>`).
  if (/<[a-zA-Z][\w-]{1,7}>$/.test(back)) return true
  return false
}

// Iterate every value under any `chN_M` block (skip glossary, _names,
// _ui, etc. — they're not chapter prose).
function isChapterKey(k) {
  return /^ch\d+_\d+\./.test(k)
}

const findings = []

function scan(flat, names, locale) {
  for (const [key, value] of Object.entries(flat)) {
    if (!isChapterKey(key)) continue
    if (typeof value !== 'string') continue
    let m
    ACRONYM_RE.lastIndex = 0
    while ((m = ACRONYM_RE.exec(value)) !== null) {
      const tok = m[0]
      if (STOPLIST.has(tok)) continue
      if (PART_NUMBER_RE.test(tok)) continue
      if (names.has(tok.toUpperCase())) continue
      if (isGlossWrapped(value, tok, m.index)) continue
      if (hasInlineExpansion(value, tok, m.index)) continue
      findings.push({ locale, key, acronym: tok, value })
    }
  }
}

scan(flatEn, namesEn, 'en')
scan(flatUk, namesUk, 'uk')

if (findings.length === 0) {
  console.log(`check-undefined-acronyms OK: every all-caps acronym in chapter prose is either in glossary._names, wrapped, or inline-expanded.`)
  process.exit(0)
}

// Group by acronym so the output reads as a checklist.
const byAcronym = new Map()
for (const f of findings) {
  if (!byAcronym.has(f.acronym)) byAcronym.set(f.acronym, [])
  byAcronym.get(f.acronym).push(f)
}

console.error('check-undefined-acronyms FAIL — these acronyms appear in chapter prose without a glossary entry and without an inline expansion at first sight:')
console.error('')
for (const [acr, occurrences] of [...byAcronym.entries()].sort()) {
  console.error(`  ${acr} (${occurrences.length} occurrence(s)):`)
  for (const f of occurrences.slice(0, 3)) {
    const idx = f.value.indexOf(f.acronym)
    const snippet = f.value.slice(Math.max(0, idx - 30), Math.min(f.value.length, idx + f.acronym.length + 40))
    console.error(`    [${f.locale}] ${f.key}`)
    console.error(`        …${snippet}…`)
  }
  if (occurrences.length > 3) console.error(`    (+ ${occurrences.length - 3} more)`)
  console.error('')
}
console.error(`${findings.length} unexplained acronym occurrence(s) across ${byAcronym.size} distinct acronym(s).`)
console.error('')
console.error('Fix:')
console.error('  • Add a glossary entry (src/features/glossary/glossary.ts + glossary._names + UA glossary block) and wrap first mention with <G k="..."> or a chapter-local short tag.')
console.error('  • Or expand inline at first mention: «EFHW (End-Fed Half-Wave)» or «End-Fed Half-Wave (EFHW)».')
console.error('  • Or rephrase to drop the acronym entirely.')
process.exit(1)
