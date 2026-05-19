#!/usr/bin/env node
/**
 * convert-electronic-symbol.mjs
 * ────────────────────────────
 * Fetches a single SVG from chris-pikul/electronic-symbols and emits the
 * inner <path>/<circle> elements in a form ready to paste into a React
 * component:
 *
 *   • Strips the outer <svg> wrapper, xmlns, viewBox, comments
 *   • Replaces every `stroke="#000"` (and `#000000`) with `stroke="currentColor"`
 *   • Strips every inline `stroke-width="..."` so the parent <g> determines
 *     thickness via {STROKE}
 *   • Strips `stroke-miterlimit` and other Inkscape artefacts that don't
 *     affect rendering at our scale
 *
 * The output is the bare inner geometry (<path>s, <circle>s) in the source's
 * native 150×150 coordinate system. Wrap it in a React component that
 * applies the project's coordinate transform and pin layout.
 *
 * Usage:
 *   node scripts/convert-electronic-symbol.mjs <SymbolFileName.svg>
 *   node scripts/convert-electronic-symbol.mjs Transistor-COM-MOSFET-N-Enhancement.svg
 *
 * Pinned to the upstream commit recorded in src/lib/circuit/vendored/SOURCE.md
 * so re-runs are reproducible.
 */
import https from 'node:https'

const UPSTREAM_COMMIT = '9c22054b11cb865cda7c817e4a9f4a4d3be6256e'
const UPSTREAM_BASE =
  `https://raw.githubusercontent.com/chris-pikul/electronic-symbols/${UPSTREAM_COMMIT}/SVG`

const symbolFile = process.argv[2]
if (!symbolFile) {
  console.error('Usage: convert-electronic-symbol.mjs <SymbolFile.svg>')
  process.exit(1)
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => resolve(body))
    }).on('error', reject)
  })
}

const url = `${UPSTREAM_BASE}/${symbolFile}`
const raw = await fetch(url)

// Strip <?xml ...?>, comments, and outer <svg ...>...</svg> wrapper.
let inner = raw
  .replace(/<\?xml[^?]*\?>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/m, '')
  .trim()

// Normalise colour: chris-pikul uses #000 / #000000 black. Replace with
// `currentColor` so the symbol picks up the React parent's `color`.
inner = inner.replace(/stroke="#0{3,6}"/g, 'stroke="currentColor"')

// NOTE on fill handling: chris-pikul wraps stroke-only paths in a parent
// `<g fill="none">`. After conversion, paths land directly inside our
// `VendoredSymbol` wrapper (which also sets `fill="none"`), so unfilled
// paths render correctly without any extra attribute.
// For paths that ARE meant to be filled (BJT/MOSFET body arrows, LED
// emission arrowheads, junction dots), add `fill="currentColor"` BY HAND
// in the React component file. Doing it automatically here would wrongly
// fill stroke-only paths (e.g., transformer coil bumps, switch arms,
// chassis-ground hatching) — see May 2026 user-flagged regression.

// Strip inline stroke-width — parent <g> sets it from STROKE constant.
inner = inner.replace(/\s*stroke-width="[^"]*"/g, '')

// Remove decorative attributes that don't affect rendering for us.
inner = inner.replace(/\s*stroke-miterlimit="[^"]*"/g, '')
inner = inner.replace(/\s*stroke-linejoin="[^"]*"/g, '')
inner = inner.replace(/\s*stroke-linecap="[^"]*"/g, '')

console.log(`// Source: ${url}`)
console.log(`// chris-pikul/electronic-symbols @ ${UPSTREAM_COMMIT.slice(0, 7)}`)
console.log(`// Native viewBox: 0 0 150 150`)
console.log(inner)
