#!/usr/bin/env node
/**
 * check:diagram-fontsize — fail when a diagram component hardcodes a
 * numeric SVG `fontSize="N"` instead of using the project's em-based
 * font tokens.
 *
 * Why this exists: hardcoded numeric fontSize values (e.g. fontSize="11"
 * or fontSize={11}) are interpreted as SVG user-space units and scale
 * with the SVG's display size. So labels get bigger on wider screens
 * and smaller on mobile, producing inconsistent label sizes between
 * sibling diagrams in the same chapter.
 *
 * The project convention (established by LcResponseCurve / BodePlotter
 * / VnaFilterSweepMock) is:
 *   1. Outer <svg> sets `style={{ fontSize: '1rem' }}` to anchor em
 *      units to the document root.
 *   2. <text> elements use em-based fontSize (`0.75em` for tick labels,
 *      `0.812em` for axis/zone labels) — pulled from `svgTokens.font.*`
 *      where possible.
 *
 * Scope: src/components/diagrams/, src/components/chapter-heroes/.
 *
 * Opt-out: place a comment `// hardcoded-fontsize-ok: <reason>` on the
 * line above the offending fontSize. Use sparingly — there are very
 * few legitimate cases (the Circuit primitives bake fixed pixel sizes
 * for terminal labels, but those primitives live under src/lib/circuit/
 * which is outside this check's scope).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const SCAN_DIRS = [
  'src/components/diagrams',
  'src/components/chapter-heroes',
]

const SKIP_FILE_RE = /\.(test|stories)\.tsx?$/

// Match `fontSize="11"`, `fontSize='11'`, `fontSize={11}` — numeric
// values without an em / rem / % unit. Allow keyword values like
// `fontSize="inherit"` (rare but valid) and the canonical em form.
const NUMERIC_FONTSIZE_RE = /\bfontSize\s*=\s*(?:["']\s*\d+\s*["']|\{\s*\d+(?:\.\d+)?\s*\})/g

function walkTsx(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkTsx(p))
    else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !SKIP_FILE_RE.test(entry.name)) {
      out.push(p)
    }
  }
  return out
}

const issues = []
let scanned = 0

for (const scanDir of SCAN_DIRS) {
  for (const f of walkTsx(path.join(ROOT, scanDir))) {
    scanned++
    const src = fs.readFileSync(f, 'utf-8')
    const lines = src.split('\n')
    const optOut = new Set()
    lines.forEach((line, i) => {
      if (/hardcoded-fontsize-ok\b/.test(line)) optOut.add(i + 2)
    })

    function lineOf(pos) {
      return src.slice(0, pos).split('\n').length
    }

    for (const m of src.matchAll(NUMERIC_FONTSIZE_RE)) {
      const ln = lineOf(m.index)
      if (optOut.has(ln)) continue
      issues.push({
        file: path.relative(ROOT, f),
        line: ln,
        match: m[0].replace(/\s+/g, ' '),
      })
    }
  }
}

// `--strict` flag promotes findings to a hard failure. Default mode is
// advisory (prints findings, exits 0) — matches the precedent set by
// `check:hardcoded-units`. The strict mode is what new code should run
// against; the advisory mode lets pre-existing tech debt surface
// without blocking unrelated PRs.
const strict = process.argv.includes('--strict')

if (issues.length === 0) {
  console.log(`check:diagram-fontsize OK — ${scanned} diagram file(s) scanned, no hardcoded numeric fontSize values.`)
  process.exit(0)
}

const headline = strict
  ? 'check:diagram-fontsize FAIL — these diagram files use hardcoded numeric fontSize values that scale with the SVG. They produce inconsistent label sizes between sibling diagrams. Use em-based values from `svgTokens.font.*` (and ensure the outer SVG sets `style={{ fontSize: \'1rem\' }}`).'
  : `Found ${issues.length} hardcoded numeric fontSize value(s) in diagrams (advisory — they scale with the SVG and produce inconsistent label sizes between sibling diagrams):`
console[strict ? 'error' : 'log'](headline)
console.log('')
for (const i of issues) {
  console.log(`  ${i.file}:${i.line}  ${i.match}`)
}
console.log('')
console.log('Fix: replace `fontSize="11"` with `fontSize={svgTokens.font.tickLabel}` (or `"0.75em"` literally), and add `style={{ fontSize: \'1rem\' }}` to the outer `<svg>` if missing.')
console.log('Opt-out: place `// hardcoded-fontsize-ok: <reason>` on the line directly above the value.')
process.exit(strict ? 1 : 0)
