import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import PrefixLadderDiagram from './PrefixLadderDiagram'

describe('PrefixLadderDiagram', () => {
  it('renders the prefix ladder with the ÷1000 / ×1000 segment arrows', () => {
    const { container } = renderWithProviders(<PrefixLadderDiagram />)
    const text = container.querySelector('svg')?.textContent ?? ''
    // The 8 segments between the 9 ticks are labelled ÷1000 (left of unity)
    // and ×1000 (right of unity).
    expect(text).toContain('÷1000')
    expect(text).toContain('×1000')
    // Each arrow draws a <line> + <polyline>; the axis adds another <line>.
    expect(container.querySelectorAll('svg line').length).toBeGreaterThan(8)
  })
})
