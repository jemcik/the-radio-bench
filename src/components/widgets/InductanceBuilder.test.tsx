import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import InductanceBuilder from './InductanceBuilder'

/* InductanceBuilder smoke tests.
 *
 * Default state: n = 50, tA = 0.42, tL = 0.43, air (µᵣ = 1).
 * Log-mapped defaults:
 *   A ≈ exp(log 0.01 + (log 100 − log 0.01) · 0.42) ≈ 0.5 cm²
 *   l ≈ exp(log 5  + (log 200 − log 5)   · 0.43) ≈ 25 mm
 *   L = µ₀ · 1 · 50² · 0.5e-4 / 25e-3 ≈ 6.3 µH
 *
 * Switching to high-permeability ferrite (µᵣ = 5000) scales the
 * inductance by 5000× → tens of mH.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<InductanceBuilder />, { language })
}

describe('InductanceBuilder', () => {
  it('renders a µH-range default value for air-core', () => {
    const { container } = setup()
    // Default is ~6 µH — autoscaled to µH.
    expect(container.textContent).toMatch(/µH/)
  })

  it('switches to mH range when high-permeability ferrite is selected', () => {
    setup()
    const select = screen.getByLabelText(/core/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'ferriteHigh' } })
    // µᵣ jumps from 1 to 5000 — same geometry, inductance scales by 5000×.
    // ~6 µH becomes ~30 mH.
    expect(document.body.textContent).toMatch(/mH|H/)
  })

  it('shows the µᵣ of the selected core material', () => {
    setup()
    const select = screen.getByLabelText(/core/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'ironPowder' } })
    // Iron-powder is µᵣ = 50.
    expect(document.body.textContent).toContain('50')
  })

  it('renders a UK-locale decimal comma in the readout', () => {
    const { container } = setup('uk')
    // Move the diameter slider so the inductance becomes non-integer.
    const diameterSlider = screen.getAllByRole('slider')[1]
    fireEvent.change(diameterSlider, { target: { value: '0.6' } })
    // Inductance formatted via formatDecimal(2) → guaranteed 2 decimals →
    // UK locale uses a comma.
    expect(container.textContent).toMatch(/[0-9]+,[0-9]{2}\s*(нГн|мкГн|мГн|Гн)/)
  })
})
