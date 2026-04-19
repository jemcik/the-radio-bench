import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RmsSelector from './RmsSelector'

/* Smoke + regression tests for the Peak · PP · Average · RMS selector.
 *
 * The waveform is fixed at 10 V peak, 100 Hz. The four derived values
 * are:
 *    Peak          = 10.00 V
 *    Peak-to-peak  = 20.00 V
 *    Average       =  6.37 V  (half-cycle, 2/π · V_pk)
 *    RMS           =  7.07 V  (V_pk / √2)
 *
 * These numbers are quoted verbatim in the chapter prose (Section 3 and
 * the mains-voltage worked examples), so the format is load-bearing.
 */

function setup() {
  return renderWithProviders(<RmsSelector />)
}

describe('RmsSelector', () => {
  it('renders all four numerical levels', () => {
    setup()
    // Readouts grid — each row shows "Label (V_x)  value V".
    expect(screen.getByText(/10\.00\s*V/)).toBeInTheDocument()  // peak
    expect(screen.getByText(/20\.00\s*V/)).toBeInTheDocument()  // peak-to-peak
    expect(screen.getByText(/6\.37\s*V/)).toBeInTheDocument()   // avg
    expect(screen.getByText(/7\.07\s*V/)).toBeInTheDocument()   // rms
  })

  it('renders the four mode tabs', () => {
    setup()
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(4)
  })

  it('defaults to RMS mode (aria-selected on the RMS tab)', () => {
    setup()
    const tabs = screen.getAllByRole('tab')
    const selected = tabs.filter((t) => t.getAttribute('aria-selected') === 'true')
    expect(selected.length).toBe(1)
    expect(selected[0]).toHaveTextContent(/RMS/)
  })

  it('switching to peak-to-peak updates aria-selected', () => {
    setup()
    const ppTab = screen.getByRole('tab', { name: /Peak-to-peak/i })
    fireEvent.click(ppTab)
    expect(ppTab.getAttribute('aria-selected')).toBe('true')
  })
})
