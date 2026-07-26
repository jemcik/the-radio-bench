#!/usr/bin/env node
/**
 * check-widget-prose-duplication — fail when a widget/diagram string and a
 * prose paragraph in the same chapter say the same thing in nearly the same
 * words.
 *
 * Why: a widget note and the paragraph next to it are written at different
 * times, often to fix different problems, and they drift into restating each
 * other. Reader-flagged on ch4.4 §4, where `rst.judgementNote` and `rstP4` were
 * near-verbatim twins sitting two lines apart. The cause is instructive: the
 * two ORIGINALLY CONTRADICTED each other, a review caught the contradiction,
 * and it was "fixed" by copying one into the other — trading a contradiction
 * for a duplication. Nothing else in the suite compares a widget's strings with
 * the prose around it, so both defects were invisible to the gates.
 *
 * What it does, per `ch{X}_{Y}` block in en/ui.json and uk/ui.json:
 *   1. Splits the block into WIDGET strings (anything inside a nested object,
 *      plus top-level `*Caption` keys) and PROSE strings (top-level keys that
 *      are not quiz, aria, section headings or captions).
 *   2. Splits every string into sentences and compares each widget sentence
 *      against each prose sentence by Jaccard overlap of content words.
 *   3. Flags a pair when the overlap crosses THRESHOLD and both sentences are
 *      long enough for the number to mean anything.
 *
 * Sentence level is deliberate: duplication is normally ONE sentence copied,
 * and measuring whole strings dilutes it below any usable threshold. On the
 * ch4.4 evidence, whole-string Jaccard put a real duplicate (0.26) below a
 * clean pair (0.24); sentence-level separates them cleanly.
 *
 * The 51 pairs that already existed when this gate was written are grandfathered in
 * the baseline and tracked as a backlog in TECH_DEBT.md §1 — this gate stops the
 * problem growing, it does not claim the course is free of it.
 *
 * Exits 0 if clean, 1 if any chapter has a duplicated pair.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LOCALES = ['en', 'uk']
const BASELINE_PATH = path.join(__dirname, 'widget-prose-duplication-baseline.json')

/** Overlap at or above this, between two long-enough sentences, is a duplicate. */
const THRESHOLD = 0.5
/** Below this many content words a Jaccard score is noise, not evidence. */
const MIN_TOKENS = 5

/** Top-level prose keys that are not prose. */
const SKIP_PROSE = /^(quiz_|section[A-Z]|.*[Aa]ria$|.*Caption$|heroAria$|labEquip|labComp)/

const stripMarkup = s => s.replace(/<[^>]+>/g, ' ').replace(/\{\{[^}]+\}\}/g, ' ')

const sentences = s =>
  stripMarkup(s)
    .split(/(?<=[.!?:])\s+/)
    .map(x => x.trim())
    .filter(Boolean)

/** Content words: Latin or Cyrillic, 4+ chars, which drops most function words. */
const tokens = s => {
  const out = new Set()
  for (const m of s.toLowerCase().matchAll(/[\p{L}]{4,}/gu)) out.add(m[0])
  return out
}

const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0
  let shared = 0
  for (const t of a) if (b.has(t)) shared += 1
  return shared / (a.size + b.size - shared)
}

/** Walk a chapter block into [widgetStrings, proseStrings], each {key, value}. */
function partition(block) {
  const widget = []
  const prose = []
  const walkNested = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') {
        if (!/aria/i.test(k)) widget.push({ key: `${prefix}.${k}`, value: v })
      } else if (v && typeof v === 'object') {
        walkNested(v, `${prefix}.${k}`)
      }
    }
  }
  for (const [k, v] of Object.entries(block)) {
    if (v && typeof v === 'object') {
      walkNested(v, k)
    } else if (typeof v === 'string') {
      if (/Caption$/.test(k)) widget.push({ key: k, value: v })
      else if (!SKIP_PROSE.test(k)) prose.push({ key: k, value: v })
    }
  }
  return [widget, prose]
}

const baseline = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  : {}

const findings = []

for (const locale of LOCALES) {
  const file = path.join(ROOT, `src/i18n/locales/${locale}/ui.json`)
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const [chId, block] of Object.entries(json)) {
    if (!/^ch\d+_\d+$/.test(chId) || !block || typeof block !== 'object') continue
    const [widget, prose] = partition(block)

    for (const w of widget) {
      for (const p of prose) {
        for (const ws of sentences(w.value)) {
          const wt = tokens(ws)
          if (wt.size < MIN_TOKENS) continue
          for (const ps of sentences(p.value)) {
            const pt = tokens(ps)
            if (pt.size < MIN_TOKENS) continue
            const score = jaccard(wt, pt)
            if (score < THRESHOLD) continue
            const id = `${chId}|${w.key}|${p.key}`
            if (baseline[id]) continue
            findings.push({ locale, chId, id, score, wKey: w.key, pKey: p.key, ws, ps })
          }
        }
      }
    }
  }
}

if (findings.length === 0) {
  const n = Object.keys(baseline).length
  console.log(
    `Widget/prose duplication OK: no widget string restates a neighbouring paragraph` +
      (n ? ` (${n} grandfathered pair(s) — see TECH_DEBT.md §1).` : '.'),
  )
  process.exit(0)
}

console.error(
  'check:widget-prose-duplication FAIL — these widget/diagram strings restate a prose\n' +
    'paragraph in the same chapter. Decide which artefact OWNS the fact and cut it from\n' +
    'the other; do not leave the reader the same sentence twice.\n',
)
const seen = new Set()
for (const f of findings.sort((a, b) => b.score - a.score)) {
  if (seen.has(f.id + f.locale)) continue
  seen.add(f.id + f.locale)
  console.error(`  [${f.locale}] ${f.chId}  ${f.wKey}  ×  ${f.pKey}   overlap ${f.score.toFixed(2)}`)
  console.error(`      widget: ${f.ws.slice(0, 110)}`)
  console.error(`      prose : ${f.ps.slice(0, 110)}\n`)
}
console.error(`${seen.size} duplicated pair(s).`)
console.error(
  '\nFix:\n' +
    '  • Keep the fact where the reader needs it AT THAT MOMENT — usually the widget\n' +
    '    note, since that is where they are generating the numbers it warns about.\n' +
    '  • Cut it from the other, leaving only what that artefact alone says.\n' +
    `  • To grandfather an existing pair, add its id to ${path.relative(ROOT, BASELINE_PATH)}\n` +
    '    and say why in its value string. The existing backlog is TECH_DEBT.md §1.',
)
process.exit(1)
