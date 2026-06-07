#!/usr/bin/env node
/**
 * check-quiz-balance — fail when a chapter's quiz telegraphs its answers by
 * LENGTH: the correct option is the single longest of the four in too large
 * a share of questions.
 *
 * Why this gate exists (user-flagged, ch 1.11 review, 2026-06): going through
 * the transistor quiz the user noticed the correct answer was *always* the
 * longest, most-detailed option — a dead giveaway that lets you score without
 * knowing the material. Measurement confirmed it course-wide: ch1_11 and
 * ch2_2 were 100 % «correct = longest», ch1_10/ch2_1 ~88 %, vs 25 % expected
 * by chance. The authoring habit is to pack the justification INTO the correct
 * option while leaving distractors as terse throwaways. The fix is to move the
 * «why» into the `_explanation` field (shown after answering) and keep all four
 * options parallel in length + specificity.
 *
 * What it checks, in both locales (en + uk), for every chapter block
 * (top-level keys matching /^ch\d+_\d+$/) with a quiz:
 *
 *   For each question `quiz_q{n}` with options `_a`.._d and `_correct`,
 *   strip markup, and decide whether the correct option is the UNIQUE longest
 *   (strictly longer than all three distractors). A chapter FAILS when the
 *   correct option is the unique longest in more than THRESHOLD of its
 *   questions (default 0.60). 25 % is chance; a well-balanced quiz lands near
 *   there. The 0.60 line flags only the systematic offenders.
 *
 * The fix is never «shorten the correct answer until it's vague». It is:
 *   1. move the explanatory clause from the correct option into `_explanation`;
 *   2. make distractors specific + plausible, matched in length;
 * so the four options are parallel and length carries no signal.
 *
 * Exits 0 if clean, 1 if any chapter in either locale exceeds the threshold.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const LOCALES = ['en', 'uk']
const THRESHOLD = 0.60 // fail above this share of «correct is the unique longest»
const MIN_QUESTIONS = 5 // need ≥5 *evaluable* (prose) questions — below that a
//                          longest-ratio is too noisy to act on (a 3/4 is chance)
// Questions whose LONGEST option is shorter than this are numeric / one-word
// answers («16 kHz», «120 W», «FM») where length cannot telegraph the answer.
// They're excluded so the ratio reflects only prose questions, where a
// length tell is real.
const MIN_SIGNAL_LEN = 20

/** Strip HTML/JSX tags and collapse whitespace; return visible-text length. */
function visibleLen(s) {
  if (typeof s !== 'string') return 0
  const text = s
    .replace(/<[^>]+>/g, '') // drop tags, keep inner text
    .replace(/\s+/g, ' ')
    .trim()
  return [...text].length // count code points (Cyrillic-safe)
}

/** All quiz question numbers present in a chapter block, sorted ascending. */
function questionNumbers(block) {
  const ns = new Set()
  for (const key of Object.keys(block)) {
    const m = /^quiz_q(\d+)$/.exec(key)
    if (m) ns.add(Number(m[1]))
  }
  return [...ns].sort((a, b) => a - b)
}

const violations = []
const report = [] // { locale, ch, longest, total, pct }

for (const locale of LOCALES) {
  const file = path.join(ROOT, 'src/i18n/locales', locale, 'ui.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))

  for (const [ch, block] of Object.entries(data)) {
    if (!/^ch\d+_\d+$/.test(ch) || typeof block !== 'object' || block === null) continue
    const ns = questionNumbers(block)
    if (ns.length < MIN_QUESTIONS) continue

    let longest = 0
    let total = 0
    const flaggedQ = []
    for (const n of ns) {
      const opts = ['a', 'b', 'c', 'd'].map((x) => block[`quiz_q${n}_${x}`])
      if (opts.some((o) => typeof o !== 'string')) continue
      const correct = Number(block[`quiz_q${n}_correct`])
      if (!Number.isInteger(correct) || correct < 0 || correct > 3) continue
      const lens = opts.map(visibleLen)
      if (Math.max(...lens) < MIN_SIGNAL_LEN) continue // numeric / one-word answers
      total += 1
      const correctLen = lens[correct]
      const maxWrong = Math.max(...lens.filter((_, i) => i !== correct))
      if (correctLen > maxWrong) {
        longest += 1
        flaggedQ.push(n)
      }
    }
    if (total < MIN_QUESTIONS) continue
    const pct = longest / total
    report.push({ locale, ch, longest, total, pct })
    if (pct > THRESHOLD) {
      violations.push({ locale, ch, longest, total, pct, flaggedQ })
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────
report.sort((a, b) => a.locale.localeCompare(b.locale) || b.pct - a.pct)
let curLocale = null
for (const r of report) {
  if (r.locale !== curLocale) {
    curLocale = r.locale
    process.stdout.write(`\n[${r.locale}]  correct-is-longest / total  (threshold ${Math.round(THRESHOLD * 100)}%)\n`)
  }
  const mark = r.pct > THRESHOLD ? '✗' : '·'
  process.stdout.write(
    `  ${mark} ${r.ch.padEnd(9)} ${String(r.longest).padStart(2)}/${String(r.total).padStart(2)}  ${String(Math.round(r.pct * 100)).padStart(3)}%\n`,
  )
}

if (violations.length > 0) {
  process.stdout.write('\n✗ quiz-balance: the correct option is the unique longest too often —\n')
  process.stdout.write('  readers can score by picking the longest answer. Move the justification\n')
  process.stdout.write('  into the _explanation field and make distractors length-parallel.\n\n')
  for (const v of violations) {
    process.stdout.write(
      `  [${v.locale}] ${v.ch}: ${v.longest}/${v.total} (${Math.round(v.pct * 100)}%) — questions ${v.flaggedQ.join(', ')}\n`,
    )
  }
  process.exit(1)
}

process.stdout.write('\n✓ quiz-balance: no chapter telegraphs its answers by length.\n')
process.exit(0)
