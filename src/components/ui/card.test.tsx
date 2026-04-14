import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './card'

describe('Card', () => {
  it('renders children as a div by default', () => {
    render(<Card data-testid="c">hello</Card>)
    const c = screen.getByTestId('c')
    expect(c.tagName).toBe('DIV')
    expect(c).toHaveTextContent('hello')
  })

  it('applies the default surface + radius', () => {
    render(<Card data-testid="c" />)
    const c = screen.getByTestId('c')
    expect(c.className).toMatch(/border-border/)
    expect(c.className).toMatch(/bg-card/)
    expect(c.className).toMatch(/rounded-xl/)
  })

  it.each([
    ['default', /border-border/],
    ['muted',   /bg-card\/60/],
    ['accent',  /border-primary\/30/],
    ['teal',    /border-teal-500\/25/],
  ] as const)('surface=%s applies the right tint', (surface, expectedClass) => {
    render(<Card data-testid="c" surface={surface} />)
    expect(screen.getByTestId('c').className).toMatch(expectedClass)
  })

  it('radius=lg switches to rounded-lg', () => {
    render(<Card data-testid="c" radius="lg" />)
    expect(screen.getByTestId('c').className).toMatch(/rounded-lg/)
  })

  it('merges caller className on top of variant classes', () => {
    render(<Card data-testid="c" className="p-6 my-custom" />)
    const c = screen.getByTestId('c')
    expect(c.className).toMatch(/p-6/)
    expect(c.className).toMatch(/my-custom/)
    // Default classes still present
    expect(c.className).toMatch(/border-border/)
  })

  it('asChild forwards styles onto the child element', () => {
    render(
      <Card asChild data-testid="c">
        <a href="/foo">click</a>
      </Card>,
    )
    const link = screen.getByTestId('c')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/foo')
    expect(link.className).toMatch(/border-border/)
  })

  it('passes through arbitrary HTML attributes', () => {
    render(<Card data-testid="c" role="region" aria-label="stats" />)
    const c = screen.getByTestId('c')
    expect(c).toHaveAttribute('role', 'region')
    expect(c).toHaveAttribute('aria-label', 'stats')
  })
})
