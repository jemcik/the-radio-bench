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

/** Extract dynamic-lookup patterns from EVERY template literal in source
 *  that contains an interpolation. A key is treated as referenced if it
 *  starts with the literal PREFIX (text before the first `${`) AND ends
 *  with the literal SUFFIX (text after the last `}`).
 *
 *  Why scan all backtick templates, not just `t(`…`)`: i18n keys reach
 *  the runtime through several shapes —
 *    • `t(`ch1_8.widget.cutoff.mode${m}`)`            (direct)
 *    • `i18nKey={`ch1_11.widget.bjtOp.regionDescription.${r}`}` (<Trans>)
 *    • `const titleKey = `ch1_8.filterTypeGallery${s}`; t(titleKey)` (var)
 *  Capturing every interpolated template covers all three without having
 *  to special-case the call site.
 *
 *  Why the SUFFIX half matters: `t(`ch${id}.heroAriaLabel`)` yields prefix
 *  `ch` — on its own that matches EVERY chapter key and silently neuters
 *  orphan detection for the whole `ch*` namespace (this is exactly how a
 *  batch of dead diagram/hero/widget keys accumulated unnoticed; May 2026).
 *  Pairing it with suffix `.heroAriaLabel` keeps the match precise.
 *
 *  Empty-prefix-AND-empty-suffix patterns (`t(`${prefix}.${key}`)`) carry
 *  zero constraint — they would match everything — so they are dropped;
 *  such fully-dynamic keys are covered by extractQuizPrefixes() or a
 *  MANUAL_DYNAMIC_PREFIXES entry instead. Over-matching only ever risks a
 *  missed orphan, never a false failure on a live key. */
function extractTemplatePatterns(source) {
  const patterns = []
  // Only template literals in an i18n-key CONTEXT — `t(`…`)`, `i18nKey={`…`}`,
  // or a `…Key = `…`` assignment later fed to t()/i18nKey. Scanning ALL
  // backtick templates would pick up non-i18n ones like `key={`ch${i}`}`
  // (OscilloscopeDiagram channel ids) whose bare `ch` prefix re-neuters the
  // whole chapter namespace — the very bug this gate exists to prevent.
  const re = /(?:t\(\s*|i18nKey=\{?\s*|[A-Za-z_]\w*Key\s*=\s*)`([^`]*\$\{[^`]*)`/g
  let m
  while ((m = re.exec(source)) !== null) {
    const tpl = m[1]
    const open = tpl.indexOf('${')
    const close = tpl.lastIndexOf('}')
    const prefix = tpl.slice(0, open)
    const suffix = close === -1 ? '' : tpl.slice(close + 1)
    if (prefix === '' && suffix === '') continue
    patterns.push({ prefix, suffix })
  }
  return patterns
}

/** Quiz strings are reached through `buildQuizFromI18n(t, 'chX', …)`, which
 *  builds keys like `chX.quiz_q3_b` via a fully-dynamic `t(`${prefix}.${key}`)`
 *  the static analysis can't resolve. Extract each call's literal chapter
 *  prefix and allowlist its `chX.quiz_` namespace. Self-maintaining: a new
 *  chapter's quiz keys are covered the moment its component calls the helper
 *  with a literal prefix. */
function extractQuizPrefixes(source) {
  const out = []
  const re = /buildQuizFromI18n\(\s*\w+\s*,\s*'([^']+)'/g
  let m
  while ((m = re.exec(source)) !== null) out.push(`${m[1]}.quiz_`)
  return out
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
// Manual + quiz allowlists are prefix-only (empty suffix); template
// patterns carry both a prefix and a suffix.
const allPatterns = [
  ...MANUAL_DYNAMIC_PREFIXES.map(prefix => ({ prefix, suffix: '' })),
  ...extractQuizPrefixes(source).map(prefix => ({ prefix, suffix: '' })),
  ...extractTemplatePatterns(source),
]

/* i18next plural forms. `t('welcome.chapters', { count })` resolves to
 * `welcome.chapters_one` / `_few` / `_many` / `_other` via Intl.PluralRules,
 * so the suffixed keys never appear in src/ literally. Treat a plural form
 * as referenced when its BASE key is referenced — that keeps orphan
 * detection alive for the base (delete the t() call and all forms flag). */
const PLURAL_SUFFIXES = ['_zero', '_one', '_two', '_few', '_many', '_other']
const pluralBase = key => {
  const s = PLURAL_SUFFIXES.find(sfx => key.endsWith(sfx))
  return s ? key.slice(0, -s.length) : null
}

const orphans = keys.filter(key => {
  if (allPatterns.some(({ prefix, suffix }) => key.startsWith(prefix) && key.endsWith(suffix))) return false
  if (source.includes(key)) return false
  const base = pluralBase(key)
  return !(base && source.includes(base))
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
