import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import CeGainCalculator from './CeGainCalculator'

/**
 * CeGainCalculator smoke tests.
 *
 * Defaults from the chapter's worked example:
 *   V_CC = 9 V, R_C = 2.2 kΩ, R_E = 470 Ω, R_1 = 47 kΩ, R_2 = 10 kΩ.
 *   V_B = 9 × 10 / (47 + 10) ≈ 1.58 V
 *   V_E = V_B − 0.7 = 0.88 V
 *   I_C ≈ 0.88 / 470 = 1.87 mA
 *   V_C = 9 − 1.87 mA × 2.2 kΩ = 9 − 4.12 ≈ 4.88 V
 *   gain = −2200 / 470 ≈ −4.68
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<CeGainCalculator />, { language })
}

describe('CeGainCalculator', () => {
  it('renders the default V_B ≈ 1.58 V', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/1\.58\s*V/)
  })

  it('renders the default V_C ≈ 4.89 V (mid-rail Q-point)', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/4\.89\s*V/)
  })

  it('renders the default voltage gain ≈ −4.68', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/−4\.68|-4\.68/)
  })

  it('updates the gain when R_E is changed', () => {
    const { container } = setup()
    // R_E 470 → 220 → gain = −2200 / 220 = −10
    const reSlider = container.querySelector('input#ce-gain-re') as HTMLInputElement
    fireEvent.change(reSlider, { target: { value: '220' } })
    expect(container.textContent).toMatch(/−10|-10/)
  })
})
