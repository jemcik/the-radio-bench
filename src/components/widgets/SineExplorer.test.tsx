import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SineExplorer from './SineExplorer'

/* Smoke + regression tests for the Sine Explorer widget.
 *
 * Defaults: A = 5 V, f = 100 Hz (fLog = 2), T = 10 ms.
 * The readout below the plot must show all three numbers in locked
 * format — the chapter prose references these exact values.
 */

function setup() {
  return renderWithProviders(<SineExplorer />)
}

describe('SineExplorer', () => {
  it('renders the default amplitude readout (5.0 V)', () => {
    setup()
    // The amplitude slider header shows "5.0 V" at default.
    expect(screen.getAllByText(/5\.0\s*V/).length).toBeGreaterThan(0)
  })

  it('renders the default frequency readout (100 Hz)', () => {
    setup()
    expect(screen.getAllByText(/100\s*Hz/).length).toBeGreaterThan(0)
  })

  it('shows T = 1/f worked out to 10.00 ms at defaults', () => {
    setup()
    // The period row spells out the reciprocal calculation.
    expect(screen.getByText(/T = 1 \/ f =.*10\.00 ms/)).toBeInTheDocument()
  })

  it('renders two sliders (amplitude + frequency)', () => {
    setup()
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBe(2)
  })
})
