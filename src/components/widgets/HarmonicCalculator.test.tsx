import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import HarmonicCalculator from './HarmonicCalculator'

describe('HarmonicCalculator', () => {
  it('computes 2×/3×/4× harmonics and their amateur bands for the default 7.0 MHz', () => {
    const { container } = renderWithProviders(<HarmonicCalculator />)
    // 7 MHz → 14 (20 m), 21 (15 m), 28 (10 m) — all land on amateur bands
    expect(container.textContent).toMatch(/14\.00/)
    expect(container.textContent).toMatch(/21\.00/)
    expect(container.textContent).toMatch(/28\.00/)
    expect(container.textContent).toMatch(/20 m/)
    expect(container.textContent).toMatch(/15 m/)
    expect(container.textContent).toMatch(/10 m/)
  })

  it('shows «no amateur band» when the harmonics miss every band (5 MHz)', () => {
    const { container } = renderWithProviders(<HarmonicCalculator />)
    const f = container.querySelector('input#harm-f') as HTMLInputElement
    fireEvent.change(f, { target: { value: '5' } })
    // 5 MHz → 10, 15, 20 MHz — none of them in an amateur band
    expect(container.textContent).toMatch(/10\.00/)
    expect(container.textContent).toMatch(/20\.00/)
    expect(container.textContent).toMatch(/no amateur band/)
  })

  it('recomputes for a 14 MHz input (2nd harmonic = 28 MHz, 10 m)', () => {
    const { container } = renderWithProviders(<HarmonicCalculator />)
    const f = container.querySelector('input#harm-f') as HTMLInputElement
    fireEvent.change(f, { target: { value: '14' } })
    // 14 MHz → 28 (10 m), 42 (none), 56 (none)
    expect(container.textContent).toMatch(/28\.00/)
    expect(container.textContent).toMatch(/42\.00/)
    expect(container.textContent).toMatch(/56\.00/)
    expect(container.textContent).toMatch(/10 m/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<HarmonicCalculator />, { language: 'uk' })
    expect(container.querySelector('input#harm-f')).not.toBeNull()
  })
})
