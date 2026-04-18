import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SafeZoneCalculator from './SafeZoneCalculator'

/* Smoke + regression tests for the Safe-Zone calculator.
 *
 * Default inputs: V = 12 V, rating = 1/4 W (= 0.25 W).
 *   R_min = V² / P = 144 / 0.25 = 576 Ω.
 *
 * We assert that 576 Ω is rendered (the headline result) and that
 * both input controls render with the right defaults.
 */

function setup() {
  return renderWithProviders(<SafeZoneCalculator />)
}

describe('SafeZoneCalculator', () => {
  it('renders R_min = 576 Ω for the default 12 V / 1⁄4 W input', () => {
    const { container } = setup()
    // Value + unit are separate text nodes; search full container text.
    expect(container.textContent).toContain('576 Ω')
  })

  it('renders the V² / P formula breakdown with the substituted values', () => {
    const { container } = setup()
    expect(container.textContent).toContain('R ≥ V² / P')
    expect(container.textContent).toContain('12 V')
    expect(container.textContent).toContain('1/4 W')
  })

  it('renders one numeric voltage input and two select controls (unit + rating)', () => {
    setup()
    const spinboxes = screen.getAllByRole('spinbutton')
    const selects = screen.getAllByRole('combobox')
    expect(spinboxes.length).toBe(1)
    expect(selects.length).toBe(2)
  })
})
