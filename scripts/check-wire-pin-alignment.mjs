#!/usr/bin/env node
/**
 * check-wire-pin-alignment — verify that every `<Wire points={[…]} />`
 * endpoint in a schematic touches an actual component pin endpoint
 * exactly. No 2-px gaps, no «close enough».
 *
 * Why
 * ───
 * The chris-pikul primitives have specific pin coordinates after the
 * wrapper `translate(-75,-75) scale(0.4)`:
 *   • Resistor / Capacitor / Inductor / AcSource / SwitchSPST / Fuse /
 *     Diode / LED / DiodeZener / Battery / BatteryMulti: pins at (±30, 0)
 *   • OpAmp: +in (−30, **−10**), −in (−30, **+10**), out (+30, 0)
 *   • Transformer: pri.p1/p2 (−30, ∓25), sec.p1/p2 (+30, ∓25)
 *   • Meter: pins at (±20, 0) — NOT default ±30; uses METER_PIN_SPAN
 *   • Ground: pin tip at (0, −10) for orient='right' (compact post-May 2026)
 *
 * Past failures the gate catches:
 *   • CascadedRcSchematic OPAMP_PLUS_IN_Y = BUF_OPAMP_Y - 12 (should be -10)
 *   • Transformer schematics pre-chris-pikul-migration with ±12/±30 pins
 *
 * What this gate flags
 * ────────────────────
 * For each .tsx file under `src/components/diagrams/`:
 *   1. Parse component placements (Resistor x=… y=… orient='…').
 *   2. Compute each component's pin endpoint coords (absolute).
 *   3. Parse every `<Wire points={[…, lastPoint]} />` endpoint.
 *   4. For each wire endpoint that is NOT a constant-named anchor
 *      (i.e. literal `{x: N, y: M}` or `pins2(…).pN`-style), check
 *      whether it matches a known pin endpoint exactly.
 *   5. If a wire ends NEAR a pin (within 5 px) but not ON it, flag.
 *
 * Limitations
 * ───────────
 * This is a STATIC analyser of JSX literal coords. It can resolve:
 *   • Component placement props that are constants in the same file
 *   • Wire endpoint expressions like `{x: NODE_X, y: TOP_Y}` after
 *     numeric resolution of NODE_X / TOP_Y
 *   • `r.p1` / `r.p2` from `const r = pins2(X, Y, …)` declarations
 * It does NOT resolve:
 *   • Computed expressions (`(TOP_Y + BOT_Y) / 2`) — it DOES try to
 *     evaluate simple arithmetic, but bails on complex ones
 *   • Imports from other files
 *
 * Opt-out: place `// wire-pin-alignment-ok: <reason>` directly above
 * the flagged wire. Use only when the wire deliberately ends in mid-rail
 * (e.g. a stub that meets another wire, not a component pin).
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

// ─── Pin geometry per primitive (after wrapper translate+scale) ──────
// Each entry: function(orient) → array of {x, y} relative to component
// (component placed at origin). Absolute pins = (compX + offset.x,
// compY + offset.y).

const ORIENT_ROT = {
  right: { c: 1, s: 0 },
  down: { c: 0, s: 1 },
  left: { c: -1, s: 0 },
  up: { c: 0, s: -1 },
}

function rot(orient, x, y) {
  const o = ORIENT_ROT[orient] || ORIENT_ROT.right
  return { x: x * o.c - y * o.s, y: x * o.s + y * o.c }
}

const PRIMITIVE_PINS = {
  // Two-terminal symbols with pins at ±30 along the body axis
  Resistor: o => [rot(o, -30, 0), rot(o, 30, 0)],
  Capacitor: o => [rot(o, -30, 0), rot(o, 30, 0)],
  CapacitorElectrolytic: o => [rot(o, -30, 0), rot(o, 30, 0)],
  Inductor: o => [rot(o, -30, 0), rot(o, 30, 0)],
  InductorCore: o => [rot(o, -30, 0), rot(o, 30, 0)],
  Fuse: o => [rot(o, -30, 0), rot(o, 30, 0)],
  Crystal: o => [rot(o, -30, 0), rot(o, 30, 0)],
  AcSource: o => [rot(o, -30, 0), rot(o, 30, 0)],
  Battery: o => [rot(o, -30, 0), rot(o, 30, 0)],
  BatteryMulti: o => [rot(o, -30, 0), rot(o, 30, 0)],
  Diode: o => [rot(o, -30, 0), rot(o, 30, 0)],
  LED: o => [rot(o, -30, 0), rot(o, 30, 0)],
  DiodeZener: o => [rot(o, -30, 0), rot(o, 30, 0)],
  SwitchSPST: o => [rot(o, -30, 0), rot(o, 30, 0)],

  // Three-terminal: pin coords per primitive doc
  TransistorNPN: o => [rot(o, -30, 0), rot(o, 10, -30), rot(o, 10, 30)],
  TransistorPNP: o => [rot(o, -30, 0), rot(o, 10, 30), rot(o, 10, -30)],
  TransistorNMOS: o => [rot(o, -30, 0), rot(o, 10, -30), rot(o, 10, 30)],
  TransistorPMOS: o => [rot(o, -30, 0), rot(o, 10, -30), rot(o, 10, 30)],
  SwitchSPDT: o => [rot(o, -30, 0), rot(o, 30, -15), rot(o, 30, 15)],

  // OpAmp: +in (top, y=-10), -in (bottom, y=+10), output (right)
  OpAmp: o => [rot(o, -30, -10), rot(o, -30, 10), rot(o, 30, 0)],

  // Meter: custom 40-px pin span (METER_PIN_SPAN), not default 60
  Meter: o => [rot(o, -20, 0), rot(o, 20, 0)],

  // Transformer: two windings, each with two pins
  Transformer: o => [
    rot(o, -30, -25),
    rot(o, -30, 25),
    rot(o, 30, -25),
    rot(o, 30, 25),
  ],

  // Ground: single pin tip at (0, -10) in default orient='right'
  Ground: o => [rot(o, 0, -10)],
  GroundEarth: o => [rot(o, 0, -10)],

  // Antenna: single pin at top in orient='up' (default for antenna)
  Antenna: o => [rot(o, 0, -30)],

  // Tap: single point (the arrow tip)
  Tap: () => [{ x: 0, y: 0 }],

  // NodePoint: single point at (0, 0)
  NodePoint: () => [{ x: 0, y: 0 }],
}

// ─── Walk source dir ─────────────────────────────────────────────────

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...walk(full))
    } else if (entry.endsWith('.tsx') && !entry.endsWith('.test.tsx')) {
      out.push(full)
    }
  }
  return out
}

// ─── Numeric constant resolver ───────────────────────────────────────
// Pre-pass: extract all top-level `const NAME = <number-expr>` and
// `const NAME = pins2(X, Y, [orient])` declarations.

// Pre-seeded constants imported from @/lib/circuit. Keep in sync with
// src/lib/circuit/layout.ts and types.ts.
const LIB_CONSTS = {
  SCHEMATIC_PAD_TOP: 35,
  SCHEMATIC_PAD_BOT: 20,
  SPAN: 60,
  HALF: 30,
  STROKE: 1.5,
  WIRE_STROKE: 1.5,
  AC_SOURCE_RADIUS: 20,
  METER_PIN_SPAN: 40,
  LABEL_SIZE: 14,
  VALUE_SIZE: 13,
}

function extractConsts(source) {
  const consts = { ...LIB_CONSTS }
  const pinDefs = Object.create(null)
  // Multi-pass: re-scan until no new resolutions, so y-consts that
  // depend on x-consts (etc.) get resolved.
  // Collect all `const NAME = EXPR` definitions
  const defs = []
  const reConst = /^\s*const\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/gm
  let m
  while ((m = reConst.exec(source)) !== null) {
    const name = m[1]
    const expr = m[2].replace(/\s*\/\/.*/, '').trim().replace(/[;,]$/, '')
    defs.push({ name, expr })
  }
  // First pass: register pins2(…) defs separately
  for (const d of defs) {
    const pinsMatch = /^pins2\(\s*([^,]+?)\s*,\s*([^,)]+?)(?:\s*,\s*['"]([^'"]+)['"])?\s*\)$/.exec(d.expr)
    if (pinsMatch) {
      pinDefs[d.name] = { xExpr: pinsMatch[1], yExpr: pinsMatch[2], orient: pinsMatch[3] || 'right' }
    }
  }
  // Multi-pass numeric resolution: repeat until no progress.
  let changed = true
  while (changed) {
    changed = false
    for (const d of defs) {
      if (consts[d.name] !== undefined) continue
      if (pinDefs[d.name]) continue
      // Strip schematicHeight(…) calls — they don't matter for pin coords
      let expr = d.expr.replace(/schematicHeight\([^)]+\)/g, '0')
      const v = tryEval(expr, consts)
      if (v !== undefined) {
        consts[d.name] = v
        changed = true
      }
    }
  }
  return { consts, pinDefs }
}

function tryEval(expr, consts) {
  // Substitute known constants
  const subbed = expr.replace(/\b([A-Za-z_]\w*)\b/g, (full, name) => {
    if (Object.prototype.hasOwnProperty.call(consts, name)) return `(${consts[name]})`
    return '«MISSING»'
  })
  if (subbed.includes('«MISSING»')) return undefined
  try {
    const v = Function(`"use strict"; return (${subbed})`)()
    return typeof v === 'number' && Number.isFinite(v) ? v : undefined
  } catch {
    return undefined
  }
}

function resolvePinSet(pinDefs, name, consts) {
  const def = pinDefs[name]
  if (!def) return null
  const cx = tryEval(def.xExpr, consts)
  const cy = tryEval(def.yExpr, consts)
  if (cx === undefined || cy === undefined) return null
  // pins2 produces two pins at ±30 along the orient axis (using SPAN/2=30 default)
  const offs = [rot(def.orient, -30, 0), rot(def.orient, 30, 0)]
  return { p1: { x: cx + offs[0].x, y: cy + offs[0].y }, p2: { x: cx + offs[1].x, y: cy + offs[1].y } }
}

// ─── Component placements ────────────────────────────────────────────
// Find `<PrimName x={…} y={…} orient="…" />` (or self-closed inside <>)

function extractComponents(source, consts) {
  const components = []
  const reJsx = /<([A-Z][A-Za-z0-9]*)\b([^/>]*)\/?>/g
  let m
  while ((m = reJsx.exec(source)) !== null) {
    const name = m[1]
    if (!PRIMITIVE_PINS[name]) continue
    const propsStr = m[2]
    const xMatch = /\bx=\{([^}]+)\}/.exec(propsStr)
    const yMatch = /\by=\{([^}]+)\}/.exec(propsStr)
    if (!xMatch || !yMatch) continue
    const cx = tryEval(xMatch[1], consts)
    const cy = tryEval(yMatch[1], consts)
    if (cx === undefined || cy === undefined) continue
    const orientMatch = /\borient=['"]([^'"]+)['"]/.exec(propsStr)
    const orient = orientMatch ? orientMatch[1] : 'right'
    const pinFn = PRIMITIVE_PINS[name]
    const pins = pinFn(orient).map(p => ({ x: cx + p.x, y: cy + p.y }))
    components.push({ name, cx, cy, orient, pins, line: source.slice(0, m.index).split('\n').length })
  }
  return components
}

// ─── Wire endpoint analysis ──────────────────────────────────────────

function extractWireEndpoints(source, consts, pinDefs) {
  const endpoints = []
  // Match <Wire points={[ ... ]} ... />
  const reWire = /<Wire\s+([^/>]*?)\/>/gms
  let m
  while ((m = reWire.exec(source)) !== null) {
    const propsStr = m[1]
    const pointsMatch = /\bpoints=\{\[([^\]]+)\]\}/s.exec(propsStr)
    if (!pointsMatch) continue
    const pointsRaw = pointsMatch[1]
    // Split into entries: either {x: …, y: …} or NAME.pN
    const entries = []
    // {x: …, y: …}
    const reObj = /\{\s*x:\s*([^,}]+?)\s*,\s*y:\s*([^,}]+?)\s*\}/g
    let mm
    while ((mm = reObj.exec(pointsRaw)) !== null) {
      const cx = tryEval(mm[1], consts)
      const cy = tryEval(mm[2], consts)
      if (cx !== undefined && cy !== undefined) entries.push({ x: cx, y: cy, raw: mm[0] })
    }
    // NAME.p1 / NAME.p2
    const reRef = /\b([A-Za-z_]\w*)\.(p1|p2)\b/g
    while ((mm = reRef.exec(pointsRaw)) !== null) {
      const pset = resolvePinSet(pinDefs, mm[1], consts)
      if (pset && pset[mm[2]]) entries.push({ x: pset[mm[2]].x, y: pset[mm[2]].y, raw: `${mm[1]}.${mm[2]}` })
    }
    if (entries.length === 0) continue
    const line = source.slice(0, m.index).split('\n').length
    // Only the FIRST and LAST endpoint are pin candidates; interior
    // entries are corners and may live anywhere.
    endpoints.push({ point: entries[0], wireLine: line, role: 'first' })
    if (entries.length > 1) {
      endpoints.push({ point: entries[entries.length - 1], wireLine: line, role: 'last' })
    }
  }
  return endpoints
}

// ─── Run analysis per file ───────────────────────────────────────────

function analyseFile(file) {
  const src = readFileSync(file, 'utf8')
  // Skip files with no Wire elements
  if (!/\bWire\b/.test(src) && !/<Wire/.test(src)) return null
  const { consts, pinDefs } = extractConsts(src)
  const components = extractComponents(src, consts)
  const endpoints = extractWireEndpoints(src, consts, pinDefs)

  // All pin coords
  const pinPoints = []
  for (const c of components) {
    for (const p of c.pins) {
      pinPoints.push({ x: p.x, y: p.y, comp: c.name, line: c.line })
    }
  }

  const findings = []
  for (const ep of endpoints) {
    const { point, wireLine } = ep
    // Find nearest pin
    let nearest = null
    let nearestDist = Infinity
    for (const pin of pinPoints) {
      const dx = point.x - pin.x
      const dy = point.y - pin.y
      const dist = Math.hypot(dx, dy)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = pin
      }
    }
    // Exact match (within 0.5 px) is fine
    if (nearestDist <= 0.5) continue
    // Within 15 px is suspicious: probably MEANT to touch a pin but
    // missed. Threshold widened from 5 → 15 (May 2026) after the buggy
    // pinsBJT helper produced wire endpoints up to 11 px off the actual
    // chris-pikul TransistorNPN pin tips (collector at +10/-30 vs old
    // pinsBJT +12/-19 → 11.2 px miss). The 5-px window let that bug
    // through.
    if (nearestDist <= 15) {
      // Check for opt-out comment
      const lines = src.split('\n')
      const ctx = lines.slice(Math.max(0, wireLine - 8), wireLine).join('\n')
      if (/wire-pin-alignment-ok:/.test(ctx)) continue
      findings.push({
        wireLine,
        point,
        nearestPin: nearest,
        dist: nearestDist,
      })
    }
    // Else: probably ends at a rail/corner intentionally, not a pin
  }
  return { file, findings, components: components.length, endpoints: endpoints.length }
}

// ─── Main ────────────────────────────────────────────────────────────

const files = walk(join(repoRoot, 'src/components/diagrams'))
let totalFindings = 0
const allFindings = []

for (const file of files) {
  const result = analyseFile(file)
  if (!result || result.findings.length === 0) continue
  totalFindings += result.findings.length
  for (const f of result.findings) {
    allFindings.push({ file: file.replace(repoRoot + '/', ''), ...f })
  }
}

if (totalFindings > 0) {
  console.error(
    `Found ${totalFindings} wire endpoint(s) that DON'T touch any known component pin but are within 5 px of one (i.e. probably meant to touch and missed):\n`,
  )
  for (const f of allFindings) {
    const dx = f.point.x - f.nearestPin.x
    const dy = f.point.y - f.nearestPin.y
    console.error(
      `  ${f.file}:${f.wireLine}  wire ends at (${f.point.x}, ${f.point.y})  nearest pin: ${f.nearestPin.comp} at (${f.nearestPin.x}, ${f.nearestPin.y})  offset (Δx=${dx.toFixed(1)}, Δy=${dy.toFixed(1)}), dist=${f.dist.toFixed(2)} px`,
    )
  }
  console.error(`
Wire endpoints must match component pin endpoints exactly. Common
causes: wrong y-offset (e.g. OpAmp +/− inputs at ±10 in chris-pikul,
NOT ±12), copy-pasted ARRL-era ±12 coords on chris-pikul transformers,
or a hand-typed coord that was eyeballed.

Fix: derive the wire's endpoint coord from the same constant as the
component's pin (use pins2(…).p1/p2 or the primitive's known offset).

Opt-out (only when the wire INTENTIONALLY ends at a rail mid-point
or a corner that happens to be near a pin but isn't electrically
connected): place \`// wire-pin-alignment-ok: <reason>\` within 8
lines above the flagged \`<Wire …>\`.
`)
  process.exit(1)
}

console.log(
  `check-wire-pin-alignment OK: ${files.length} diagram file(s) scanned, all wire endpoints either touch a known pin or end at a non-pin coordinate.`,
)
