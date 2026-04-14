import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DiagramFigure from './DiagramFigure'

describe('DiagramFigure', () => {
  it('wraps children in a <figure> with the standard border-box styling', () => {
    const { container } = render(
      <DiagramFigure>
        <svg data-testid="svg" />
      </DiagramFigure>,
    )
    const figure = container.querySelector('figure')!
    expect(figure).toBeInTheDocument()
    expect(figure.className).toMatch(/my-8/)
    expect(figure.className).toMatch(/not-prose/)

    const inner = figure.querySelector('div')!
    expect(inner.className).toMatch(/rounded-xl/)
    expect(inner.className).toMatch(/border-border/)
    expect(inner.className).toMatch(/bg-muted\/40/)

    // Children actually nested inside the inner box, not outside it.
    expect(inner.querySelector('[data-testid=svg]')).toBeInTheDocument()
  })

  it('renders a <figcaption> when caption is provided', () => {
    render(
      <DiagramFigure caption="the triangle">
        <svg />
      </DiagramFigure>,
    )
    const cap = screen.getByText('the triangle')
    expect(cap.tagName).toBe('FIGCAPTION')
    expect(cap.className).toMatch(/text-muted-foreground/)
  })

  it('omits <figcaption> when no caption', () => {
    const { container } = render(
      <DiagramFigure>
        <svg />
      </DiagramFigure>,
    )
    expect(container.querySelector('figcaption')).toBeNull()
  })
})
