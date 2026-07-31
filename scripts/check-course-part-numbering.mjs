#!/usr/bin/env node
/**
 * check-course-part-numbering — the course's five divisions are numbered
 * 0, I, II, III, IV. Prose that calls one of them «Part 3» names something the
 * reader cannot find: the sidebar, the landing page and every chapter header
 * render `['0', 'I', 'II', 'III', 'IV'][part.number]` (see `Welcome.tsx`), so
 * Part 3 is labelled «III» on every surface the reader has ever seen.
 *
 * Reader-flagged 2026-07-29 on `ch0_3.intro` («for Parts 0 and 1»). The same
 * shape was in eight more keys — ch0_1, ch0_2, ch1_11, ch2_1, ch2_2 — so it was
 * never a typo, it was a habit.
 *
 * Scope: the `en` locale. The Ukrainian half of this rule — which also covers
 * the capitalisation, «частина» being a common noun — lives in the UA linter as
 * `forbidden.course-part-capital-or-arabic`, next to the rest of the UA style
 * rules so it can be run mid-edit on a single block. `check:all` runs both.
 *
 * Part 0 has no Roman form and correctly stays «0».
 *
 * Exits 0 if clean, 1 if any Arabic-numbered part reference is found.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN = path.join(ROOT, 'src/i18n/locales/en/ui.json')

// «Part 1», «Parts 0 and 1», «Part 2's» — an Arabic numeral 1-9 naming a
// division. `Part 0` is legitimate and deliberately not matched.
// A following unit («Part 3 V» would be nonsense in English, but a stray
// «part 3 dB» is not) is excluded by requiring the capitalised noun.
const RE = /\bParts?\b[^.;:!?]{0,12}?\b[1-9]\d*\b/g

const json = JSON.parse(fs.readFileSync(EN, 'utf-8'))
const hits = []

function walk(node, segs) {
  if (typeof node === 'string') {
    for (const m of node.matchAll(RE)) {
      hits.push({ key: segs.join('.'), text: m[0] })
    }
    return
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walk(v, [...segs, k])
  }
}
walk(json, [])

if (hits.length === 0) {
  console.log('check-course-part-numbering OK: every part reference uses 0 / I / II / III / IV.')
  process.exit(0)
}

console.error(
  'check-course-part-numbering FAIL — these strings number a course division with an ' +
    'Arabic numeral, but every surface the reader sees labels them 0, I, II, III, IV:\n',
)
for (const h of hits) console.error(`  [en] ${h.key}  «${h.text}»`)
console.error(
  '\nFix: write the Roman numeral — «Part I», «Part III», «Parts 0 and I».' +
    '\nPart 0 is the one that stays Arabic.' +
    '\nThe Ukrainian half of this rule (including the lowercase «частина») is' +
    '\n`forbidden.course-part-capital-or-arabic` in the ua-translate linter.',
)
process.exit(1)
