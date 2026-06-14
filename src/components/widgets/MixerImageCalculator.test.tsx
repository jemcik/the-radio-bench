import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import MixerImageCalculator from './MixerImageCalculator'

describe('MixerImageCalculator', () => {
  it('computes LO, image and offset for the default 7.0 MHz / 455 kHz / LO high', () => {
    const { container } = renderWithProviders(<MixerImageCalculator />)
    // LO = 7.0 + 0.455 = 7.455 MHz; image = 7.0 + 0.910 = 7.910 MHz; offset = 910 kHz
    expect(container.textContent).toMatch(/7\.455/)
    expect(container.textContent).toMatch(/7\.910/)
    expect(container.textContent).toMatch(/910/)
  })

  it('drops the LO and image below the station when the oscillator is set low', () => {
    const { container } = renderWithProviders(<MixerImageCalculator />)
    const side = container.querySelector('select#mix-side') as HTMLSelectElement
    fireEvent.change(side, { target: { value: 'low' } })
    // LO = 7.0 − 0.455 = 6.545 MHz; image = 7.0 − 0.910 = 6.090 MHz
    expect(container.textContent).toMatch(/6\.545/)
    expect(container.textContent).toMatch(/6\.090/)
  })

  it('recomputes when the wanted station changes', () => {
    const { container } = renderWithProviders(<MixerImageCalculator />)
    const rf = container.querySelector('input#mix-rf') as HTMLInputElement
    fireEvent.change(rf, { target: { value: '14.0' } })
    // LO = 14.0 + 0.455 = 14.455 MHz; image = 14.0 + 0.910 = 14.910 MHz
    expect(container.textContent).toMatch(/14\.455/)
    expect(container.textContent).toMatch(/14\.910/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<MixerImageCalculator />, { language: 'uk' })
    expect(container.querySelector('input#mix-rf')).not.toBeNull()
  })
})
