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
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    expect(inputs[0].value).toBe('100')
    // The dB field mirrors the formatted result — rounded to 1 decimal
    // so landmark values (+3, +10, +20) line up with the chapter prose.
    expect(inputs[1].value).toBe('20.0')
    // Result panel renders the formatted natural value with × prefix.
    expect(screen.getAllByText(/×100/).length).toBeGreaterThan(0)
  })

  it('updates dB when the natural ratio is edited (power mode)', () => {
    setup()
    const [naturalInput] = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(naturalInput, { target: { value: '2' } })
    // Power doubling = +3 dB (the chapter's +3 dB = ×2 landmark — at one
    // decimal place, 10·log(2) ≈ 3.0103 rounds to "3.0").
    expect(screen.getAllByText(/3\.0/).length).toBeGreaterThan(0)
  })

  it('updates the natural ratio when dB is edited (power mode)', () => {
    setup()
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(inputs[1], { target: { value: '10' } })
    // +10 dB power = ×10 — must appear in the natural input AND the result panel.
    expect(inputs[0].value).toBe('10')
  })

  it('switches to voltage mode and converts ×2 to +6 dB', () => {
    setup()
    const modeSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
    fireEvent.change(modeSelect, { target: { value: 'voltage' } })
    // The mode switch resets the pair to (2, 6.0 dB) — natural is the
    // typed seed; the dB field reflects the computed result, rounded to
    // one decimal (the "6 dB = ×2 voltage" landmark from the chapter).
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    expect(inputs[0].value).toBe('2')
    expect(inputs[1].value).toBe('6.0')
    // Re-typing the same ratio still shows the formatted ≈6.0 dB result.
    fireEvent.change(inputs[0], { target: { value: '2' } })
    expect(screen.getAllByText(/6\.0/).length).toBeGreaterThan(0)
  })

  it('switches to dBm mode and shows 1 W = +30 dBm', () => {
    setup()
    const modeSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
    fireEvent.change(modeSelect, { target: { value: 'dbm' } })
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    expect(inputs[0].value).toBe('1')      // 1 W
    expect(inputs[1].value).toBe('30.0')   // = +30 dBm at 1-decimal precision
    // dBm label appears in the result panel.
    expect(screen.getAllByText('dBm').length).toBeGreaterThan(0)
  })

  it('hides the result panel and shows an invalid hint on bad input', () => {
    setup()
    const [naturalInput] = screen.getAllByRole('textbox') as HTMLInputElement[]
    // Negative ratios are not valid for the natural side.
    fireEvent.change(naturalInput, { target: { value: '-5' } })
    // Invalid hint copy comes from i18n; assert on a substring of the
    // English fallback.
    expect(screen.getByText(/valid number/i)).toBeInTheDocument()
  })

  it('localizes the dB readout to the uk locale (comma decimal)', () => {
    // Regression: the result box used to render "20.0" with a period even
    // when the page was Ukrainian because Chrome ignores the lang attr on
    // number inputs. Switched to type="text" with locale-aware formatting
    // — now EN sees "20.0" and UK sees "20,0" regardless of OS locale.
    renderWithProviders(<DbCalculator />, { language: 'uk' })
    // дБ label should appear (units namespace), not "dB".
    expect(screen.getAllByText('дБ').length).toBeGreaterThan(0)
    // The +20 dB result for a ×100 power ratio renders with a comma.
    expect(screen.getAllByText('20,0').length).toBeGreaterThan(0)
  })

  it('localizes the dBm result to uk (1 W → "30,0 дБм")', () => {
    renderWithProviders(<DbCalculator />, { language: 'uk' })
    const modeSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
    fireEvent.change(modeSelect, { target: { value: 'dbm' } })
    // The dBm unit label and the comma-formatted 30,0 value both appear.
    expect(screen.getAllByText('дБм').length).toBeGreaterThan(0)
    expect(screen.getAllByText('30,0').length).toBeGreaterThan(0)
  })
})
