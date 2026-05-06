import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import ImpedanceTransformer from './ImpedanceTransformer'

/* ImpedanceTransformer smoke tests.
 *
 * Default state (matches §4 worked example):
 *   Z_s = 200 Ω, ratio 1:2 (preset)
 *   ratio² = (1/2)² = 0.25
 *   Z_p = 200 × 0.25 = 50 Ω
 *   SWR vs 50 Ω = 50/50 = 1.00:1 → "match"
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<ImpedanceTransformer />, { language })
}

describe('ImpedanceTransformer', () => {
  it('renders the default Z_p ≈ 50 Ω', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/50\s*Ω/)
  })

  it('marks the default as a 1:1 SWR match', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/match/)
  })

  it('updates Z_p when load changes', () => {
    const { container } = setup()
    const zsInput = document.getElementById('impedance-zs') as HTMLInputElement
    // 100 Ω load with 1:2 ratio → 100 × 0.25 = 25 Ω primary, SWR = 50/25 = 2:1
    fireEvent.change(zsInput, { target: { value: '100' } })
    expect(container.textContent).toMatch(/25\s*Ω/)
  })

  it('uses Cyrillic units in UK locale', () => {
    const { container } = setup('uk')
    // 50 Ω → "50 Ом" (Cyrillic «Ом»)
    expect(container.textContent).toMatch(/50\s*Ом/)
  })
})
