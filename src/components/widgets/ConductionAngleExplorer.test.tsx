import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import ConductionAngleExplorer from './ConductionAngleExplorer'

describe('ConductionAngleExplorer', () => {
  it('shows Class A at 50 % efficiency and any-mode use at the default 360°', () => {
    const { container } = renderWithProviders(<ConductionAngleExplorer />)
    // Φ = 360° → α = 180° → η = 50 %, linear (any mode)
    expect(container.textContent).toMatch(/50/)
    expect(container.textContent).toMatch(/any mode/i)
  })

  it('flips to a nonlinear class when conduction drops below half a cycle', () => {
    const { container } = renderWithProviders(<ConductionAngleExplorer />)
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '120' } })
    // Φ = 120° → η ≈ 90 %, nonlinear (constant-amplitude only)
    expect(container.textContent).toMatch(/90/)
    expect(container.textContent).toMatch(/constant-amplitude only/i)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<ConductionAngleExplorer />, { language: 'uk' })
    expect(container.querySelector('input[type="range"]')).not.toBeNull()
  })
})
