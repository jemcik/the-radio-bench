import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './input'
import { Select } from './select'

describe('Input', () => {
  it('renders an <input> with the shared form styling', () => {
    render(<Input data-testid="i" />)
    const el = screen.getByTestId('i')
    expect(el.tagName).toBe('INPUT')
    // Core token classes — regressions would break theming across widgets.
    expect(el.className).toMatch(/border-input/)
    expect(el.className).toMatch(/bg-background/)
    expect(el.className).toMatch(/focus:ring-primary/)
  })

  it('defaults type="text" but respects an explicit type', () => {
    const { rerender } = render(<Input data-testid="i" />)
    expect(screen.getByTestId('i')).toHaveAttribute('type', 'text')
    rerender(<Input data-testid="i" type="number" />)
    expect(screen.getByTestId('i')).toHaveAttribute('type', 'number')
  })

  it('merges caller className on top of defaults', () => {
    render(<Input data-testid="i" className="w-24" />)
    const el = screen.getByTestId('i')
    expect(el.className).toMatch(/w-24/)
    expect(el.className).toMatch(/border-input/)
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('forwards DOM event props', () => {
    render(<Input placeholder="foo" aria-label="amount" />)
    const el = screen.getByPlaceholderText('foo')
    expect(el).toHaveAttribute('aria-label', 'amount')
  })
})

describe('Select', () => {
  it('renders a <select> with the shared form styling', () => {
    render(
      <Select data-testid="s" defaultValue="b">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    )
    const el = screen.getByTestId('s') as HTMLSelectElement
    expect(el.tagName).toBe('SELECT')
    expect(el.value).toBe('b')
    expect(el.className).toMatch(/border-input/)
    expect(el.className).toMatch(/cursor-pointer/)
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLSelectElement>()
    render(
      <Select ref={ref}>
        <option value="a">A</option>
      </Select>,
    )
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })
})
