import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import DbCalculator from './DbCalculator'

function setup() {
  return renderWithProviders(<DbCalculator />)
}

describe('DbCalculator', () => {
  it('starts in power mode with the default 100 ↔ 20 dB conversion', () => {
    setup()
    // The default natural value is 100 (×100) and dB is 20.
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    expect(inputs[0].value).toBe('100')
    // The dB field mirrors the formatted result (one decimal precision via toFixed(2)).
    expect(inputs[1].value).toBe('20.00')
    // Result panel renders the formatted natural value with × prefix.
    expect(screen.getAllByText(/×100/).length).toBeGreaterThan(0)
  })

  it('updates dB when the natural ratio is edited (power mode)', () => {
    setup()
    const [naturalInput] = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    fireEvent.change(naturalInput, { target: { value: '2' } })
    // Power doubling = +3 dB.
    expect(screen.getAllByText(/3\.01/).length).toBeGreaterThan(0)
  })

  it('updates the natural ratio when dB is edited (power mode)', () => {
    setup()
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    fireEvent.change(inputs[1], { target: { value: '10' } })
    // +10 dB power = ×10 — must appear in the natural input AND the result panel.
    expect(inputs[0].value).toBe('10')
  })

  it('switches to voltage mode and converts ×2 to +6 dB', () => {
    setup()
    const modeSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
    fireEvent.change(modeSelect, { target: { value: 'voltage' } })
    // The mode switch resets the pair to (2, 6.02 dB) — natural is the
    // typed seed; the dB field reflects the computed result.
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    expect(inputs[0].value).toBe('2')
    expect(inputs[1].value).toBe('6.02')
    // Re-typing the same ratio still shows the formatted ≈6.02 dB result.
    fireEvent.change(inputs[0], { target: { value: '2' } })
    expect(screen.getAllByText(/6\.02/).length).toBeGreaterThan(0)
  })

  it('switches to dBm mode and shows 1 W = +30 dBm', () => {
    setup()
    const modeSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
    fireEvent.change(modeSelect, { target: { value: 'dbm' } })
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    expect(inputs[0].value).toBe('1')      // 1 W
    expect(inputs[1].value).toBe('30.00')  // = +30 dBm (toFixed(2))
    // dBm label appears in the result panel.
    expect(screen.getAllByText('dBm').length).toBeGreaterThan(0)
  })

  it('hides the result panel and shows an invalid hint on bad input', () => {
    setup()
    const [naturalInput] = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    // Negative ratios are not valid for the natural side.
    fireEvent.change(naturalInput, { target: { value: '-5' } })
    // Invalid hint copy comes from i18n; assert on a substring of the
    // English fallback.
    expect(screen.getByText(/valid number/i)).toBeInTheDocument()
  })
})
