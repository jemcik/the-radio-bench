import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import HarmonicReachCalculator from './HarmonicReachCalculator'

describe('HarmonicReachCalculator', () => {
  it('shows a 6 m signal whose 2nd harmonic lands in FM broadcast (default 50 MHz)', () => {
    const { container } = renderWithProviders(<HarmonicReachCalculator />)
    // 50 MHz (6 m) → 100 / 150 / 200 / 250 MHz
    expect(container.textContent).toMatch(/100\.00/)
    expect(container.textContent).toMatch(/150\.00/)
    expect(container.textContent).toMatch(/200\.00/)
    expect(container.textContent).toMatch(/250\.00/)
    // home band identified as 6 m
    expect(container.textContent).toMatch(/6 m/)
    // 2nd harmonic (100 MHz) is in the FM broadcast band → the FM service is named
    expect(container.textContent).toMatch(/FM/)
  })

  it('recomputes for a 40 m signal — harmonics land on other amateur bands', () => {
    const { container } = renderWithProviders(<HarmonicReachCalculator />)
    const f = container.querySelector('input#hr-f') as HTMLInputElement
    fireEvent.change(f, { target: { value: '7' } })
    // 7 MHz → 14 (20 m), 21 (15 m), 28 (10 m), 35 (none)
    expect(container.textContent).toMatch(/14\.00/)
    expect(container.textContent).toMatch(/21\.00/)
    expect(container.textContent).toMatch(/28\.00/)
    expect(container.textContent).toMatch(/35\.00/)
    expect(container.textContent).toMatch(/20 m/)
    expect(container.textContent).toMatch(/10 m/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<HarmonicReachCalculator />, { language: 'uk' })
    expect(container.querySelector('input#hr-f')).not.toBeNull()
  })
})
