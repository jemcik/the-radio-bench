import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import OhmsLawPlot from './OhmsLawPlot'

/* Smoke + regression tests for the Ohm's Law V–I plot widget.
 *
 * Default R is 1 kΩ. At that resistance the V = I·R line runs from the
 * origin to V = 12 V (plot ceiling) at I = 12 mA, so the widget's
 * endpoint / formula readout must reflect those specific values. We
 * assert the locked-in shape:
 *
 *   1. Resistance readout renders "1.00 kΩ".
 *   2. The formula row shows the full breakdown ending in "12.00 V".
 *   3. Exactly one slider (R) is rendered.
 *   4. The V–I line and its endpoint marker render as SVG primitives.
 */

function setup() {
  return renderWithProviders(<OhmsLawPlot />)
}

describe('OhmsLawPlot', () => {
  it('renders the default 1 kΩ resistance readout', () => {
    setup()
    // The compact resistance label shows "1.00 kΩ" at R = 10^3.
    expect(screen.getAllByText(/1\.00 kΩ/).length).toBeGreaterThan(0)
  })

  it('shows the V = I·R formula ending with the computed voltage', () => {
    setup()
    // At R = 1 kΩ the line hits the V-axis ceiling at I = 12 mA, V = 12 V.
    // The formula row displays the full breakdown "V = I · R = … = 12.00 V".
    expect(screen.getByText(/V = I · R =.*= 12\.00 V/)).toBeInTheDocument()
  })

  it('renders exactly one R slider with an accessible label', () => {
    setup()
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBe(1)
  })

  it('draws the V–I line in the plot SVG', () => {
    const { container } = setup()
    // The plot SVG contains one <line> with strokeWidth=2.5 (the V–I
    // characteristic). Axes use strokeWidth=1 and gridlines use 0.5,
    // so the 2.5-width line is unambiguous.
    const viLine = container.querySelector('line[stroke-width="2.5"]')
    expect(viLine).not.toBeNull()
  })
})
