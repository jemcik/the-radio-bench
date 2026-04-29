import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import VnaResonanceMock from './VnaResonanceMock'

/* VnaResonanceMock smoke tests.
 *
 * Default state: f₀ = 7.0 MHz, Q = 50.
 *   BW ≈ f₀ / Q = 140 kHz   (exact:  f_H − f_L from |Γ|² = 1/2)
 *
 * The widget exposes three sliders (f₀, Q, sweep span) and three
 * readouts. We exercise the readouts and verify the Q slider
 * actually moves the bandwidth.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<VnaResonanceMock />, { language })
}

describe('VnaResonanceMock', () => {
  it('renders the default f₀ = 7.0 MHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/7(\.000)?\s*MHz/)
  })

  it('renders the default Q = 50', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/\b50\b/)
  })

  it('renders the default bandwidth ≈ 140 kHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/14[01]\s*kHz/)
  })

  it('halving Q doubles the bandwidth', () => {
    const { container } = setup()
    const qSlider = document.getElementById('vna-mock-q') as HTMLInputElement
    fireEvent.change(qSlider, { target: { value: '25' } })
    // Q = 25 → BW ≈ 280 kHz
    expect(container.textContent).toMatch(/28[01]\s*kHz/)
  })

  it('uses Cyrillic units in UK locale', () => {
    const { container } = setup('uk')
    expect(container.textContent).toMatch(/7(?:,000)?\s*МГц/)
    expect(container.textContent).toMatch(/14[01]\s*кГц/)
  })
})
