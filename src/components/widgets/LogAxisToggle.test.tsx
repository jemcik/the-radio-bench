import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import LogAxisToggle from './LogAxisToggle'

function setup() {
  return renderWithProviders(<LogAxisToggle />)
}

describe('LogAxisToggle', () => {
  it('renders both axis tabs and starts on logarithmic', () => {
    setup()
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)
    const [linTab, logTab] = tabs
    expect(linTab).toHaveAttribute('aria-selected', 'false')
    expect(logTab).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to the linear axis when its tab is clicked', () => {
    setup()
    const tabs = screen.getAllByRole('tab')
    fireEvent.click(tabs[0])
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('renders the response curve as an SVG path', () => {
    const { container } = setup()
    const path = container.querySelector('svg path[d]')
    expect(path).not.toBeNull()
    // Path should contain at least one M command followed by Ls.
    expect(path?.getAttribute('d') ?? '').toMatch(/^M/)
  })

  it('exposes a slider with an accessible label', () => {
    setup()
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('updates the cutoff readout when the slider value changes', () => {
    const { container } = setup()
    // The readout lives in the font-mono span next to the slider label —
    // distinct from the SVG <text> tick labels that ALSO contain "1.0 kHz"
    // when fc = 1 kHz, which is why querying by text alone finds two nodes.
    const readout = container.querySelector('span.font-mono.text-sm')
    expect(readout).not.toBeNull()
    const before = readout?.textContent ?? ''
    expect(before).toMatch(/1\.0 kHz/)

    // Radix sliders respond to keyboard. ArrowUp is one step (FC_LOG_STEP
    // = 0.05 in log-space, enough to shift fc by ~12 %) — enough that
    // formatHz produces a new string.
    const slider = screen.getByRole('slider')
    slider.focus()
    fireEvent.keyDown(slider, { key: 'ArrowUp' })

    expect(readout?.textContent ?? '').not.toBe(before)
  })
})
