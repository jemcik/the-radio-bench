import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import AmModulationExplorer from './AmModulationExplorer'

function setRange(container: HTMLElement, id: string, value: number) {
  const slider = container.querySelector(`input#${id}`) as HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  setter.call(slider, String(value))
  slider.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AmModulationExplorer', () => {
  it('renders with a modulation-index slider and two SVG views', () => {
    const { container } = renderWithProviders(<AmModulationExplorer />)
    expect(container.querySelector('input#am-mi')).not.toBeNull()
    expect(container.querySelectorAll('svg[role="img"]').length).toBe(2)
  })

  it('shows the modulation percentage at the default index', () => {
    const { container } = renderWithProviders(<AmModulationExplorer />)
    // default mi = 0.7 → "70 % modulation"
    expect(container.textContent).toMatch(/70/)
    expect(container.textContent).toMatch(/modulation/i)
  })

  it('warns when overmodulated (index > 1)', () => {
    const { container } = renderWithProviders(<AmModulationExplorer />)
    setRange(container, 'am-mi', 1.2)
    expect(container.textContent).toMatch(/Overmodulated/i)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<AmModulationExplorer />, { language: 'uk' })
    expect(container.querySelector('input#am-mi')).not.toBeNull()
  })
})
