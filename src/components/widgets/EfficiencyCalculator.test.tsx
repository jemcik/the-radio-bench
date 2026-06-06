import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import EfficiencyCalculator from './EfficiencyCalculator'

describe('EfficiencyCalculator', () => {
  it('computes DC input, efficiency and heat for the default 13.8 V / 21 A / 100 W', () => {
    const { container } = renderWithProviders(<EfficiencyCalculator />)
    // P_DC = 13.8 × 21 = 289.8 → 290 W; η = 100/289.8 = 34.5 %; heat = 189.8 → 190 W
    expect(container.textContent).toMatch(/290/)
    expect(container.textContent).toMatch(/34\.5/)
    expect(container.textContent).toMatch(/190/)
  })

  it('recomputes when the transmit current changes', () => {
    const { container } = renderWithProviders(<EfficiencyCalculator />)
    const current = container.querySelector('input#eff-current') as HTMLInputElement
    fireEvent.change(current, { target: { value: '10' } })
    // P_DC = 13.8 × 10 = 138 W; η = 100/138 = 72.5 %; heat = 38 W
    expect(container.textContent).toMatch(/138/)
    expect(container.textContent).toMatch(/72\.5/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<EfficiencyCalculator />, { language: 'uk' })
    expect(container.querySelector('input#eff-volt')).not.toBeNull()
  })
})
