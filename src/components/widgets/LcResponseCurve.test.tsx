import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import LcResponseCurve from './LcResponseCurve'

/* LcResponseCurve smoke tests.
 *
 * Default state: L = 4 µH, C = 130 pF, R = 18 Ω.
 *   Z₀ = √(L/C) = √(30 769) ≈ 175 Ω
 *   Q  = Z₀ / R = 175 / 18 ≈ 9.74
 *   f₀ ≈ 6.98 MHz
 *   BW = f₀ / Q ≈ 717 kHz
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

  it('renders the default Q ≈ 9.7', () => {
    const { container } = setup()
    // Q text smushes against the next readout label (no whitespace), so
    // we anchor only on the leading word-boundary.
    expect(container.textContent).toMatch(/Q9\.[78]/)
  })

  it('renders the default BW ≈ 717 kHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/71[567]\s*kHz/)
  })

  it('renders Z at f₀ ≈ 1.71 kΩ in parallel mode (R_P = Q·X_L)', () => {
    const { container } = setup()
    // Parallel default: R_P = Q × 2π·f₀·L = 9.74 × 175 Ω ≈ 1.71 kΩ.
    expect(container.textContent).toMatch(/1\.7[01]\s*kΩ/)
  })

  it('Z at f₀ drops to R_loss = 18 Ω in series mode', () => {
    const { container } = setup()
    const seriesButton = screen.getByRole('button', { name: /Series LC/i })
    fireEvent.click(seriesButton)
    // Series at f₀: |Z|_min = R_loss = 18 Ω (the input value).
    expect(container.textContent).toMatch(/18\s*Ω/)
  })

  it('toggling to series mode changes the Y-axis label', () => {
    const { container } = setup()
    // Default is parallel — so the parallel y-axis label should appear.
    expect(container.textContent).toContain('|Z| (relative)')
    const seriesButton = screen.getByRole('button', { name: /Series LC/i })
    fireEvent.click(seriesButton)
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
