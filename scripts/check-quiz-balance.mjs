#!/usr/bin/env node
/**
 * check-quiz-balance — fail when a chapter's quiz lets a reader score WITHOUT
 * knowing the material. Three independent tells, each its own section below:
 *
 *   1. LENGTH   — the correct option is the single longest too often, so you
 *                 can pick the wordiest answer and be right.
 *   2. POSITION — the correct option clusters on one letter (almost always
 *                 «b»), so you can pick that letter and be right.
 *   3. PARITY   — en and uk disagree on `_correct` for a question, so the two
 *                 locales grade the same answer differently (an authoring bug,
 *                 not a fairness one — but the same _correct index feeds both,
 *                 so a desync means one locale is silently wrong).
 *
 * ── Why LENGTH (user-flagged, ch1_11 review, 2026-06) ─────────────────────
 * Going through the transistor quiz the user noticed the correct answer was
 * *always* the longest, most-detailed option. Measured course-wide: ch1_11 and
 * ch2_2 were 100 % «correct = longest», ch1_10/ch2_1 ~88 %, vs 25 % by chance.
 * The habit is to pack the justification INTO the correct option and leave
 * distractors as terse throwaways. Fix: move the «why» into `_explanation`
 * (shown after answering) and keep all four options parallel in length.
 *
 * ── Why POSITION (user-flagged, ch4_1 review, 2026-07) ────────────────────
 * Reviewing the propagation quiz the user noticed «вірна відповідь частіше
 * всього B». Measured course-wide: the correct answer sat on «b» in 70–88 % of
 * questions in 7 chapters, and «d» was NEVER correct in 15 of 22 chapters. A
 * student who always picks «b» (or never picks «d») beats chance almost
 * everywhere. Fix: reorder options so the correct slot spreads across a/b/c/d
 * (aim ≤40 % on any one letter, all four used) and update `_correct`. The gate
 * fails on BOTH tells: a slot over 40 %, or (for quizzes with ≥8 questions) any
 * slot that is never the correct answer.
 *
 * ── Baseline / ratchet ─────────────────────────────────────────────────────
 * The position tell was course-wide debt (17 chapters, «b» in up to 88 %). It
 * was cleared 2026-07 by reordering options across the whole course, so
 * POSITION_BASELINE is now empty and every chapter meets the strict ≤40 % bar.
 * The ratchet mechanism is kept only in case a genuinely un-reorderable quiz
 * ever appears: an entry maps a chapter → its current modal-slot COUNT (a
 * ceiling it may not exceed). Do NOT add entries to dodge the gate — a new
 * chapter that needs one is a new chapter that isn't balanced. LENGTH and
 * PARITY have no baseline; they must always hold.
 *
 * Exits 0 if clean, 1 if any section has a violation in either locale.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
// Locales dir is overridable for self-tests (fixtures); defaults to the repo's.
const LOCALES_DIR = process.env.QUIZ_LOCALES_DIR
  ? path.resolve(process.env.QUIZ_LOCALES_DIR)
  : path.join(ROOT, 'src/i18n/locales')

const LOCALES = ['en', 'uk']
const MIN_QUESTIONS = 5 // below this a ratio/skew is too noisy to act on

// ── LENGTH ────────────────────────────────────────────────────────────────
const THRESHOLD_LEN = 0.6 // fail above this share of «correct is the unique longest»
// Questions whose LONGEST option is shorter than this are numeric / one-word
// answers («16 kHz», «FM») where length cannot telegraph the answer. Excluded
// from LENGTH only — a position tell is real even for numeric options.
const MIN_SIGNAL_LEN = 20

// ── POSITION ────────────────────────────────────────────────────────────────
const THRESHOLD_POS = 0.4 // fail when one slot holds >40 % of correct answers
const MIN_ALL_FOUR = 8 // at/above this evaluable-question count, every slot (a/b/c/d)
//                        must be correct at least once — a never-correct letter
//                        («d») is its own tell: readers learn to never pick it.
// Grandfathered debt: chapter → its current modal-slot COUNT (ceiling). A listed
// chapter passes as long as it does not exceed this; an unlisted chapter must
// meet THRESHOLD_POS. Empty since the 2026-07 course-wide rebalance — do NOT add
// entries to dodge the gate; balance the quiz instead.
const POSITION_BASELINE = {}

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

/** Parse `_correct` into an integer slot 0..3, or null if malformed/absent. */
function correctSlot(block, n) {
  const raw = block[`quiz_q${n}_correct`]
  const c = Number(raw)
  return Number.isInteger(c) && c >= 0 && c <= 3 ? c : null
}

/** A question is evaluable when all four options are strings and _correct is valid. */
function evaluable(block, n) {
  const opts = ['a', 'b', 'c', 'd'].map((x) => block[`quiz_q${n}_${x}`])
  if (opts.some((o) => typeof o !== 'string')) return null
  const correct = correctSlot(block, n)
  return correct == null ? null : { opts, correct }
}

const data = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, locale, 'ui.json'), 'utf8')),
  ]),
)

/** Chapter blocks in a locale, as [id, block] pairs, quiz-bearing with ≥MIN_QUESTIONS. */
function chapterBlocks(locale) {
  return Object.entries(data[locale]).filter(
    ([ch, block]) =>
      /^ch\d+_\d+$/.test(ch) &&
      typeof block === 'object' &&
      block !== null &&
      questionNumbers(block).length >= MIN_QUESTIONS,
  )
}

const violations = []

// ── Section 1: LENGTH (per locale) ─────────────────────────────────────────
const lenReport = []
for (const locale of LOCALES) {
  for (const [ch, block] of chapterBlocks(locale)) {
    let longest = 0
    let total = 0
    const flaggedQ = []
    for (const n of questionNumbers(block)) {
      const ev = evaluable(block, n)
      if (!ev) continue
      const lens = ev.opts.map(visibleLen)
      if (Math.max(...lens) < MIN_SIGNAL_LEN) continue // numeric / one-word answers
      total += 1
      const maxWrong = Math.max(...lens.filter((_, i) => i !== ev.correct))
      if (lens[ev.correct] > maxWrong) {
        longest += 1
        flaggedQ.push(n)
      }
    }
    if (total < MIN_QUESTIONS) continue
    const pct = longest / total
    lenReport.push({ locale, ch, longest, total, pct })
    if (pct > THRESHOLD_LEN) violations.push({ kind: 'length', locale, ch, longest, total, pct, flaggedQ })
  }
}

// ── Section 2: POSITION (locale-independent; read from en) ───────────────────
const posReport = []
for (const [ch, block] of chapterBlocks('en')) {
  const slots = []
  for (const n of questionNumbers(block)) {
    const ev = evaluable(block, n)
    if (ev) slots.push(ev.correct)
  }
  if (slots.length < MIN_QUESTIONS) continue
  const counts = [0, 0, 0, 0]
  for (const s of slots) counts[s] += 1
  const modal = Math.max(...counts)
  const total = slots.length
  const pct = modal / total
  const ceiling = POSITION_BASELINE[ch] // grandfathered modal-count ceiling, or undefined
  const modalBad = ceiling != null ? modal > ceiling : pct > THRESHOLD_POS
  const starved = total >= MIN_ALL_FOUR && counts.some((c) => c === 0)
  const bad = modalBad || starved
  posReport.push({ ch, counts, modal, total, pct, ceiling, bad, starved })
  if (bad) violations.push({ kind: 'position', ch, counts, modal, total, pct, ceiling, modalBad, starved })
}

// ── Section 3: PARITY — en/uk agree on _correct ─────────────────────────────
const parityBad = []
for (const [ch, enBlock] of chapterBlocks('en')) {
  const ukBlock = data.uk[ch]
  if (!ukBlock || typeof ukBlock !== 'object') continue
  for (const n of questionNumbers(enBlock)) {
    const en = enBlock[`quiz_q${n}_correct`]
    const uk = ukBlock[`quiz_q${n}_correct`]
    if (en == null || uk == null) continue
    if (String(en) !== String(uk)) {
      parityBad.push({ ch, n, en, uk })
      violations.push({ kind: 'parity', ch, n, en, uk })
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
lenReport.sort((a, b) => a.locale.localeCompare(b.locale) || b.pct - a.pct)
let curLocale = null
for (const r of lenReport) {
  if (r.locale !== curLocale) {
    curLocale = r.locale
    process.stdout.write(`\n[length · ${r.locale}]  correct-is-longest / total  (threshold ${Math.round(THRESHOLD_LEN * 100)}%)\n`)
  }
  const mark = r.pct > THRESHOLD_LEN ? '✗' : '·'
  process.stdout.write(
    `  ${mark} ${r.ch.padEnd(9)} ${String(r.longest).padStart(2)}/${String(r.total).padStart(2)}  ${String(Math.round(r.pct * 100)).padStart(3)}%\n`,
  )
}

posReport.sort((a, b) => b.pct - a.pct)
process.stdout.write(`\n[position]  most-common correct-slot / total  (≤${Math.round(THRESHOLD_POS * 100)}% modal; all four slots used when ≥${MIN_ALL_FOUR} questions)\n`)
for (const r of posReport) {
  const mark = r.bad ? '✗' : r.ceiling != null ? '~' : '·'
  const dist = ['a', 'b', 'c', 'd'].map((x, i) => `${x}${r.counts[i]}`).join(' ')
  const tag = r.ceiling != null ? `  (grandfathered ≤${r.ceiling})` : ''
  process.stdout.write(
    `  ${mark} ${r.ch.padEnd(9)} ${String(r.modal).padStart(2)}/${String(r.total).padStart(2)}  ${String(Math.round(r.pct * 100)).padStart(3)}%  ${dist}${tag}\n`,
  )
}

process.stdout.write('\n[parity]  en/uk _correct agreement\n')
process.stdout.write(parityBad.length === 0 ? '  · all questions agree\n' : `  ✗ ${parityBad.length} mismatch(es)\n`)

// ── Verdict ───────────────────────────────────────────────────────────────
if (violations.length === 0) {
  process.stdout.write('\n✓ quiz-balance: no chapter telegraphs its answers by length or position; en/uk agree.\n')
  process.exit(0)
}

const lenV = violations.filter((v) => v.kind === 'length')
const posV = violations.filter((v) => v.kind === 'position')
const parV = violations.filter((v) => v.kind === 'parity')

if (lenV.length) {
  process.stdout.write('\n✗ LENGTH: the correct option is the unique longest too often — readers can score\n')
  process.stdout.write('  by picking the longest answer. Move the justification into _explanation and make\n')
  process.stdout.write('  distractors length-parallel.\n')
  for (const v of lenV)
    process.stdout.write(`  [${v.locale}] ${v.ch}: ${v.longest}/${v.total} (${Math.round(v.pct * 100)}%) — questions ${v.flaggedQ.join(', ')}\n`)
}
if (posV.length) {
  process.stdout.write('\n✗ POSITION: the correct answer clusters on one option letter — readers can score by\n')
  process.stdout.write('  always picking it. Reorder options so the correct slot spreads across a/b/c/d\n')
  process.stdout.write('  (≤40 %, all four used) and update _correct. Do NOT add to POSITION_BASELINE.\n')
  for (const v of posV) {
    const dist = ['a', 'b', 'c', 'd'].map((x, i) => `${x}${v.counts[i]}`).join(' ')
    const reasons = []
    if (v.modalBad)
      reasons.push(
        v.ceiling != null
          ? `modal ${v.modal}/${v.total} regressed past ceiling ${v.ceiling}`
          : `modal ${v.modal}/${v.total} (${Math.round(v.pct * 100)}%) >40%`,
      )
    if (v.starved) reasons.push(`slot ${['a', 'b', 'c', 'd'].filter((_, i) => v.counts[i] === 0).join('/')} never correct`)
    process.stdout.write(`  ${v.ch}: ${reasons.join('; ')} — ${dist}\n`)
  }
}
if (parV.length) {
  process.stdout.write('\n✗ PARITY: en and uk disagree on _correct — one locale grades the wrong answer.\n')
  for (const v of parV) process.stdout.write(`  ${v.ch} q${v.n}: en=${v.en} uk=${v.uk}\n`)
}

process.stdout.write('\n')
process.exit(1)
