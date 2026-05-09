#!/usr/bin/env node
/**
 * check-svg-diagram-fontsize-units — fail when a file imports SVGDiagram
 * AND uses NUMERIC `fontSize="N"` values inside it.
 *
 * Why this exists: SVGDiagram passes `width="100%"` to its inner svg, so
 * the SVG scales to its container's width. On a max-w-5xl chapter
 * container (~1024 px) a 540 px viewBox is rendered ~1.9× larger; any
 * numeric fontSize (in user-space units) inflates by the same factor —
 * `fontSize="13"` becomes ~25 px on screen. EM-based fontSize values
 * (`0.812em`, `0.75em`, `1rem`) inherit from the document root and stay
 * at constant display-px regardless of SVG scaling, so they're safe.
 *
 * The 14 pre-existing SVGDiagram users in the repo all use em values
 * (verified May 2026). The bug was introduced in ch1.10 by a single
 * file (HalfWaveRectifierWaveform) that combined SVGDiagram with
 * numeric fontSize, producing fonts 1.9× the size of body text. Reader
 * caught it immediately; this gate prevents the same pairing landing
 * unnoticed in future chapters.
 *
 * Allowed:
 *   – SVGDiagram + em/rem/percent fontSize values
 *   – bare <svg width={W}> without SVGDiagram + ANY fontSize unit
 *
 * Forbidden:
 *   – SVGDiagram + numeric fontSize="N" anywhere in the same file
 *
 * Exit code: 0 on clean, 1 on findings.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SEARCH_DIRS = ['src/components/diagrams', 'src/components/widgets', 'src/chapters']

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else if (ent.isFile() && /\.(tsx|ts)$/.test(ent.name)) out.push(p)
  }
  return out
}

const issues = []

const files = SEARCH_DIRS.flatMap(d => {
  const abs = path.join(ROOT, d)
  return fs.existsSync(abs) ? walk(abs) : []
})

for (const file of files) {
  const src = fs.readFileSync(file, 'utf-8')

  // Quick filter: does this file import SVGDiagram? Skip if not.
  const importsSvgDiagram = /from\s+['"](?:[\w./@-]*\/)?SVGDiagram['"]/.test(src)
  if (!importsSvgDiagram) continue

  // Skip the SVGDiagram component itself.
  if (file.endsWith('/SVGDiagram.tsx')) continue

  // Find every `fontSize="N"` where N is a bare integer or decimal —
  // i.e. user-space units (not em / rem / px-string / %).
  // Matches:  fontSize="13"  fontSize="13.5"
  // Skips:    fontSize="13px"  fontSize="0.812em"  fontSize="1rem"
  //           fontSize="100%"  fontSize={svgTokens.font.tickLabel}
  const numericRe = /\bfontSize\s*=\s*"(\d+(?:\.\d+)?)"/g
  const lines = src.split('\n')
  for (const m of src.matchAll(numericRe)) {
    const lineNum = src.slice(0, m.index).split('\n').length
    issues.push({
      file: path.relative(ROOT, file),
      line: lineNum,
      value: m[1],
      snippet: lines[lineNum - 1].trim(),
    })
  }
}

if (issues.length === 0) {
  console.log(
    `check-svg-diagram-fontsize-units OK: every file that imports ` +
    `SVGDiagram uses em/rem/% font sizes (no numeric fontSize values ` +
    `that would scale with the wrapper's width="100%").`,
  )
  process.exit(0)
}

console.error(
  `check-svg-diagram-fontsize-units FAIL — ${issues.length} numeric ` +
  `fontSize value(s) inside files that import SVGDiagram. The wrapper ` +
  `forces width="100%", so numeric (user-space) fontSize values scale ` +
  `~1.9× on a wide chapter container — a fontSize="13" becomes ~25 px ` +
  `on screen, much larger than body text:\n`,
)
for (const i of issues) {
  console.error(`  ${i.file}:${i.line}  fontSize="${i.value}"`)
  console.error(`    ${i.snippet}`)
}
console.error(
  '\nFix options:\n' +
  '  • Switch to em-based: fontSize="0.812em" (≈13 px) / "0.75em" (≈12 px) /\n' +
  '    "0.875em" (≈14 px). EM inherits from document root and stays at\n' +
  '    constant display-px regardless of SVG scaling.\n' +
  '  • Or drop the SVGDiagram wrapper for a bare <svg width={VB_W}> with\n' +
  '    style={{ maxWidth: "100%", height: "auto" }} — no scaling, so\n' +
  '    numeric fontSize values render at face value (see OhmsLawPlot,\n' +
  '    SineOriginDiagram for the canonical pattern).\n',
)
process.exit(1)
