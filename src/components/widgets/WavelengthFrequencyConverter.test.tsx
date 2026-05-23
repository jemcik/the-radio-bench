import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import WavelengthFrequencyConverter from './WavelengthFrequencyConverter'

/* WavelengthFrequencyConverter smoke tests.
 *
 * Uses c = 3 × 10⁸ m/s (matches the 300/f(MHz) teaching shortcut).
 * Default: 14.2 MHz, mode "lambda".
 *   λ = 3e8 / 14.2e6 = 21.13 m → "21.1 m"
 *   14.2 MHz is inside 14.0–14.35 → "20 m" band.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<WavelengthFrequencyConverter />, { language })
}

describe('WavelengthFrequencyConverter', () => {
  it('default 14.2 MHz → λ ≈ 21.1 m', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/21\.1\s*m/)
  })

  it('names the 20 m amateur band at 14.2 MHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/20\s*m/)
  })

  it('145 MHz → λ ≈ 2.07 m and the 2 m band', () => {
    const { container } = setup()
    const fInput = document.getElementById('lf-val-f') as HTMLInputElement
    fireEvent.change(fInput, { target: { value: '145' } })
    expect(container.textContent).toMatch(/2\.07\s*m/)
    expect(container.textContent).toMatch(/2\s*m/)
  })

  it('uses a comma decimal separator in the UK locale', () => {
    const { container } = setup('uk')
    expect(container.textContent).toMatch(/21,1/)
  })
})
