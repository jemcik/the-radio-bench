#!/usr/bin/env node
/**
 * check-glossary-coverage — fail when a chapter's prose mentions a known
 * glossary term but never wraps any occurrence in a `<G>` / alias tag.
 *
 * Why: glossary tooltips are how readers explore terminology. A chapter
 * that mentions «inductor» 12 times but wraps it 0 times leaves readers
 * with an unstyled bare word — no underline, no tooltip, no popover.
 * That has shipped at least once (ch1.6 v1) and the human caught it.
 *
 * What it does, per chapter (`ch{X}_{Y}` blocks in en/ui.json):
 *   1. Concatenates every string value under the chapter block (skipping
 *      `widget` subtrees — those are widget UI labels, not prose).
 *   2. For each glossary key + display name, counts:
 *      a. Plain-text mentions: word-boundary matches outside of HTML
 *         attribute contexts (k="…", className="…", style attrs).
 *      b. Tag wraps: any chapter-local alias tag bound to this glossary
 *         key in the chapter's TSX (e.g. `<cap>` → `<G k="capacitor"/>`),
 *         plus literal `<G k="key">` usage.
 *   3. Flags terms with plain mentions ≥ 1 but wraps = 0.
 *
 * Exits 0 if clean, 1 if any chapter has unwrapped terms.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en/ui.json')
const GLOSSARY_PATH = path.join(ROOT, 'src/features/glossary/glossary.ts')
const CHAPTERS_DIR = path.join(ROOT, 'src/chapters')

// Generic / structural terms whose tooltips would feel intrusive on
// every chapter (band labels, ubiquitous units, the SI namespace).
// Glossary entries still exist; they just don't have to be wrapped
// in every chapter that mentions them.
const EXEMPT_TERMS = new Set([
  'si',
  'gnd', 'usb', 'ide',
  'hf', 'rf', 'vhf', 'uhf', 'fm', 'am', 'led',
  'arrl', 'cept', 'erc',
  'qrp', 'qso',
  'rms', 'pwm', 'esr',
  'ham radio',
  'mains',
  'sine wave', 'square wave',
  'volt/div', 'time/div',
  'true rms', 'peak-to-peak',
  'colour code', 'preferred value', 'power rating', 'surface mount',
  'dip chip', 'power rails',
  'dbm', 'dbd', 'dbi',
  'continuity', 'calibrated', 'cursor',
  'fourier', 'harmonic', 'logarithm', 'decade',
  'period', 'phase', 'amplitude', 'frequency',  // broad signal descriptors
  'voltage', 'current', 'resistance', 'power', 'watt', 'ampere', 'ohm', 'coulomb', 'charge',
  'efficiency',  // generic engineering ratio mentioned in many chapters
  'conductor', 'insulator', 'semiconductor',
  'topology', 'tolerance',
  'antenna', 'dipole', 'yagi', 'isotropic', 'coax', 'transceiver',
  'ionosphere', 'skywave', 'ground wave',
  'rectification',
  // Words with strong dual technical meanings that the bare-word regex
  // can't disambiguate:
  //  – «cutoff» means a transistor region (no I_C) AND a filter cutoff
  //    frequency (RC LPF f_c). Both are legitimate technical uses;
  //    chapter context disambiguates for the reader.
  //  – «kvl» (Kirchhoff's voltage law) is fundamental and mentioned in
  //    many chapters; named on first encounter in ch1_2 (Ohm's Law)
  //    and doesn't need re-tooltipping everywhere it surfaces.
  'cutoff',
  'kvl',
  'drift velocity', 'conventional current',
  'derivative', 'logarithm',
  'form factor', 'carrier',
  'multimeter', 'oscilloscope', 'breadboard', 'arduino', 'vna',
  'farad', 'henry', 'hertz',  // raw unit names
  'rc circuit',
  'dielectric', 'electrolytic',
  'coupling capacitor', 'bypass capacitor',
  'switch debouncing', 'debouncing',
  // Domain-shorthand glossary keys whose bare token («order», «family»,
  // «trap») collides far more often with idiomatic English («reading
  // order», «order of magnitude», «each family is tuned», «141 V is
  // the trap») than with the technical concept. The technical mention
  // (e.g. «filter order» / «filter family» / «trap dipole») in chapter
  // prose tends to be a multi-word phrase that the gate's bare-word
  // regex can't tell apart, so wrapping the bare word produces a wrong
  // tooltip more often than not. Glossary entries still exist; chapters
  // that genuinely need to point at them should wrap the qualified
  // phrase explicitly.
  'order', 'family', 'trap',
  // Foundational radio-wave terms (introduced in ch2.1) that recur across
  // many chapters as ordinary prose words — like «frequency», «antenna»,
  // «voltage» above. The glossary entries exist and ch2.1 wraps them where
  // they're taught; every later chapter that says «magnetic field» or
  // «wavelength» needn't re-tooltip them.
  'electric field', 'magnetic field', 'electromagnetic wave', 'radio wave',
  'wavelength', 'speed of light', 'electromagnetic spectrum', 'polarisation',
])

// Per-chapter exemptions for terms that ARE in the glossary in general
// but, in this specific chapter, occur only inside non-prose strings
// (table examples, aria-labels, units-table cell labels) where a
// `<G>` wrap would render as literal text or break aria semantics, OR
// are alias-tag self-matches (the gate's bare-word regex catching the
// alias name itself inside a `<diode>diode testing</diode>` span).
const EXEMPT_PER_CHAPTER = {
  // ch0_2 «diode» — the only mentions are inside `<diode>diode testing</diode>`
  // alias spans (alias maps to the «diode testing» glossary key, not
  // «diode»); the gate's bare-word regex catches the alias name itself.
  // «modulation» — appears only inside «PWM output (Pulse Width
  // Modulation)», the inline expansion of PWM; not the radio-modulation
  // concept (taught in ch2_2).
  ch0_2: new Set(['diode', 'modulation']),
  // ch0_3: «impedance» and «inductance» occur ONLY in non-wrappable
  // contexts — SI-prefix table examples («50 Ω impedance») driven by
  // src/features/si/prefixes.ts and rendered via a raw t() call, or
  // a units-quantity table cell label («Inductance»). «capacitor» is
  // NOT exempt: it has a wrappable mention in `quiz_q2_explanation`
  // («A 100 µF capacitor stores …»), and a single wrap satisfies the
  // gate even with the additional non-wrappable table-example mention.
  ch0_3: new Set(['impedance', 'inductance']),
  // ch1_1 «tank» — water-tower analogy in waterPipeAriaLabel, NOT a
  // tank-circuit reference. The gate's word-boundary regex can't tell
  // them apart.
  // «transistor» — forward-reference in the conductor/semiconductor
  // introduction; passing mention, not concept-focal.
  ch1_1: new Set(['tank', 'transistor']),
  // ch1_4 «potentiometer» — only in heroAriaLabel; aria-label is a
  // plain-string attribute and can't carry a `<G>` wrap.
  ch1_4: new Set(['potentiometer']),
  // ch0_5 «How to Read a Schematic» introduces transistor/NPN/PNP/base/
  // collector/emitter as part of its symbol vocabulary, but the chapter
  // is about reading schematics — actual transistor behaviour is taught
  // in ch1_11. Wrapping every symbol mention here would tooltip-bomb
  // the symbol-card layouts (which are mostly aria-label / heading
  // contexts that can't carry `<G>` tags cleanly).
  // «dc» and «inductor» each appear ONLY in non-prose contexts.
  // dc → symbolBatteryDesc (rendered via raw `t()` to a `description`
  // prop, not Trans, so JSX `<G>` won't render). inductor →
  // symbolInductorName (one-word symbol-card heading «Inductor (coil)»;
  // wrapping the entire heading would turn the whole title into a
  // tooltip target and disrupt the symbol-card layout).
  ch0_5: new Set(['dc', 'inductor', 'transistor', 'npn', 'pnp', 'base', 'collector', 'emitter']),
  // ch1_10 «capacitance» — same pattern as ch1_6's «time constant».
  // The varactor entry uses «junction capacitance» (a separate
  // glossary key with its own definition — depletion-region physics,
  // not capacitor-plate physics) wrapped via the `capN` alias. The
  // bare-word regex sees «capacitance» inside «junction capacitance»
  // and counts it as unwrapped. The wider phrase IS the correct
  // tooltip target here.
  ch1_10: new Set(['capacitance', 'transistor', 'base', 'gate', 'drain']),
  // ch1_2 «drain» — passing reference (parasitic drain on a battery
  // analogy), not a FET drain terminal.
  // «modulation» — only in the power-ladder label «small AM broadcast
  // station (amplitude modulation)»; «envelope» — only in the idiom
  // «back-of-envelope sanity check», not the AM envelope. Both are taught
  // (and wrapped) in ch2_2, not this Ohm's-Law chapter.
  ch1_2: new Set(['drain', 'modulation', 'envelope']),
  // ch1_3 «base» — passing reference (e.g. «base of …»), not a BJT
  // base terminal. The English bare word collides.
  ch1_3: new Set(['base']),
  // ch1_5 «drain» — passing reference (charge draining off a cap),
  // not a FET drain.
  ch1_5: new Set(['mlcc', 'pcb', 'drain']),
  // ch1_6 — transistor/base/collector mentioned in coil-driver lab
  // and ferrite-bead context; passing references, not the chapter's
  // focus (inductors). Concept-focal coverage lives in ch1_11.
  ch1_6: new Set(['time constant', 'transistor', 'base', 'collector']),
  // ch1_7 — transistor/collector/drain in tank-circuit driver context;
  // passing references, not concept-focal.
  // «sideband» — appears only inside the already-wrapped «<ssb>SSB</ssb>
  // (single-sideband voice)» expansion; the bare-word regex catches
  // «sideband» inside that phrase. Concept taught in ch2_2.
  ch1_7: new Set(['solenoid', 'transistor', 'collector', 'drain', 'sideband']),
  // ch1_8 «gate» — passing reference («gate-keeper» metaphor or logic
  // gate), not a FET gate terminal.
  // «baseband» — passing reference in the aliasing aside («fold back into
  // the baseband as aliases»); the baseband concept is taught in ch2_2.
  // «linear amplifier» — false substring match: the only occurrence is
  // «the non-linear amplifier» in quiz_q7_b. The linear-amplifier concept
  // is taught and wrapped in ch2_3.
  ch1_8: new Set(['gate', 'baseband', 'linear amplifier']),
  // ch1_11: «impedance» appears only inside the wrapped «<inI>input
  // impedance</inI>» phrase (mapped to the «input impedance» glossary
  // key — a more specific tooltip target than the bare-word «impedance»
  // entry). Same pattern as ch1_6's «time constant» / ch1_10's
  // «capacitance». «emi» is a glossary key the gate's bare-word regex
  // catches inside the chapter's «<emi>emitter</emi>» alias span — a
  // false self-match (alias name collides with an unrelated glossary
  // key). Other false-positives caught by ch1_11 prose:
  //   – «base» mentions inside the «base–emitter junction» that we
  //     already wrap on first occurrence; the regex still catches
  //     the second occurrence inside the wrapped phrase.
  // ch1_11: «impedance» appears only inside the wrapped «<inI>input
  // impedance</inI>» phrase (mapped to the «input impedance» glossary
  // key — a more specific tooltip target than the bare-word «impedance»
  // entry). «emi» is a glossary key the gate's bare-word regex catches
  // inside the chapter's «<emi>emitter</emi>» alias span — a false
  // self-match.
  // «saturation» — the bare-word matches the magnetic-core saturation
  // glossary entry (an inductor/transformer concept), but in this
  // chapter every occurrence is about TRANSISTOR saturation, glossed
  // via the dedicated «transistor saturation» entry (wrapped via the
  // <sat> alias on first occurrence). Magnetic-core saturation is
  // irrelevant in this chapter.
  ch1_11: new Set(['impedance', 'emi', 'saturation']),
}

function readGlossaryKeys() {
  const src = fs.readFileSync(GLOSSARY_PATH, 'utf-8')
  const out = []
  for (const line of src.split('\n')) {
    const m = line.match(/^\s{2}(?:'([^']+)'|"([^"]+)"|([a-zA-Z][\w-]*)):\s*\{/)
    if (m) out.push(m[1] ?? m[2] ?? m[3])
  }
  return out
}

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'))
const names = en.glossary?._names ?? {}

const glossaryKeys = readGlossaryKeys().filter(k => !EXEMPT_TERMS.has(k))

function* allStrings(node) {
  if (typeof node === 'string') yield node
  else if (Array.isArray(node)) for (const v of node) yield* allStrings(v)
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'widget') continue
      yield* allStrings(v)
    }
  }
}

const chapterIds = Object.keys(en).filter(k => /^ch\d+_\d+$/.test(k))

function findTsxForChapter(chId) {
  const want = chId.replace('ch', 'Chapter') + '.tsx'
  const stack = [CHAPTERS_DIR]
  while (stack.length) {
    const d = stack.pop()
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.isFile() && e.name === want) return p
    }
  }
  return null
}

/**
 * Build a single global alias→glossary-key map by scanning every .tsx
 * file under `src/components/widgets` and `src/components/diagrams`.
 * Widgets that render chapter i18n keys via `<Trans>` define alias
 * bindings in their own `components` props — those bindings ARE
 * available to whichever chapter uses the widget, but the gate's
 * per-chapter scan misses them because the binding lives outside
 * `Chapter*.tsx`. Treat all widget/diagram bindings as globally
 * available; per-chapter Chapter*.tsx bindings still take precedence
 * on collision.
 */
function buildGlobalWidgetAliasMap() {
  const map = new Map()
  const stack = [
    path.join(ROOT, 'src/components/widgets'),
    path.join(ROOT, 'src/components/diagrams'),
  ]
  while (stack.length) {
    const d = stack.pop()
    if (!fs.existsSync(d)) continue
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.isFile() && /\.tsx$/.test(e.name) && !/\.test\.tsx$/.test(e.name)) {
        const src = fs.readFileSync(p, 'utf-8')
        for (const m of src.matchAll(/(\w+)\s*:\s*<G\s+k="([^"]+)"\s*\/>/g)) {
          map.set(m[1], m[2])
        }
      }
    }
  }
  return map
}
const globalWidgetAliases = buildGlobalWidgetAliasMap()

// Strip HTML attribute contents from prose so a term that only appears
// inside a `k="..."` doesn't count as a plain mention.
function stripHtmlAttrs(s) {
  // Remove all `name="value"` and `name='value'` attribute pairs.
  return s.replace(/\b\w+\s*=\s*"[^"]*"|\b\w+\s*=\s*'[^']*'/g, '')
}

const issues = []

for (const chId of chapterIds) {
  const block = en[chId]
  const proseRaw = [...allStrings(block)].join('\n')
  const proseText = stripHtmlAttrs(proseRaw)

  const tsxPath = findTsxForChapter(chId)
  // Start from the global widget/diagram alias map (lower precedence),
  // then layer the chapter's own bindings on top so per-chapter
  // mappings still win on collision.
  const tagToKey = new Map(globalWidgetAliases)
  if (tsxPath) {
    const src = fs.readFileSync(tsxPath, 'utf-8')
    for (const m of src.matchAll(/(\w+)\s*:\s*<G\s+k="([^"]+)"\s*\/>/g)) {
      tagToKey.set(m[1], m[2])
    }
  }
  const keyToTags = new Map()
  for (const [tag, key] of tagToKey) {
    if (!keyToTags.has(key)) keyToTags.set(key, new Set())
    keyToTags.get(key).add(tag)
  }

  const chapterExempt = EXEMPT_PER_CHAPTER[chId] ?? new Set()

  for (const gKey of glossaryKeys) {
    if (chapterExempt.has(gKey)) continue
    const displayName = names[gKey] ?? gKey
    const needles = [gKey, displayName].filter((v, i, a) => a.indexOf(v) === i)

    let plainHits = 0
    for (const n of needles) {
      // Build a word-boundary regex. For multi-word phrases the spaces
      // are literal; for single words use \b on both sides.
      const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`\\b${escaped}\\b`, 'gi')
      plainHits += (proseText.match(re) ?? []).length
    }
    if (plainHits === 0) continue

    const tags = keyToTags.get(gKey) ?? new Set()
    let wrapHits = 0
    for (const tag of tags) {
      const tagRe = new RegExp(`<${tag}\\b`, 'g')
      wrapHits += (proseRaw.match(tagRe) ?? []).length
    }
    const literalRe = new RegExp(
      `<G\\s+k=["']${gKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g',
    )
    wrapHits += (proseRaw.match(literalRe) ?? []).length

    if (wrapHits === 0) {
      issues.push({ chId, gKey, displayName, plainHits })
    }
  }
}

if (issues.length === 0) {
  console.log(`Glossary coverage OK: ${chapterIds.length} chapters scanned against ${glossaryKeys.length} glossary terms (${EXEMPT_TERMS.size} exempt).`)
  process.exit(0)
}

console.error('Glossary coverage FAIL — these chapters mention glossary terms in prose but never wrap any occurrence as <G> (no tooltip, no popover):')
console.error('')
const byChapter = new Map()
for (const i of issues) {
  if (!byChapter.has(i.chId)) byChapter.set(i.chId, [])
  byChapter.get(i.chId).push(i)
}
for (const [chId, items] of [...byChapter].sort()) {
  console.error(`  ${chId}:`)
  for (const i of items) {
    const note = i.displayName !== i.gKey ? ` («${i.displayName}»)` : ''
    console.error(`    ${i.gKey}${note} — ${i.plainHits} mention(s), 0 wraps`)
  }
}
console.error('')
console.error(`${issues.length} unwrapped term(s) across ${byChapter.size} chapter(s).`)
console.error('Wrap each first occurrence with <G k="..."> (or a chapter-local tag mapped to it).')
process.exit(1)
