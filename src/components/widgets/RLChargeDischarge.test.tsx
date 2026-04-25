import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RLChargeDischarge from './RLChargeDischarge'

/* RLChargeDischarge smoke tests.
 *
 * Default state: L = 10 mH, R = 100 Ω  →  τ = L/R = 100 µs.
 * V_in = 5 V → I∞ = V/R = 50 mA.
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<RLChargeDischarge />, { language })
}

describe('RLChargeDischarge', () => {
  it('computes the default τ as 100 µs', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/100\s*µs/)
  })

  it('computes the default I∞ as 50 mA', () => {
    const { container } = setup()
    expect(container.textContent).toMatch(/50(\.00)?\s*mA/)
  })

  it('shows ↗ charging arrow during animation, ↘ discharging during the other direction', async () => {
    const rafCallbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    try {
      const { container } = setup()
      // Charge button kicks off animation
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^charge$/ })) })
      await act(async () => { rafCallbacks.shift()?.(0) })
      expect(container.textContent).toMatch(/↗ charging/)

      // Pump to end
      await act(async () => { rafCallbacks.shift()?.(60000) })
      expect(container.textContent).toMatch(/— idle/)

      // Discharge — direction changes
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^discharge$/ })) })
      await act(async () => { rafCallbacks.shift()?.(0) })
      expect(container.textContent).toMatch(/↘ discharging/)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('halving R doubles τ — opposite of RC where halving R halves τ', () => {
    setup()
    // Default τ = L/R = 100 µs. Halve R from 100 → 50 Ω → τ = 200 µs.
    const rInput = document.getElementById('rl-r') as HTMLInputElement
    fireEvent.change(rInput, { target: { value: '50' } })
    expect(document.body.textContent).toMatch(/200\s*µs/)
  })

  it('renders Cyrillic units in UK locale', () => {
    const { container } = setup('uk')
    // Default τ = 100 µs — UA shows "мкс"; default I∞ = 50 mA — UA "мА".
    expect(container.textContent).toMatch(/мкс/)
    expect(container.textContent).toMatch(/мА/)
  })

  it('Reset button restores defaults', () => {
    setup()
    const rInput = document.getElementById('rl-r') as HTMLInputElement
    fireEvent.change(rInput, { target: { value: '999' } })
    expect(rInput.value).toBe('999')
    fireEvent.click(screen.getByRole('button', { name: /^reset$/ }))
    expect(rInput.value).toBe('100')
  })
})
