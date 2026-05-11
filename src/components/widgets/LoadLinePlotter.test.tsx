import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import LoadLinePlotter from './LoadLinePlotter'

/**
 * LoadLinePlotter smoke tests.
 *
 * Defaults: V_CC = 9 V, R_C = 2.2 kΩ, I_B = 20 µA, β = 100.
 *   I_C(active) = 100 × 20 µA = 2.0 mA
 *   V_drop on R_C = 2.0 mA × 2.2 kΩ = 4.4 V
 *   V_CE = 9 − 4.4 = 4.6 V — comfortably in the active region
 *
 * Headroom: up = 9 − 4.6 = 4.4 V; down = 4.6 − 0.2 = 4.4 V (mid-rail!).
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<LoadLinePlotter />, { language })
}

describe('LoadLinePlotter', () => {
  it('renders the default Q-point with V_CE ≈ 4.6 V and I_C ≈ 2 mA', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/4\.6\s*V/)
    expect(container.textContent).toMatch(/2\s*mA/)
  })

  it('updates the Q-point when V_CC is increased', () => {
    const { container } = setup()
    // V_CC 9 → 12 with same R_C, β, I_B → V_CE = 12 − 4.4 = 7.6 V
    const vccSlider = container.querySelector('input#load-line-vcc') as HTMLInputElement
    fireEvent.change(vccSlider, { target: { value: '12' } })
    expect(container.textContent).toMatch(/7\.6\s*V/)
  })

  it('moves the Q-point into saturation when R_C is large enough', () => {
    const { container } = setup()
    // R_C 2.2 → 8 kΩ at I_C = 2.0 mA would drop 16 V, saturating against 9 V
    const rcSlider = container.querySelector('input#load-line-rc') as HTMLInputElement
    fireEvent.change(rcSlider, { target: { value: '8' } })
    // Saturation clamps V_CE at 0.2 V
    expect(container.textContent).toMatch(/0\.2\s*V/)
  })
})
