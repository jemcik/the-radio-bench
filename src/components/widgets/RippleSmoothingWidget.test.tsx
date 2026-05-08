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

  it('smoothed trace has no large sample-to-sample jumps (rendering-bug regression)', () => {
    // Regression for the «mid-rising-edge V_PEAK reset» rendering bug.
    //
    // Symptom: at small C the smoothed curve had a near-vertical V-shape
    // around each rectified zero-crossing — `sineV → ~V_PEAK · exp(-dt/RC)
    // → V_PEAK` in two consecutive samples, jumping ~100+ px (most of
    // the plot height) per sample. The user spotted it on a screenshot.
    //
    // Cause: the previous algorithm tracked `lastPeakT` and updated it
    // on every sample where `sineV ≥ dischargeV`, including mid-rising-
    // edge samples where the actual cap voltage was nowhere near
    // V_PEAK. The discharge formula then started «from V_PEAK at this
    // mid-rising-edge t» — producing a phantom jump up to ≈V_PEAK and a
    // follow-on phantom drop back down.
    //
    // The fix uses analytic peak times (peaks of |sin(2π·F·t)| sit at
    // t = T_period/2 + k·T_period) — no state, no `lastPeakT`. The
    // resulting curve is mathematically continuous: the steepest part
    // is the rising edge of |sin|, slope at zero-crossing = 2π·F·V_peak
    // ≈ 3.77 V/ms ≈ 0.25 V per 40/600-ms sample ≈ 3.5 px per sample.
    // With the bug, jumps of 100+ px appeared. We assert the max
    // sample-to-sample y-jump stays well under 10 px — comfortably
    // above the continuous bound, far below the buggy regime.
    const { container } = setup()
    const smoothed = container.querySelector('path[stroke-width="2.5"]')
    expect(smoothed).not.toBeNull()
    const d = smoothed!.getAttribute('d') ?? ''
    const pts: Array<[number, number]> = []
    for (const m of d.matchAll(/[ML]([\d.]+)\s+([\d.]+)/g)) {
      pts.push([parseFloat(m[1]), parseFloat(m[2])])
    }
    expect(pts.length).toBeGreaterThan(100)
    let maxJumpPx = 0
    for (let i = 1; i < pts.length; i++) {
      const dy = Math.abs(pts[i][1] - pts[i - 1][1])
      if (dy > maxJumpPx) maxJumpPx = dy
    }
    expect(maxJumpPx).toBeLessThan(10)
  })
})
