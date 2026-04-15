import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import OscilloscopeDiagram from './OscilloscopeDiagram'

describe('OscilloscopeDiagram', () => {
  it('renders the screen, the trace path, and a graticule', () => {
    const { container } = renderWithProviders(<OscilloscopeDiagram />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    // Screen background + wave trace + at least a few graticule lines.
    expect(svg!.querySelectorAll('rect').length).toBeGreaterThanOrEqual(1)
    expect(svg!.querySelectorAll('path').length).toBeGreaterThanOrEqual(1)
    expect(svg!.querySelectorAll('line').length).toBeGreaterThan(4)
  })
})
