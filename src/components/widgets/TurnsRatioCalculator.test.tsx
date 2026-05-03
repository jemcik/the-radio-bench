import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import TurnsRatioCalculator from './TurnsRatioCalculator'

/* TurnsRatioCalculator smoke tests.
 *
 * Default state (matches §2 worked example):
 *   N_p = 920, N_s = 48, V_p = 230 V, I_p = 0.26 A
 *   V_s = 230 × 48 / 920 = 12 V
 *   I_s = 0.26 × 920 / 48 ≈ 4.98 A
 *   Ratio reduces to 115:6 (gcd of 920 and 48 = 8 → 115:6)
 *   Kind = step-down (N_s < N_p)
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<TurnsRatioCalculator />, { language })
}

describe('TurnsRatioCalculator', () => {
  it('renders the default V_s ≈ 12 V', () => {
    const { container } = setup()
    // Locale formatter strips trailing zeros, so we expect "12 V" not "12.0 V".
    expect(container.textContent).toMatch(/Secondary V_\{s\}\s*12\s*V/)
  })

  it('shows step-down for the default state', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/step-down/)
  })

  it('flips to step-up when N_s exceeds N_p', () => {
    const { container } = setup()
    const nsInput = document.getElementById('turns-val-ns') as HTMLInputElement
    fireEvent.change(nsInput, { target: { value: '2000' } })
    expect(container.textContent).toMatch(/step-up/)
  })

  it('uses Cyrillic units in UK locale', () => {
    const { container } = setup('uk')
    // Default I_s ≈ 4.98 A → "4,98 А" (Cyrillic decimal comma + Cyrillic A).
    // V_s = 12 has no decimal in Ukrainian either; pick I_s as the test
    // anchor because it has a non-zero fractional part on every locale.
    expect(container.textContent).toMatch(/4,98\s*А/)
  })
})
