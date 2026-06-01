import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import BeatFrequencyExplorer from './BeatFrequencyExplorer'

function setRange(container: HTMLElement, id: string, value: number) {
  const slider = container.querySelector(`input#${id}`) as HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  setter.call(slider, String(value))
  slider.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('BeatFrequencyExplorer', () => {
  it('renders with a separation slider and three stacked plots', () => {
    const { container } = renderWithProviders(<BeatFrequencyExplorer />)
    expect(container.querySelector('input#beat-sep')).not.toBeNull()
    const svg = container.querySelector('svg[role="img"]')
    expect(svg).not.toBeNull()
    // tone1, tone2, sum (+ two envelope halves) → at least 3 curve paths
    expect(svg!.querySelectorAll('path').length).toBeGreaterThanOrEqual(3)
  })

  it('shows the "beat" state at the default separation', () => {
    const { container } = renderWithProviders(<BeatFrequencyExplorer />)
    expect(container.textContent).toMatch(/beat/i)
  })

  it('reports no wobble when the tones are identical (separation 0)', () => {
    const { container } = renderWithProviders(<BeatFrequencyExplorer />)
    setRange(container, 'beat-sep', 0)
    expect(container.textContent).toMatch(/no wobble/i)
  })

  it('reports a fast beat at maximum separation', () => {
    const { container } = renderWithProviders(<BeatFrequencyExplorer />)
    setRange(container, 'beat-sep', 6)
    expect(container.textContent).toMatch(/quickly/i)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<BeatFrequencyExplorer />, { language: 'uk' })
    expect(container.querySelector('input#beat-sep')).not.toBeNull()
  })
})
