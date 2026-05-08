#!/usr/bin/env node
/**
 * check-circuit-conventions
 * ─────────────────────────
 * Mechanical enforcement of conventions in
 * `.claude/skills/diagram-quality/references/circuit-schematics.md`
 * that previously relied on me reading the doc and remembering. The
 * doc-only enforcement failed at least once: the «<Ground> vs battery
 * — don't show both» rule was written after an earlier fix but was
 * still violated in ZenerRegulatorSchematic, caught only by the user
 * during review. Documentation alone isn't enough — convention
 * violations need a gate.
 *
 * Currently checks one rule:
 *
 *   1. <Ground> must not appear in a schematic that also uses
 *      <Battery> / <BatteryMulti> as an explicit two-terminal source.
 *      The battery's «−» terminal IS the reference; adding a
 *      separate Ground symbol creates the illusion of two distinct
 *      references where there is one. The rule has two recognised
 *      exceptions (per circuit-schematics.md):
 *        (a) supply drawn as a bare terminal label, no Battery — n/a
 *            for this check (no Battery in file).
 *        (b) several branches share a common return rail and Ground
 *            helps declutter (e.g. transistor-stage circuits where
 *            the ARRL convention is an explicit ground at the
 *            emitter return).
 *      For (b) the author opts out by adding a `// ground-with-
 *      battery-ok: <reason>` comment on the line directly above the
 *      `<Ground …>` element.
 *
 * Future rules to add as they get violated:
 *   • Junction dot at every T-joint, NEVER at a plain corner. Hard
 *     to detect statically (requires parsing `<Wire>` paths and
 *     intersecting them with `<Junction>` positions); deferred until
 *     someone re-violates and feels the pain again.
 *   • Battery `label` AND `value` both supplied when only `value`
 *     should be used (single-battery schematics).
 *   • Multiple coordinate sources for the same component — pin
 *     helper and JSX render not derived from a single `const`.
 *
 * Exit code: 0 on clean, 1 on findings.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIAGRAMS_DIR = path.join(ROOT, 'src/components/diagrams')

const SKIP_FILE_RE = /\.(test|stories)\.tsx?$/

const BATTERY_IMPORT_RE = /\b(Battery|BatteryMulti)\b/
const GROUND_USAGE_RE = /<\s*(Ground|GroundEarth)\b/g
// Match the opt-out marker phrase in any comment style — single-line
// `//`, JS block `/* */`, or JSX block `{/* */}`. We just look for the
// phrase itself; the surrounding loop only consults this regex while
// already walking inside a comment span.
const OPT_OUT_RE = /\bground-with-battery-ok\b/

function listFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(name => name.endsWith('.tsx') && !SKIP_FILE_RE.test(name))
    .map(name => path.join(dir, name))
}

const findings = []

// Strip JSX block comments (the `{` + `/`+`*` ... `*`+`/` + `}` form)
// and plain JS block comments before scanning. Replaces each comment
// span with spaces so line numbers stay correct. Without this, an
// opt-out comment that mentions the `<Ground>` glyph literally would
// re-trigger the very rule it's opting out of.
function stripBlockComments(src) {
  const out = []
  let i = 0
  while (i < src.length) {
    const jsx = src.indexOf('{/*', i)
    const js  = src.indexOf('/*', i)
    // Pick the earliest comment opener (preferring JSX so `{/*` wins
    // over the `/*` inside it).
    let start = -1
    let closer = ''
    if (jsx >= 0 && (js < 0 || jsx <= js)) { start = jsx; closer = '*/}' }
    else if (js >= 0)                      { start = js;  closer = '*/'  }
    if (start < 0) { out.push(src.slice(i)); break }
    out.push(src.slice(i, start))
    const end = src.indexOf(closer, start + closer.length)
    if (end < 0) {
      // Unterminated comment — drop the rest as one big comment.
      out.push(src.slice(start).replace(/[^\n]/g, ' '))
      break
    }
    const span = src.slice(start, end + closer.length)
    out.push(span.replace(/[^\n]/g, ' '))
    i = end + closer.length
  }
  return out.join('')
}

for (const file of listFiles(DIAGRAMS_DIR)) {
  const rawText = fs.readFileSync(file, 'utf8')
  // `rawLines` carries comment text intact — the opt-out walker reads
  // these so `{/* ground-with-battery-ok: … */}` (JSX block comment)
  // and `// ground-with-battery-ok: …` (line comment) both work.
  const rawLines = rawText.split('\n')
  // `text` has block comments stripped — the actual `<Ground …>`
  // matcher reads this so a comment that mentions «<Ground>» literally
  // (e.g. an opt-out rationale) doesn't itself trigger the rule.
  const text = stripBlockComments(rawText)
  const strippedLines = text.split('\n')

  // Quick gate: file must mention BOTH Battery (or BatteryMulti) and
  // Ground (or GroundEarth). If not, no possible violation.
  if (!BATTERY_IMPORT_RE.test(text)) continue
  // Battery present — find each Ground usage and check for opt-out.
  GROUND_USAGE_RE.lastIndex = 0
  let m
  while ((m = GROUND_USAGE_RE.exec(text)) !== null) {
    const idx = m.index
    const lineNum = text.slice(0, idx).split('\n').length

    // Walk upward looking for the opt-out marker in raw lines. A line
    // counts as «inside a comment» whenever stripped[li] differs from
    // raw[li] (the stripper replaced its content with spaces). Stop
    // once we hit a line that is BOTH non-empty AND not part of a
    // comment — that's code, the opt-out window is over. Scan up to
    // 12 lines back so a verbose multi-line rationale still counts.
    let optOut = false
    for (let li = lineNum - 2; li >= Math.max(0, lineNum - 13); li--) {
      const raw = rawLines[li]
      if (raw === undefined) continue
      if (OPT_OUT_RE.test(raw)) {
        optOut = true
        break
      }
      const stripped = strippedLines[li] ?? ''
      const isInsideComment = raw !== stripped
      const isBlank = raw.trim() === ''
      const isLineComment = raw.trim().startsWith('//')
      if (!isInsideComment && !isBlank && !isLineComment) {
        // Hit code — opt-out window has ended.
        break
      }
    }
    if (optOut) continue

    findings.push({
      file: path.relative(ROOT, file),
      line: lineNum,
      glyph: m[1],
    })
  }
}

if (findings.length === 0) {
  console.log('check-circuit-conventions OK: no <Ground> in any schematic that also uses <Battery>.')
  process.exit(0)
}

console.error('check-circuit-conventions FAIL — these schematics use <Ground> alongside an explicit <Battery>:')
console.error('')
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}    <${f.glyph} … />`)
}
console.error('')
console.error('Why this is a bug (per .claude/skills/diagram-quality/references/circuit-schematics.md →')
console.error('«<Ground> vs battery — don\'t show both»):')
console.error('')
console.error('  An explicit two-terminal Battery already defines the 0 V reference')
console.error('  via its «−» terminal. Adding a separate Ground symbol creates the')
console.error('  illusion of two distinct references where there is one. Beginner')
console.error('  readers (the target audience of this course) read it as «is GND')
console.error('  the same as battery −? they look different — must be different».')
console.error('')
console.error('Fix:')
console.error('  • Default action: remove the <Ground … /> and any wire stub feeding it.')
console.error('    The bottom rail going back to the battery «−» pin is sufficient.')
console.error('  • Legitimate exception (per the doc): multi-stage circuit where the')
console.error('    Ground symbol genuinely declutters a shared return — e.g. a transistor')
console.error('    stage whose emitter convention is an explicit GND. In that case,')
console.error('    add `// ground-with-battery-ok: <one-line reason>` directly above')
console.error('    the `<Ground …>` element. The check then accepts that line.')
process.exit(1)
