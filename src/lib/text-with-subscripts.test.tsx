import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { withSubscripts, withSubscriptsSvg } from './text-with-subscripts'

/* withSubscripts — turns plain `X_L` patterns into `X<sub>L</sub>`
 * for glossary tooltip / popover bodies. */

function renderInline(node: ReturnType<typeof withSubscripts>) {
  return render(<span>{node}</span>).container
}

describe('withSubscripts', () => {
  it('renders a single capital-letter subscript pair', () => {
    const c = renderInline(withSubscripts('X_L'))
    expect(c.querySelectorAll('sub')).toHaveLength(1)
    expect(c.querySelector('sub')?.textContent).toBe('L')
    expect(c.textContent).toBe('XL')
  })

  it('renders multiple subscript patterns in one string', () => {
    const c = renderInline(withSubscripts('X_L = X_C'))
    const subs = c.querySelectorAll('sub')
    expect(subs).toHaveLength(2)
    expect(subs[0].textContent).toBe('L')
    expect(subs[1].textContent).toBe('C')
    expect(c.textContent).toBe('XL = XC')
  })

  it('handles multi-letter subscripts like R_loss', () => {
    const c = renderInline(withSubscripts('R_loss'))
    expect(c.querySelector('sub')?.textContent).toBe('loss')
  })

  it('handles digit subscripts like f_0 and Z_max', () => {
    const c = renderInline(withSubscripts('f_0 vs Z_max'))
    const subs = c.querySelectorAll('sub')
    expect(subs).toHaveLength(2)
    expect(subs[0].textContent).toBe('0')
    expect(subs[1].textContent).toBe('max')
  })

  it('does NOT split mid-word underscores like co_2', () => {
    const c = renderInline(withSubscripts('co_2 thing'))
    expect(c.querySelectorAll('sub')).toHaveLength(0)
    expect(c.textContent).toBe('co_2 thing')
  })

  it('preserves text without subscripts unchanged', () => {
    const c = renderInline(withSubscripts('plain prose with no subscripts.'))
    expect(c.querySelectorAll('sub')).toHaveLength(0)
    expect(c.textContent).toBe('plain prose with no subscripts.')
  })

  it('returns the empty string for nullish or empty input', () => {
    expect(withSubscripts(undefined)).toBe('')
    expect(withSubscripts('')).toBe('')
  })

  it('matches at start, after whitespace, after punctuation', () => {
    const c = renderInline(withSubscripts('start X_L; after space X_C, after punct (X_S)'))
    const subs = c.querySelectorAll('sub')
    expect(subs).toHaveLength(3)
    expect([...subs].map(s => s.textContent)).toEqual(['L', 'C', 'S'])
  })
})

describe('withSubscriptsSvg', () => {
  function renderInSvg(node: ReturnType<typeof withSubscriptsSvg>) {
    return render(<svg><text>{node}</text></svg>).container
  }

  it('emits <tspan> with baseline-shift instead of <sub>', () => {
    const c = renderInSvg(withSubscriptsSvg('f_L'))
    const tspans = c.querySelectorAll('tspan')
    expect(tspans).toHaveLength(1)
    expect(tspans[0].getAttribute('baseline-shift')).toBe('sub')
    expect(tspans[0].textContent).toBe('L')
    expect(c.querySelectorAll('sub')).toHaveLength(0)
  })

  it('handles multiple SVG subscripts', () => {
    const c = renderInSvg(withSubscriptsSvg('f_L vs f_H'))
    const tspans = c.querySelectorAll('tspan')
    expect(tspans).toHaveLength(2)
    expect([...tspans].map(t => t.textContent)).toEqual(['L', 'H'])
  })

  it('respects custom font size for the subscript', () => {
    const c = renderInSvg(withSubscriptsSvg('X_L', '0.6em'))
    const tspan = c.querySelector('tspan')
    expect(tspan?.getAttribute('font-size')).toBe('0.6em')
  })

  it('returns plain string when no subscripts present', () => {
    const c = renderInSvg(withSubscriptsSvg('plain label'))
    expect(c.querySelectorAll('tspan')).toHaveLength(0)
    expect(c.textContent).toBe('plain label')
  })
})
