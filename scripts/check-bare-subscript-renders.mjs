#!/usr/bin/env node
/**
 * check-bare-subscript-renders.mjs
 * ─────────────────────────────────
 * Catches the pattern that produced the «X_L = X_C with literal underscores
 * in the UI» bugs: an i18n value contains a bare subscript pattern, AND
 * the place that renders it via `{t('key')}` does NOT route through one of
 * the wrappers that turn the pattern into a real <sub>/<tspan>.
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
 * Two flavours of the same class
 * ──────────────────────────────
 * 1. **Bare** form: `X_Y` (e.g. `f_0`, `R_loss`, `N_p`).
 *    Safe wrappers: `withSubscripts(...)`, `withSubscriptsSvg(...)`, `<MathText>`.
 *
 * 2. **Braced** form: `X_{Y}` (LaTeX-style — looks like the canonical
 *    `<var>X_{Y}</var>` form, but appears OUTSIDE any `<var>` tag).
 *    Safe wrapper: `<MathText>` ONLY. `withSubscripts` ignores braces and
 *    would render the literal `{` and `}` in the UI — this is the exact
 *    failure mode that hit ch1.9 widget labels (rendered «N_{p}» on screen).
 *
 * Algorithm
 * ─────────
 * 1. Load every EN i18n value; for each value, classify whether it contains
 *    a bare subscript, a braced subscript (outside <var>), or both.
 *    A `<var>X_{Y}</var>` block is exempt — the `<` / `>` lookbehinds prevent
 *    its content from matching either pattern.
 * 2. Walk every `.tsx`/`.ts` under `src/`.
 * 3. For each `{t('key')}` call that points at one of the flagged keys,
 *    check whether the surrounding context is a safe wrapper FOR THAT KEY'S
 *    FORMS:
 *      a. Bare-only key:   any of withSubscripts / withSubscriptsSvg / <MathText>.
 *      b. Braced (or mixed) key: <MathText> only.
 * 4. UNSAFE call sites print as ERRORs with file:line, key, value, and
 *    a form-specific fix hint.
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

// Bare `X_Y`. Single Latin letter at a token boundary, underscore, then 1+
// word characters. Lookbehind/-ahead exclude `<`, `>`, `{`, `}` so that
// `<var>X_Y</var>` (rare) and `<var>X_{Y}</var>` (common) are not flagged.
const BARE_SUB_RE   = /(?<![A-Za-z<>\\{])\b[A-Za-z]_[A-Za-zА-ЯІЇЄа-яіїє0-9]+\b(?![<>}])/

// Braced `X_{Y}` (LaTeX-style). Same letter-at-boundary rule, but the
// subscript body sits inside `{…}`. The lookbehind excludes `<` and `>` so
// that `<var>X_{Y}</var>` is exempt (the `X` is preceded by `>`).
const BRACED_SUB_RE = /(?<![A-Za-z<>])\b[A-Za-z]_\{[A-Za-z0-9]+\}/

function classify(v) {
  const bare = BARE_SUB_RE.test(v)
  const braced = BRACED_SUB_RE.test(v)
  if (!bare && !braced) return null
  return { bare, braced }
}

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
const flaggedKeys = new Map()  // key → { bare, braced }
for (const [k, v] of Object.entries(flat)) {
  const c = classify(v)
  if (c) flaggedKeys.set(k, c)
}

if (flaggedKeys.size === 0) {
  console.log('check-bare-subscript-renders OK: no flagged keys.')
  process.exit(0)
}

const files = walkSrc(SRC_DIR)

// Match `t('some.key')` and `t("some.key")`, capture the key.
const T_CALL = /\bt\(\s*['"]([\w.-]+)['"]\s*[),]/g

// Function-call wrappers that handle the BARE `X_Y` form.
//
// IMPORTANT: these do NOT handle the BRACED `X_{Y}` form — their regex only
// matches `[A-Za-z0-9]+` after the underscore (no braces). A braced flagged
// key wrapped in withSubscripts() would render literal `{` / `}` in the UI.
const SAFE_FN_WRAPPERS_BARE = ['withSubscripts', 'withSubscriptsSvg']

// JSX-element wrappers that handle BOTH forms (KaTeX understands LaTeX
// syntax natively, so `X_{Y}` and `X_Y` both render).
//
// `<Trans>` is deliberately NOT here. Trans only maps HTML-like tags via its
// `components={}` prop — bare subscripts inside a Trans block render as the
// literal underscore. Caught on ch1.8 §2 where `пік на f_0` shipped with a
// literal underscore. Use <MathText> if you need bare-subscript rendering,
// or wrap as `<var>X_{Y}</var>` in the i18n value (which exempts the value
// from the flag entirely because the lookbehind excludes `>`).
const SAFE_JSX_WRAPPERS_ANY = ['MathText']

function isInsideFnWrapper(back, wrappers) {
  for (const fn of wrappers) {
    // `withSubscripts(` immediately before t() — the simplest case.
    if (new RegExp(`\\b${fn}\\s*\\(\\s*$`).test(back)) return true
    // `withSubscriptsSvg(t('key'), '0.6em')` — second-arg form: t() is the
    // first arg of the wrapper. Detect by an unclosed `wrapper(` with no
    // intervening `)` that closes it.
    const m = back.match(new RegExp(`\\b${fn}\\s*\\(`, 'g'))
    if (!m) continue
    const lastOpen = back.lastIndexOf(`${fn}(`)
    if (lastOpen === -1) continue
    const tail = back.slice(lastOpen + fn.length + 1)
    const opens = (tail.match(/\(/g) || []).length
    const closes = (tail.match(/\)/g) || []).length
    if (opens >= closes) return true   // wrapper still open at t() position
  }
  return false
}

function isInsideJsxWrapper(back, tags) {
  for (const tag of tags) {
    const opens = (back.match(new RegExp(`<${tag}\\b`, 'g')) || []).length
    const closes = (back.match(new RegExp(`</${tag}>`, 'g')) || []).length
    if (opens > closes) return true
  }
  return false
}

function isCallSiteSafe(back, classification) {
  // Braced (or mixed) form: only <MathText> handles `X_{Y}` correctly.
  if (classification.braced) {
    return isInsideJsxWrapper(back, SAFE_JSX_WRAPPERS_ANY)
  }
  // Bare-only: function wrappers OR MathText all work.
  return (
    isInsideFnWrapper(back, SAFE_FN_WRAPPERS_BARE) ||
    isInsideJsxWrapper(back, SAFE_JSX_WRAPPERS_ANY)
  )
}

const findings = []

// Pass A — direct `t('literal-key')` call sites.
for (const file of files) {
  const text = readFileSync(file, 'utf8')

  T_CALL.lastIndex = 0
  let m
  while ((m = T_CALL.exec(text)) !== null) {
    const key = m[1]
    const classification = flaggedKeys.get(key)
    if (!classification) continue

    const idx = m.index
    // Lookback window: 800 chars covers multi-line JSX blocks comfortably.
    const back = text.slice(Math.max(0, idx - 800), idx)

    if (isCallSiteSafe(back, classification)) continue

    const line = text.slice(0, idx).split('\n').length
    const rel = path.relative(REPO, file)
    findings.push({ file: rel, line, key, value: flat[key], classification, kind: 'direct' })
  }
}

// Pass B — prop indirection: a flagged key is passed as a string-literal prop
// (e.g. `<InputRow labelKey="ch1_9.foo.npLabel" />`), and the receiving
// component's body has `t(propName)` wrapped in something. The wrapper might
// be safe for bare but unsafe for braced — that's the ch1.9 footgun.
//
// Strategy:
//   1. Build an index of indirect call sites: `t(<identifier>)` with their
//      wrapper context, keyed by the identifier name.
//   2. For each prop-style usage of a flagged key, look up indirect calls
//      that consume the matching prop name (cross-file is fine), and check
//      each consumer's wrapper against the form.
//
// We only run Pass B for keys whose value contains the BRACED form. Bare-only
// keys are already handled correctly by withSubscripts even when passed via
// prop indirection — flagging them here would be noise.

const T_INDIRECT = /\bt\(\s*([a-zA-Z_$][\w$]*)\s*[),]/g

const indirectCallsByProp = new Map() // propName → [{file, line, bareSafe, anySafe}]

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  T_INDIRECT.lastIndex = 0
  let m
  while ((m = T_INDIRECT.exec(text)) !== null) {
    const propName = m[1]
    // Skip false positives from `t(...)`-shaped calls that are in fact other
    // functions: we only care when the identifier looks like a prop name (any
    // identifier) AND the call signature matches `t(...)` exactly.
    const idx = m.index
    const back = text.slice(Math.max(0, idx - 800), idx)
    const bareSafe =
      isInsideFnWrapper(back, SAFE_FN_WRAPPERS_BARE) ||
      isInsideJsxWrapper(back, SAFE_JSX_WRAPPERS_ANY)
    const anySafe = isInsideJsxWrapper(back, SAFE_JSX_WRAPPERS_ANY)
    const list = indirectCallsByProp.get(propName) ?? []
    list.push({
      file: path.relative(REPO, file),
      line: text.slice(0, idx).split('\n').length,
      bareSafe,
      anySafe,
    })
    indirectCallsByProp.set(propName, list)
  }
}

// Match `someProp="flagged.key"` or `someProp='flagged.key'`. Excludes the
// already-covered `t('flagged.key')` shape (which has an open-paren before
// the quote, not an `=`).
const PROP_USE = /(?<![A-Za-z0-9_$])([a-zA-Z_$][\w$]*)\s*=\s*['"]([\w.-]+)['"]/g

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  PROP_USE.lastIndex = 0
  let m
  while ((m = PROP_USE.exec(text)) !== null) {
    const propName = m[1]
    const key = m[2]
    const classification = flaggedKeys.get(key)
    if (!classification) continue
    // Bare-only keys are handled fine by any wrapper that the consumer might
    // use — skip to avoid false positives.
    if (!classification.braced) continue

    const consumers = indirectCallsByProp.get(propName) ?? []
    if (consumers.length === 0) continue // no `t(propName)` site found

    const unsafe = consumers.filter(c => !c.anySafe)
    if (unsafe.length === 0) continue

    const idx = m.index
    const line = text.slice(0, idx).split('\n').length
    const rel = path.relative(REPO, file)
    findings.push({
      file: rel,
      line,
      key,
      value: flat[key],
      classification,
      kind: 'prop-indirection',
      propName,
      consumerSites: unsafe.map(c => `${c.file}:${c.line}`),
    })
  }
}

if (findings.length === 0) {
  console.log(`check-bare-subscript-renders OK: ${flaggedKeys.size} flagged i18n key(s) all wrapped at every call site.`)
  process.exit(0)
}

console.error('check-bare-subscript-renders FAIL — these i18n values contain bare subscript patterns AND are interpolated as raw `{t(...)}` without an explicit wrapper that handles the form:')
console.error('')
for (const f of findings) {
  const form = f.classification.braced
    ? (f.classification.bare ? 'mixed (bare + braced)' : 'braced X_{Y}')
    : 'bare X_Y'
  console.error(`  ${f.file}:${f.line}`)
  console.error(`    key:   ${f.key}`)
  console.error(`    form:  ${form}`)
  console.error(`    value: ${f.value.length > 90 ? f.value.slice(0, 87) + '…' : f.value}`)
  if (f.kind === 'prop-indirection') {
    console.error(`    via:   prop "${f.propName}" → consumed at ${f.consumerSites.join(', ')}`)
    console.error(`           (consumer wraps with withSubscripts, which ignores braces)`)
  }
  console.error('')
}
console.error(`${findings.length} unsafe interpolation(s).`)
console.error('')
console.error('Fix options:')
console.error('  Bare X_Y form:')
console.error('    • Wrap the call: `{withSubscripts(t(\'key\'))}` (HTML / prose)')
console.error('                  or `{withSubscriptsSvg(t(\'key\'))}` (SVG <text>)')
console.error('    • Or wrap the JSX: `<MathText>{t(\'key\')}</MathText>` (routes through KaTeX)')
console.error('')
console.error('  Braced X_{Y} form:')
console.error('    • `withSubscripts` does NOT handle braces — would render literal `{` / `}`.')
console.error('    • Either rewrite the i18n value to bare form (`X_Y`) and use withSubscripts,')
console.error('    • Or wrap the JSX: `<MathText>{t(\'key\')}</MathText>` (KaTeX understands `X_{Y}`),')
console.error('    • Or rewrite the value with explicit `<var>X_{Y}</var>` markup and render via')
console.error('      `<Trans i18nKey="key" components={{ var: <MathVar /> }} />`.')
process.exit(1)
