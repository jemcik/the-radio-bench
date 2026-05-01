import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import VnaFilterSweepMock from './VnaFilterSweepMock'

/* VnaFilterSweepMock smoke tests.
 *
 * Default state: shape=LPF, f_c = 10 kHz, order = 2 (second-order LC).
 * Switching the shape tab swaps the readout's bottom box from
 * "Order" to "Q (band shapes)".
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<VnaFilterSweepMock />, { language })
}

describe('VnaFilterSweepMock', () => {
  it('renders the default f_c ≈ 10 kHz', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/10\s*kHz/)
  })

  it('starts on the LPF tab and shows "Low-pass" in the shape readout', () => {
    const { container } = setup()
    const lpfButton = container.querySelector('button[aria-pressed="true"]')
    expect(lpfButton?.textContent).toMatch(/Low-pass/)
  })

  it('switching to BPF swaps the order slider for a Q slider', () => {
    const { getByRole } = setup()
    const bpfButton = getByRole('button', { name: /Band-pass/i })
    fireEvent.click(bpfButton)
    // Order slider should be gone; Q slider should appear with id "vna-sweep-q"
    expect(document.getElementById('vna-sweep-order')).toBeNull()
    expect(document.getElementById('vna-sweep-q')).not.toBeNull()
  })

  it('renders an SVG plot trace', () => {
    const { container } = setup()
    const traces = container.querySelectorAll('path[d^="M"]')
    expect(traces.length).toBeGreaterThan(0)
  })

  /*
   * Regression: at the exact notch centre f_0, the BSF transfer
   * magnitude is 0 → log10(0) = −Infinity → dbToY = Infinity →
   * `.toFixed()` emits the string «Infinity», which is an invalid SVG
   * path coord and aborts the rest of the trace. With the default
   * fcLog10 = 4 and STEPS = 280 over [log10(100), log10(1e6)],
   * sample i = 140 lands exactly on f_0, hitting the singularity.
   * The trace must contain only finite path coordinates.
   */
  it('BSF trace at default f_0 contains no Infinity / NaN path coords', () => {
    const { container, getByRole } = setup()
    const bsfButton = getByRole('button', { name: /Band-stop/i })
    fireEvent.click(bsfButton)
    const traces = container.querySelectorAll('path[d^="M"]')
    for (const t of traces) {
      const d = t.getAttribute('d') ?? ''
      expect(d).not.toMatch(/Infinity|NaN/)
    }
  })

  /*
   * Regression: at high Q (e.g. 50), the BSF notch is narrower than
   * one base-grid sample. Without f_0-centred fine sampling the trace
   * just kisses 0 dB everywhere and the notch is invisible. The trace
   * must reach at least −20 dB somewhere — a depth that requires
   * either a sample close enough to f_0 OR the exact-f_0 sample
   * (which clamps to far-below-plot via the dbToY non-finite guard).
   *
   * We probe by extracting all (x, y) pairs from the SVG path and
   * checking that at least one sample's y is well below the dbToY(-20)
   * line. Because dbToY clamps non-finite db to PLOT_BOTTOM + 10000,
   * the f_0 sample alone satisfies this.
   */
  it('BSF trace at high Q reaches at least -20 dB on the notch dip', () => {
    const { container, getByRole } = setup()
    const bsfButton = getByRole('button', { name: /Band-stop/i })
    fireEvent.click(bsfButton)
    // Default Q is 8 — bump to 50 to force the narrow-notch regime.
    const qSlider = document.getElementById('vna-sweep-q') as HTMLInputElement
    fireEvent.change(qSlider, { target: { value: '50' } })
    const traces = container.querySelectorAll('path[d^="M"]')
    expect(traces.length).toBeGreaterThan(0)
    const d = traces[traces.length - 1]?.getAttribute('d') ?? ''
    // Extract all y coords from "M x y" / "L x y" commands
    const ys: number[] = []
    for (const m of d.matchAll(/[ML]\s+[\d.-]+\s+([\d.-]+)/g)) {
      ys.push(Number(m[1]))
    }
    expect(ys.length).toBeGreaterThan(0)
    // dbToY for the widget: PLOT_TOP=28, PLOT_H=320-28-56=236,
    // Y_MAX_DB=5, Y_MIN_DB=-60. y(-20) = 28 + (5-(-20))/65 * 236 = 28 + 90.77 = 118.77
    const Y_AT_MINUS_20_DB = 118.77
    const maxY = Math.max(...ys)
    expect(maxY).toBeGreaterThan(Y_AT_MINUS_20_DB)
  })
})
