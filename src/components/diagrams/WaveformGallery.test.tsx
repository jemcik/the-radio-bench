import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import WaveformGallery from './WaveformGallery'

/* Smoke + regression tests for the static WaveformGallery diagram.
 *
 * Three tiles (sine, square, triangle), each with peak = 1. The true
 * RMS / form factor / averaging-DMM rows are quoted in Section 5 prose,
 * so the displayed numbers are load-bearing:
 *
 *   Sine:     RMS 0.707, form factor 1.111, DMM 0.707  ✓
 *   Square:   RMS 1.000, form factor 1.000, DMM 1.110  ✗ (11% high)
 *   Triangle: RMS 0.577, form factor 1.155, DMM 0.555  ✗ (3.8% low)
 */

describe('WaveformGallery', () => {
  it('renders all three tile titles', () => {
    renderWithProviders(<WaveformGallery />)
    expect(screen.getByText('Sine')).toBeInTheDocument()
    expect(screen.getByText('Square')).toBeInTheDocument()
    expect(screen.getByText('Triangle')).toBeInTheDocument()
  })

  it('shows the true-RMS numbers for each waveform', () => {
    renderWithProviders(<WaveformGallery />)
    // Sine RMS and sine averaging-DMM reading happen to coincide by
    // design (0.707), so two 0.707 nodes render on that tile.
    expect(screen.getAllByText('0.707').length).toBeGreaterThanOrEqual(2)
    // Square RMS and square form factor are both 1.000 — likewise two.
    expect(screen.getAllByText('1.000').length).toBeGreaterThanOrEqual(2)
    // 0.577 is only the triangle RMS.
    expect(screen.getByText('0.577')).toBeInTheDocument()
  })

  it('shows the cheap-DMM error on square (1.110) and triangle (0.555)', () => {
    renderWithProviders(<WaveformGallery />)
    expect(screen.getByText('1.110')).toBeInTheDocument()   // square DMM reading
    expect(screen.getByText('0.555')).toBeInTheDocument()   // triangle DMM reading
  })
})
