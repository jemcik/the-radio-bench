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
  // Ukrainian Cyrillic words sometimes written ALL-CAPS for emphasis,
  // and material-/diagram-label words that read as headings («МІДЬ»,
  // «ВОДА» on the chapter-1 hero pipes; «ДІЕЛЕКТРИК», «ПРОВІДНИК» as
  // material-category titles). Add as the lint surfaces real false
  // positives in UA prose.
  'КВАДРАТА', 'КВАДРАТ', 'НЕ', 'ТАК', 'НІ',
  'МІДЬ', 'ВОДА', 'ДІЕЛЕКТРИК', 'НАПІВПРОВІДНИК', 'ПРОВІДНИК',
  'МІНІМАЛЬНИЙ', 'СУМА', 'ОДНОМУ', 'ОКРЕМО', 'ПОБАЧИТИ',
  'КОЖНА', 'ВСЯ',
  // Diagram cell labels (rendered inside SVG; the text is verisimilitude
  // for an electret-microphone schematic, not a glossary candidate).
  'МІК', 'ПДС',
  // Acronym fragments that show up because the surrounding acronym IS
  // glossed: MOS appears inside the inline expansion of MOSFET,
  // «(MOS field-effect transistors)»; LC- / RC- / RC-ФНЧ are partial
  // matches glued to a following JSX tag («LC-<lpf>...</lpf>») where
  // the regex captures the trailing hyphen as part of the token.
  'MOS',
  'LC-', 'RC-', 'RC-ФНЧ',
  // E-series catalogue designations (E12, E24, E48, E96, E192) — these
  // are «preferred-value» series names from the IEC 60063 standard.
  // The series concept lives in the «preferred value» glossary entry;
  // each `EN` number is just a specific instance. Treating them as
  // glossary candidates would require N entries for N values, which
  // is overkill — the chapter prose explains the family inline.
  'E12', 'E24', 'E48', 'E96', 'E192',
  // Brand names — proper nouns rather than glossary candidates.
  'UNI-T',
  // Geographic abbreviation — already understood by readers;
  // expanding inline would patronise.
  'США',
  // Scope-display verisimilitude labels, not glossary candidates.
  'TRIG',
  // Diagram label for the cylindrical part of a transformer's E-I
  // laminated core («E-I shape» — descriptive, not glossable).
  'E-I',
  // Variable label in schematics — `R-L` is the LOAD resistor name in
  // a divider diagram, not an acronym.
  'R-L',
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

// Glossary-name lookup: include BOTH the keys and the locale-specific
// display values from `glossary._names`. The keys are canonical English
// (e.g. `pwm`, `adc`, `vhf`); the values carry the localised display
// form («ШІМ», «АЦП», «УКХ»). Without the values, UA prose using «ШІМ»
// gets flagged as undefined even though `<G k="pwm">` renders it as a
// glossary tooltip with that exact label.
function buildNameSet(jsonRoot) {
  const names = jsonRoot.glossary?._names || {}
  const set = new Set()
  for (const [k, v] of Object.entries(names)) {
    set.add(k.toUpperCase())
    if (typeof v === 'string') set.add(v.toUpperCase())
  }
  return set
}
const namesEn = buildNameSet(en)
const namesUk = buildNameSet(uk)

const flatEn = flatten(en)
const flatUk = flatten(uk)

// Inline-expansion check. For an acronym `EFHW` in a value, an inline
// expansion is one of:
//   - `<full form> (EFHW)`        → e.g. «End-Fed Half-Wave (EFHW)»
//   - `EFHW (<full form>)`        → e.g. «EFHW (End-Fed Half-Wave)»
//   - `<full form> (EFHW <extra>)` — full form precedes parens, ACRONYM
//     is alone or with descriptor inside parens (e.g. «Kirchhoff's
//     Current Law (KCL)»).
//   - `(EFHW — <full form>)` — acronym at start of parens, full form
//     follows after a dash inside same parens (e.g. «(IEC — International
//     Electrotechnical Commission)»).
//
// «Full form» is detected as either:
//   - 2+ Capitalised words (English title-case form), OR
//   - 3+ space-separated tokens of any case (Ukrainian doesn't title-case
//     definitions: «(метал-оксид-напівпровідникові польові транзистори)»
//     is a perfectly good expansion of MOSFET but every word is
//     lowercase).
function hasInlineExpansion(value, acronym, idx) {
  const start = Math.max(0, idx - 120)
  const end = Math.min(value.length, idx + acronym.length + 120)
  const window = value.slice(start, end)

  // English title-case form: 2+ capitalised words in sequence.
  const hasCapWords = (s) =>
    /(?:[A-ZА-ЯІЇЄҐ][a-zа-яіїєґ-]+\s*){2,}/.test(s)
  // Ukrainian/lowercase form: 3+ multi-letter tokens. Looser — accepts
  // «метал-оксид-напівпровідникові польові транзистори» but rejects
  // 2-token noise like «div abc». Uses an explicit Latin+Cyrillic
  // letter class because JavaScript's default `\w` is ASCII-only and
  // wouldn't match Cyrillic word chars at all.
  const LETTER = '[A-Za-zА-ЯІЇЄҐа-яіїєґ]'
  const SEP = '[\\s—–-]+'
  const hasMultiWords = (s) =>
    new RegExp(`${LETTER}{3,}${SEP}${LETTER}{3,}${SEP}${LETTER}{3,}`).test(s)
  const looksLikeExpansion = (s) => hasCapWords(s) || hasMultiWords(s)

  // (a) Acronym followed by «(...)» containing a plausible expansion.
  const after = new RegExp(
    `\\b${acronym}\\b[^(]{0,5}\\(([^)]{4,120})\\)`,
  )
  const am = after.exec(window)
  if (am && looksLikeExpansion(am[1])) return true

  // (b) `(...)` immediately before the acronym, containing a plausible
  // expansion.
  const before = new RegExp(
    `\\(([^)]{4,120})\\)[^(]{0,5}\\b${acronym}\\b`,
  )
  const bm = before.exec(window)
  if (bm && looksLikeExpansion(bm[1])) return true

  // (c) `<full form> (ACRONYM[...])` — acronym is INSIDE parens (alone
  // or with a short descriptor), full form precedes the open paren.
  // Catches «Kirchhoff's Current Law (KCL)», «Kirchhoff's Voltage Law,
  // KVL» (the «KVL» is sometimes preceded by a comma instead of paren).
  const inParens = new RegExp(`\\(\\s*${acronym}\\b[^)]{0,40}\\)`)
  const ipm = inParens.exec(window)
  if (ipm && ipm.index >= 8) {
    const preceding = window.slice(Math.max(0, ipm.index - 80), ipm.index)
    if (looksLikeExpansion(preceding)) return true
  }

  // (d) `(<anything> ACRONYM <separator> <full form>)` — acronym
  // mid-parens, full form follows after a dash/comma in same parens.
  // Catches «(стиль IEC — Міжнародна електротехнічна комісія)».
  const acrInParens = new RegExp(
    `\\([^)]*?\\b${acronym}\\b[^)]*?[—–\\-,][^)]{4,120}\\)`,
  )
  const aim = acrInParens.exec(window)
  if (aim) {
    const after_acr = aim[0].slice(aim[0].indexOf(acronym) + acronym.length)
    if (looksLikeExpansion(after_acr)) return true
  }

  // (e) `(<full form>, ACRONYM)` — full form first, then comma/dash,
  // then ACRONYM, all inside same parens. Catches the «(англ. Kirchhoff's
  // Current Law, KCL)» bilingual-definition pattern.
  const acrTrailParens = new RegExp(
    `\\(([^)]{8,200})[—–\\-,]\\s*${acronym}\\b[^)]*\\)`,
  )
  const atm = acrTrailParens.exec(window)
  if (atm && looksLikeExpansion(atm[1])) return true

  // (f) `ACRONYM: <full form>` — colon-introduced definition (common in
  // quiz explanations and key-takeaway lines: «KCL: at any junction…»).
  const colonForm = new RegExp(`\\b${acronym}\\b\\s*:\\s*([^.;\\n]{12,160})`)
  const cm = colonForm.exec(window)
  if (cm && looksLikeExpansion(cm[1])) return true

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
      // Trailing-hyphen partial: when a Latin acronym is followed by a
      // hyphen and then a JSX tag (e.g. `LC-<lpf>...`), the regex
      // captures the hyphen as part of the token. That's a partial,
      // not a real acronym worth glossing in itself.
      if (tok.endsWith('-')) continue
      // Mixed-script combos: Latin + hyphen + Cyrillic (e.g. `RC-ФНЧ`).
      // These are concatenated terms, not single-acronym entries; their
      // components (RC, ФНЧ) get scanned separately when they appear
      // standalone. Skip the combo to avoid double-counting.
      if (/[A-Z]/.test(tok) && /[А-ЯІЇЄҐ]/.test(tok)) continue
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
