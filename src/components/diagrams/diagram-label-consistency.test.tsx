/**
 * «Designator labels on one schematic must share typography» gate.
 *
 * Catches the recurring class of bug where two labels that look like
 * paired designators on the same schematic render at different
 * (fontSize, fontWeight). Last instance: ZenerRegulatorSchematic
 * shipped with V_in at fs=13 / weight=null (the Battery primitive's
 * default `value` styling) sitting next to R_s and R_L at fs=14 /
 * weight=600 (the Resistor primitive's default `label` styling).
 * The two primitives applied different rules to what is, semantically,
 * the SAME slot — the sole identifier of a component when no separate
 * designator is supplied.
 *
 * Fixing the symptom in one schematic doesn't prevent the next
 * primitive from re-introducing the same inconsistency. This gate
 * locks the contract at the test level so any drift fails CI.
 *
 * What «designator-style» means here
 * ──────────────────────────────────
 * Narrow filter so we don't compare apples to oranges. A `<text>`
 * counts as designator-style when EITHER:
 *   1. Its trimmed textContent matches `^[A-Z]\d*$` — single uppercase
 *      Latin letter, optionally followed by digits. Captures plain
 *      designators («R», «Z», «D») and reference designators («R1»,
 *      «Q3», «D1»). Excludes lowercase region labels («forward», «in»,
 *      «out»), numeric values («1.5V», «470µF»), all-caps acronyms
 *      («GND», «VCC», «DC+»), and units in parens («(V)», «(mA)»).
 *   2. It contains a `<tspan>` whose `font-size` is in percent units —
 *      the marker for «this label was rendered through
 *      parseLabelSubscript / withSubscriptsSvg». Captures every
 *      `X_y`-style designator («R_s», «V_in», «V_Z», «R_L», «V_pp»).
 *
 * What this gate flags
 * ────────────────────
 * Within each rendered schematic SVG, every designator-style label is
 * collected with its `(fontSize, fontWeight)` tuple. If two or more
 * distinct tuples appear, the gate fails and reports each tuple plus
 * the labels that use it. The ASSERT bar is «every designator-style
 * label on a single SVG MUST share the same (fontSize, fontWeight)».
 *
 * Out of scope (deliberate)
 * ─────────────────────────
 *   • Numeric values like «1.5V», «9V», «470µF» — they don't match
 *     the designator filter and are left alone (textbook convention
 *     keeps them at value weight).
 *   • font-family / font-style differences — italic math-var vs
 *     upright sans is intentional.
 *   • opacity differences — sometimes intentional (dimmed value
 *     annotations).
 *   • Cross-schematic consistency — two different diagrams may
 *     legitimately use different scales.
 *   • Subscript-letter size (lowercase vs uppercase) — handled by
 *     the case-aware logic in `parseLabelSubscript`; not part of the
 *     designator-uniformity contract.
 */
import type React from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'

const modules = import.meta.glob<{ default: React.FC }>('./*.tsx', { eager: true })

const SKIP_FILES = new Set([
  // Utility wrappers and the test file itself
  './DiagramFigure.tsx',
  './SVGDiagram.tsx',
  './diagram-text-overlap.test.tsx',
  './diagram-curve-edge-rail.test.tsx',
  './diagram-label-consistency.test.tsx',
  // Requires props
  './MagnitudeLadder.tsx',
  // Hand-drawn raw <text> diagrams that predate the Circuit-primitive
  // convention. They use inline fontSize / fontWeight values that
  // don't match the primitive-rendered designators (px vs em, varying
  // sizes for V_in vs V_out within the same diagram). Properly fixing
  // them means rewriting to use TerminalLabel / Resistor / etc., a
  // bigger task than this gate's scope. Skip with TODO until someone
  // does the rewrite.
  './BypassCapSchematic.tsx',     // TODO: V_cc at fs=10 doesn't match C at fs=14
  './DividerLoadingDiagram.tsx',  // TODO: V_in at 0.687em doesn't match V_out at 0.75em
])

const DIAGRAMS = Object.entries(modules)
  .filter(([path]) => !SKIP_FILES.has(path) && !path.endsWith('.test.tsx'))
  .map(([path, mod]) => {
    const name = path.replace('./', '').replace('.tsx', '')
    return { name, Component: mod.default }
  })
  .filter(d => typeof d.Component === 'function')

/* ── Designator-style filter ─────────────────────────────────────── */

const PLAIN_DESIGNATOR_RE = /^[A-Z]\d*$/

function isDesignatorStyle(el: SVGTextElement): boolean {
  // Explicit opt-out: text elements that are symbol-internal glyphs
  // (the «V» / «A» letter inside a Meter circle, the «A» / «B» letter
  // inside a NodePoint, the «V» / «I» / «R» letters of a formula
  // triangle) are sized for their geometric container, not for label
  // readability. They legitimately use a different fontSize / weight
  // from component designator labels and should not be compared
  // against those. Primitive authors mark them with this data
  // attribute so the gate stays narrow.
  if (el.hasAttribute('data-uniform-typography-exempt')) return false

  const txt = (el.textContent ?? '').trim()
  if (PLAIN_DESIGNATOR_RE.test(txt)) return true
  const tspan = el.querySelector(':scope > tspan')
  const tspanFs = tspan?.getAttribute('font-size') ?? ''
  if (tspanFs.endsWith('%')) return true
  return false
}

/** Resolve effective font-size for a `<text>` element. Walks up the
 *  parent chain so that a `<text>` whose font-size is set on its
 *  parent `<g>` reports the inherited value. */
function resolveFontSize(el: Element): string | null {
  let cur: Element | null = el
  while (cur && cur.tagName.toLowerCase() !== 'svg') {
    const fs = cur.getAttribute('font-size')
    if (fs) return fs
    cur = cur.parentElement
  }
  return null
}

function resolveFontWeight(el: Element): string | null {
  let cur: Element | null = el
  while (cur && cur.tagName.toLowerCase() !== 'svg') {
    const w = cur.getAttribute('font-weight')
    if (w) return w
    cur = cur.parentElement
  }
  return null
}

/* ── The test ─────────────────────────────────────────────────────── */

describe.each(DIAGRAMS)('$name — designator labels share typography', ({ Component }) => {
  it('all designator-style <text> elements on one SVG share (fontSize, fontWeight)', () => {
    const { container } = renderWithProviders(<Component />)
    const findings: string[] = []

    for (const svg of Array.from(container.querySelectorAll('svg'))) {
      const texts = Array.from(svg.querySelectorAll('text')) as SVGTextElement[]
      // Map: tuple key → array of label textContents that use it
      const buckets = new Map<string, string[]>()
      for (const t of texts) {
        if (!isDesignatorStyle(t)) continue
        const fs = resolveFontSize(t) ?? '(none)'
        const fw = resolveFontWeight(t) ?? '(none)'
        const key = `fs=${fs} weight=${fw}`
        const list = buckets.get(key) ?? []
        list.push((t.textContent ?? '').trim())
        buckets.set(key, list)
      }
      if (buckets.size > 1) {
        const summary = Array.from(buckets.entries())
          .map(([k, labels]) => `    ${k} → [${labels.join(', ')}]`)
          .join('\n')
        findings.push(
          `SVG has ${buckets.size} different designator-typography tuples (expected 1):\n${summary}`,
        )
      }
    }

    expect(findings, findings.join('\n\n')).toEqual([])
  })
})
