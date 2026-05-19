import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import LoadLinePlotter from './LoadLinePlotter'

/**
 * LoadLinePlotter smoke tests.
 *
 * Defaults: V_CC = 9 V, R_C = 2.2 kΩ, I_B = 20 µA, β = 100.
 *
 * Q-point is solved with the full curve model (tanh + Early effect)
 * so the dot sits ON the rendered curve. The Early correction
 * (1 + V_CE/V_EARLY) with V_EARLY = 100 V pushes I_C up by ~4–5 %
 * relative to the bare β·I_B value at typical V_CE, which then
 * pulls V_CE slightly closer to V_CE_SAT through the load line.
 *
 *   Linear (no Early): I_C = 2.0 mA, V_CE = 9 − 2.0·2.2 = 4.6 V
 *   With Early:        I_C ≈ 2.09 mA, V_CE ≈ 4.41 V (converged)
 *
 * Tests assert the iterated (with-Early) values, since those are
 * what the user sees both as the dot position AND as the readout.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<LoadLinePlotter />, { language })
}

describe('LoadLinePlotter', () => {
  it('renders the default Q-point with V_CE ≈ 4.41 V and I_C ≈ 2.09 mA', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/4\.41\s*V/)
    expect(container.textContent).toMatch(/2\.09\s*mA/)
  })

  it('updates the Q-point when V_CC is increased', () => {
    const { container } = setup()
    // V_CC 9 → 12 with same R_C, β, I_B. Linear V_CE = 12 − 4.4 = 7.6 V;
    // with Early at v_ce ≈ 7.3 the i_c lifts ~7 %, so converged V_CE ≈ 7.28 V.
    const vccSlider = container.querySelector('input#load-line-vcc') as HTMLInputElement
    fireEvent.change(vccSlider, { target: { value: '12' } })
    expect(container.textContent).toMatch(/7\.28\s*V/)
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
