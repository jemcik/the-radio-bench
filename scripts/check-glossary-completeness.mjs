#!/usr/bin/env node
/**
 * check-glossary-completeness — fail when a `glossary.ts` entry is
 * missing any of its four locale-bound artifacts:
 *
 *   1. EN display label  →  en/ui.json `glossary._names.<key>`
 *   2. UA display label  →  uk/ui.json `glossary._names.<key>`
 *   3. UA tip            →  uk/ui.json `glossary.<key>.tip`
 *   4. UA detail         →  uk/ui.json `glossary.<key>.detail`
 *
 * Why this exists: when a new entry lands in glossary.ts (the EN base
 * data), the renderer falls back silently to the EN base if the UA
 * tip/detail/name is missing — and to the raw English key string if the
 * `_names` label is missing. So the chapter prose can be UA-translated
 * yet the popovers and «See also» chains still ship as English. The
 * existing `check:i18n` parity gate validates UA covers every EN ui key,
 * but the glossary subtree never compares against `glossary.ts`. The
 * ch1.10 review caught three separate instances of this in 30 minutes
 * (anode/cathode/forward voltage drop UA tips missing, then their
 * `_names` labels missing). This gate locks the contract in.
 *
 * Render path verified at `src/features/glossary/term.tsx:343-349`:
 *   `t('glossary._names.${key}', { defaultValue: key })`        ← (1)+(2)
 *   `t('glossary.${key}.tip',    { defaultValue: '' }) || tip`  ← (3)
 *   `t('glossary.${key}.detail', { defaultValue: '' }) || det`  ← (4)
 *
 * Exit 0 on clean, 1 on findings.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const GLOSSARY_TS = path.join(ROOT, 'src/features/glossary/glossary.ts')
const EN_JSON     = path.join(ROOT, 'src/i18n/locales/en/ui.json')
const UK_JSON     = path.join(ROOT, 'src/i18n/locales/uk/ui.json')

// ── Extract top-level keys from glossary.ts ──────────────────────────
//
// Each entry sits at depth 1 inside `export const glossary = { ... }`.
// Match lines that look like `  <ident>: {` or `  '<multi word>': {`.
const src = fs.readFileSync(GLOSSARY_TS, 'utf-8')
const KEY_RE = /^ {2}(\w[\w-]*|'[^']+'):\s*\{\s*$/gm
const keys = []
for (const m of src.matchAll(KEY_RE)) {
  keys.push(m[1].replace(/^'|'$/g, ''))
}

if (keys.length === 0) {
  console.error('check-glossary-completeness: extracted ZERO keys from glossary.ts.')
  console.error('The regex must be out of sync with the file format. Inspect glossary.ts manually.')
  process.exit(2)
}

// ── Load both locales' glossary blocks ───────────────────────────────
const en = JSON.parse(fs.readFileSync(EN_JSON, 'utf-8'))
const uk = JSON.parse(fs.readFileSync(UK_JSON, 'utf-8'))

const enNames = en?.glossary?._names ?? {}
const ukNames = uk?.glossary?._names ?? {}
const ukBlock = uk?.glossary ?? {}

// ── Audit every key ──────────────────────────────────────────────────
const issues = []
for (const key of keys) {
  if (!Object.prototype.hasOwnProperty.call(enNames, key)) {
    issues.push({ key, kind: 'EN _names label', where: `en/ui.json glossary._names[${JSON.stringify(key)}]` })
  }
  if (!Object.prototype.hasOwnProperty.call(ukNames, key)) {
    issues.push({ key, kind: 'UA _names label', where: `uk/ui.json glossary._names[${JSON.stringify(key)}]` })
  }
  const ukEntry = ukBlock[key]
  const hasTip = ukEntry && typeof ukEntry === 'object' && typeof ukEntry.tip === 'string' && ukEntry.tip.trim().length > 0
  const hasDetail = ukEntry && typeof ukEntry === 'object' && typeof ukEntry.detail === 'string' && ukEntry.detail.trim().length > 0
  if (!hasTip) {
    issues.push({ key, kind: 'UA tip', where: `uk/ui.json glossary[${JSON.stringify(key)}].tip` })
  }
  if (!hasDetail) {
    issues.push({ key, kind: 'UA detail', where: `uk/ui.json glossary[${JSON.stringify(key)}].detail` })
  }
}

// ── Report ───────────────────────────────────────────────────────────
if (issues.length === 0) {
  console.log(`check-glossary-completeness OK: ${keys.length} glossary.ts keys all have EN+UA _names labels and UA tip+detail in uk/ui.json.`)
  process.exit(0)
}

console.error(
  `check-glossary-completeness FAIL — ${issues.length} missing locale artifact(s) ` +
  `across ${new Set(issues.map(i => i.key)).size} glossary.ts key(s):\n`,
)

const byKey = new Map()
for (const issue of issues) {
  if (!byKey.has(issue.key)) byKey.set(issue.key, [])
  byKey.get(issue.key).push(issue)
}
for (const [key, ks] of byKey) {
  console.error(`  ${key}:`)
  for (const i of ks) {
    console.error(`    – missing ${i.kind} (${i.where})`)
  }
}

console.error(
  '\nFix: when adding a new entry to src/features/glossary/glossary.ts, also add\n' +
  '  – glossary._names.<key> in BOTH en/ui.json and uk/ui.json\n' +
  '  – glossary.<key>.tip and .detail (and .formula if relevant) in uk/ui.json\n' +
  'The ua-translate skill\'s «glossary subtree» mode handles UA tip/detail in one\n' +
  'invocation: `python3 .claude/skills/ua-translate/scripts/gemini-translate.py glossary <key1> <key2> ...`',
)
process.exit(1)
