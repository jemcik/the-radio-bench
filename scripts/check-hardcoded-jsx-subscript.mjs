#!/usr/bin/env node
/**
 * check-hardcoded-jsx-subscript
 * ─────────────────────────────
 * Catches the «hardcoded JSX prose with bare subscript pattern» class of
 * bug. Symptom in production: a string like
 *
 *     <p>ΔV ≈ I_load · t_period / C = (V_peak / R_load) · …</p>
 *
 * ships to readers with all five underscores rendered LITERALLY because
 * the text never went through `withSubscripts()` / `<MathText>` / a
 * canonical `<var>X_{Y}</var>` markup. Caught in ch1.10 RippleSmoothingWidget
 * after a user screenshot showed `I_load`, `t_period`, `V_peak`, `R_load`,
 * `f_mains` all printed with literal underscores.
 *
 * Why the existing gates miss it
 * ──────────────────────────────
 *   • `check:bare-subscript-renders` — scans EN i18n keys → call sites,
 *     checks each `t('key')` is wrapped. A HARDCODED JSX literal isn't
 *     an i18n key, so this gate never sees it.
 *   • `check:hardcoded-jsx-text` — scans SVG `<text>` / `<tspan>` /
 *     `<title>` and a few attributes (aria-label, alt, …) for English-
 *     looking prose that should be in i18n. It does NOT scan generic
 *     element bodies (`<p>`, `<span>`, `<div>`, …) and does NOT look for
 *     bare-subscript patterns specifically.
 *   • Per-i18n linter `markup.bare-subscript-pattern` — only sees i18n
 *     VALUES. A literal in JSX is invisible to it.
 *
 * This gate closes the gap: scan every chapter / widget / diagram / hero
 * `.tsx` for JSX text content that has BOTH whitespace (so we're looking
 * at prose, not a single-token label) AND a bare-subscript pattern.
 *
 * What it does NOT flag
 * ─────────────────────
 *   • Single-token labels like `<TerminalLabel>V_in</TerminalLabel>`.
 *     Those route through `parseLabelSubscript` inside the label primitive
 *     and render correctly. The «whitespace required» rule excludes them.
 *   • JSX expressions: `<p>{withSubscripts(t('…'))}</p>`. The text between
 *     `>` and `<` is empty (the `{…}` block is excluded by the chunk
 *     regex), so nothing to flag.
 *   • Strings already inside a `<var>X_Y</var>` block: the lookbehind /
 *     lookahead in the bare-subscript regex skip them.
 *
 * Opt-out
 * ───────
 *   Place `// hardcoded-subscript-ok: <reason>` on the line directly
 *   above the offending JSX line to silence the next match. Use sparingly
 *   — the right fix is almost always to move the text to i18n and wrap
 *   the call site.
 *
 * Exit code: 0 on clean, 1 on findings.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const SCAN_DIRS = [
  'src/components/widgets',
  'src/components/diagrams',
  'src/components/chapter-heroes',
  'src/components/lab',
  'src/chapters',
  'src/features',
  'src/pages',
]

const SKIP_FILE_RE = /\.(test|stories)\.tsx?$/

// Bare subscript: single Latin letter at a token boundary, underscore,
// then 1+ alphanumerics. Lookbehind/-ahead exclude `<var>X_Y</var>` and
// `X_{Y}` so that the canonical wrapped forms don't trigger.
//
// `(?<![A-Za-z<>{\\])` — base must not be preceded by another letter
// (so `co_2` inside a word doesn't match), `<`/`>` (so `<var>X_Y` is
// exempt — the `>` from the opening tag is right before X), `{` (so
// braced subscripts like `_{Y}` are exempt), or `\` (so TeX commands
// like `\mathrm` aren't dragged in mid-formula).
//
// `(?![<>}])` — sub must not be followed by `<` (closing tag right after,
// e.g. `<var>X_Y</var>`), `>`, or `}` (braced form ends).
const BARE_SUB_RE = /(?<![A-Za-z<>{\\])[A-Za-z]_[A-Za-z0-9]+(?![<>}])/g

// JSX text chunk: a run of characters between `>` and `<` that contains
// no JSX expression boundaries (`{` / `}`). Captures the text content.
//
// Multi-line by default — JSX text often spans multiple lines for
// readability. `[^<{}]+` excludes those characters; a real expression
// `{foo}` inside a JSX block ends our chunk early (which is correct —
// the expression's contents are evaluated, not literal text).
const JSX_TEXT_CHUNK_RE = />([^<{}]+)</g

// A chunk that contains any of these tokens is JS code, not JSX text.
// They can sneak in via comparison operators (`x > 0` and `y < 5` bracket
// a piece of JS that happens to contain `>` and `<`), JSX-then-JS lines,
// or multi-line code blocks where one of the boundaries lands in code.
//
// JSX text essentially never contains these tokens in real chapters /
// widgets — the rule is loose enough that the false-negative rate is low,
// and the false-positive rate drops dramatically.
const JS_CODE_MARKERS = [
  /\/\//,                                          // line comment
  /\/\*|\*\//,                                     // block comment
  /=>/,                                            // arrow function
  /===|!==/,                                       // strict equality
  /&&|\|\||\?\?|\?\./,                             // logical / null-coalesce
  /\b(const|let|var|return|function|if|else|for|while|do|switch|case|break|continue|import|export|interface|type|class|new|throw|async|await|yield)\b/,
  /\.\w+\s*\(/,                                    // method call
  /\b(Math|Object|Array|String|Number|JSON|Promise|Set|Map)\.\w+/,
]

function looksLikeCode(chunk) {
  for (const re of JS_CODE_MARKERS) {
    if (re.test(chunk)) return true
  }
  return false
}

// Files where opt-outs apply. Looks for `// hardcoded-subscript-ok: …`
// on the immediately-preceding non-empty line.
const OPT_OUT_RE = /\/\/\s*hardcoded-subscript-ok\b/

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const st = fs.statSync(full)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue
      walk(full, acc)
    } else if (st.isFile() && /\.tsx?$/.test(full) && !SKIP_FILE_RE.test(full)) {
      acc.push(full)
    }
  }
  return acc
}

const files = []
for (const d of SCAN_DIRS) {
  walk(path.join(ROOT, d), files)
}

const findings = []

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split('\n')

  JSX_TEXT_CHUNK_RE.lastIndex = 0
  let m
  while ((m = JSX_TEXT_CHUNK_RE.exec(text)) !== null) {
    const chunk = m[1]

    // Need at least one whitespace AND non-whitespace content. This
    // excludes single-token labels (the safe `<TerminalLabel>V_in</…>`
    // case) and pure-whitespace text.
    const trimmed = chunk.trim()
    if (!trimmed || !/\s/.test(trimmed)) continue

    // Skip chunks that look like JS code (false positives from `>`/`<`
    // that bracket a piece of code, not JSX text — comparison operators,
    // arrow functions, line/block comments, `.method(…)` calls, …).
    if (looksLikeCode(chunk)) continue

    // Check for bare-subscript pattern.
    BARE_SUB_RE.lastIndex = 0
    const subs = chunk.match(BARE_SUB_RE)
    if (!subs) continue

    // Compute line for opt-out check + reporting.
    const idx = m.index + 1
    const line = text.slice(0, idx).split('\n').length

    // Opt-out: scan upward from the matched line for the closest non-empty
    // line and check for the opt-out comment.
    let optOut = false
    for (let li = line - 2; li >= Math.max(0, line - 4); li--) {
      const candidate = lines[li]
      if (!candidate) continue
      if (!candidate.trim()) continue
      if (OPT_OUT_RE.test(candidate)) {
        optOut = true
        break
      }
      // First non-empty line above is not an opt-out — stop looking.
      break
    }
    if (optOut) continue

    findings.push({
      file: path.relative(ROOT, file),
      line,
      chunk: chunk.length > 110 ? chunk.slice(0, 107) + '…' : chunk,
      patterns: [...new Set(subs)],
    })
  }
}

if (findings.length === 0) {
  console.log(
    `check-hardcoded-jsx-subscript OK: ${files.length} file(s) scanned, no hardcoded JSX text contains a bare subscript pattern outside a safe wrapper.`,
  )
  process.exit(0)
}

console.error(
  'check-hardcoded-jsx-subscript FAIL — these JSX text literals contain bare subscript patterns AND are not wrapped in a subscript-aware renderer:',
)
console.error('')
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}`)
  console.error(`    text:     "${f.chunk.trim()}"`)
  console.error(`    patterns: ${f.patterns.join(', ')}`)
  console.error('')
}
console.error(`${findings.length} unsafe text literal(s).`)
console.error('')
console.error('Fix options:')
console.error('  • Move the text to i18n (en + uk ui.json) and render via:')
console.error("      {withSubscripts(t('key'))}              (HTML / prose)")
console.error("      {withSubscriptsSvg(t('key'))}           (SVG <text>)")
console.error("      <MathText>{t('key')}</MathText>          (KaTeX, handles X_{Y} too)")
console.error('  • Or rewrite the i18n value as `<var>X_{Y}</var>` and render via')
console.error("      <Trans i18nKey=\"key\" components={{ var: <MathVar /> }} />")
console.error('  • If this is a legitimate one-off label that intentionally bypasses i18n,')
console.error('    add `// hardcoded-subscript-ok: <reason>` on the line directly above.')
process.exit(1)
