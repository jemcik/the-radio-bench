#!/usr/bin/env node
/**
 * check-circuit-maxwidth — fail when a `<Circuit …>` is rendered without a
 * `maxWidth` prop (and without a `legend`, which self-caps the SVG).
 *
 * Why this exists: `Circuit` wraps its SVG in `SVGDiagram`, which sets
 * `width="100%"`. Without `maxWidth`, a small viewBox (e.g. 470) scales UP
 * to fill the ~960 px chapter column — ~2× — and every `TerminalLabel`
 * (whose fontSize is in user-space units) inflates by the same factor.
 * ch3.4 `ShuntMultiplierSchematic` shipped this way: 14 px labels rendered
 * ~34 px and descended onto the meter symbols. The user caught it on screen;
 * neither the text-overlap gate (renders at viewBox scale) nor a screenshot
 * glance caught the size. This gate makes the machine catch the pairing.
 *
 * The `legend` branch of `Circuit` puts the SVG in a `max-w-[560px]`
 * container that already caps its render width, so a `legend` Circuit is
 * exempt. Every non-legend Circuit must pass `maxWidth={W}` (usually equal
 * to its `width`), which caps the figure at its natural size (scale ≤ 1×).
 *
 * Exit code: 0 clean, 1 on findings.
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
    else if (ent.isFile() && /\.tsx$/.test(ent.name) && !/\.test\.tsx$/.test(ent.name)) out.push(p)
  }
  return out
}

/**
 * Return the props text of every `<Circuit …>` opening tag in `src`.
 * Scans from `<Circuit` to the `>` that closes the opening tag, tracking
 * `{}` depth so a `>` inside a `{…}` expression (e.g. `caption={<Trans/>}`)
 * does not end the tag early. Also tracks line number of the tag start.
 */
function circuitOpeningTags(src) {
  const tags = []
  const re = /<Circuit\b/g
  let m
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length
    let depth = 0
    let props = ''
    for (; i < src.length; i++) {
      const ch = src[i]
      if (ch === '{') depth++
      else if (ch === '}') depth--
      else if (ch === '>' && depth === 0) break
      props += ch
    }
    const line = src.slice(0, m.index).split('\n').length
    tags.push({ props, line })
  }
  return tags
}

const files = SEARCH_DIRS.flatMap(d => {
  const abs = path.join(ROOT, d)
  return fs.existsSync(abs) ? walk(abs) : []
})

const issues = []
for (const file of files) {
  const src = fs.readFileSync(file, 'utf-8')
  if (!src.includes('<Circuit')) continue
  for (const { props, line } of circuitOpeningTags(src)) {
    const hasMaxWidth = /\bmaxWidth\s*=/.test(props)
    const hasLegend = /\blegend\s*=/.test(props)
    if (!hasMaxWidth && !hasLegend) {
      issues.push(`${path.relative(ROOT, file)}:${line}  <Circuit> without maxWidth (and no legend)`)
    }
  }
}

if (issues.length) {
  console.error('check-circuit-maxwidth FAIL — these <Circuit> elements will scale up to fill')
  console.error('the chapter column, inflating TerminalLabel text (user-space fontSize):\n')
  for (const i of issues) console.error('  ' + i)
  console.error('\nFix: add `maxWidth={W}` (usually equal to the Circuit `width`) so the figure')
  console.error('caps at its natural size. A Circuit with a `legend` prop is exempt (its SVG is')
  console.error('already capped at max-w-[560px]).')
  process.exit(1)
}
console.log(`check-circuit-maxwidth OK — every <Circuit> caps its render width (maxWidth or legend).`)
