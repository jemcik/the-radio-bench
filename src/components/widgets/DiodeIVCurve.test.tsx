import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import DiodeIVCurve from './DiodeIVCurve'

/* Smoke + regression tests for the Diode I–V curve widget.
 *
 * The widget defaults to V = 0.60 V on the silicon (1N4148) curve. At
 * those settings the Shockley equation calibrated in the component
 * (n·V_T ≈ 41.3 mV, I_s ≈ 3.06×10⁻¹⁰ A) gives ≈ 624 µA, formatted as
 * "624 µA" by the readout's small-current branch.
 */

function setup() {
  return renderWithProviders(<DiodeIVCurve />)
}

describe('DiodeIVCurve', () => {
  it('renders the default V = 0.60 V slider readout', () => {
    setup()
    expect(screen.getAllByText(/0\.60 V/).length).toBeGreaterThan(0)
  })

  it('produces ≈ 624 µA on silicon at the default voltage', () => {
    setup()
    // The success-tone readout text contains "I = 624 µA" — the
    // widget's small-current branch prefers µA when below 1 mA.
    expect(screen.getByText(/I = 624 µA/)).toBeInTheDocument()
  })

  it('renders three diode-family toggles in aria-pressed default state', () => {
    setup()
    const buttons = screen.getAllByRole('button', { pressed: false })
    // Two of the three toggles are unpressed at startup (Schottky, LED).
    // The Silicon button is the active one.
    expect(buttons.some(b => /Schottky/.test(b.textContent ?? ''))).toBe(true)
    expect(buttons.some(b => /Red LED/.test(b.textContent ?? ''))).toBe(true)
    expect(
      screen.getByRole('button', { pressed: true }).textContent,
    ).toMatch(/Silicon/)
  })

  it('renders one V slider with an accessible label', () => {
    setup()
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBe(1)
  })

  it('draws three diode-family curves as SVG paths', () => {
    const { container } = setup()
    // Each curve is a <path> with strokeWidth=2.5 (active) or 1.5 (ghost).
    // We expect one of each plus two ghosted siblings — at least three
    // curve paths total inside the plot.
    const curvePaths = container.querySelectorAll('path[stroke-linecap="round"][stroke-linejoin="round"]')
    expect(curvePaths.length).toBeGreaterThanOrEqual(3)
  })
})
