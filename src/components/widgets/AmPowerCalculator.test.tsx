import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import AmPowerCalculator from './AmPowerCalculator'

describe('AmPowerCalculator', () => {
  it('splits power per the ARRL example at 100 W, m = 1', () => {
    const { container } = renderWithProviders(<AmPowerCalculator />)
    // defaults: carrier 100 W, m = 1, audio 3 kHz
    // each sideband = 100·1/4 = 25 W; total = 150 W; bandwidth = 6 kHz
    expect(container.textContent).toMatch(/25/)
    expect(container.textContent).toMatch(/150/)
    expect(container.textContent).toMatch(/6 kHz/)
  })

  it('recomputes total power when the carrier changes', () => {
    const { container } = renderWithProviders(<AmPowerCalculator />)
    const carrier = container.querySelector('input#amp-carrier') as HTMLInputElement
    fireEvent.change(carrier, { target: { value: '50' } })
    // total = 50 + 2·(50/4) = 75 W
    expect(container.textContent).toMatch(/75/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<AmPowerCalculator />, { language: 'uk' })
    expect(container.querySelector('input#amp-carrier')).not.toBeNull()
  })
})
