import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import LogVsLinearDiagram from './LogVsLinearDiagram'

describe('LogVsLinearDiagram', () => {
  it('renders both axes with the four shared tick labels', () => {
    const { container } = renderWithProviders(<LogVsLinearDiagram />)
    const text = container.querySelector('svg')?.textContent ?? ''
    // Ticks at 1, 10, 100, 1000 with Hz / kHz suffixes.
    expect(text).toContain('1 Hz')
    expect(text).toContain('10 Hz')
    expect(text).toContain('100 Hz')
    expect(text).toContain('1 kHz')
  })

  it('uses the localized unit symbols in uk (Гц / кГц)', () => {
    const { container } = renderWithProviders(<LogVsLinearDiagram />, { language: 'uk' })
    const text = container.querySelector('svg')?.textContent ?? ''
    expect(text).toContain('Гц')
    expect(text).toContain('кГц')
    expect(text).not.toContain('kHz')
  })
})
