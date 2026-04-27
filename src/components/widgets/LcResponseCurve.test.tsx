import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import LcResponseCurve from './LcResponseCurve'

/* LcResponseCurve smoke tests.
 *
 * Default state: L = 4 µH, C = 130 pF, R = 5 Ω.
 *   Z₀ = √(L/C) = √(30 769) ≈ 175 Ω
 *   Q  = Z₀ / R = 175 / 5 ≈ 35.1
 *   f₀ ≈ 6.98 MHz
 *   BW = f₀ / Q ≈ 199 kHz
 *
 * These map straight onto the three readouts (f₀, Q, BW) and a
 * curve path under the SVG. We only check the readouts here — the
 * curve itself is exercised visually.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<LcResponseCurve />, { language })
}

describe('LcResponseCurve', () => {
  it('renders the default f₀ ≈ 6.98 MHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/6\.98\s*MHz/)
  })

  it('renders the default Q ≈ 35', () => {
    const { container } = setup()
    // Q text smushes against the next readout label (no whitespace), so
    // we anchor only on the leading word-boundary and accept the value
    // with or without a one-decimal suffix.
    expect(container.textContent).toMatch(/Q35(?:\.[0-9])?/)
  })

  it('renders the default BW ≈ 199 kHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/19[89]\s*kHz/)
  })

  it('toggling to series mode changes the Y-axis label', () => {
    const { container } = setup()
    // Default is parallel — so the parallel y-axis label should appear.
    expect(container.textContent).toContain('|Z| (Ω)')
    const seriesRadio = screen.getByRole('radio', { name: /Series LC/i })
    fireEvent.click(seriesRadio)
    expect(container.textContent).toContain('current (relative)')
  })

  it('lowering R to 1 Ω raises Q above 100', () => {
    const { container } = setup()
    const rInput = document.getElementById('lcr-val-r') as HTMLInputElement
    fireEvent.change(rInput, { target: { value: '1' } })
    // Z₀ = 175 Ω, R = 1 Ω → Q ≈ 175. Q is sandwiched between «Q» and
    // «BW» without whitespace, so anchor on Q on the left.
    expect(container.textContent).toMatch(/Q17[45](?:\.[0-9])?/)
  })
})
