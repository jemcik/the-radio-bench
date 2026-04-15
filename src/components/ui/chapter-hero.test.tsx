import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChapterHero } from './chapter-hero'

describe('ChapterHero', () => {
  it('wraps children in a role="img" element with the given aria-label', () => {
    render(
      <ChapterHero ariaLabel="test sketch of a bench">
        <svg data-testid="sketch" />
      </ChapterHero>,
    )
    const wrapper = screen.getByRole('img', { name: 'test sketch of a bench' })
    expect(wrapper).toBeInTheDocument()
    expect(wrapper.querySelector('[data-testid="sketch"]')).toBeInTheDocument()
  })

  it('opts out of prose styles, centres the illustration, and uses the sketch-stroke token', () => {
    const { container } = render(
      <ChapterHero ariaLabel="x">
        <svg />
      </ChapterHero>,
    )
    const wrapper = container.firstElementChild!
    // not-prose keeps the hero out of the chapter's paragraph rhythm;
    // flex + justify-center centres the SVG horizontally; the inline
    // text token drives stroke colour via currentColor.
    expect(wrapper.className).toMatch(/not-prose/)
    expect(wrapper.className).toMatch(/justify-center/)
    expect(wrapper.className).toMatch(/sketch-stroke/)
  })
})
