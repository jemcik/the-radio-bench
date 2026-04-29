#!/usr/bin/env node
/**
 * check-bare-subscript-renders.mjs
 * ─────────────────────────────────
 * Catches the pattern that produced the «X_L = X_C with literal underscores
 * in the UI» bugs: an i18n value contains a bare X_Y subscript pattern, AND
 * the place that renders it via `{t('key')}` does NOT route through one of
 * the wrappers that turn `X_Y` into a real <sub>/<tspan>.
 *
 * Why a per-i18n linter cannot do this on its own: i18n strings are stored
 * without rendering context. The same string `"X_L"` is fine when it goes
 * through `<MathText>{t(...)}</MathText>` (KaTeX) or
 * `<text>{withSubscriptsSvg(t(...))}</text>` (SVG <tspan>), but breaks when
 * interpolated raw as `<text>{t(...)}</text>`. The i18n linter therefore
 * has to keep its `bare-subscript` rule at WARN level (or it would over-fire
 * on currently-correct strings). This script closes that gap by looking at
 * the call site.
 *
 * Algorithm
 * ─────────
 * 1. Load every EN i18n value; collect the keys whose value matches the
 *    bare-subscript regex (same pattern the UA linter uses).
 * 2. Walk every `.tsx`/`.ts` under `src/`.
 * 3. For each `{t('key')}` call that points at one of the flagged keys,
 *    classify the surrounding context:
 *      a. Wrapped in a function call to `withSubscripts(...)` /
 *         `withSubscriptsSvg(...)` — SAFE.
 *      b. Inside JSX of `<MathText>...</MathText>` or `<Trans>...</Trans>` —
 *         SAFE (KaTeX / Trans handles the markup).
 *    Otherwise — UNSAFE.
 * 4. UNSAFE call sites print as ERRORs with file:line, key, and value.
 *
 * To make the rule meaningful and the call sites self-documenting, this
 * project deliberately requires EXPLICIT wrappers at every call site.
 * Auto-wrapping inside container components (Widget, etc.) is avoided —
 * the wrapper appears at the t() call so a future reader can see the
 * subscript handling without inspecting deep components.
 *
 * Exit code: 0 on clean, 1 on findings.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')
const EN_PATH = path.join(REPO, 'src/i18n/locales/en/ui.json')
const SRC_DIR = path.join(REPO, 'src')

// Same pattern as the UA linter — single Latin letter at a token boundary,
// underscore, then 1+ word characters. Excludes mid-word matches like `co_2`.
const SUBSCRIPT_RE = /(?<![A-Za-z<>\\{])\b[A-Za-z]_[A-Za-zА-ЯІЇЄа-яіїє0-9]+\b(?![<>}])/

function flatten(obj, prefix = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, p))
    else if (typeof v === 'string') out[p] = v
  }
  return out
}

function walkSrc(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue
      walkSrc(full, acc)
    } else if (st.isFile() && (full.endsWith('.tsx') || full.endsWith('.ts'))) {
      acc.push(full)
    }
  }
  return acc
}

const en = JSON.parse(readFileSync(EN_PATH, 'utf8'))
const flat = flatten(en)
const flaggedKeys = new Set(
  Object.entries(flat)
    .filter(([, v]) => SUBSCRIPT_RE.test(v))
    .map(([k]) => k),
)

if (flaggedKeys.size === 0) {
  console.log('check-bare-subscript-renders OK: no flagged keys.')
  process.exit(0)
}

const files = walkSrc(SRC_DIR)

// Match `t('some.key')` and `t("some.key")`, capture the key.
const T_CALL = /\bt\(\s*['"]([\w.-]+)['"]\s*[),]/g

// Function-call wrappers that route the string through a subscript-aware
// renderer. If the immediate lookback ends with `wrapper(` (optionally
// followed by extra arguments before the t() call), the call is safe.
const SAFE_FN_WRAPPERS = ['withSubscripts', 'withSubscriptsSvg']

// JSX-element wrappers. If there's an unmatched opening tag of one of these
// in the lookback, the t() sits inside it and is handled.
const SAFE_JSX_WRAPPERS = ['MathText', 'Trans']

function isInsideFnWrapper(back) {
  for (const fn of SAFE_FN_WRAPPERS) {
    // `withSubscripts(` immediately before t() — the simplest case.
    if (new RegExp(`\\b${fn}\\s*\\(\\s*$`).test(back)) return true
    // `withSubscriptsSvg(t('key'), '0.6em')` — second-arg form: t() is the
    // first arg of the wrapper. Detect by an unclosed `wrapper(` with no
    // intervening `)` that closes it.
    const m = back.match(new RegExp(`\\b${fn}\\s*\\(`, 'g'))
    if (!m) continue
    // Count unmatched `(` vs `)` after the last wrapper call:
    const lastOpen = back.lastIndexOf(`${fn}(`)
    if (lastOpen === -1) continue
    const tail = back.slice(lastOpen + fn.length + 1)
    const opens = (tail.match(/\(/g) || []).length
    const closes = (tail.match(/\)/g) || []).length
    if (opens >= closes) return true   // wrapper still open at t() position
  }
  return false
}

function isInsideJsxWrapper(back) {
  for (const tag of SAFE_JSX_WRAPPERS) {
    const opens = (back.match(new RegExp(`<${tag}\\b`, 'g')) || []).length
    const closes = (back.match(new RegExp(`</${tag}>`, 'g')) || []).length
    if (opens > closes) return true
  }
  return false
}

const findings = []

for (const file of files) {
  const text = readFileSync(file, 'utf8')

  T_CALL.lastIndex = 0
  let m
  while ((m = T_CALL.exec(text)) !== null) {
    const key = m[1]
    if (!flaggedKeys.has(key)) continue

    const idx = m.index
    // Lookback window: 800 chars covers multi-line JSX blocks comfortably.
    const back = text.slice(Math.max(0, idx - 800), idx)

    if (isInsideFnWrapper(back) || isInsideJsxWrapper(back)) continue

    const line = text.slice(0, idx).split('\n').length
    const rel = path.relative(REPO, file)
    findings.push({ file: rel, line, key, value: flat[key] })
  }
}

if (findings.length === 0) {
  console.log(`check-bare-subscript-renders OK: ${flaggedKeys.size} flagged i18n key(s) all wrapped at every call site.`)
  process.exit(0)
}

console.error('check-bare-subscript-renders FAIL — these i18n values contain bare X_Y subscript patterns AND are interpolated as raw `{t(...)}` without an explicit wrapper:')
console.error('')
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}`)
  console.error(`    key:   ${f.key}`)
  console.error(`    value: ${f.value.length > 90 ? f.value.slice(0, 87) + '…' : f.value}`)
  console.error('')
}
console.error(`${findings.length} unsafe interpolation(s).`)
console.error('')
console.error('Fix options at the call site:')
console.error('  • Wrap the call: `{withSubscripts(t(\'key\'))}` (HTML / prose)')
console.error('                or `{withSubscriptsSvg(t(\'key\'))}` (SVG <text>)')
console.error('  • Or wrap the JSX: `<MathText>{t(\'key\')}</MathText>` (routes through KaTeX)')
console.error('  • Or render via `<Trans i18nKey="key" components={{ var: <MathVar /> }} />`')
console.error('    and rewrite the i18n value with explicit `<var>X_{\\\\mathrm{Y}}</var>` markup.')
console.error('  • Or rephrase the string to drop the subscript entirely.')
process.exit(1)
