import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import VnaFilterSweepMock from './VnaFilterSweepMock'

/* VnaFilterSweepMock smoke tests.
 *
 * Default state: shape=LPF, f_c = 10 kHz, order = 2 (second-order LC).
 * Switching the shape tab swaps the readout's bottom box from
 * "Order" to "Q (band shapes)".
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<VnaFilterSweepMock />, { language })
}

describe('VnaFilterSweepMock', () => {
  it('renders the default f_c ≈ 10 kHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/10\s*kHz/)
  })

  it('starts on the LPF tab and shows "Low-pass" in the shape readout', () => {
    const { container } = setup()
    const lpfButton = container.querySelector('button[aria-pressed="true"]')
    expect(lpfButton?.textContent).toMatch(/Low-pass/)
  })

  it('switching to BPF swaps the order slider for a Q slider', () => {
    const { getByRole } = setup()
    const bpfButton = getByRole('button', { name: /Band-pass/i })
    fireEvent.click(bpfButton)
    // Order slider should be gone; Q slider should appear with id "vna-sweep-q"
    expect(document.getElementById('vna-sweep-order')).toBeNull()
    expect(document.getElementById('vna-sweep-q')).not.toBeNull()
  })

  it('renders an SVG plot trace', () => {
    const { container } = setup()
    const traces = container.querySelectorAll('path[d^="M"]')
    expect(traces.length).toBeGreaterThan(0)
  })
})
