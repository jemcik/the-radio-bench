/**
 * viewBox-edge clip gate for diagram text labels — all four edges.
 *
 * Catches the «label runs off the edge of the SVG and gets cut» class.
 * Two real cases this exists for, both user-flagged:
 *   • SineOriginDiagram — the «time» / «час» axis label ran past the
 *     RIGHT edge of the viewBox; the SVG clipped it to «t» / «ч».
 *   • CrystalRadioSchematic — the «земля» label sat past the BOTTOM
 *     edge and was cut by the card's rounded border.
 *
 * Tolerances — chosen so the three known false positives don't fire
 * while real clips still do (the first cut of this gate dropped top/left
 * entirely; the right move is per-edge tolerances, not dropping edges):
 *   • LEFT / RIGHT — LENGTH-AWARE. jsdom has no real text metrics, so
 *     width is estimated `chars × fontSize × 0.55`, which over-counts a
 *     long label by ~25 px (AtomicDiagram's 38-char labels looked like
 *     they spilled when they fit). Allow horizontal overflow up to
 *     ~22 % of the label's estimated width + 3 px: short labels (tight
 *     estimate) are still caught; long labels aren't falsely flagged.
 *   • BOTTOM — small fixed tolerance (4 px): descender depth
 *     (≈0.2·fontSize) is predictable, so the bbox bottom is accurate.
 *   • TOP — generous fixed tolerance (16 px). TOP overflow is the odd
 *     one: a label placed in the viewBox's top PADDING (RLChargingSchematic
 *     «I» sits at y=3, glyph reaching ~7 px above the frame) renders
 *     fine — top overflow shows in the card's padding instead of being
 *     clipped. The generous tolerance absorbs that harmless overflow
 *     while still catching a label grossly pushed off the top.
 *
 * Still NOT covered: text overlapping a component SYMBOL — that needs
 * per-primitive geometry and stays the job of the in-card visual review.
 *
 * Reuses the bbox machinery from `diagram-text-overlap.test.tsx`.
 */
import type React from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'

const CHAR_W_RATIO = 0.55
const FONT_HEIGHT_RATIO = 1.1
const ASCENT_RATIO = 0.8
const BOTTOM_TOL = 4 // px — descender estimate is small & predictable
const TOP_TOL = 16 // px — generous: top overflow renders in the card's padding, not clipped
const HORIZ_WIDTH_FRACTION = 0.22 // allow left/right overflow up to this × label width
const HORIZ_TOL_BASE = 3 // px — constant slack on top of the width-aware part

const modules = import.meta.glob<{ default: React.FC }>('./*.tsx', { eager: true })

const SKIP_FILES = new Set([
  './DiagramFigure.tsx',
  './SVGDiagram.tsx',
  './MagnitudeLadder.tsx', // requires `items` prop
])

const DIAGRAMS = Object.entries(modules)
  .filter(([path]) => !SKIP_FILES.has(path) && !path.endsWith('.test.tsx'))
  .map(([path, mod]) => ({
    name: path.replace('./', '').replace('.tsx', ''),
    Component: mod.default,
  }))
  .filter(d => typeof d.Component === 'function')

interface BBox {
  x: number; y: number; w: number; h: number; label: string
}

function parseFontSize(el: Element | null): number {
  if (!el) return 13
  const fs = el.getAttribute?.('font-size')
  if (fs) {
    if (fs.endsWith('em') || fs.endsWith('rem')) return parseFloat(fs) * 16
    if (fs.endsWith('%')) return (parseFloat(fs) / 100) * parseFontSize(el.parentElement)
    const n = parseFloat(fs)
    if (!Number.isNaN(n)) return n
  }
  return parseFontSize(el.parentElement)
}

function lineBBox(text: string, fs: number, x: number, y: number, anchor: string): BBox {
  const w = text.length * fs * CHAR_W_RATIO
  const h = fs * FONT_HEIGHT_RATIO
  let bx = x
  if (anchor === 'middle') bx = x - w / 2
  else if (anchor === 'end') bx = x - w
  return { x: bx, y: y - h * ASCENT_RATIO, w, h, label: text }
}

function* textBBoxes(el: SVGTextElement): Iterable<BBox> {
  const fs = parseFontSize(el)
  const baseAnchor = el.getAttribute('text-anchor') ?? 'start'
  const baseX = parseFloat(el.getAttribute('x') ?? '0')
  const baseY = parseFloat(el.getAttribute('y') ?? '0')
  const tspans = Array.from(el.querySelectorAll(':scope > tspan'))
  const isMultiLine = tspans.some(t => t.hasAttribute('dy') || t.hasAttribute('y'))

  if (!isMultiLine) {
    const content = (el.textContent ?? '').trim()
    if (content) yield lineBBox(content, fs, baseX, baseY, baseAnchor)
    return
  }
  let curX = baseX
  let curY = baseY
  for (const tspan of tspans) {
    const xAttr = tspan.getAttribute('x'); const yAttr = tspan.getAttribute('y')
    const dxAttr = tspan.getAttribute('dx'); const dyAttr = tspan.getAttribute('dy')
    if (xAttr !== null) curX = parseFloat(xAttr)
    if (yAttr !== null) curY = parseFloat(yAttr)
    if (dxAttr !== null) curX += parseFloat(dxAttr)
    if (dyAttr !== null) curY += parseFloat(dyAttr)
    const content = (tspan.textContent ?? '').trim()
    if (content) yield lineBBox(content, parseFontSize(tspan), curX, curY, baseAnchor)
  }
}

function isInsideTransformedGroup(el: Element): boolean {
  let cur: Element | null = el
  while (cur && cur.tagName.toLowerCase() !== 'svg') {
    if (cur.hasAttribute('transform')) return true
    cur = cur.parentElement
  }
  return false
}

function svgBounds(svg: SVGSVGElement): { w: number; h: number } | null {
  const vb = svg.getAttribute('viewBox')
  if (vb) {
    const p = vb.split(/[\s,]+/).map(Number)
    if (p.length === 4 && p.every(n => Number.isFinite(n))) return { w: p[2], h: p[3] }
  }
  const w = parseFloat(svg.getAttribute('width') ?? '')
  const h = parseFloat(svg.getAttribute('height') ?? '')
  if (Number.isFinite(w) && Number.isFinite(h)) return { w, h }
  return null
}

describe.each(DIAGRAMS)('$name — labels stay inside the viewBox', ({ Component }) => {
  it('no <text> label spills past any edge of the viewBox', () => {
    const { container } = renderWithProviders(<Component />)
    const findings: string[] = []

    for (const svg of Array.from(container.querySelectorAll('svg'))) {
      const bounds = svgBounds(svg as SVGSVGElement)
      if (!bounds) continue
      const { w: vbW, h: vbH } = bounds

      for (const text of Array.from(svg.querySelectorAll('text')) as SVGTextElement[]) {
        if (isInsideTransformedGroup(text)) continue
        for (const bb of textBBoxes(text)) {
          const horizTol = bb.w * HORIZ_WIDTH_FRACTION + HORIZ_TOL_BASE
          const rightOverflow = bb.x + bb.w - vbW
          if (rightOverflow > horizTol) {
            findings.push(`"${bb.label}" clipped at RIGHT (x+w=${(bb.x + bb.w).toFixed(0)} > viewBox w=${vbW}, overflow ${rightOverflow.toFixed(0)} > tol ${horizTol.toFixed(0)})`)
          }
          const leftOverflow = -bb.x
          if (leftOverflow > horizTol) {
            findings.push(`"${bb.label}" clipped at LEFT (x=${bb.x.toFixed(0)}, overflow ${leftOverflow.toFixed(0)} > tol ${horizTol.toFixed(0)})`)
          }
          if (bb.y + bb.h > vbH + BOTTOM_TOL) {
            findings.push(`"${bb.label}" clipped at BOTTOM (y+h=${(bb.y + bb.h).toFixed(0)} > viewBox h=${vbH})`)
          }
          const topOverflow = -bb.y
          if (topOverflow > TOP_TOL) {
            findings.push(`"${bb.label}" clipped at TOP (y=${bb.y.toFixed(0)}, overflow ${topOverflow.toFixed(0)} > tol ${TOP_TOL})`)
          }
        }
      }
    }
    expect(findings, findings.join('\n')).toEqual([])
  })
})
