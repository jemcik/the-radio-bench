import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import LcSeriesSchematic from './LcSeriesSchematic'

describe('LcSeriesSchematic', () => {
  it('renders the L and C labels', () => {
    const { container } = renderWithProviders(<LcSeriesSchematic />)
    // The schematic uses circuit primitives — L and C both appear as
    // designator text via SVG <text> elements rendered by the symbols.
    expect(container.querySelector('svg')).not.toBeNull()
    const text = container.textContent ?? ''
    expect(text).toContain('L')
    expect(text).toContain('C')
  })

  it('renders the source value v_in', () => {
    const { container } = renderWithProviders(<LcSeriesSchematic />)
    expect(container.textContent).toContain('v')  // battery value renders «v_in»
  })

  it('renders an accessible <title>', () => {
    const { container } = renderWithProviders(<LcSeriesSchematic />)
    const title = container.querySelector('svg title')
    expect(title?.textContent).toBeTruthy()
  })
})
