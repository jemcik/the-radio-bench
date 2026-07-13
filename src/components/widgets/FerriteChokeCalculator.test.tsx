import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import FerriteChokeCalculator from './FerriteChokeCalculator'

describe('FerriteChokeCalculator', () => {
  it('applies the N² rule — 3 turns give 900 Ω from a 100 Ω single pass', () => {
    const { container } = renderWithProviders(<FerriteChokeCalculator />)
    // default 3 turns → 100 × 3² = 900 Ω
    expect(container.textContent).toMatch(/900/)
  })

  it('recomputes as turns rise: 5 turns → 2500 Ω, an effective choke', () => {
    const { container } = renderWithProviders(<FerriteChokeCalculator />)
    const t = container.querySelector('input#fc-turns') as HTMLInputElement
    fireEvent.change(t, { target: { value: '5' } })
    // 100 × 5² = 2500 Ω (≥ 1 kΩ → effective)
    expect(container.textContent).toMatch(/2500/)
  })

  it('a single pass is just 100 Ω', () => {
    const { container } = renderWithProviders(<FerriteChokeCalculator />)
    const t = container.querySelector('input#fc-turns') as HTMLInputElement
    fireEvent.change(t, { target: { value: '1' } })
    expect(container.textContent).toMatch(/100/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<FerriteChokeCalculator />, { language: 'uk' })
    expect(container.querySelector('input#fc-turns')).not.toBeNull()
  })
})
