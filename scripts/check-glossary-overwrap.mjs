#!/usr/bin/env node
/**
 * check-glossary-overwrap — fail when a chapter's prose wraps the SAME
 * glossary term more than once within a single i18n string, and warn
 * when a chapter as a whole over-wraps a single term.
 *
 * Why: the convention (CLAUDE.md → "Glossary terms" section) is
 * «wrap first occurrence of each technical term — once per chapter
 * section is enough». Sprinkling `<G>` on every occurrence creates
 * orange-soup prose where every other word is a button.
 *
 * The most blatant pattern this gate kills is the alias-rename hack:
 * when an author wants to wrap the same term twice in one i18n string
 * but React/Trans rejects two `<arduino>` siblings (alias keys must
 * be unique per Trans call), they invent `<arduino2>` and bind both
 * to the same glossary key — `arduino: <G k="arduino" />, arduino2:
 * <G k="arduino" />`. The two aliases differ as JSX tags but resolve
 * to the SAME glossary key, leaking past the React uniqueness check
 * while still violating the «wrap once» rule.
 *
 * What it does:
 *   1. Scans each chapter's `Chapter*.tsx` for alias bindings of the
 *      form `<aliasName>: <G k="glossary-key" />`. Builds an
 *      alias→key map per chapter (last binding wins on collision).
 *   2. For each i18n string under that chapter's block, locates every
 *      wrap occurrence: alias tags `<alias>…</alias>` AND direct
 *      `<G k="key">…</G>` literals. Resolves each to its glossary
 *      key.
 *   3. STRICT (fail): if any single i18n string wraps the same
 *      glossary key 2+ times → exit 1.
 *   4. ADVISORY (warn): per-chapter total wraps per key; report any
 *      key with `wrapsTotal >= ADVISORY_THRESHOLD`. Does not exit 1.
 *
 * Gate is NOT in `check:all` yet — first run advisory-only across the
 * codebase, fix flagged cases per chapter, then promote to a hard CI
 * gate.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en/ui.json')
const CHAPTERS_DIR = path.join(ROOT, 'src/chapters')

// A chapter that wraps the same glossary key this many times across
// all its i18n strings is suspicious enough to surface for review.
// Calibrated from the existing codebase's worst offenders (ch1_8
// «decibel» = 8, ch0_2 «AC»/«square wave»/«arduino» = 5 each, etc.):
// 3 catches the egregious cases without drowning every multi-section
// chapter that legitimately re-wraps a term once per section.
const ADVISORY_THRESHOLD = 3

// Key-prefix groups that share ONE logical section: every i18n key in
// a group counts as one section for «wrap once per section» purposes.
// Two wraps of the same glossary key across keys in the same group
// is a strict failure even when neither key alone has duplicates.
//
// `lab*`  — the lab-activity block (goal, equipment, components,
//           procedure steps, expected, troubleshooting). All read as
//           one continuous lab walkthrough; wrapping «Arduino» in
//           equipment AND again in step 2 is sprinkle, not section
//           introduction.
// `quiz_` — quiz items rendered as a flat list. The reader scans
//           them all in one pass; double-wrapping the same term is
//           the same kind of orange-soup as in lab.
const SECTION_PREFIX_GROUPS = ['lab', 'quiz_']

function sectionGroupOf(key) {
  for (const prefix of SECTION_PREFIX_GROUPS) {
    if (key.startsWith(prefix)) return prefix
  }
  return null
}

// Walk every Chapter*.tsx and extract alias→key bindings.
function findChapterTsxFiles() {
  const out = []
  const stack = [CHAPTERS_DIR]
  while (stack.length) {
    const d = stack.pop()
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.isFile() && /^Chapter[\w_]+\.tsx$/.test(e.name)) out.push(p)
    }
  }
  return out
}

const aliasRe = /(\w+)\s*:\s*<G\s+k=["']([^"']+)["']\s*\/>/g

/** Map: chapterId → Map<aliasTagName, glossaryKey>. Last binding wins. */
function buildAliasMaps() {
  const maps = new Map()
  for (const f of findChapterTsxFiles()) {
    const chId = path.basename(f).replace(/^Chapter/, 'ch').replace(/\.tsx$/, '')
    const src = fs.readFileSync(f, 'utf-8')
    const m = new Map()
    aliasRe.lastIndex = 0
    let match
    while ((match = aliasRe.exec(src)) !== null) {
      m.set(match[1], match[2])
    }
    maps.set(chId, m)
  }
  return maps
}

/** Yield every string value, recursively, from a JSON node. */
function* walkStrings(node, keyPath = '') {
  if (typeof node === 'string') {
    yield { path: keyPath, value: node }
  } else if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      yield* walkStrings(node[i], `${keyPath}[${i}]`)
    }
  } else if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      yield* walkStrings(node[k], keyPath ? `${keyPath}.${k}` : k)
    }
  }
}

/**
 * Find every wrap occurrence in a single string. Returns a list of
 * resolved glossary keys. An «occurrence» is either:
 *   - An alias open-tag `<alias>` whose name is in the chapter's alias
 *     map (resolves to that alias's key).
 *   - A literal `<G k="key">` open-tag (resolves to its key directly).
 *
 * Self-closing tags `<alias />` are intentionally NOT counted — those
 * are usually layout helpers, not wraps around a term.
 */
function findWrapKeys(str, aliasMap) {
  const keys = []
  // Direct <G k="..."> wraps
  const gRe = /<G\s+k=["']([^"']+)["']\s*>/g
  let m
  while ((m = gRe.exec(str)) !== null) keys.push(m[1])
  // Alias open-tags that have a body (non-self-closing). Anchor on the
  // matching close-tag to be safe.
  const aliasOpenRe = /<(\w+)\s*(?:[^>/]*)>(?=[^<]*<\/\1\s*>)/g
  while ((m = aliasOpenRe.exec(str)) !== null) {
    const name = m[1]
    if (aliasMap.has(name)) keys.push(aliasMap.get(name))
  }
  return keys
}

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'))
const aliasMaps = buildAliasMaps()

const strictHits = []         // [{chId, keyPath, gKey, count, kind}]
const advisoryHits = []       // [{chId, gKey, total}]

for (const [chId, block] of Object.entries(en)) {
  if (!chId.startsWith('ch')) continue
  if (typeof block !== 'object' || block === null) continue
  const aliasMap = aliasMaps.get(chId) ?? new Map()

  // Per-string strict check + per-section-group strict check
  const chapterTotals = new Map()  // gKey → total wraps in this chapter
  // Map<sectionPrefix, Map<gKey, [{ key, count }]>> for section-group dupes
  const sectionGroups = new Map()
  for (const { path: kp, value } of walkStrings(block)) {
    const keys = findWrapKeys(value, aliasMap)
    if (keys.length === 0) continue
    const perString = new Map()
    for (const k of keys) perString.set(k, (perString.get(k) ?? 0) + 1)
    for (const [gKey, count] of perString) {
      chapterTotals.set(gKey, (chapterTotals.get(gKey) ?? 0) + count)
      if (count >= 2) {
        strictHits.push({ chId, keyPath: kp, gKey, count, kind: 'in-string' })
      }
    }
    // Track wraps per (section-group, gKey) — but only count the i18n
    // KEY once per term, not the per-string count, since a string
    // already flagged as in-string-duplicate doesn't need to also
    // light up the section-group check.
    const topLevelKey = kp.split(/[.[]/)[0]
    const grp = sectionGroupOf(topLevelKey)
    if (grp !== null) {
      if (!sectionGroups.has(grp)) sectionGroups.set(grp, new Map())
      const groupMap = sectionGroups.get(grp)
      for (const gKey of perString.keys()) {
        if (!groupMap.has(gKey)) groupMap.set(gKey, [])
        groupMap.get(gKey).push({ key: topLevelKey })
      }
    }
  }
  // Section-group strict failures: same gKey wrapped in 2+ different
  // i18n keys within the same section-group prefix.
  for (const [grp, groupMap] of sectionGroups) {
    for (const [gKey, occs] of groupMap) {
      const uniqueKeys = [...new Set(occs.map(o => o.key))]
      if (uniqueKeys.length >= 2) {
        strictHits.push({
          chId, keyPath: `${grp}* (${uniqueKeys.join(', ')})`,
          gKey, count: uniqueKeys.length, kind: 'section-group',
        })
      }
    }
  }
  for (const [gKey, total] of chapterTotals) {
    if (total >= ADVISORY_THRESHOLD) {
      advisoryHits.push({ chId, gKey, total })
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────

let exitCode = 0

const inStringHits = strictHits.filter(h => h.kind === 'in-string')
const sectionGroupHits = strictHits.filter(h => h.kind === 'section-group')

if (inStringHits.length > 0) {
  console.log(
    `check:glossary-overwrap FAIL — ${inStringHits.length} i18n string(s) wrap the same glossary key 2+ times:\n`,
  )
  for (const { chId, keyPath, gKey, count } of inStringHits) {
    console.log(`  ${chId}.${keyPath} — «${gKey}» wrapped ${count}× in one string`)
  }
  console.log('')
  console.log('Convention: wrap first occurrence per chapter section only. Two')
  console.log('wraps in one i18n string is almost always a `<arduino2>`-style')
  console.log('alias-rename hack to bypass React/Trans\'s unique-alias-per-call')
  console.log('check. Pick the first occurrence to keep, drop the rest.')
  console.log('')
  exitCode = 1
}

if (sectionGroupHits.length > 0) {
  console.log(
    `check:glossary-overwrap FAIL — ${sectionGroupHits.length} glossary key(s) wrapped in 2+ i18n keys within the same section group:\n`,
  )
  for (const { chId, keyPath, gKey, count } of sectionGroupHits) {
    console.log(`  ${chId}.${keyPath} — «${gKey}» wrapped in ${count} different keys`)
  }
  console.log('')
  console.log('The `lab*` and `quiz_*` key prefixes each render as ONE logical')
  console.log('section in the chapter (lab activity, quiz). Per the «once per')
  console.log('section» rule, a glossary term should be wrapped in only ONE i18n')
  console.log('key inside that group — keep the first narrative mention, drop')
  console.log('the rest down to plain text.')
  console.log('')
  exitCode = 1
}

if (advisoryHits.length > 0) {
  // Sort: most over-wrapped first, then by chapter
  advisoryHits.sort((a, b) => b.total - a.total || a.chId.localeCompare(b.chId))
  console.log(
    `check:glossary-overwrap ADVISORY — ${advisoryHits.length} (chapter, term) pair(s) with ≥${ADVISORY_THRESHOLD} wraps:`,
  )
  console.log('(advisory only — review whether each really needs that many wraps; «once per section» is the rule)\n')
  const byChapter = new Map()
  for (const h of advisoryHits) {
    if (!byChapter.has(h.chId)) byChapter.set(h.chId, [])
    byChapter.get(h.chId).push(h)
  }
  for (const [chId, items] of [...byChapter.entries()].sort()) {
    console.log(`  ${chId}:`)
    for (const { gKey, total } of items.sort((a, b) => b.total - a.total)) {
      console.log(`    ${gKey} — ${total} wraps`)
    }
  }
  console.log('')
}

if (strictHits.length === 0 && advisoryHits.length === 0) {
  console.log('check:glossary-overwrap OK — no in-string duplicates, no chapters over-wrap any single term.')
}

process.exit(exitCode)
