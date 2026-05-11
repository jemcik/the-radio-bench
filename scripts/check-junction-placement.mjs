#!/usr/bin/env node
/**
 * check-junction-placement.mjs
 * ────────────────────────────
 * Mechanically gates the «junction-dot only at 3+ wire conductors» rule.
 *
 * Background — May 2026 chris-pikul migration: TransformerVoltageSchematic
 * shipped with four spurious `<Junction>` dots at L-corners (each was an
 * interior point of ONE polyline `<Wire>`, not a real T-joint). The rule
 * was already documented in three places (SKILL.md, common-failures.md,
 * circuit-schematics.md § «Schematic junction dots») — the latter even
 * called out: «Not yet mechanically gated… Worth adding when someone
 * re-violates and feels the pain.» Pain felt. Gate built.
 *
 * Rule recap
 * ──────────
 * A `<Junction>` (filled dot) signals «three or more conductors are
 * electrically tied together at this point». For each `<Junction>` at
 * (x, y) we count how many conductor directions emanate from (x, y):
 *
 *   • point is the FIRST or LAST element of a `<Wire>` polyline  →  +1
 *     (one conductor enters/exits the network here)
 *   • point is an INTERIOR element of a `<Wire>` polyline           →  +2
 *     (the wire continues through this point — back AND forward)
 *
 * Sum across all `<Wire>` elements in the file. If the total is < 3,
 * the junction is at an L-corner or a phantom dot — flag it.
 *
 * Limitations (by design — keep the script simple)
 * ─────────────────────────────────────────────────
 * Coordinates are compared by canonical TEXT form, not by evaluated
 * numeric value. Two points match iff their `x` and `y` expression
 * strings (after whitespace normalisation) are identical:
 *
 *     {x: TX_PRI_X, y: TOP_Y}  ===  {x: TX_PRI_X, y: TOP_Y}   ✓
 *     {x: TX_PRI_X, y: TOP_Y}  ===  {x: 290 - 30, y: 50}      ✗ (text differs)
 *
 * In this project schematic authors consistently use ONE variable name
 * per coordinate (X_TX, MID_Y, …), so textual comparison catches the
 * intended cases. Identifier-based wire points (e.g. `pinsBJT(...).base`)
 * are opaque to this script — match only if the Junction uses the same
 * identifier text.
 *
 * Exits 0 if clean, 1 if any spurious dot is found.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIAGRAMS_DIR = path.join(ROOT, 'src/components/diagrams')

function normalise(expr) {
  return expr.trim().replace(/\s+/g, ' ')
}

function pointKey(xExpr, yExpr) {
  return `${normalise(xExpr)} | ${normalise(yExpr)}`
}

/** Replace /* …block… *\/ comments with same-length WHITESPACE-only
 *  filler, so JSX `{ /* … *\/ }` braces don't confuse the regexes BUT
 *  character offsets stay aligned with the raw file (line numbers in
 *  error messages then point at the real source line). */
function blankBlockComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, ' '),
  )
}

/** Numeric values for identifiers imported from `@/lib/circuit` that
 *  schematic files commonly use in coordinate expressions. Keeping a
 *  small allowlist beats parsing the imported source tree just to
 *  resolve a couple of constants. Mirror any rename in
 *  src/lib/circuit/layout.ts (etc.) here. */
const IMPORTED_CONSTANTS = {
  SCHEMATIC_PAD_TOP: 35,
  SPAN: 60,
  HALF: 30,
  STROKE: 1.5,
  WIRE_STROKE: 1.5,
  DETAIL_STROKE: 1.5,
  METER_PIN_SPAN: 40,
}

/** Build a map { NAME → numeric value } from all top-level `const NAME =
 *  <expression>` declarations in the file. Used to evaluate point
 *  expressions like `BYPASS_X` or `(TOP_Y + BOT_Y) / 2` into numbers,
 *  so we can detect when a wire segment visually passes through a
 *  Junction point as a non-vertex interior pass-through. */
function buildConstantMap(src) {
  const consts = { ...IMPORTED_CONSTANTS }
  const re = /^[ \t]*const\s+(\w+)\s*=\s*([^\n=][^\n]*?)$/gm
  let m
  const seen = new Set()
  // Two passes — constants can reference other constants.
  for (let pass = 0; pass < 4; pass++) {
    re.lastIndex = 0
    while ((m = re.exec(src)) !== null) {
      const name = m[1]
      // Strip trailing `// inline comment` and `; , ` before eval.
      const expr = m[2]
        .replace(/\/\/.*$/, '')
        .replace(/[;,]\s*$/, '')
        .trim()
      if (seen.has(name) && consts[name] !== undefined) continue
      const value = safeEval(expr, consts)
      if (typeof value === 'number' && Number.isFinite(value)) {
        consts[name] = value
        seen.add(name)
      }
    }
  }
  return consts
}

/** Evaluate a simple arithmetic expression against a constants map.
 *  Returns a number when evaluation succeeds, undefined otherwise.
 *  Restricted to numeric literals, identifiers from the map, parens,
 *  `+ - * /` and unary `-`. Anything else (function calls, property
 *  access, …) bails out to `undefined` — the caller treats unknown
 *  points as opaque and only relies on textual matching for them. */
function safeEval(expr, consts) {
  // Reject any token outside {digits, identifier chars, + - * / ( ) . whitespace}
  if (/[^\w\s+\-*/().]/.test(expr)) return undefined
  // Substitute identifiers with their numeric values; bail if any
  // identifier is missing from the map.
  const subbed = expr.replace(/\b([a-zA-Z_]\w*)\b/g, (_, name) => {
    if (consts[name] !== undefined) return `(${consts[name]})`
    return '«MISSING»'
  })
  if (subbed.includes('«MISSING»')) return undefined
  try {
    const v = Function(`"use strict"; return (${subbed})`)()
    return typeof v === 'number' ? v : undefined
  } catch {
    return undefined
  }
}

/** Pin-helper formulas, mirroring src/lib/circuit/types.ts:
 *  - pins2(cx, cy)         → p1=(cx-30, cy), p2=(cx+30, cy)
 *  - pinsBJT(cx, cy)       → base=(cx-26, cy), collector=(cx+12, cy-19),
 *                            emitter=(cx+12, cy+19)
 *  - pinsMOSFET(cx, cy)    → mirrors pinsBJT (same offsets)
 *  - meterPins(cx, cy)     → like pins2 but span=40 → p1=(cx-20,cy), p2=(cx+20,cy)
 *  - pinsOpAmp(cx, cy)     → inv=(cx-30,cy-12), non=(cx-30,cy+12), out=(cx+30, cy)
 *
 *  Rotation handling for each orient mirrors the types.ts `rot()` helper. */
function rotateOffset(ox, oy, orient) {
  switch (orient) {
    case 'right': return [ox, oy]
    case 'down':  return [-oy, ox]
    case 'left':  return [-ox, -oy]
    case 'up':    return [oy, -ox]
    default:      return [ox, oy]
  }
}

const PIN_HELPER_FORMULAS = {
  pins2: { p1: [-30, 0], p2: [30, 0] },
  pinsBJT: {
    base: [-26, 0],
    collector: [12, -19],
    emitter: [12, 19],
  },
  pinsMOSFET: {
    gate: [-26, 0],
    drain: [12, -19],
    source: [12, 19],
  },
  meterPins: { p1: [-20, 0], p2: [20, 0] },
  pinsOpAmp: {
    inv: [-30, -12],
    non: [-30, 12],
    out: [30, 0],
  },
}

/** Parse `const NAME = HELPER(EXPR_X, EXPR_Y[, 'orient'])` declarations
 *  and pre-compute each pin's numeric coordinate into a per-helper-var
 *  map: `pinResolutions['NAME.collector'] = { nx, ny }`, … */
function buildPinResolutions(src, consts) {
  const out = {}
  const re = /^[ \t]*const\s+(\w+)\s*=\s*(pins2|pinsBJT|pinsMOSFET|meterPins|pinsOpAmp)\s*\(\s*([^,]+)\s*,\s*([^,)]+)\s*(?:,\s*['"](\w+)['"]\s*)?\)/gm
  let m
  while ((m = re.exec(src)) !== null) {
    const name = m[1]
    const helper = m[2]
    const xExpr = m[3].trim()
    const yExpr = m[4].trim()
    const orient = m[5] || 'right'
    const cx = safeEval(xExpr, consts)
    const cy = safeEval(yExpr, consts)
    if (typeof cx !== 'number' || typeof cy !== 'number') continue
    const formula = PIN_HELPER_FORMULAS[helper]
    for (const [pinName, [ox, oy]] of Object.entries(formula)) {
      const [rx, ry] = rotateOffset(ox, oy, orient)
      out[`${name}.${pinName}`] = { nx: cx + rx, ny: cy + ry }
    }
  }
  return out
}

/** Try to attach a numeric (x, y) to a point/junction whose `x` and `y`
 *  textual expressions resolve via the constants map, OR whose textual
 *  identifier matches a pre-computed pin-helper resolution. */
function attachNumeric(obj, consts, pins) {
  if (typeof obj.x !== 'string' || typeof obj.y !== 'string') return
  // Direct identifier match — wire vertex written as a bare `tr.collector`.
  const ident = obj.x === obj.y ? obj.x : null
  if (ident && pins[ident]) {
    obj.nx = pins[ident].nx
    obj.ny = pins[ident].ny
    return
  }
  // `IDENT.x` / `IDENT.y` form — Junction written as `{x: tr.collector.x, y: tr.collector.y}`.
  const xDot = /^([\w.]+)\.x$/.exec(obj.x)
  const yDot = /^([\w.]+)\.y$/.exec(obj.y)
  if (xDot && yDot && xDot[1] === yDot[1] && pins[xDot[1]]) {
    obj.nx = pins[xDot[1]].nx
    obj.ny = pins[xDot[1]].ny
    return
  }
  // General arithmetic.
  const nx = safeEval(obj.x, consts)
  const ny = safeEval(obj.y, consts)
  if (typeof nx === 'number' && typeof ny === 'number') {
    obj.nx = nx
    obj.ny = ny
  }
}

/** Does the axis-aligned segment from A to B pass through point P
 *  (with all three having numeric coords)? Returns true only for
 *  STRICT INTERIOR pass-throughs — endpoints handled separately. */
function segmentPassesThrough(A, B, P) {
  if (A.nx === undefined || B.nx === undefined || P.nx === undefined) return false
  // Horizontal segment
  if (A.ny === B.ny && A.ny === P.ny) {
    const lo = Math.min(A.nx, B.nx)
    const hi = Math.max(A.nx, B.nx)
    return P.nx > lo && P.nx < hi
  }
  // Vertical segment
  if (A.nx === B.nx && A.nx === P.nx) {
    const lo = Math.min(A.ny, B.ny)
    const hi = Math.max(A.ny, B.ny)
    return P.ny > lo && P.ny < hi
  }
  return false
}

/** Map a 0-based character offset back to a 1-based source line number. */
function lineNumberAt(src, offset) {
  let line = 1
  for (let i = 0; i < offset && i < src.length; i++) if (src[i] === '\n') line++
  return line
}

function extractWires(src) {
  // Match <Wire …points={[ … ]} … />
  // We only care about the inner polyline, not other attrs.
  const wires = []
  const wireRe = /<Wire\b[^>]*?\bpoints=\{\s*\[([\s\S]*?)\]\s*\}/g
  let m
  while ((m = wireRe.exec(src)) !== null) {
    const inner = m[1]
    const points = []
    // Walk the inner contents and pull out each top-level point. A point
    // is either `{ x: EXPR, y: EXPR }` (literal object) or a bare
    // identifier-like expression `Q1.base`, `vR1.p1`, … (these come
    // from pin helpers and refer to a Point object). Both forms get
    // dual keys so a `<Junction>` written as `x={ident.x} y={ident.y}`
    // can match a wire point written as the bare `ident`.
    let depth = 0
    let buf = ''
    const flush = () => {
      const piece = buf.trim().replace(/^,/, '').trim()
      buf = ''
      if (!piece) return
      const litMatch = /^\{\s*x:\s*([^,}]+?)\s*,\s*y:\s*([^,}]+?)\s*\}$/.exec(piece)
      if (litMatch) {
        const x = litMatch[1].trim()
        const y = litMatch[2].trim()
        const keys = [pointKey(x, y)]
        // Synthesise a base-identifier alias if the literal is
        // `{ x: IDENT.x, y: IDENT.y }` so it matches a Junction-as-bare-
        // identifier form (rare but possible).
        const xDot = /^([\w.]+)\.x$/.exec(x)
        const yDot = /^([\w.]+)\.y$/.exec(y)
        if (xDot && yDot && xDot[1] === yDot[1]) keys.push(`@${xDot[1]}`)
        points.push({ raw: piece, x, y, keys })
        return
      }
      // Bare identifier — `Q1.base`, `vR1.p1`, etc. Treat the whole
      // expression as an opaque point handle. Match it against any
      // Junction whose (x, y) reference the same base via `.x`/`.y`.
      const identMatch = /^[\w.[\]]+$/.exec(piece)
      if (identMatch) {
        points.push({ raw: piece, x: piece, y: piece, keys: [`@${piece}`] })
      }
      // Anything else (function calls, expressions) — leave unindexed.
      // The script will skip it; not a correctness issue, just reduced
      // coverage.
    }
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i]
      if (ch === '{' || ch === '[' || ch === '(') depth++
      else if (ch === '}' || ch === ']' || ch === ')') depth--
      if (ch === ',' && depth === 0) {
        flush()
        continue
      }
      buf += ch
    }
    flush()
    wires.push({ points, offset: m.index })
  }
  return wires
}

function extractJunctions(src) {
  const junctions = []
  const re = /<Junction\b([^>]*?)\/>/g
  let m
  while ((m = re.exec(src)) !== null) {
    const attrs = m[1]
    const xMatch = /\bx=\{([^}]+)\}/.exec(attrs)
    const yMatch = /\by=\{([^}]+)\}/.exec(attrs)
    if (xMatch && yMatch) {
      const x = xMatch[1].trim()
      const y = yMatch[1].trim()
      const keys = [pointKey(x, y)]
      // If the Junction reads `x={IDENT.x} y={IDENT.y}` with the same
      // base, also match wire points written as the bare `IDENT`.
      const xDot = /^([\w.]+)\.x$/.exec(x)
      const yDot = /^([\w.]+)\.y$/.exec(y)
      if (xDot && yDot && xDot[1] === yDot[1]) keys.push(`@${xDot[1]}`)
      junctions.push({
        x, y, keys,
        text: m[0].replace(/\s+/g, ' '),
        offset: m.index,
      })
    }
  }
  return junctions
}

/** Pin names returned by the project's pin-helper functions. A Junction
 *  at `IDENT.<pinName>` indicates the dot sits at a component pin —
 *  which contributes +1 conductor (the component's body wired through
 *  that pin) in addition to whatever wires connect there. */
const KNOWN_PIN_NAMES = new Set([
  // pins2 — two-terminal components (resistor, cap, inductor, diode, …)
  'p1', 'p2',
  // pinsBJT — base/collector/emitter
  'base', 'collector', 'emitter',
  // pinsMOSFET — gate/drain/source
  'gate', 'drain', 'source',
  // pinsOpAmp — inv/non/out
  'inv', 'non', 'out',
])

function componentPinContribution(junction, wires) {
  // (a) Direct textual match — Junction at `IDENT.<pinName>` already
  // resolved via the synthesised `@IDENT.pinName` alias.
  for (const key of junction.keys) {
    if (!key.startsWith('@')) continue
    const ident = key.slice(1)
    const dot = ident.lastIndexOf('.')
    if (dot < 0) continue
    const pinName = ident.slice(dot + 1)
    if (KNOWN_PIN_NAMES.has(pinName)) return 1
  }
  // (b) Numeric match — Junction at a literal `{x, y}` whose numeric
  // coordinates equal some wire vertex written as a known pin
  // reference (e.g., `tr.collector`). The wire vertex carries a key
  // like `@tr.collector`; same component contributes the conductor.
  if (junction.nx === undefined) return 0
  for (const wire of wires) {
    for (const p of wire.points) {
      if (p.nx === undefined) continue
      if (p.nx !== junction.nx || p.ny !== junction.ny) continue
      for (const k of p.keys) {
        if (!k.startsWith('@')) continue
        const ident = k.slice(1)
        const dot = ident.lastIndexOf('.')
        if (dot < 0) continue
        const pinName = ident.slice(dot + 1)
        if (KNOWN_PIN_NAMES.has(pinName)) return 1
      }
    }
  }
  return 0
}

function vertexMatches(point, junction, junctionKeySet) {
  if (point.keys.some((k) => junctionKeySet.has(k))) return true
  // Numeric fallback — a wire endpoint at `tr.collector` and a junction
  // at `{ x: TR_COL_X, y: RC_Y }` can resolve to the same (x, y) even
  // when the textual forms diverge.
  if (point.nx !== undefined && junction.nx !== undefined) {
    return point.nx === junction.nx && point.ny === junction.ny
  }
  return false
}

function countDirections(junction, wires) {
  let count = 0
  const junctionKeySet = new Set(junction.keys)
  for (const wire of wires) {
    // Pass 1 — explicit vertex matches (textual or numeric).
    let vertexHit = false
    for (let i = 0; i < wire.points.length; i++) {
      if (vertexMatches(wire.points[i], junction, junctionKeySet)) {
        vertexHit = true
        if (i === 0 || i === wire.points.length - 1) count += 1
        else count += 2
      }
    }
    if (vertexHit) continue
    // Pass 2 — numeric pass-through. The wire doesn't list this point
    // as a vertex, but a segment may visually run through it. Counts
    // as +2 conductor directions (back AND forward through the segment).
    for (let i = 0; i + 1 < wire.points.length; i++) {
      if (segmentPassesThrough(wire.points[i], wire.points[i + 1], junction)) {
        count += 2
        break  // a wire passes through P at most once for our purposes
      }
    }
  }
  // Pass 3 — component body. If the junction sits at a pin reference
  // (e.g., `vR1.p1.x, vR1.p1.y`), the component itself contributes the
  // third conductor at that point. Without this the script would flag
  // every meter-tap junction (Wire-in + Wire-out = 2 directions) as
  // spurious, even though it's a real T-joint counting the resistor.
  count += componentPinContribution(junction, wires)
  return count
}

function walkDiagrams(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walkDiagrams(p, out)
    else if (entry.name.endsWith('.tsx')) out.push(p)
  }
  return out
}

const files = walkDiagrams(DIAGRAMS_DIR)
const issues = []

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf-8')
  const src = blankBlockComments(raw)
  const consts = buildConstantMap(src)
  const pins = buildPinResolutions(src, consts)
  const wires = extractWires(src)
  const junctions = extractJunctions(src)
  // Attach numeric coords to every wire-vertex and every junction so
  // `segmentPassesThrough` can detect interior pass-throughs.
  for (const w of wires) for (const p of w.points) attachNumeric(p, consts, pins)
  for (const j of junctions) attachNumeric(j, consts, pins)
  const rel = path.relative(ROOT, file)
  for (const j of junctions) {
    const dirs = countDirections(j, wires)
    if (dirs < 3) {
      issues.push({
        file: rel,
        line: lineNumberAt(raw, j.offset),
        text: j.text,
        directions: dirs,
      })
    }
  }
}

if (issues.length === 0) {
  console.log(
    `check-junction-placement OK — every <Junction> in src/components/diagrams/ ` +
    `sits at a real 3+ wire conductor convergence.`
  )
  process.exit(0)
}

console.log(
  `check:junction-placement FAIL — ${issues.length} spurious <Junction>(s) at ` +
  `L-corners or 2-wire bends (not T-joints):\n`
)
for (const i of issues) {
  console.log(`  [${i.file}:${i.line}] ${i.text}`)
  console.log(
    `    Only ${i.directions} conductor direction(s) at this point — ` +
    `junction dots require 3+.`
  )
}
console.log('\nFix:')
console.log('  • Remove the <Junction> if the point is just an L-corner inside one <Wire> polyline.')
console.log('  • Or restructure the wires so 3+ separate conductors actually converge here.')
console.log(
  '  • See .claude/skills/diagram-quality/references/circuit-schematics.md ' +
  '§ «Schematic junction dots»',
)
process.exit(1)
