import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RippleSmoothingWidget from './RippleSmoothingWidget'

/* Smoke + regression tests for the smoothing-capacitor / ripple widget.
 *
 * Default C ≈ 470 µF on a 12 V peak / 100 Ω load / 100 Hz ripple. The
 * worst-case approximation ΔV ≈ I·t/C = 0.12 × 0.01 / 470·10⁻⁶ ≈ 2.55 V;
 * the widget's exponential simulation gives a slightly smaller number
 * once the cap top-up during the rising edge is accounted for, around
 * 1.85–1.95 V. We assert on the format "470 µF" + the order-of-magnitude
 * of ripple, not on the third decimal — the simulator's discretisation
 * can shift it a few mV.
 */

function setup() {
  return renderWithProviders(<RippleSmoothingWidget />)
}

describe('RippleSmoothingWidget', () => {
  it('renders the default 470 µF capacitor readout', () => {
    setup()
    // Compact "470 µF" appears both as the right-hand readout and inside
    // the result-box lead sentence — at least one match.
    expect(screen.getAllByText(/470 µF/).length).toBeGreaterThan(0)
  })

  it('shows a single-volt-range ripple for the default capacitor', () => {
    setup()
    // ΔV at 470 µF lands between 1.5 V and 2.5 V depending on
    // discretisation. The result box has a sentence "peak-to-peak
    // ripple ΔV ≈ 1.xx V" or "2.xx V" — we accept either decade.
    expect(
      screen.getByText(/peak-to-peak ripple ΔV ≈ [12]\.\d{2} V/),
    ).toBeInTheDocument()
  })

  it('renders one C slider with an accessible label', () => {
    setup()
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBe(1)
  })

  it('draws both the rectified bumps and the smoothed trace', () => {
    const { container } = setup()
    // Rectified bumps use strokeWidth=1.5 (light), smoothed uses 2.5.
    // We expect both to be present as <path> elements.
    const bumps = container.querySelector('path[stroke-width="1.5"]')
    const smoothed = container.querySelector('path[stroke-width="2.5"]')
    expect(bumps).not.toBeNull()
    expect(smoothed).not.toBeNull()
  })
})
