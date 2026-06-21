#!/usr/bin/env node
/**
 * Glossary-tag-on-compound mismatch gate.
 *
 * The bug this exists to catch (ch3.2, June 2026, reader-flagged):
 *
 *     <strong><react>реактивний</react> модулятор</strong>
 *
 * The glossary tag `<react>` wraps only the LEADING adjective of a two-word
 * bold compound, while the head noun («модулятор») sits bare outside the tag.
 * `<react>` resolves to the glossary entry for «реактивний опір» (reactance —
 * an electrical PROPERTY), but the bold term the reader sees and clicks is
 * «реактивний модулятор» (a transmitter STAGE). So the popover defined a
 * different concept than the term it was attached to. The reader clicked the
 * stage name and got the property's definition.
 *
 * No existing gate caught it: glossary checks verify the entry EXISTS
 * (completeness), is USED (coverage) and is not OVER-wrapped (overwrap) — none
 * compare the MEANING of the wrapped span against the compound it sits in.
 * `beginner-review` (semantic) missed it too.
 *
 * What this gate flags
 * ────────────────────
 * A `<strong>` whose entire content is exactly
 *
 *     <gtag>leading word(s)</gtag> <single-head-noun>
 *
 * i.e. a glossary/chapter tag wrapping a strict leading modifier of a tight
 * two-part compound, with the head noun left bare. That STRUCTURE is the
 * smell — the popover will describe the modifier's concept, not the compound.
 *
 * It deliberately does NOT fire on:
 *   • `<strong>` spanning a whole phrase/sentence (more than one trailing word)
 *     — there the tag legitimately links a sub-term and the rest is prose.
 *   • the tag wrapping the head noun with a leading qualifier outside it
 *     (`occupied <bw>bandwidth</bw>`) — that links the genuine head concept.
 *   • the tag wrapping the WHOLE compound (`<lpf>low-pass filter</lpf>`) — the
 *     entry IS the compound, so the popover matches.
 *
 * When a flagged case is genuinely fine (the wrapped modifier is itself the
 * real referent, or it is a standalone concept worth linking), add it to
 * ALLOWLIST with a one-line justification — same discipline as the diagram
 * SKIP_FILES lists. A NEW unexplained hit is a real authoring bug: either
 * wrap the whole compound, move the link to the head noun, or drop the link.
 */
import fs from 'node:fs'

const STRUCT = new Set(['var', 'em', 'strong', 'sub', 'sup', 'b', 'i', 'br'])

/**
 * Reviewed-acceptable compounds, keyed `i18nKey|tag`. Each carries the reason
 * the leading-modifier link is correct here. Covers both locales for a key.
 */
const ALLOWLIST = new Map([
  ['ch1_5.geometryVars|diel',
    '«dielectric» links to the dielectric material — the genuine referent of «the constant OF the dielectric»; the head noun «constant»/«проникність» is the quantity, the link is to its owner.'],
  ['ch1_8.introPreview|lc',
    '«LC» is a standalone concept (an inductor–capacitor pair); «LC filters» are filters built from one, so linking the qualifier to the LC entry is on-topic.'],
  ['ch1_9.introPreview|inductance',
    'Ukrainian word order puts the head noun «індуктивність» first; the tag wraps the HEAD noun (correct), «розсіяння» is the genitive qualifier — «leakage inductance» IS a kind of inductance.'],
])

const FILES = [
  ['EN', 'src/i18n/locales/en/ui.json'],
  ['UA', 'src/i18n/locales/uk/ui.json'],
]

const findings = []
const usedAllow = new Set()

for (const [loc, file] of FILES) {
  const root = JSON.parse(fs.readFileSync(file, 'utf8'))
  ;(function walk(o, path) {
    for (const k in o) {
      const v = o[k]
      const p = path ? `${path}.${k}` : k
      if (typeof v === 'string') {
        for (const m of v.matchAll(/<strong>(.*?)<\/strong>/g)) {
          const inner = m[1].trim()
          // entire <strong> body == <gtag>X</gtag> <one bare word>
          const tm = inner.match(/^<([A-Za-z]+)>([^<]+)<\/\1>\s+(\S+)$/u)
          if (!tm) continue
          const [, tag, wrapped, head] = tm
          if (STRUCT.has(tag)) continue
          if (!/^\p{L}[\p{L}\p{N}-]*[.,]?$/u.test(head)) continue
          const id = `${p}|${tag}`
          if (ALLOWLIST.has(id)) { usedAllow.add(id); continue }
          findings.push({ loc, key: p, tag, wrapped, head, full: m[0] })
        }
      } else if (v && typeof v === 'object') {
        walk(v, p)
      }
    }
  })(root, '')
}

// Stale-allowlist hygiene: an entry that no longer matches anything is dead.
const stale = [...ALLOWLIST.keys()].filter(id => !usedAllow.has(id))

if (findings.length === 0 && stale.length === 0) {
  console.log(
    `check:glossary-compound-mismatch OK — no glossary tag wraps the leading ` +
    `modifier of a bold compound (${ALLOWLIST.size} reviewed exception(s)).`,
  )
  process.exit(0)
}

if (findings.length) {
  console.error('Glossary-compound mismatch — a glossary tag wraps only the LEADING')
  console.error('modifier of a bold compound; its popover will describe the modifier,')
  console.error('not the compound the reader clicked. Wrap the whole compound, move the')
  console.error('link to the head noun, or drop it (or allowlist with a justification):\n')
  for (const f of findings) {
    console.error(`  ${f.loc}  ${f.key}`)
    console.error(`      ${f.full}`)
    console.error(`      tag <${f.tag}> wraps «${f.wrapped}», bare head noun «${f.head}»\n`)
  }
}
if (stale.length) {
  console.error('Stale ALLOWLIST entries (no longer match any string — remove them):')
  for (const id of stale) console.error(`  ${id}`)
}
process.exit(1)
