/**
 * Schematic layout audits.
 *
 * Catches the class of failure where a hand-authored SVG schematic
 * has labels extending past the viewBox (clipped text on one side)
 * or content ending far short of the viewBox (big empty stripe on
 * the other side). Both have been shipped and flagged by the user
 * in ch1_5 §7 schematics — after the fact, every time. This test
 * uses a conservative text-width estimator to flag them mechanically.
 *
 * The estimator is rough (jsdom doesn't lay out real fonts) — we err
 * on the side of wide so we never UNDER-estimate a label's real
 * size. A «passes» verdict in this test therefore means «definitely
 * fits»; a «fails» verdict is a strong signal to re-geometry even
 * if the real render somehow doesn't clip.
 */
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/render'
import CouplingCapSchematic from './CouplingCapSchematic'
import BypassCapSchematic from './BypassCapSchematic'
import RCChargingSchematic from './RCChargingSchematic'
import BlocksHighPassSchematic from './BlocksHighPassSchematic'

/** Conservative character-width estimate (px) for the fonts used in
 *  schematic text labels (Georgia / Georgia italic / serif fallback).
 *
 *  Empirical: at 14 px italic Georgia, plain Latin averages ~7 px/char
 *  but uppercase + wide glyphs hit 8–9. Cyrillic similar. We use 8
 *  as a safe upper bound — if a label fits at 8 px/char, it fits for
 *  real. */
const PX_PER_CHAR_AT_14 = 8
function estimateWidth(text: string, fontSize: number): number {
  const pxPerChar = PX_PER_CHAR_AT_14 * (fontSize / 14)
  return text.length * pxPerChar
}

/** Extract all <text> elements from an SVG, compute a conservative
 *  horizontal bounding box for each based on its text-anchor and the
 *  text content, and return [minX, maxX] across all of them. */
function textHorizontalExtent(svg: SVGSVGElement): { minX: number; maxX: number } {
  let minX = Infinity
  let maxX = -Infinity
  const texts = svg.querySelectorAll('text')
  texts.forEach(el => {
    const x = Number(el.getAttribute('x') ?? '0')
    const fontSize = Number(el.getAttribute('font-size') ?? '14')
    const anchor = el.getAttribute('text-anchor') ?? 'start'
    // Use textContent to catch nested <tspan> text too.
    const txt = el.textContent ?? ''
    if (!txt) return
    const w = estimateWidth(txt, fontSize)
    let left: number, right: number
    if (anchor === 'end') {
      right = x
      left = x - w
    } else if (anchor === 'middle') {
      left = x - w / 2
      right = x + w / 2
    } else {
      left = x
      right = x + w
    }
    if (left < minX) minX = left
    if (right > maxX) maxX = right
  })
  return { minX, maxX }
}

/** Extract the viewBox bounds of the first <svg> found in the
 *  rendered container. */
function viewBoxOf(svg: SVGSVGElement): { x: number; y: number; w: number; h: number } {
  const vb = svg.getAttribute('viewBox') ?? '0 0 0 0'
  const [x, y, w, h] = vb.split(/\s+/).map(Number)
  return { x, y, w, h }
}

/** Fail the test if labels clip outside the viewBox, OR if the
 *  horizontal span of the labels leaves more than `maxStripe` px of
 *  uncovered gap on either side (catches «lopsided empty space»
 *  diagrams). */
function expectLayoutTight(svg: SVGSVGElement, maxStripe = 55) {
  const { minX, maxX } = textHorizontalExtent(svg)
  const vb = viewBoxOf(svg)
  // Clip check
  expect(minX).toBeGreaterThanOrEqual(vb.x - 2)
  expect(maxX).toBeLessThanOrEqual(vb.x + vb.w + 2)
  // Lopsided-stripe check — only fire if ONE side has a lot of space
  // AND the other side has much less. Symmetric small margins are fine.
  const leftStripe = minX - vb.x
  const rightStripe = (vb.x + vb.w) - maxX
  const asymmetry = Math.abs(leftStripe - rightStripe)
  expect(
    asymmetry,
    `Asymmetric viewBox: left stripe ${leftStripe.toFixed(1)} px, right stripe ${rightStripe.toFixed(1)} px — shift content or resize viewBox so margins are comparable.`,
  ).toBeLessThan(maxStripe)
}

describe('Schematic layouts fit their viewBox without clipping or lopsided gaps', () => {
  it('CouplingCapSchematic (en)', () => {
    const { container } = renderWithProviders(<CouplingCapSchematic />, { language: 'en' })
    const svg = container.querySelector('svg')!
    expectLayoutTight(svg)
  })
  it('CouplingCapSchematic (uk)', () => {
    const { container } = renderWithProviders(<CouplingCapSchematic />, { language: 'uk' })
    const svg = container.querySelector('svg')!
    expectLayoutTight(svg)
  })
  it('BypassCapSchematic (en)', () => {
    const { container } = renderWithProviders(<BypassCapSchematic />, { language: 'en' })
    const svg = container.querySelector('svg')!
    expectLayoutTight(svg)
  })
  it('BypassCapSchematic (uk)', () => {
    const { container } = renderWithProviders(<BypassCapSchematic />, { language: 'uk' })
    const svg = container.querySelector('svg')!
    expectLayoutTight(svg)
  })
  it('RCChargingSchematic (uk)', () => {
    const { container } = renderWithProviders(<RCChargingSchematic />, { language: 'uk' })
    const svg = container.querySelector('svg')!
    expectLayoutTight(svg)
  })
  it('BlocksHighPassSchematic (uk)', () => {
    const { container } = renderWithProviders(<BlocksHighPassSchematic />, { language: 'uk' })
    const svg = container.querySelector('svg')!
    expectLayoutTight(svg)
  })
})
