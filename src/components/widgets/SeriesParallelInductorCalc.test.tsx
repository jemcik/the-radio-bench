import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SeriesParallelInductorCalc from './SeriesParallelInductorCalc'

/* SeriesParallelInductorCalc smoke tests.
 *
 * Default state: L1 = 1 mH, L2 = 4.7 mH.
 *   Series:   1 + 4.7 = 5.7 mH
 *   Parallel: (1 · 4.7) / (1 + 4.7) = 4.7 / 5.7 ≈ 0.825 mH
 *
 * These defaults span just within one decade (mH), so the auto-scale
 * passes both through as mH. The "1 nH in parallel with 1 mH" test
 * exercises cross-decade auto-scale.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<SeriesParallelInductorCalc />, { language })
}

describe('SeriesParallelInductorCalc', () => {
  it('renders the default series total of 5.7 mH', () => {
    const { container } = setup()
    expect(container.textContent).toContain('5.7 mH')
  })

  it('renders the default parallel equivalent ≈ 825 µH (auto-scaled below 1 mH)', () => {
    const { container } = setup()
    // 0.8245 mH = 824.5 µH → pickUnit drops to µH because the henries
    // value (8.25e-4) is below 1e-3. Rounds at 0 decimals (abs ≥ 100).
    expect(container.textContent).toMatch(/82[45]\s*µH/)
  })

  it('mismatched-scale demo: 1 nH ∥ 1 mH (smaller dominates in parallel)', () => {
    setup()
    // Change L1 from 1 mH to 1 nH
    const l1Input = document.getElementById('spi-val-1') as HTMLInputElement
    fireEvent.change(l1Input, { target: { value: '1' } })
    const unitSelects = screen.getAllByRole('combobox')
    fireEvent.change(unitSelects[0], { target: { value: 'nh' } })
    // Change L2 from 4.7 mH to 1 mH
    const l2Input = document.getElementById('spi-val-2') as HTMLInputElement
    fireEvent.change(l2Input, { target: { value: '1' } })
    // Series dominated by the larger = 1 mH; parallel by the smaller = 1 nH.
    const txt = document.body.textContent ?? ''
    expect(txt).toMatch(/1 mH/)             // series
    expect(txt).toMatch(/1\.00 nH|1 nH/)    // parallel
  })

  it('uses Cyrillic units in UK locale', () => {
    const { container } = setup('uk')
    // Series 5.7 mH → "5,7 мГн" (decimal comma); parallel 825 µH → "825 мкГн".
    expect(container.textContent).toMatch(/5,7\s*мГн/)
    expect(container.textContent).toMatch(/82[45]\s*мкГн/)
  })
})
