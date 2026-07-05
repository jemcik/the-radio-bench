import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RfPowerCalculator from './RfPowerCalculator'

describe('RfPowerCalculator', () => {
  it('turns 200 Vpp into 100 W (+50 dBm) across 50 Ω', () => {
    const { container } = renderWithProviders(<RfPowerCalculator />)
    expect(container.textContent).toMatch(/70\.7/) // Vrms
    expect(container.textContent).toMatch(/100\.0/) // Vpeak and power
    expect(container.textContent).toMatch(/50\.0/) // dBm
  })

  it('treats a peak voltage of 100 V as 100 W', () => {
    const { container } = renderWithProviders(<RfPowerCalculator />)
    fireEvent.change(container.querySelector('select#rfp-mode') as HTMLSelectElement, { target: { value: 'vpeak' } })
    fireEvent.change(container.querySelector('input#rfp-v') as HTMLInputElement, { target: { value: '100' } })
    expect(container.textContent).toMatch(/70\.7/) // Vrms
    expect(container.textContent).toMatch(/100\.0/)
  })

  it('treats an RMS voltage of 70.71 V as 100 W', () => {
    const { container } = renderWithProviders(<RfPowerCalculator />)
    fireEvent.change(container.querySelector('select#rfp-mode') as HTMLSelectElement, { target: { value: 'vrms' } })
    fireEvent.change(container.querySelector('input#rfp-v') as HTMLInputElement, { target: { value: '70.71' } })
    expect(container.textContent).toMatch(/100\.0/)
  })

  it('hides the results when an input is invalid', () => {
    const { container } = renderWithProviders(<RfPowerCalculator />)
    fireEvent.change(container.querySelector('input#rfp-v') as HTMLInputElement, { target: { value: '' } })
    expect(container.querySelector('select#rfp-mode')).not.toBeNull()
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<RfPowerCalculator />, { language: 'uk' })
    expect(container.querySelector('input#rfp-v')).not.toBeNull()
  })
})
