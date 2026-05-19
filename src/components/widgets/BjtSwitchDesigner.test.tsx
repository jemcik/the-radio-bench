import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import BjtSwitchDesigner from './BjtSwitchDesigner'

/**
 * BjtSwitchDesigner smoke tests.
 *
 * Defaults: V_in = 3.3 V, I_C = 10 mA, β = 50, overdrive = 5×.
 *   I_B  = 5 × 10 mA / 50 = 1.0 mA
 *   V_drive = 3.3 − 0.7 = 2.6 V
 *   R_b raw = 2.6 V / 1.0 mA = 2.6 kΩ
 *   R_b E12-snapped DOWN = 2.2 kΩ (lower → more saturation, safe direction)
 *   I_B (actual at 2.2 kΩ) = 2.6 / 2200 ≈ 1.18 mA
 *   β · I_B(actual) ≈ 59 mA, well above 10 mA → saturated
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<BjtSwitchDesigner />, { language })
}

describe('BjtSwitchDesigner', () => {
  it('renders the default required base current ≈ 1 mA', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/Required\s*I_?B[^0-9]*1\s*mA/)
  })

  it('renders the E12-snapped 2.2 kΩ base resistor', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/2\.2\s*kΩ/)
  })

  it('renders the saturated I_C = 10 mA', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/Saturated\s*I_?C[^0-9]*10\s*mA/)
  })

  it('updates I_B when the target collector current is changed', () => {
    const { container } = setup()
    // Increase I_C from 10 to 20 mA → I_B = 5 × 20 / 50 = 2 mA
    const icSlider = container.querySelector('input#bjt-switch-ic') as HTMLInputElement
    fireEvent.change(icSlider, { target: { value: '20' } })
    expect(container.textContent).toMatch(/Required\s*I_?B[^0-9]*2\s*mA/)
  })

  it('updates I_B when β is increased', () => {
    const { container } = setup()
    // β: 50 → 100 → I_B = 5 × 10 / 100 = 0.5 mA = 500 µA
    // formatCurrent's mA threshold is ≥ 1 mA; 0.5 mA renders as 500 µA.
    const betaSlider = container.querySelector('input#bjt-switch-beta') as HTMLInputElement
    fireEvent.change(betaSlider, { target: { value: '100' } })
    expect(container.textContent).toMatch(/Required\s*I_?B[^0-9]*500\s*µA/)
  })
})
