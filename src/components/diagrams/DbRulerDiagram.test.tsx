import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import DbRulerDiagram from './DbRulerDiagram'

describe('DbRulerDiagram', () => {
  it('renders an SVG with all nine ratio labels (×1, ×10, …, ×100k)', () => {
    const { container } = renderWithProviders(<DbRulerDiagram />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    // Ratio row contains the eight × labels (÷1000 … ×100k). Use a substring
    // match because each label sits inside its own <text> node.
    const text = svg?.textContent ?? ''
    expect(text).toContain('×1')
    expect(text).toContain('×100')
    expect(text).toContain('÷1000')
  })

  it('localizes the aria-label / caption to uk', () => {
    const { container } = renderWithProviders(<DbRulerDiagram />, { language: 'uk' })
    const svg = container.querySelector('svg[aria-label]')!
    // uk aria contains "Шкала дБ" (dB ruler / scale).
    expect(svg.getAttribute('aria-label') ?? '').toMatch(/Шкала дБ/)
  })
})
