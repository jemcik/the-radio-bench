import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import SineOriginDiagram from './SineOriginDiagram'

/* Smoke tests for the static sine-origin diagram.
 *
 * The diagram has no interactivity — it's an explanatory illustration
 * paired with the new `sineWaveOrigin` prose paragraph. Test that the
 * key labels render so a missing i18n key would fail the suite.
 */

describe('SineOriginDiagram', () => {
  it('renders the radius label (A)', () => {
    renderWithProviders(<SineOriginDiagram />)
    // The radius label is rendered once inside the SVG. A single-char
    // «A» appears in multiple places across the page, so scope by the
    // figure/img role.
    const img = screen.getByRole('img')
    expect(img.textContent).toContain('A')
  })

  it('renders the angle label (θ)', () => {
    renderWithProviders(<SineOriginDiagram />)
    const img = screen.getByRole('img')
    expect(img.textContent).toContain('θ')
  })

  it('renders the time-axis label', () => {
    renderWithProviders(<SineOriginDiagram />)
    const img = screen.getByRole('img')
    expect(img.textContent).toContain('t')
  })

  it('renders the caption below the figure', () => {
    renderWithProviders(<SineOriginDiagram />)
    // EN default — caption begins with "The sine wave is".
    expect(
      screen.getByText(/sine wave is the height of a uniformly rotating point/i),
    ).toBeInTheDocument()
  })
})
