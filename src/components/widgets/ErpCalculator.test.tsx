import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import ErpCalculator from './ErpCalculator'

describe('ErpCalculator', () => {
  it('computes ERP and EIRP for 100 W, 1 dB loss, 6 dBd gain', () => {
    const { container } = renderWithProviders(<ErpCalculator />)
    // system gain +5 dB → ERP = 100·10^0.5 ≈ 316 W; EIRP = 316·1.64 ≈ 519 W
    expect(container.textContent).toMatch(/\+5\.0/)
    expect(container.textContent).toMatch(/316/)
    expect(container.textContent).toMatch(/519/)
  })

  it('a plain dipole with no line loss radiates its full power as ERP', () => {
    const { container } = renderWithProviders(<ErpCalculator />)
    fireEvent.change(container.querySelector('input#erp-l') as HTMLInputElement, { target: { value: '0' } })
    fireEvent.change(container.querySelector('input#erp-g') as HTMLInputElement, { target: { value: '0' } })
    // system gain 0 dB → ERP = 100 W, EIRP = 100·1.64 ≈ 164 W
    expect(container.textContent).toMatch(/\+0\.0/)
    expect(container.textContent).toMatch(/100/)
    expect(container.textContent).toMatch(/164/)
  })

  it('shows a negative system gain when loss exceeds gain', () => {
    const { container } = renderWithProviders(<ErpCalculator />)
    fireEvent.change(container.querySelector('input#erp-g') as HTMLInputElement, { target: { value: '0' } })
    // gain 0 dBd, loss 1 dB → system gain −1.0 dB
    expect(container.textContent).toMatch(/−1\.0/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<ErpCalculator />, { language: 'uk' })
    expect(container.querySelector('input#erp-p')).not.toBeNull()
  })
})
