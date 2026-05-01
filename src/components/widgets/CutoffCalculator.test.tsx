import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import CutoffCalculator from './CutoffCalculator'

/* CutoffCalculator smoke tests.
 *
 * Default state: R = 1 kΩ, C = 100 nF, mode = "fc".
 *   f_c = 1 / (2π · 1000 · 100e-9)
 *       = 1 / (2π · 1e-4)
 *       = 1591.55 Hz   →  1.59 kHz
 *   τ   = R · C = 1000 · 100e-9 = 1e-4 s = 100 µs
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<CutoffCalculator />, { language })
}

describe('CutoffCalculator', () => {
  it('renders the default f_c ≈ 1.59 kHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/1\.59\s*kHz/)
  })

  it('renders the default τ = 100 µs', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/100\s*µs/)
  })

  it('updates f_c when C is changed', () => {
    const { container } = setup()
    const cInput = document.getElementById('cutoff-val-c') as HTMLInputElement
    // Drop C from 100 nF to 10 nF — f_c should rise 10× to ≈ 15.9 kHz
    fireEvent.change(cInput, { target: { value: '10' } })
    expect(container.textContent).toMatch(/15\.9\s*kHz/)
  })

  it('uses Cyrillic units in UK locale', () => {
    const { container } = setup('uk')
    // 1.59 kHz → "1,59 кГц" (Cyrillic).
    expect(container.textContent).toMatch(/1,59\s*кГц/)
  })
})
