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
 * 1. Load every i18n value from BOTH locales (a tag present only in the
 *    Ukrainian value still has to reach a renderer); union the tag names
 *    per key; classify:
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
const LOCALE_PATHS = [
  path.join(REPO, 'src/i18n/locales/en/ui.json'),
  path.join(REPO, 'src/i18n/locales/uk/ui.json'),
]
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

// BOTH locales, not just EN. A tag that exists only in the Ukrainian value
// still has to reach a renderer, and reading EN alone made every such key
// invisible: `ch1_2.efficiencyExample` shipped «<transceiver>трансивер
// </transceiver>» as literal text on screen, through a green gate, because the
// English value carried no tag. Repo-wide there were 36 UA-only tagged keys.
const flaggedKeys = new Map()
const sampleValue = {}
for (const localePath of LOCALE_PATHS) {
  const json = JSON.parse(readFileSync(localePath, 'utf8'))
  for (const [k, v] of Object.entries(flatten(json))) {
    const c = classify(v)
    if (!c) continue
    if (sampleValue[k] === undefined) sampleValue[k] = v
    const prev = flaggedKeys.get(k)
    // Union the tag sets across locales, so a key tagged in one locale and not
    // the other is still classified by everything it can contain.
    if (prev) {
      const tags = [...new Set([...prev.tags, ...c.tags])].sort()
      flaggedKeys.set(k, { onlyMathText: prev.onlyMathText && c.onlyMathText, tags })
    } else {
      flaggedKeys.set(k, c)
    }
  }
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
      value: sampleValue[key],
      tags: classification.tags,
      onlyMathText: classification.onlyMathText,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────
// Second pass — dynamic-key-through-t() detection.
//
// The T_CALL pass above only sees `t('literal-key')`. It misses the
// pattern of assigning a markup-bearing key to a variable and then
// rendering through `t(variable)`:
//
//   let warnKey: string
//   if (sat)        warnKey = 'ch1_11.widget.ceGain.warnSaturated'
//   else if (cut)   warnKey = 'ch1_11.widget.ceGain.warnCutoff'
//   else            warnKey = 'ch1_11.widget.ceGain.warnGood'
//   …
//   <p>{t(warnKey)}</p>          ← invisible to T_CALL
//
// All three warn* values contain `<strong>` / `<var>` markup, so the
// tags ship as literal text. Reader-flagged in ch 1.11 after the gate
// passed clean on this exact pattern.
//
// Detection strategy: find every `t(identifier)` (not `t('string')`)
// call site. Apply the same `isCallSiteSafe(back, classification)`
// check that the T_CALL pass uses. If unsafe, scan the file for
// literal-string assignments to that identifier (possibly the last
// segment of a dotted access like `computed.warnKey`) and flag every
// markup-bearing key the variable could hold. If the call site is in
// a safe wrapper (Trans, MathText, etc.) we skip — the wrapper
// handles the markup regardless of which key the variable holds.
const T_DYNAMIC_RE = /\bt\(\s*([a-zA-Z_$][\w$.]*)\s*[),]/g

for (const file of files) {
  if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) continue
  const text = readFileSync(file, 'utf8')
  T_DYNAMIC_RE.lastIndex = 0
  let m
  while ((m = T_DYNAMIC_RE.exec(text)) !== null) {
    const expr = m[1]
    const idx = m.index
    const back = text.slice(Math.max(0, idx - 800), idx)

    // Determine possible string-literal values this identifier could
    // hold. Only flag the assignments whose value is a known
    // markup-bearing i18n key.
    const lastSegment = expr.includes('.') ? expr.split('.').pop() : expr
    const assignRe = new RegExp(
      `\\b${lastSegment}\\s*=\\s*(['"\`])([a-zA-Z_$.][\\w.-]*)\\1`,
      'g',
    )
    let am
    const possibleKeys = []
    while ((am = assignRe.exec(text)) !== null) {
      const key = am[2]
      if (flaggedKeys.has(key)) possibleKeys.push({ key, pos: am.index })
    }
    if (possibleKeys.length === 0) continue

    // For dynamic keys, the strictest classification across the
    // possible values determines safety. If ANY possible value has
    // non-MathText tags, the wrapper must be Trans. So fold the
    // classifications.
    const onlyMathText = possibleKeys.every(p => flaggedKeys.get(p.key).onlyMathText)
    const mergedClass = { onlyMathText, tags: [] }
    if (isCallSiteSafe(back, mergedClass)) continue

    // Unsafe call site — flag every markup-bearing assignment.
    for (const { key, pos } of possibleKeys) {
      const cls = flaggedKeys.get(key)
      const line = text.slice(0, pos).split('\n').length
      findings.push({
        file: path.relative(REPO, file),
        line,
        key,
        value: sampleValue[key],
        tags: cls.tags,
        onlyMathText: cls.onlyMathText,
        kind: 'dynamic-through-t',
        varName: expr,
      })
    }
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
  if (f.kind === 'dynamic-through-t') {
    console.error(`    via:   variable «${f.varName}» assigned the markup-bearing key,`)
    console.error(`           then rendered through t(${f.varName}) elsewhere in this file.`)
  }
  console.error(`    value: ${f.value.length > 90 ? f.value.slice(0, 87) + '…' : f.value}`)
  console.error('')
}
console.error(`${findings.length} unsafe interpolation(s).`)
console.error('')
console.error('Fix:')
console.error('  • Replace `<p>{t(\'key\')}</p>` with')
console.error('       `<p><Trans i18nKey="key" ns="ui" components={{ strong: <strong />, ... }} /></p>`')
console.error('    mapping every tag in the value to a React component.')
console.error('  • For dynamic keys (`t(varName)` where varName comes from if/else),')
console.error('    switch the call site to `<Trans i18nKey={varName} components={...} />`.')
console.error('  • If the only tags are <var>/<nowrap>, `<MathText>{t(\'key\')}</MathText>` also works.')
console.error('  • Or rewrite the i18n value to drop the tags.')
process.exit(1)
