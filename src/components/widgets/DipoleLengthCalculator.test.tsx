import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import DipoleLengthCalculator from './DipoleLengthCalculator'

describe('DipoleLengthCalculator', () => {
  it('computes total / leg / feet for the default 7.1 MHz', () => {
    const { container } = renderWithProviders(<DipoleLengthCalculator />)
    // 143/7.1 = 20.14 m total, 10.07 m per leg, 468/7.1 = 65.92 ft
    expect(container.textContent).toMatch(/20\.14/)
    expect(container.textContent).toMatch(/10\.07/)
    expect(container.textContent).toMatch(/65\.92/)
  })

  it('recomputes for a typed 14 MHz input', () => {
    const { container } = renderWithProviders(<DipoleLengthCalculator />)
    const f = container.querySelector('input#dip-f') as HTMLInputElement
    fireEvent.change(f, { target: { value: '14' } })
    // 143/14 = 10.21 m total
    expect(container.textContent).toMatch(/10\.21/)
  })

  it('jumps to the 2 m band when its preset button is clicked', () => {
    const { container } = renderWithProviders(<DipoleLengthCalculator />)
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === '2 m')!
    fireEvent.click(btn)
    // 143/145 = 0.99 m total — a tiny dipole
    expect(container.textContent).toMatch(/0\.99/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<DipoleLengthCalculator />, { language: 'uk' })
    expect(container.querySelector('input#dip-f')).not.toBeNull()
  })
})
