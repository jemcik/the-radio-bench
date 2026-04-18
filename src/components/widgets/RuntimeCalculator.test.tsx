import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RuntimeCalculator from './RuntimeCalculator'

/* Smoke + regression tests for the Battery Runtime Calculator.
 *
 * Default inputs: 2000 mAh × 1.2 V × 30 mA drain (typical AA NiMH
 * powering a small radio on receive).
 *
 *   Energy  = 1.2 × 2000 / 1000 = 2.40 Wh
 *   Runtime = 2000 / 30 = 66.67 hours → auto-scales to days
 *             (threshold 48 h) → 66.67 / 24 = 2.78 days
 */

function setup() {
  return renderWithProviders(<RuntimeCalculator />)
}

describe('RuntimeCalculator', () => {
  it('renders the default 2.40 Wh energy readout', () => {
    const { container } = setup()
    expect(container.textContent).toContain('2.40 Wh')
  })

  it('renders the default runtime as 2.78 days (auto-scaled from 66.7 h)', () => {
    const { container } = setup()
    expect(container.textContent).toContain('2.78 days')
  })

  it('shows the V·Q and Q/I formula hints under each result', () => {
    const { container } = setup()
    expect(container.textContent).toContain('= V · Q')
    expect(container.textContent).toContain('= Q / I')
  })

  it('renders three numeric inputs and three unit pickers', () => {
    setup()
    expect(screen.getAllByRole('spinbutton').length).toBe(3)
    expect(screen.getAllByRole('combobox').length).toBe(3)
  })
})
