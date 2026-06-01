import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import FmModulationExplorer from './FmModulationExplorer'

function setRange(container: HTMLElement, id: string, value: number) {
  const slider = container.querySelector(`input#${id}`) as HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  setter.call(slider, String(value))
  slider.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('FmModulationExplorer', () => {
  it('renders with a deviation slider and an SVG view', () => {
    const { container } = renderWithProviders(<FmModulationExplorer />)
    expect(container.querySelector('input#fm-dev')).not.toBeNull()
    expect(container.querySelector('svg[role="img"]')).not.toBeNull()
  })

  it('computes Carson bandwidth at the default deviation', () => {
    const { container } = renderWithProviders(<FmModulationExplorer />)
    // default ±5 kHz deviation, 3 kHz audio → 2·(5+3) = 16 kHz
    expect(container.textContent).toMatch(/16/)
  })

  it('updates Carson bandwidth when the deviation changes', () => {
    const { container } = renderWithProviders(<FmModulationExplorer />)
    setRange(container, 'fm-dev', 0)
    // 2·(0+3) = 6 kHz
    expect(container.textContent).toMatch(/6 kHz/)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<FmModulationExplorer />, { language: 'uk' })
    expect(container.querySelector('input#fm-dev')).not.toBeNull()
  })
})
