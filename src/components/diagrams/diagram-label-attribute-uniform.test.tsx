/**
 * «Same label text → same visual attributes» gate.
 *
 * Catches the recurring class of bug where two text elements within
 * the SAME diagram SVG carry IDENTICAL visible content but render with
 * different visual attributes (fillOpacity, opacity, fill colour). A
 * reader can't tell whether the difference is meaningful or accidental
 * — they just see «two labels say the same thing but one is dimmer»
 * and flag it as inconsistency.
 *
 * Past failure: `HalfWaveRectifierWaveform.tsx` shipped with the
 * top-plot V_peak labels at `fillOpacity=0.85` and the bottom-plot
 * V_peak label at `fillOpacity=0.5` — the author was trying to encode
 * «this V_peak is a reference, not an actual peak» via opacity. The
 * encoding was invisible nuance; the reader saw only inconsistency.
 *
 * What this gate flags
 * ────────────────────
 * For every diagram SVG: collect all `<text>` elements, normalise
 * their visible textContent (after subscript-tspan flattening), group
 * by content. For each group of 2+ elements, FAIL if any of these
 * attributes don't match across the group:
 *   • fillOpacity (default «1» if absent)
 *   • opacity (default «1» if absent)
 *   • fill (the colour itself; default «(inherit)» if absent)
 *
 * fontSize / fontWeight uniformity is OUT OF SCOPE for this gate
 * (covered by `diagram-label-consistency.test.tsx` which has its own
 * narrow rules for designator-style labels).
 *
 * Out-of-scope cases
 * ──────────────────
 *   • Labels with empty / whitespace-only textContent.
 *   • Labels containing only digits — frequently used as axis ticks
 *     where the same digit appears with different prominence
 *     («0» tick vs «0 V» grid label) and the duplicate is incidental.
 *   • Single-character labels — letters like «V», «I», «R», «+» often
 *     mean different things in different diagram regions (a corner of
 *     the Ohm's-law triangle vs an axis label vs a legend bullet) and
 *     a single-char duplicate is almost always incidental, not
 *     semantic. The real signal is on MULTI-character duplicates like
 *     «+V_peak», «GND», «V_in» — these almost always reference the
 *     same quantity wherever they appear.
 *
 * Opt-out: `<text data-attr-uniform-exempt="<reason>">` or
 * `<text data-uniform-typography-exempt="<reason>">` (the latter is
 * the existing attribute used by `diagram-label-consistency.test.tsx`
 * for symbol-internal glyphs — honoured here too so callers don't have
 * to mark twice).
 */
import type React from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'

const modules = import.meta.glob<{ default: React.FC }>('./*.tsx', { eager: true })

const SKIP_FILES = new Set([
  // Utility wrappers and test files
  './DiagramFigure.tsx',
  './SVGDiagram.tsx',
  './diagram-text-overlap.test.tsx',
  './diagram-curve-edge-rail.test.tsx',
  './diagram-label-consistency.test.tsx',
  './diagram-label-attribute-uniform.test.tsx',
  // Requires props
  './MagnitudeLadder.tsx',
])

const DIAGRAMS = Object.entries(modules)
  .filter(([path]) => !SKIP_FILES.has(path) && !path.endsWith('.test.tsx'))
  .map(([path, mod]) => {
    const name = path.replace('./', '').replace('.tsx', '')
    return { name, Component: mod.default }
  })
  .filter(d => typeof d.Component === 'function')

/** Normalise visible content of a `<text>` element: concatenate all
 *  descendant text nodes, collapse whitespace. */
function visibleText(el: SVGTextElement): string {
  return (el.textContent ?? '').replace(/\s+/g, '').trim()
}

const DIGITS_ONLY_RE = /^\d+$/

function isExempt(el: SVGTextElement): boolean {
  return (
    el.hasAttribute('data-attr-uniform-exempt') ||
    el.hasAttribute('data-uniform-typography-exempt')
  )
}

/** Resolve an attribute by walking up parent <g> nodes (inheritance). */
function resolveAttr(el: Element, name: string): string {
  let cur: Element | null = el
  while (cur && cur.tagName.toLowerCase() !== 'svg') {
    const v = cur.getAttribute(name)
    if (v !== null) return v
    cur = cur.parentElement
  }
  return '(inherit)'
}

describe.each(DIAGRAMS)('$name — identical label text → identical visual attrs', ({ Component }) => {
  it('within each SVG, every text-content group has matching (fillOpacity, opacity, fill)', () => {
    const { container } = renderWithProviders(<Component />)
    const findings: string[] = []

    for (const svg of Array.from(container.querySelectorAll('svg'))) {
      const texts = Array.from(svg.querySelectorAll('text')) as SVGTextElement[]
      const groups = new Map<string, Array<{ el: SVGTextElement; key: string }>>()
      for (const t of texts) {
        if (isExempt(t)) continue
        const content = visibleText(t)
        if (!content) continue
        if (DIGITS_ONLY_RE.test(content)) continue
        // Single-character labels (V, I, R, +, −, …) frequently mean
        // different things in different diagram regions and the
        // duplicate is incidental, not semantic.
        if (content.length <= 1) continue
        const fillOpacity = resolveAttr(t, 'fill-opacity')
        const opacity = resolveAttr(t, 'opacity')
        const fill = resolveAttr(t, 'fill')
        const key = `fillOpacity=${fillOpacity} opacity=${opacity} fill=${fill}`
        const list = groups.get(content) ?? []
        list.push({ el: t, key })
        groups.set(content, list)
      }
      for (const [content, members] of groups) {
        if (members.length < 2) continue
        const keys = new Set(members.map(m => m.key))
        if (keys.size === 1) continue
        const breakdown = Array.from(keys)
          .map(k => `    ${k} → ${members.filter(m => m.key === k).length}×`)
          .join('\n')
        findings.push(
          `«${content}» appears ${members.length}× in this SVG with ${keys.size} different attribute tuples:\n${breakdown}`,
        )
      }
    }

    expect(findings, findings.join('\n\n')).toEqual([])
  })
})
