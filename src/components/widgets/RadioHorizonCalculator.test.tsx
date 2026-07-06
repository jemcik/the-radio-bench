import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RadioHorizonCalculator from './RadioHorizonCalculator'

describe('RadioHorizonCalculator', () => {
  it('computes the radio and visual horizon for the default 10 m / 10 m', () => {
    const { container } = renderWithProviders(<RadioHorizonCalculator />)
    // 4.12 × (√10 + √10) = 4.12 × 6.3246 = 26.06 km; 3.57 × 6.3246 = 22.58 km
    expect(container.textContent).toMatch(/26\.06/)
    expect(container.textContent).toMatch(/22\.58/)
  })

  it('recomputes when the "their antenna" height changes to 100 m', () => {
    const { container } = renderWithProviders(<RadioHorizonCalculator />)
    const rx = container.querySelector('input#horizon-rx') as HTMLInputElement
    fireEvent.change(rx, { target: { value: '100' } })
    // 4.12 × (√10 + √100) = 4.12 × (3.1623 + 10) = 4.12 × 13.1623 = 54.23 km
    expect(container.textContent).toMatch(/54\.23/)
  })

  it('applies the 300 m tower preset to the your-antenna height', () => {
    const { container } = renderWithProviders(<RadioHorizonCalculator />)
    const tx = container.querySelector('input#horizon-tx') as HTMLInputElement
    const btn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('300'),
    )!
    fireEvent.click(btn)
    expect(tx.value).toBe('300')
    // 4.12 × (√300 + √10) = 4.12 × (17.3205 + 3.1623) = 4.12 × 20.4828 = 84.39 km
    expect(container.textContent).toMatch(/84\.39/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<RadioHorizonCalculator />, { language: 'uk' })
    expect(container.querySelector('input#horizon-tx')).not.toBeNull()
  })
})
