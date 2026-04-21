import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SeriesParallelCalc from './SeriesParallelCalc'

/* SeriesParallelCalc smoke tests.
 *
 * Default state: R1 = 1 kΩ, R2 = 4.7 kΩ.
 *   Series:   1 + 4.7 = 5.7 kΩ
 *   Parallel: (1 × 4.7) / (1 + 4.7) = 4.7 / 5.7 ≈ 0.825 kΩ → 825 Ω
 *
 * The parallel value crosses the kΩ→Ω boundary (it's under 1 kΩ), so
 * the formatted readout is "825 Ω" — a useful regression guard against
 * the auto-scaling logic in `pickUnit`.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<SeriesParallelCalc />, { language })
}

describe('SeriesParallelCalc', () => {
  it('renders the default series total of 5.7 kΩ', () => {
    const { container } = setup()
    expect(container.textContent).toContain('5.7 kΩ')
  })

  it('renders the default parallel equivalent of ~825 Ω', () => {
    const { container } = setup()
    // Parallel is ~824.6 Ω → rounded via auto-scale to "825 Ω" (0 decimals ≥100).
    expect(container.textContent).toMatch(/82[45] Ω/)
  })

  it('asymmetry demo: 1 kΩ ∥ 1 MΩ ≈ 1 kΩ (small-resistor-dominates)', () => {
    setup()
    // Change R2 from 4.7 to 1, and its unit from kΩ to MΩ.
    const r2Input = document.getElementById('sp-val-2') as HTMLInputElement
    fireEvent.change(r2Input, { target: { value: '1' } })
    const unitSelects = screen.getAllByRole('combobox')
    // The R₂ unit dropdown is the second combobox.
    fireEvent.change(unitSelects[1], { target: { value: 'mohm' } })
    // Now parallel of 1 kΩ and 1 MΩ is 1000 · 1e6 / 1001000 ≈ 999 Ω.
    const txt = document.body.textContent ?? ''
    expect(txt).toMatch(/99[89] Ω/)
  })

  it('uses a comma separator in UK locale', () => {
    const { container } = setup('uk')
    // Default parallel ≈ 825 Ω (no decimal) and default series 5,7 кОм.
    expect(container.textContent).toMatch(/5,7\s*кОм/)
  })
})
