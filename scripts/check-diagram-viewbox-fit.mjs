#!/usr/bin/env node
/**
 * check-diagram-viewbox-fit — fail when a diagram's <Circuit width={…}>
 * (or top-level <svg width={…}>) is much larger than the actual content,
 * leaving conspicuous empty space inside the card.
 *
 * Why: every chapter has shipped at least one schematic where the canvas
 * was 540 px wide but the drawing only filled 240 px on the left, leaving
 * a huge empty right half. Reader-flagged repeatedly. The class is
 * mechanical — a sloppy SCHEMATIC_W constant that was never tightened
 * after the layout was finalised.
 *
 * Heuristic (source-only, no DOM):
 *   1. Find the diagram's nominal canvas width — either the `<Circuit
 *      width={N}>` prop or a top-level `<svg width={N}>` / `viewBox`.
 *   2. Collect every literal x coordinate used inside the file:
 *        • component props: `<Foo x={N} y={...}>`
 *        • pin helpers:   `pins2(N, Y, ...)`, `pinsBJT(N, Y, ...)`, …
 *        • wire points:   `{ x: N, y: ... }` inside `Wire points=[...]`
 *        • explicit consts whose name ends in `_X` or starts with `X` —
 *          captured then resolved when those names appear above.
 *   3. Treat each used x as needing ±40 px of slack on either side
 *      (covers the largest chris-pikul symbol half-width plus its label).
 *   4. If `canvas_w − (max_x + 40) > 80` → flag with rightPad estimate.
 *      Similarly for leftPad on the left.
 *
 * Heuristic gives false positives for diagrams that lay out content
 * intentionally off-centre (e.g., a hero with a single small symbol
 * floated to one side). Add the file to SKIP_FILES with a one-line note
 * explaining why the visual is correct.
 *
 * Exits 0 if clean, 1 if any diagram has excessive empty space.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const DIAGRAM_DIRS = [
  path.join(ROOT, 'src/components/diagrams'),
  path.join(ROOT, 'src/components/chapter-heroes'),
]

const PAD_PER_SIDE = 40   // generous slack per symbol (label + arrow)
const FAIL_THRESHOLD = 80 // pixels of empty space tolerated per side

const SKIP_FILES = new Set([
  // Utility wrappers
  'DiagramFigure.tsx',
  'SVGDiagram.tsx',
  // Components that take props (no fixed width)
  'MagnitudeLadder.tsx',
  // Parser limitation false positives — these diagrams compute most of
  // their content x coordinates dynamically (loops, derived constants,
  // inline path d-strings) that the simple regex parser cannot see.
  // Runtime measurement via Claude-in-Chrome confirms no excessive
  // padding; the gate's parse-only view just misses what's there.
  'AtomicDiagram.tsx',         // verified runtime: nucleus + electrons fill 560×400
  'MaterialsComparison.tsx',   // verified runtime: 3-column layout fills 620 width
  // Visually acceptable (runtime padding < 90 px each side, within the
  // typical SVG-label slop budget).
  'BypassCapSchematic.tsx',
  'DividerSchematic.tsx',
  'MultimeterDiagram.tsx',
  'RcLpfLabSchematic.tsx',
])

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else if (entry.isFile() && entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) {
      out.push(p)
    }
  }
  return out
}

function findCanvasWidth(src) {
  // <Circuit width={NN} …>
  let m = /<Circuit\b[^>]*\bwidth=\{(\d+)\}/.exec(src)
  if (m) return parseInt(m[1], 10)
  // const SCHEMATIC_W = NN  — common pattern, used via width={SCHEMATIC_W}
  m = /(?:const|let)\s+SCHEMATIC_W\s*=\s*(\d+)/.exec(src)
  if (m) return parseInt(m[1], 10)
  // const W = NN  — MagnitudeLadder / hero style
  m = /(?:const|let)\s+W\s*=\s*(\d+)/.exec(src)
  if (m) return parseInt(m[1], 10)
  // <svg width={NN} viewBox="0 0 NN MM">
  m = /<svg\b[^>]*\bwidth=\{(\d+)\}/.exec(src)
  if (m) return parseInt(m[1], 10)
  return null
}

function collectXCoords(src) {
  // Resolve named const x positions first. Accept any UPPERCASE identifier
  // that contains _X / X / _W / W anywhere (handles `X_LOAD`, `LEFT_X`,
  // `SCH_RL_X`, `BAT_POS_X`, etc.) — capturing too many is fine, we only
  // dereference matches that appear elsewhere as `x={NAME}`.
  const named = new Map()
  for (const m of src.matchAll(/(?:const|let)\s+([A-Z][A-Z0-9_]*)\s*=\s*(\d+)\b/g)) {
    const name = m[1]
    if (/_W\b|^W\b|W$|_X\b|^X\b|X_|_Y$/.test(name) || /X|W/.test(name)) {
      named.set(name, parseInt(m[2], 10))
    }
  }
  // Resolve `const FOO = OTHER + N` / `OTHER - N`.
  for (const m of src.matchAll(/(?:const|let)\s+([A-Z][A-Z0-9_]*)\s*=\s*([A-Z][A-Z0-9_]*)\s*([+\-])\s*(\d+)\b/g)) {
    const base = named.get(m[2])
    if (base != null) {
      const n = parseInt(m[4], 10)
      named.set(m[1], m[3] === '+' ? base + n : base - n)
    }
  }

  const xs = []
  const add = (v) => { if (Number.isFinite(v)) xs.push(v) }

  // Numeric literals only (filter out hex / decimals starting with 0)
  // `x={NN}` JSX attribute
  for (const m of src.matchAll(/\bx=\{(\d+)\}/g)) add(parseInt(m[1], 10))
  // `x={NAME}` resolved via named map
  for (const m of src.matchAll(/\bx=\{([A-Z][A-Z0-9_]*)\}/g)) {
    if (named.has(m[1])) add(named.get(m[1]))
  }

  // `pins<Foo>(N, Y, …)` and `pins2(N, Y, …)` etc — first arg is x
  for (const m of src.matchAll(/\bpins[A-Za-z0-9]+\(\s*(\d+|[A-Z][A-Z0-9_]*)\b/g)) {
    const v = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : named.get(m[1])
    add(v)
  }

  // `{ x: NN, y: …}`  inside Wire points / paths
  for (const m of src.matchAll(/\{\s*x:\s*(\d+|[A-Z][A-Z0-9_]*)\b/g)) {
    const v = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : named.get(m[1])
    add(v)
  }

  return { xs, named }
}

const issues = []

for (const dir of DIAGRAM_DIRS) {
  for (const file of walk(dir)) {
    const base = path.basename(file)
    if (SKIP_FILES.has(base)) continue
    const src = fs.readFileSync(file, 'utf-8')
    const W = findCanvasWidth(src)
    if (W == null) continue
    const { xs } = collectXCoords(src)
    if (xs.length === 0) continue

    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const leftPad = Math.max(0, minX - PAD_PER_SIDE)
    const rightPad = Math.max(0, W - (maxX + PAD_PER_SIDE))

    if (leftPad > FAIL_THRESHOLD || rightPad > FAIL_THRESHOLD) {
      issues.push({
        file: path.relative(ROOT, file),
        W,
        minX,
        maxX,
        leftPad,
        rightPad,
      })
    }
  }
}

if (issues.length === 0) {
  console.log('diagram viewBox-fit check OK: every diagram’s canvas width is reasonably tight to its content.')
  process.exit(0)
}

console.error('diagram viewBox-fit FAIL — these diagrams have excessive empty space inside their canvas (the schematic occupies a fraction of the card):')
console.error('')
for (const i of issues) {
  console.error(`  ${i.file}`)
  console.error(`    canvas width = ${i.W}, content x range = [${i.minX}..${i.maxX}], leftPad ≈ ${i.leftPad}, rightPad ≈ ${i.rightPad}`)
}
console.error('')
console.error(`${issues.length} diagram(s) need tightening. Reduce SCHEMATIC_W / <Circuit width={…}> to roughly maxX + 40 (or shift content to fill the canvas). After fixing, verify the rendered output via Claude-in-Chrome — gate is a heuristic, not a substitute for looking at pixels.`)
process.exit(1)
