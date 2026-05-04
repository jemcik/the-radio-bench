#!/usr/bin/env node
/**
 * check-tag-renders.mjs
 * ─────────────────────
 * Catches the «I see `<strong>` literally on the page» class of bug:
 * an i18n value contains HTML-like tags (e.g. `<strong>`, `<em>`, `<G>`,
 * `<bln>`, `<filt>`), but the call site interpolates it raw as
 * `{t('key')}` — without a `<Trans>` to map the tags to React components.
 * The tags then render as literal text.
 *
 * Why a value-only linter cannot do this on its own
 * ─────────────────────────────────────────────────
 * The same i18n value `"…<strong>X</strong>…"` is fine when rendered via
 *   `<Trans i18nKey="key" components={{ strong: <strong /> }} />`
 * but breaks when rendered via
 *   `<p>{t('key')}</p>`
 * The fix is at the call site, not in the string. So the linter has to
 * cross-reference: «which keys have tags» × «which call sites are safe».
 *
 * Two tiers of safe wrapper
 * ─────────────────────────
 * - `<Trans>` with a `components={{...}}` prop maps every tag to a real
 *   React element. Universal safe wrapper for ANY tag.
 *
 * - SVG-label and KaTeX renderers parse `<var>…</var>` (and `<nowrap>`,
 *   `<sub>`) only — they do NOT process `<strong>`, `<em>`, custom
 *   glossary tags (`<G>`, `<bln>`, `<filt>`, `<cap>`, etc.) or anything
 *   else. Safe ONLY for keys whose tags are exclusively var / nowrap / sub:
 *     JSX:  <MathText>, <TerminalLabel>, <SymbolText>,
 *           <CenteredLabel>, <OrientedLabel>
 *     fn:   renderLabelContent(...), renderSvgInlineMath(...)
 *   (Plus <Trans>, which works at both tiers.)
 *
 * `withSubscripts` / `withSubscriptsSvg` are NOT safe for ANY tag —
 * they operate on bare `X_Y` text patterns and ignore HTML markup. A
 * key with tags wrapped in `withSubscripts(t(...))` leaks tags literally.
 *
 * Algorithm
 * ─────────
 * 1. Load every EN i18n value; extract its set of tag names; classify:
 *    a. No tags → not flagged.
 *    b. Only `<var>`/`<nowrap>`/`<sub>` → MathText OR Trans is safe.
 *    c. Anything else → ONLY Trans is safe.
 * 2. Walk every `.tsx`/`.ts` under `src/`.
 * 3. For each `{t('key')}` call pointing at a flagged key, classify the
 *    surrounding wrapper context against the key's tier. Unsafe → finding.
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

// Tag names that <MathText> parses natively. Everything else needs <Trans>.
const MATHTEXT_HANDLED = new Set(['var', 'nowrap', 'sub'])

// Match opening or self-closing tag: <name ...> or <name />. Also matches
// closing </name>. We collect the bare name to classify.
const TAG_NAME_RE = /<\/?([a-zA-Z][\w-]*)/g

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

function classify(v) {
  const names = new Set()
  for (const m of v.matchAll(TAG_NAME_RE)) names.add(m[1])
  if (names.size === 0) return null
  const onlyMathText = [...names].every(n => MATHTEXT_HANDLED.has(n))
  return { onlyMathText, tags: [...names].sort() }
}

const en = JSON.parse(readFileSync(EN_PATH, 'utf8'))
const flat = flatten(en)
const flaggedKeys = new Map()
for (const [k, v] of Object.entries(flat)) {
  const c = classify(v)
  if (c) flaggedKeys.set(k, c)
}

if (flaggedKeys.size === 0) {
  console.log('check-tag-renders OK: no flagged keys.')
  process.exit(0)
}

const files = walkSrc(SRC_DIR)
const T_CALL = /\bt\(\s*['"]([\w.-]+)['"]\s*[),]/g

// JSX components that handle `<var>` / `<nowrap>` / `<sub>` content only.
// `<Trans>` is the universal wrapper and appears in every tier.
//
// Circuit-symbol primitives in `src/lib/circuit/symbols/*` (Resistor,
// Transformer, Inductor, ...) all route their `label` / `value` / `ratio`
// string props through <SymbolText> / <CenteredLabel> / <OrientedLabel>,
// which in turn call `renderLabelContent` — so a `<var>X_{Y}</var>` value
// reaches an SVG-aware renderer. Future symbols added to that directory
// should preserve this invariant; otherwise add an opt-out at the call
// site.
const VAR_TIER_JSX = [
  'MathText', 'TerminalLabel', 'SymbolText', 'CenteredLabel', 'OrientedLabel', 'Trans',
  // Circuit-symbol primitives that route string props through safe renderers.
  'AcSource', 'Antenna', 'Battery', 'BatteryMulti',
  'Capacitor', 'CapacitorElectrolytic', 'Crystal',
  'Diode', 'DiodeZener', 'Fuse',
  'Ground', 'GroundEarth',
  'Inductor', 'InductorCore',
  'LED', 'Meter', 'NodePoint', 'OpAmp',
  'Resistor', 'SwitchSPDT', 'SwitchSPST',
  'Transformer', 'TransistorNPN', 'TransistorPNP',
]
const ANY_TIER_JSX = ['Trans']

// Function-call wrappers that parse `<var>…</var>` content (SVG labels).
const VAR_TIER_FN = ['renderLabelContent', 'renderSvgInlineMath']

// Walk the lookback, balance React-component tags, return the names of
// still-open enclosing components at the t() call position. Handles the
// case where an outer open tag falls outside the lookback window (close
// without matching open simply pops nothing — it does not corrupt the
// count, unlike a naive open/close counter).
const JSX_TAG_RE = /<(\/?)([A-Z][\w]*)\b[^<>]*?(\/?)>/g

function enclosingJsxTags(back) {
  const stack = []
  let m
  JSX_TAG_RE.lastIndex = 0
  while ((m = JSX_TAG_RE.exec(back)) !== null) {
    const isClose = m[1] === '/'
    const isSelfClose = m[3] === '/'
    const name = m[2]
    if (isClose) {
      const idx = stack.lastIndexOf(name)
      if (idx >= 0) stack.length = idx
    } else if (!isSelfClose) {
      stack.push(name)
    }
  }
  return stack
}

// When t() sits inside a JSX prop expression (`<Foo ratio={t('key')} />`),
// the wrapping component's opening tag has not yet been closed by `>` at
// the point of the t() call — so the balanced-stack walk cannot see it.
// Detect this case by slicing from the last `>` to end-of-back and
// looking for an unmatched `<TagName` in that tail.
function unfinishedOpenTag(back) {
  const lastGt = back.lastIndexOf('>')
  const tail = lastGt === -1 ? back : back.slice(lastGt + 1)
  const m = tail.match(/<([A-Z][\w]*)/)
  return m ? m[1] : null
}

function isInsideJsxWrapper(back, tags) {
  const stack = enclosingJsxTags(back)
  if (stack.some(t => tags.includes(t))) return true
  const open = unfinishedOpenTag(back)
  return open !== null && tags.includes(open)
}

function isInsideFnWrapper(back, fns) {
  for (const fn of fns) {
    if (new RegExp(`\\b${fn}\\s*\\(\\s*$`).test(back)) return true
    const lastOpen = back.lastIndexOf(`${fn}(`)
    if (lastOpen === -1) continue
    const tail = back.slice(lastOpen + fn.length + 1)
    const opens = (tail.match(/\(/g) || []).length
    const closes = (tail.match(/\)/g) || []).length
    if (opens >= closes) return true
  }
  return false
}

function isCallSiteSafe(back, classification) {
  if (classification.onlyMathText) {
    return (
      isInsideJsxWrapper(back, VAR_TIER_JSX) ||
      isInsideFnWrapper(back, VAR_TIER_FN)
    )
  }
  return isInsideJsxWrapper(back, ANY_TIER_JSX)
}

const findings = []

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  T_CALL.lastIndex = 0
  let m
  while ((m = T_CALL.exec(text)) !== null) {
    const key = m[1]
    const classification = flaggedKeys.get(key)
    if (!classification) continue

    const idx = m.index
    const back = text.slice(Math.max(0, idx - 800), idx)
    if (isCallSiteSafe(back, classification)) continue

    const line = text.slice(0, idx).split('\n').length
    findings.push({
      file: path.relative(REPO, file),
      line,
      key,
      value: flat[key],
      tags: classification.tags,
      onlyMathText: classification.onlyMathText,
    })
  }
}

if (findings.length === 0) {
  console.log(`check-tag-renders OK: ${flaggedKeys.size} flagged i18n key(s) all rendered through <Trans> or <MathText>.`)
  process.exit(0)
}

console.error('check-tag-renders FAIL — these i18n values contain HTML/JSX tags AND are interpolated as raw `{t(...)}` without a wrapper that processes those tags:')
console.error('')
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}`)
  console.error(`    key:   ${f.key}`)
  console.error(`    tags:  <${f.tags.join('>, <')}>`)
  console.error(`    value: ${f.value.length > 90 ? f.value.slice(0, 87) + '…' : f.value}`)
  console.error('')
}
console.error(`${findings.length} unsafe interpolation(s).`)
console.error('')
console.error('Fix:')
console.error('  • Replace `<p>{t(\'key\')}</p>` with')
console.error('       `<p><Trans i18nKey="key" ns="ui" components={{ strong: <strong />, ... }} /></p>`')
console.error('    mapping every tag in the value to a React component.')
console.error('  • If the only tags are <var>/<nowrap>, `<MathText>{t(\'key\')}</MathText>` also works.')
console.error('  • Or rewrite the i18n value to drop the tags.')
process.exit(1)
