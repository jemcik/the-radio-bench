import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import ResonanceCalculator from './ResonanceCalculator'

/* ResonanceCalculator smoke tests.
 *
 * Default state: L = 4 µH, C = 130 pF.
 *   f₀ = 1/(2π√(LC)) = 1/(2π·√(4e-6·130e-12))
 *      = 1/(2π·√5.2e-16) = 1/(2π·2.28e-8) ≈ 6.98 MHz
 *   T  = 1/f₀ ≈ 143 ns
 *   Z₀ = √(L/C) = √(4e-6 / 130e-12) = √(30 769) ≈ 175 Ω
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<ResonanceCalculator />, { language })
}

describe('ResonanceCalculator', () => {
  it('renders the default f₀ ≈ 6.98 MHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/6\.98\s*MHz/)
  })

  it('renders the default period T ≈ 143 ns', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/143\s*ns/)
  })

  it('renders the default characteristic impedance Z₀ ≈ 175 Ω', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/17[45]\s*Ω/)
  })

  it('updates f₀ when L is changed', () => {
    const { container } = setup()
    const lInput = document.getElementById('rescalc-val-l') as HTMLInputElement
    // Quadruple L: f₀ should halve to ≈ 3.49 MHz
    fireEvent.change(lInput, { target: { value: '16' } })
    expect(container.textContent).toMatch(/3\.49\s*MHz/)
  })

  it('uses Cyrillic units in UK locale', () => {
    const { container } = setup('uk')
    // 6.98 MHz → "6,98 МГц"; 175 Ω → "175 Ом" (Cyrillic spelling of «Ohm»).
    expect(container.textContent).toMatch(/6,98\s*МГц/)
    expect(container.textContent).toMatch(/17[45]\s*Ом/)
  })
})
