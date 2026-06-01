import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import BandwidthVisualiser from './BandwidthVisualiser'

function clickMode(container: HTMLElement, label: string) {
  const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === label)
  if (!btn) throw new Error(`mode button "${label}" not found`)
  fireEvent.click(btn)
}

describe('BandwidthVisualiser', () => {
  it('renders all five mode buttons and a comparison chart', () => {
    const { container } = renderWithProviders(<BandwidthVisualiser />)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.length).toBeGreaterThanOrEqual(5)
    expect(container.querySelector('svg[role="img"]')).not.toBeNull()
  })

  it('shows SSB bandwidth and how many fit in a 25 kHz channel by default', () => {
    const { container } = renderWithProviders(<BandwidthVisualiser />)
    // SSB ≈ 2.7 kHz → floor(25 / 2.7) = 9
    expect(container.textContent).toMatch(/2[.,]7/)
    expect(container.textContent).toMatch(/9×/)
  })

  it('flags broadcast FM as wider than the channel', () => {
    const { container } = renderWithProviders(<BandwidthVisualiser />)
    clickMode(container, 'FM broadcast')
    // 2·(75+15) = 180 kHz > 25 kHz channel
    expect(container.textContent).toMatch(/180/)
    expect(container.textContent).toMatch(/wider than the channel/i)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<BandwidthVisualiser />, { language: 'uk' })
    expect(container.querySelectorAll('button').length).toBeGreaterThanOrEqual(5)
  })
})
