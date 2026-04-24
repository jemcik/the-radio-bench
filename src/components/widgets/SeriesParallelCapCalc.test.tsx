import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SeriesParallelCapCalc from './SeriesParallelCapCalc'

/* SeriesParallelCapCalc smoke tests.
 *
 * Default state: C1 = 10 µF, C2 = 22 µF.
 *   Parallel: 10 + 22 = 32 µF
 *   Series:   (10 · 22) / (10 + 22) = 220 / 32 = 6.875 µF
 *
 * These defaults put both results into the same unit (µF), so the
 * auto-scale logic mostly passes them through — the widget's happy
 * path. The "1 pF in parallel with 1 µF" test below exercises the
 * cross-decade auto-scale, mirroring the resistor-widget asymmetry
 * test.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<SeriesParallelCapCalc />, { language })
}

describe('SeriesParallelCapCalc', () => {
  it('renders the default parallel total of 32 µF', () => {
    const { container } = setup()
    expect(container.textContent).toContain('32 µF')
  })

  it('renders the default series equivalent of ~6.88 µF', () => {
    const { container } = setup()
    // 6.875 µF → rounded at 2 decimals ≥1 → "6.88 µF" (2 decimal places).
    expect(container.textContent).toMatch(/6\.8[78] µF/)
  })

  it('mismatched-scale demo: 1 pF ∥ 1 µF ≈ 1 µF (larger-dominates in parallel)', () => {
    setup()
    // Change C1 from 10 µF to 1 pF
    const c1Input = document.getElementById('spc-val-1') as HTMLInputElement
    fireEvent.change(c1Input, { target: { value: '1' } })
    const unitSelects = screen.getAllByRole('combobox')
    fireEvent.change(unitSelects[0], { target: { value: 'pf' } })
    // Change C2 from 22 µF to 1 µF
    const c2Input = document.getElementById('spc-val-2') as HTMLInputElement
    fireEvent.change(c2Input, { target: { value: '1' } })
    // C1 unit is now 1 pF, C2 is 1 µF. Parallel ≈ 1.000001 µF ≈ 1 µF.
    // Series dominated by the smaller = 1 pF.
    const txt = document.body.textContent ?? ''
    expect(txt).toMatch(/1 µF/)  // parallel
    expect(txt).toMatch(/1\.00 pF|1 pF/)  // series (smaller dominates)
  })

  it('uses a comma separator in UK locale', () => {
    const { container } = setup('uk')
    // Default series is 6.875 → UK shows "6,88 мкФ" (assuming мкФ = µF in uk)
    expect(container.textContent).toMatch(/6,8[78]\s*мкФ/)
  })
})
