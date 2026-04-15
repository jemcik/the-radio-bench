import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import ChapterFlowDiagram from './ChapterFlowDiagram'

describe('ChapterFlowDiagram', () => {
  it('renders the five-step flow inside an SVG figure', () => {
    const { container } = renderWithProviders(<ChapterFlowDiagram />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    // Five labelled boxes (concept / formula / widget / lab / quiz) ⇒
    // at least five <text> nodes for the box titles.
    expect(container.querySelectorAll('svg text').length).toBeGreaterThanOrEqual(5)
  })
})
