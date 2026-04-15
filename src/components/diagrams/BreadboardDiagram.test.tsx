import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import BreadboardDiagram from './BreadboardDiagram'

describe('BreadboardDiagram', () => {
  it('renders an SVG with the breadboard board body, rails, and tie-point holes', () => {
    const { container } = renderWithProviders(<BreadboardDiagram />)
    const svg = container.querySelector('svg[aria-label]')
    expect(svg).not.toBeNull()
    // Board + 2 rails + 30×5 top + 30×5 bottom holes ⇒ many <circle>s.
    expect(container.querySelectorAll('circle').length).toBeGreaterThan(50)
  })

  it('uses the localized aria-label (not a hardcoded English string)', () => {
    const { container } = renderWithProviders(<BreadboardDiagram />, { language: 'uk' })
    const svg = container.querySelector('svg[aria-label]')!
    // uk aria-label contains "макетна плата" (breadboard).
    expect(svg.getAttribute('aria-label') ?? '').toMatch(/макетн/i)
  })
})
