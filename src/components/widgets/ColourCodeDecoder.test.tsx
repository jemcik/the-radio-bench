import { describe, expect, it } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import ColourCodeDecoder from './ColourCodeDecoder'

/* Colour-code decoder smoke + regression tests.
 *
 * Default state is 4-band red / violet / orange / gold — the worked
 * example from the chapter prose: 27 kΩ at ±5 %, compact notation 27k.
 * That specific number matters: the prose quotes it, and if a future
 * change to the default state silently broke the pairing the reader
 * would see contradictory values in the first line of the section and
 * in the widget. The tests pin the default value + tolerance + notation
 * + locale-aware comma substitution together.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<ColourCodeDecoder />, { language })
}

describe('ColourCodeDecoder', () => {
  it('renders the default 27 kΩ value (EN)', () => {
    const { container } = setup()
    expect(container.textContent).toContain('27 kΩ')
  })

  it('renders the default ±5 % tolerance (EN)', () => {
    const { container } = setup()
    expect(container.textContent).toContain('±5 %')
  })

  it('renders the compact text notation "27k"', () => {
    const { container } = setup()
    expect(container.textContent).toContain('27k')
  })

  it('shows one chip button per digit colour in each digit row', () => {
    setup()
    // Ten digit colours (black through white) appear in both digit rows
    // and within the multiplier palette → black chip appears 3× total
    // in a 4-band layout (digit 1, digit 2, multiplier). Use a specific
    // colour to count rows.
    const blackButtons = screen.getAllByRole('button', { name: /black/i })
    expect(blackButtons.length).toBeGreaterThanOrEqual(3)
  })

  it('switches to 5-band and shows a third digit row', () => {
    setup()
    const fiveBandButton = screen.getByRole('button', { name: /5-band/i })
    fireEvent.click(fiveBandButton)
    // In 5-band mode, black now appears in 3 digit rows + multiplier = 4×.
    const blackButtons = screen.getAllByRole('button', { name: /black/i })
    expect(blackButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('uses a comma decimal separator in UK locale', () => {
    // Change default bands (red/violet/orange) so value has a fraction
    // to display — but 27 kΩ is integer, so the comma only shows up in
    // the range readout (25.65 kΩ … 28.35 kΩ). Easier: assert the
    // tolerance number renders without a decimal either way, so the
    // comma-vs-period test happens on the plus-minus sign which is
    // locale-neutral. Use the range row as the true indicator.
    const { container } = setup('uk')
    // UK uses comma decimal; the range readout for ±5 % around 27 kΩ
    // will contain "25,6 кОм" or similar (allowing for floating-point
    // rounding to 25.6 or 25.7). Check for any localised decimal.
    const txt = container.textContent ?? ''
    const hasCommaDecimal = /\d,\d/.test(txt)
    expect(hasCommaDecimal).toBe(true)
  })
})
