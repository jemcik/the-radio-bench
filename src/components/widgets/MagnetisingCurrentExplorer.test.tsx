import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import MagnetisingCurrentExplorer from './MagnetisingCurrentExplorer'

/**
 * Smoke + behaviour tests for the magnetising-current explorer.
 *
 * Default phase is 135° — chosen so that on first render the user
 * lands inside Quarter 2 (90°–180°), where V > 0, I > 0, and power
 * flows source → field. The "build" branch of the direction indicator
 * therefore covers the default smoke test path.
 */

function setup() {
  return renderWithProviders(<MagnetisingCurrentExplorer />)
}

describe('MagnetisingCurrentExplorer', () => {
  it('renders the default phase readout (135°)', () => {
    setup()
    expect(screen.getAllByText(/ωt\s*=\s*135°/).length).toBeGreaterThan(0)
  })

  it('shows quarter 2 label at default phase (135°)', () => {
    setup()
    expect(screen.getByText(/2\s*\(90°–180°\)/)).toBeInTheDocument()
  })

  it('renders both V_p and I_mag bars (signed values, sub-elements)', () => {
    setup()
    // At ωt = 135° both V and I are normalised to +sin(135°) ≈ +0.71
    // and -cos(135°) ≈ +0.71. Two "+0.71" readouts must be visible.
    const positives = screen.getAllByText(/^\+0\.71$/)
    expect(positives.length).toBe(2)
  })

  it('renders one slider for phase', () => {
    setup()
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBe(1)
  })

  it('toggles play / pause via the button', () => {
    setup()
    const playBtn = screen.getByRole('button', { name: /Play cycle|Програти цикл/ })
    fireEvent.click(playBtn)
    // After clicking, the button now exposes the "Pause" label.
    expect(
      screen.getByRole('button', { name: /Pause|Пауза/ })
    ).toBeInTheDocument()
  })
})
