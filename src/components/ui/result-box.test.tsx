import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultBox } from './result-box'

describe('ResultBox', () => {
  it('renders children inside a rounded bordered box', () => {
    render(<ResultBox>inner</ResultBox>)
    expect(screen.getByText('inner')).toBeInTheDocument()
  })

  it('omits the label row when no label is given', () => {
    const { container } = render(<ResultBox>body</ResultBox>)
    // The eyebrow <p> is uppercase+tracking-wider; its absence is what we test.
    expect(container.querySelector('p.uppercase')).toBeNull()
  })

  it('renders the label as an uppercase eyebrow', () => {
    render(<ResultBox label="Result">body</ResultBox>)
    const label = screen.getByText('Result')
    expect(label.className).toMatch(/uppercase/)
    expect(label.className).toMatch(/tracking-wider/)
  })

  // Each tone must route to a theme-aware token so the six themes stay in sync.
  // This test pins the mapping; if the mapping ever silently changes (e.g. back
  // to raw palette colours), these assertions fail loud.
  it.each([
    ['primary', /border-primary\/30/,           /text-primary/],
    ['info',    /border-callout-note\/30/,      /text-callout-note/],
    ['success', /border-callout-experiment\/30/, /text-callout-experiment/],
    ['warn',    /border-callout-key\/30/,       /text-callout-key/],
    ['error',   /border-callout-danger\/30/,    /text-callout-danger/],
    ['muted',   /border-border/,                /text-muted-foreground/],
  ] as const)('tone=%s maps to theme tokens', (tone, boxRegex, labelRegex) => {
    const { container } = render(
      <ResultBox tone={tone} label="label">body</ResultBox>,
    )
    const box = container.firstChild as HTMLElement
    expect(box.className).toMatch(boxRegex)
    const label = screen.getByText('label')
    expect(label.className).toMatch(labelRegex)
  })

  it('merges caller className on top of tone classes', () => {
    const { container } = render(<ResultBox className="p-3">body</ResultBox>)
    const box = container.firstChild as HTMLElement
    expect(box.className).toMatch(/p-3/)
    expect(box.className).toMatch(/border-primary\/30/)  // default tone
  })
})
