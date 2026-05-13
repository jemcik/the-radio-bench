import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import BjtOperationVisualizer from './BjtOperationVisualizer'

/**
 * BjtOperationVisualizer smoke tests.
 *
 * Defaults: V_BE = 0.7 V, β = 100.
 *   At 0.7 V the exponential I_S·(exp(V_BE/V_T) − 1) with I_S = 1e-12 mA
 *   and V_T = 0.026 V gives ≈ 0.49 mA before the cap. The widget caps
 *   I_C at 10 mA. So at V_BE = 0.7 V we expect ~0.49 mA in the readout
 *   (active region).
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<BjtOperationVisualizer />, { language })
}

describe('BjtOperationVisualizer', () => {
  it('renders without crashing and shows current readouts', () => {
    const { container } = setup()
    // The current readout panel should be visible.
    expect(container.textContent).toMatch(/i_b/i)
    expect(container.textContent).toMatch(/mA|µA/)
  })

  it('renders both sliders (V_BE and β)', () => {
    const { container } = setup()
    const sliders = container.querySelectorAll('input[type="range"]')
    expect(sliders).toHaveLength(2)
  })

  it('renders an SVG with the NPN structure (emitter/base/collector regions)', () => {
    const { container } = setup()
    const svg = container.querySelector('svg[role="img"]')
    expect(svg).not.toBeNull()
    // Three rect elements for the three regions, plus border outline.
    expect(svg!.querySelectorAll('rect').length).toBeGreaterThanOrEqual(3)
  })

  it('shows region indicator', () => {
    const { container } = setup()
    // English «Region» label appears once
    expect(container.textContent).toMatch(/Region/)
    // At the default V_BE = 0.7 V the transistor is in the active region
    expect(container.textContent).toMatch(/Active/)
  })

  it('renders Ukrainian version when locale=uk', () => {
    const { container } = setup('uk')
    expect(container.textContent).toMatch(/Режим/)
  })
})
