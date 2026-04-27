import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import LcParallelSchematic from './LcParallelSchematic'

describe('LcParallelSchematic', () => {
  it('renders the L and C labels', () => {
    const { container } = renderWithProviders(<LcParallelSchematic />)
    expect(container.querySelector('svg')).not.toBeNull()
    const text = container.textContent ?? ''
    expect(text).toContain('L')
    expect(text).toContain('C')
  })

  it('renders T-junctions where the parallel components meet the rails', () => {
    const { container } = renderWithProviders(<LcParallelSchematic />)
    // Junction primitive draws a small filled circle; we check that
    // at least a couple appear (one per L lead at top/bottom rails).
    const junctions = container.querySelectorAll('circle')
    expect(junctions.length).toBeGreaterThanOrEqual(2)
  })

  it('renders an accessible <title>', () => {
    const { container } = renderWithProviders(<LcParallelSchematic />)
    const title = container.querySelector('svg title')
    expect(title?.textContent).toBeTruthy()
  })
})
