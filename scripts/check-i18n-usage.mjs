#!/usr/bin/env node
/**
 * check-i18n-usage.mjs
 *
 * Complements scripts/check-i18n.mjs (which only verifies EN↔UK parity).
 * This script flags keys defined in en/ui.json that are never referenced
 * anywhere in src/ — the "orphan i18n key" bug class.
 *
 * Catches things like the Ch0.4 "The mental table to internalise:" case,
 * where the intro paragraph was rendered but the table it promised was
 * never implemented — leaving the `dbmTableHeaderDbm` / `dbmTableHeaderPower`
 * keys defined but unused, and a broken promise in the prose.
 *
 * Dynamic-lookup prefixes (e.g. `t(`units.${unit}`)`, or quiz questions
 * built from numbered keys) are excluded by matching against
 * DYNAMIC_PREFIXES below. If you add a new dynamic-lookup pattern,
 * register its prefix here so the check stays useful.
 *
 * Exit codes:
 *   0 — all keys referenced (or on the dynamic-prefix allowlist)
 *   1 — one or more orphan keys found (names printed to stderr)
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const uiJsonPath = path.join(root, 'src/i18n/locales/en/ui.json')
const srcDir = path.join(root, 'src')

/** Manually-maintained allowlist for i18n-key access paths the static
 *  analysis below can't detect — things like glossary nested keys
 *  (`glossary.${key}.tip`) where the interesting substring isn't at
 *  the front, or pluralisation suffixes (`_one` / `_other`) that
 *  i18next appends for `{count}` interpolations. */
const MANUAL_DYNAMIC_PREFIXES = [
  'units.',                          // `t(`units.${unit}`)`
  'glossary.',                       // Term.tsx builds `glossary.${k}.tip` etc.
  'ch0_1.quiz_', 'ch0_2.quiz_', 'ch0_3.quiz_', 'ch0_4.quiz_',
  'ch0_1.quizBank', 'ch0_2.quizBank', 'ch0_3.quizBank', 'ch0_4.quizBank',
  'ch0_3.prefixConverterPlaces',     // i18next plural suffixes _one/_other
  'ch0_1.heroAriaLabel', 'ch0_2.heroAriaLabel',
  'ch0_3.heroAriaLabel', 'ch0_4.heroAriaLabel',  // `t(`ch${id}.heroAriaLabel`)`
]

/** Extract dynamic-lookup prefixes from template literals in source.
 *  A call like `t(`ch0_3.prefixName_${prefix.name}`)` contributes the
 *  static prefix `ch0_3.prefixName_`. Any key starting with that is
 *  treated as potentially referenced. */
function extractTemplatePrefixes(source) {
  const prefixes = new Set()
  // t(`literal.${...}`) — captures the literal portion before the first ${
  const re = /t\(\s*`([^`$]+)\$\{/g
  let m
  while ((m = re.exec(source)) !== null) {
    prefixes.add(m[1])
  }
  return prefixes
}

function flatten(obj, prefix = '') {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flatten(v, key))
    } else {
      out.push(key)
    }
  }
  return out
}

function collectSource() {
  const chunks = []
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      // Skip generated / test output, node_modules style (defence in depth)
      if (name === 'node_modules' || name.startsWith('.')) continue
      const full = path.join(dir, name)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) walk(full)
      else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name)) {
        chunks.push(fs.readFileSync(full, 'utf8'))
      }
    }
  }
  walk(srcDir)
  return chunks.join('\n')
}

const keys = flatten(JSON.parse(fs.readFileSync(uiJsonPath, 'utf8')))
const source = collectSource()
const autoPrefixes = extractTemplatePrefixes(source)
const allDynamicPrefixes = [...MANUAL_DYNAMIC_PREFIXES, ...autoPrefixes]

const orphans = keys.filter(key => {
  if (allDynamicPrefixes.some(p => key.startsWith(p))) return false
  return !source.includes(key)
})

if (orphans.length === 0) {
  console.log(`i18n usage OK: all ${keys.length} keys referenced in src/.`)
  process.exit(0)
}

console.error(`i18n orphan keys (${orphans.length}) — declared in en/ui.json but never referenced in src/:`)
for (const k of orphans) console.error(`  ${k}`)
console.error('')
console.error('Either wire them into the UI, delete them from both locale files, or — if they')
console.error('are accessed via template literals — add the prefix to DYNAMIC_PREFIXES in this script.')
process.exit(1)
