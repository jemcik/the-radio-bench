import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import FormulaTriangleDiagram from './FormulaTriangleDiagram'

describe('FormulaTriangleDiagram', () => {
  it('renders three triangles with the V / I / R formulas', () => {
    const { container } = renderWithProviders(<FormulaTriangleDiagram />)
    const text = container.querySelector('svg')?.textContent ?? ''
    expect(text).toContain('V = I × R')
    expect(text).toContain('I = V ÷ R')
    expect(text).toContain('R = V ÷ I')
  })
})
