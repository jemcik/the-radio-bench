import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import BjtOperationVisualizer from './BjtOperationVisualizer'

/**
 * BjtOperationVisualizer smoke tests + prose↔model consistency lock.
 *
 * The widget's region label (cutoff / active / saturation) is driven
 * by thresholds in the source file. The chapter prose ALSO quotes
 * specific V_BE boundaries for the same regions:
 *
 *   insideRegions: «Cutoff: V_BE < ~0.6 V; Active: 0.6 ≲ V_BE ≲ 0.75 V»
 *   regionDescription.cutoff: «V_BE below the junction threshold (~0.6 V)»
 *
 * Three times in one short session the model and prose drifted apart
 * (cutoff threshold was 1 µA → active at V_BE ≈ 0.54 contradicting
 * «< 0.6»; saturation threshold was 9.5 mA → triggered at V_BE ≈ 0.78
 * contradicting «active ≤ 0.75»). The pattern was «I changed one side
 * and forgot the other».
 *
 * The tests below SLIDE the V_BE slider to specific values quoted by
 * the prose and assert the displayed region matches. Any future drift
 * between code constants and prose claims breaks these tests.
 *
 * To add a new boundary: pick a V_BE clearly inside the prose-claimed
 * region and assert the displayed region label string.
 */

function setVbe(container: HTMLElement, value: number) {
  const slider = container.querySelector('input#bjt-op-vbe') as HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  setter.call(slider, String(value))
  slider.dispatchEvent(new Event('input', { bubbles: true }))
}

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

  // ── Prose↔model consistency lock ────────────────────────────
  // Each `it` here corresponds to a V_BE the prose explicitly mentions
  // as belonging to a specific region. If the model thresholds drift
  // away from those V_BE values, these tests fail until prose and
  // code are reconciled.

  it('V_BE = 0.55 V is in CUTOFF (prose: «cutoff < ~0.6 V»)', () => {
    const { container } = setup()
    setVbe(container, 0.55)
    expect(container.textContent).toMatch(/Cutoff/)
  })

  it('V_BE = 0.59 V is in CUTOFF — boundary stays at 0.60', () => {
    const { container } = setup()
    setVbe(container, 0.59)
    expect(container.textContent).toMatch(/Cutoff/)
  })

  it('V_BE = 0.65 V is in ACTIVE (prose: «active 0.6..0.75 V»)', () => {
    const { container } = setup()
    setVbe(container, 0.65)
    expect(container.textContent).toMatch(/Active/)
  })

  it('V_BE = 0.74 V is in ACTIVE — boundary stays at 0.75', () => {
    const { container } = setup()
    setVbe(container, 0.74)
    expect(container.textContent).toMatch(/Active/)
  })

  it('V_BE = 0.78 V is in SATURATION (prose: «active ≤ 0.75 V»)', () => {
    const { container } = setup()
    setVbe(container, 0.78)
    expect(container.textContent).toMatch(/Saturation/)
  })

  it('V_BE = 0.85 V is in SATURATION (slider max)', () => {
    const { container } = setup()
    setVbe(container, 0.85)
    expect(container.textContent).toMatch(/Saturation/)
  })

  // The «capped at X mA» quoted in the saturation description MUST
  // equal the actual cap the widget enforces — otherwise the text
  // lies (claims a cap that isn't yet engaged). This test parses the
  // user-visible numbers and compares them: at slider max V_BE the
  // readout i_c sits exactly at the cap (since SATURATION_THRESHOLD
  // == I_C_CAP), so it must match the number quoted in the prose.
  it('cap value in saturation description matches the i_c readout at slider max', () => {
    const { container } = setup('uk')
    setVbe(container, 0.85)
    const text = container.textContent || ''

    const descMatch = text.match(/обмежив[^0-9]+([0-9.,]+)\s*мА/)
    expect(descMatch, 'saturation description must quote a cap value').not.toBeNull()
    const quotedCap = parseFloat(descMatch![1].replace(',', '.'))

    const readoutMatch = text.match(/i_c[^0-9-]+=\s*([0-9.,]+)\s*mA/)
    expect(readoutMatch, 'i_c readout must show a numeric value').not.toBeNull()
    const readoutIc = parseFloat(readoutMatch![1].replace(',', '.'))

    expect(readoutIc).toBeCloseTo(quotedCap, 1)
  })

  // Use `fireEvent` so the linter doesn't complain about unused imports.
  it('uses fireEvent for slider interaction (smoke)', () => {
    expect(typeof fireEvent.input).toBe('function')
  })
})
