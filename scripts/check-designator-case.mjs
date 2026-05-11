#!/usr/bin/env node
/**
 * check-designator-case — flag lowercase math-identifier strings in
 * circuit-primitive props (`label="…"`, `value="…"`, `letter="…"`).
 *
 * Why
 * ───
 * Lowercase Latin letters (`v_in`, `i_C`, `r_b`, …) have shorter
 * cap-heights than uppercase ones (`V_in`, `L`, `C`) at the same
 * `font-size`. When one schematic mixes lowercase-base designators
 * («v_in») with uppercase component letters («L», «C») the glyphs
 * read as different sizes side-by-side, even though their SVG
 * `font-size` attributes are identical. Past reader report on
 * `LcSeriesSchematic`: «v_in уикористовує інший розмір шрифту, ніж
 * L або C» — caused by lowercase «v» x-height being ≈ 7 px while
 * uppercase «L»/«C» cap-height ≈ 10 px at fontSize=14.
 *
 * What this gate flags
 * ────────────────────
 * Any `label="X..."`, `value="X..."`, `letter="X..."` attribute in
 * `src/components/diagrams/**\/*.tsx` where the FIRST character of
 * the string value is a lowercase Latin letter AND the next character
 * is `_` (i.e. the pattern is a math identifier with a subscript —
 * `^[a-z]_`). Multi-letter lowercase words like `coil`, `motor`,
 * `peak` are NOT flagged — they're descriptive labels, not designators
 * that need to match the uppercase-component-letter typography.
 *
 * Opt-out
 * ───────
 * Place a `// lowercase-designator-ok: <reason>` comment on the line
 * directly above the flagged attribute. Use this only when lowercase
 * is genuinely intentional (e.g. teaching the AC-instantaneous vs
 * DC-quantity notation where the lowercase letter IS the textbook
 * convention).
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

const SCAN_DIRS = [
  'src/components/diagrams',
  'src/components/chapter-heroes',
  'src/components/widgets',
  'src/chapters',
]

const PROP_RE = /\b(label|value|letter)="([^"]*)"/g
const LOWERCASE_DESIGNATOR_RE = /^[a-z]_/

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

const findings = []
const files = SCAN_DIRS.flatMap(d => walk(join(repoRoot, d)))

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    PROP_RE.lastIndex = 0
    let m
    while ((m = PROP_RE.exec(line)) !== null) {
      const value = m[2]
      if (!LOWERCASE_DESIGNATOR_RE.test(value)) continue
      // Check for opt-out comment on the preceding line.
      const prev = lines[i - 1] || ''
      if (/lowercase-designator-ok:/.test(prev)) continue
      const rel = file.replace(repoRoot + '/', '')
      findings.push({ file: rel, line: i + 1, prop: m[1], value })
    }
  }
}

if (findings.length > 0) {
  console.error(
    `Found ${findings.length} lowercase math-identifier designator(s) in circuit-primitive props (pattern \`^[a-z]_\`):\n`,
  )
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  ${f.prop}="${f.value}"`)
  }
  console.error(`
Lowercase Latin letters have shorter cap-heights than uppercase at the
same fontSize, so a label like \`v_in\` reads as visually smaller than
\`L\` / \`C\` / \`R\` on the same schematic. Standard convention is
uppercase for circuit-quantity identifiers.

Fix: rename to uppercase (e.g. \`v_in\` → \`V_in\`).
Opt-out (only if lowercase is the load-bearing pedagogical choice —
e.g. teaching AC-instantaneous notation): place
  // lowercase-designator-ok: <reason>
on the line directly above the attribute.
`)
  process.exit(1)
}

console.log(
  `check-designator-case OK: ${files.length} file(s) scanned, no lowercase math-identifier designators.`,
)
