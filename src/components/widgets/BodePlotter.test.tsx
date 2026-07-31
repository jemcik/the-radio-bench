import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import BodePlotter from './BodePlotter'

/* BodePlotter smoke tests.
 *
 * Default state: shape=LPF, f_c = 10 kHz, order = 1.
 * The slope readout reads "−20 dB/decade" for first-order, "−40
 * dB/decade" for second-order, etc.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<BodePlotter />, { language })
}

describe('BodePlotter', () => {
  it('renders the default f_c ≈ 10 kHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/10\s*kHz/)
  })

  it('renders the default first-order slope of -20 dB/decade', () => {
    const { container } = setup()
    // formatDecimal renders U+2212 MINUS, not the ASCII hyphen.
    expect(container.textContent).toMatch(/−20\s*dB\/decade/)
  })

  it('updates the slope when the order slider is dragged to 5', () => {
    const { container } = setup()
    const orderInput = document.getElementById('bode-order') as HTMLInputElement
    fireEvent.change(orderInput, { target: { value: '5' } })
    expect(container.textContent).toMatch(/−100\s*dB\/decade/)
  })

  it('renders an SVG plot trace', () => {
    const { container } = setup()
    const traces = container.querySelectorAll('path[d^="M"]')
    expect(traces.length).toBeGreaterThan(0)
  })
})
