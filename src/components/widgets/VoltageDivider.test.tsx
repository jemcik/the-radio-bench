import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import VoltageDivider from './VoltageDivider'

/* VoltageDivider smoke + regression tests.
 *
 * Defaults: V_in = 12 V, R₁ = 10 kΩ, R₂ = 4.7 kΩ, load off.
 *   Ratio        = 4.7 / 14.7 ≈ 0.320
 *   V_out        = 12 × 0.320 ≈ 3.84 V
 *   Supply curr. = 12 / 14.7 ≈ 0.816 mA
 *
 * These pin the division arithmetic. When the reader toggles the load
 * on with the default R_L = 100 kΩ, V_out should sag by a small but
 * visible amount (R_L is 21× the divider's 3.2 kΩ parallel output
 * resistance, so roughly 4-5 % sag).
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<VoltageDivider />, { language })
}

describe('VoltageDivider', () => {
  it('renders the default V_out ≈ 3.84 V', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/3\.8[34] V/)
  })

  it('renders the default divide ratio 0.320', () => {
    const { container } = setup()
    expect(container.textContent).toContain('0.320')
  })

  it('renders the default supply current ~ 816 µA', () => {
    const { container } = setup()
    // 12 / 14700 = 0.000816 A. Auto-scaling picks µA for sub-mA values,
    // so the display is "816 µA" rather than "0.816 mA".
    expect(container.textContent).toMatch(/81[567] µA/)
  })

  it('reveals the loaded sag readout when the load is turned on', () => {
    setup()
    const toggle = screen.getByRole('checkbox')
    fireEvent.click(toggle)
    // Sag should now appear in the readouts. The text contains "sag"
    // (EN) or "Output sag" as a label; look for the percent sign in
    // the result area.
    const body = document.body.textContent ?? ''
    // Loaded sag for R_L = 100 kΩ, divider 10k//4.7k ≈ 3.2 kΩ parallel
    // output → sag ≈ 3.1 %.  Allow a 2-4 % range.
    expect(body).toMatch(/[234]\.\d %/)
  })

  it('uses a comma decimal separator in UK locale', () => {
    const { container } = setup('uk')
    // Default V_out is 3.83... → "3,83 В" in UK locale.
    expect(container.textContent).toMatch(/3,8\d\s*В/)
  })
})
