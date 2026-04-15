import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import MultimeterDiagram from './MultimeterDiagram'

describe('MultimeterDiagram', () => {
  it('renders both circuits (voltmeter in parallel, ammeter in series) inside SVG', () => {
    const { container } = renderWithProviders(<MultimeterDiagram />)
    // Two <Circuit> roots = two SVGs.
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2)
    // Each circuit draws several wires + components.
    expect(container.querySelectorAll('svg path, svg line').length).toBeGreaterThan(4)
  })
})
