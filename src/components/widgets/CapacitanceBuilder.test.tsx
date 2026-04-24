import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import CapacitanceBuilder from './CapacitanceBuilder'

/* CapacitanceBuilder smoke tests.
 *
 * Default state: tA = 0.5, tD = 0.35, air (εᵣ = 1).
 * Log-mapped defaults:
 *   A ≈ exp((log 0.01 + log 10000) / 2) · 1  = exp(4.605 · 0.5) * ... → 10 cm²
 *   d ≈ exp(log 0.01 + (log 10 − log 0.01) · 0.35) ≈ 0.295 mm
 *   C = 8.854e-12 · 1 · 1e-3 / 2.95e-4 ≈ 3.0e-11 F  = 30 pF
 *
 * The switch to X7R (εᵣ = 3000) turns the same geometry into ~90 nF.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<CapacitanceBuilder />, { language })
}

describe('CapacitanceBuilder', () => {
  it('renders a pF-range default value for air-gap plates', () => {
    const { container } = setup()
    // Default is ~30 pF — autoscaled to pF.
    expect(container.textContent).toMatch(/pF/)
  })

  it('switches to nF or µF when X7R ceramic is selected', () => {
    setup()
    const select = screen.getByLabelText(/dielectric/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'x7r' } })
    // εᵣ jumps from 1 to 3000 — same geometry, capacitance scales by 3000×.
    // Default ~30 pF becomes ~90 000 pF = 90 nF.
    expect(document.body.textContent).toMatch(/nF|µF/)
  })

  it('shows the εᵣ of the selected dielectric', () => {
    setup()
    const select = screen.getByLabelText(/dielectric/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'c0g' } })
    // C0G is εᵣ = 45.
    expect(document.body.textContent).toContain('45')
  })

  it('renders a UK-locale decimal comma in the readout', () => {
    const { container } = setup('uk')
    // The default readout (~30 pF) uses a period when integer; move the
    // area slider to create a non-integer display so the comma shows up.
    const areaSlider = screen.getAllByRole('slider')[0]
    fireEvent.change(areaSlider, { target: { value: '0.5' } })
    // Capacitance value formatted via formatDecimal(2) → guaranteed
    // to have 2 decimals → UK locale uses a comma.
    expect(container.textContent).toMatch(/[0-9]+,[0-9]{2}\s*(пФ|нФ|мкФ|мФ|Ф)/)
  })
})
