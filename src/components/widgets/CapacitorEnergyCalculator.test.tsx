import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import CapacitorEnergyCalculator from './CapacitorEnergyCalculator'

describe('CapacitorEnergyCalculator', () => {
  it('the worked example: 100 µF at 400 V = 8.00 J', () => {
    const { container } = renderWithProviders(<CapacitorEnergyCalculator />)
    // ½ × 100e-6 × 400² = 8.000 J exactly (ARRL Handbook 2023 ch22 arithmetic)
    expect(container.textContent).toMatch(/8\.00/)
  })

  it('applies the 0.25 J NFPA 70E threshold at 400 V and up — 8 J is 32× over', () => {
    const { container } = renderWithProviders(<CapacitorEnergyCalculator />)
    expect(container.textContent).toMatch(/32×/)
    expect(container.textContent).toMatch(/0\.25/)
  })

  it('uses the looser 1 J threshold between 100 V and 400 V', () => {
    const { container } = renderWithProviders(<CapacitorEnergyCalculator />)
    const v = container.querySelector('input#ce-v') as HTMLInputElement
    fireEvent.change(v, { target: { value: '200' } })
    // ½ × 100e-6 × 200² = 2.00 J, threshold 1 J → 2.0× over
    expect(container.textContent).toMatch(/2\.00/)
    expect(container.textContent).toMatch(/2\.0× over the 1\.00 J limit/)
  })

  it('a low-voltage rail is genuinely under the limit', () => {
    const { container } = renderWithProviders(<CapacitorEnergyCalculator />)
    const v = container.querySelector('input#ce-v') as HTMLInputElement
    fireEvent.change(v, { target: { value: '25' } })
    // ½ × 100e-6 × 25² = 0.031 J, and below 100 V the threshold is 100 J
    expect(container.textContent).toMatch(/under the 100\.00 J limit/)
  })

  it('energy goes as V² — quadrupling, not doubling, when voltage doubles', () => {
    const { container } = renderWithProviders(<CapacitorEnergyCalculator />)
    const v = container.querySelector('input#ce-v') as HTMLInputElement
    fireEvent.change(v, { target: { value: '1000' } })
    // ½ × 100e-6 × 1000² = 50 J
    expect(container.textContent).toMatch(/50\.00/)
    fireEvent.change(v, { target: { value: '2000' } })
    // ½ × 100e-6 × 2000² = 200 J — 4× the energy for 2× the volts
    expect(container.textContent).toMatch(/200\.00/)
  })

  it('shows the dielectric-absorption recovery band, 10–15 % of the soak voltage', () => {
    const { container } = renderWithProviders(<CapacitorEnergyCalculator />)
    // 400 V × 10–15 % = 40–60 V
    expect(container.textContent).toMatch(/40–60/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<CapacitorEnergyCalculator />, { language: 'uk' })
    expect(container.querySelector('input#ce-uf')).not.toBeNull()
  })
})
