import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import MufSkipExplorer from './MufSkipExplorer'

// Strip locale grouping separators so large integers match regardless of locale.
const bare = (s: string | null) => (s ?? '').replace(/[\s,]/g, '')

describe('MufSkipExplorer', () => {
  it('computes the default skip distance and MUF', () => {
    const { container } = renderWithProviders(<MufSkipExplorer />)
    // skip: 2 × 300 / tan(15°) = 600 / 0.26795 = 2239 km
    expect(bare(container.textContent)).toMatch(/2239/)
    // MUF: foF2 6 MHz × DX factor 3.3 = 19.80 MHz
    expect(container.textContent).toMatch(/19\.80/)
  })

  it('caps the skip distance near 4000 km at a low take-off angle', () => {
    const { container } = renderWithProviders(<MufSkipExplorer />)
    const angle = container.querySelector('input#muf-angle') as HTMLInputElement
    fireEvent.change(angle, { target: { value: '3' } })
    // 2 × 300 / tan(3°) ≈ 11448 km → capped to 4000
    expect(bare(container.textContent)).toMatch(/4000/)
  })

  it('recomputes the MUF when a shorter path is selected', () => {
    const { container } = renderWithProviders(<MufSkipExplorer />)
    const shortBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.getAttribute('aria-pressed') !== null && b.textContent != null && /short/i.test(b.textContent),
    )
    const btn = shortBtn ?? (container.querySelectorAll('button[aria-pressed]')[0] as HTMLButtonElement)
    fireEvent.click(btn)
    // 6 MHz × short factor 1.3 = 7.80 MHz
    expect(container.textContent).toMatch(/7\.80/)
  })

  it('opens more bands as the critical frequency rises', () => {
    const { container } = renderWithProviders(<MufSkipExplorer />)
    const cf = container.querySelector('input#muf-cf') as HTMLInputElement
    fireEvent.change(cf, { target: { value: '10' } })
    // 10 × 3.3 = 33.0 MHz — above every band centre, so nothing is struck through
    expect(container.textContent).toMatch(/33\.00/)
    const struck = container.querySelectorAll('.line-through')
    expect(struck.length).toBe(0)
  })

  it('renders the Ukrainian version', () => {
    const { container } = renderWithProviders(<MufSkipExplorer />, { language: 'uk' })
    expect(container.querySelector('input#muf-angle')).not.toBeNull()
  })
})
