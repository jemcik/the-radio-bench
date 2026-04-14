import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { OrientedLabel, SymbolText, getLabelPosition } from './SymbolLabel'

/**
 * Tiny SVG host so JSX <text> elements have a parent that React/jsdom accept.
 */
function Svg({ children }: { children: React.ReactNode }) {
  return <svg data-testid="root">{children}</svg>
}

describe('getLabelPosition', () => {
  it('horizontal: label sits above the body, centered', () => {
    expect(getLabelPosition(100, 50, 'right')).toEqual({
      lx: 100,
      ly: 50 - 14,
      anchor: 'middle',
    })
  })

  it('vertical: label sits to the right, start-anchored', () => {
    expect(getLabelPosition(100, 50, 'down')).toEqual({
      lx: 100 + 18,
      ly: 50,
      anchor: 'start',
    })
  })

  it('honours a custom horizontal offset (e.g. wider symbols)', () => {
    expect(getLabelPosition(100, 50, 'up', 28).lx).toBe(100 + 28)
  })

  it("'left' is treated as horizontal", () => {
    const { anchor } = getLabelPosition(0, 0, 'left')
    expect(anchor).toBe('middle')
  })
})

describe('SymbolText', () => {
  it('renders a <text> with default attributes', () => {
    const { container } = render(
      <Svg>
        <SymbolText x={5} y={10}>R1</SymbolText>
      </Svg>,
    )
    const text = container.querySelector('text')!
    expect(text.getAttribute('x')).toBe('5')
    expect(text.getAttribute('y')).toBe('10')
    expect(text.getAttribute('font-size')).toBe('11')
    expect(text.getAttribute('text-anchor')).toBe('middle')
    expect(text.getAttribute('dominant-baseline')).toBe('middle')
    expect(text.getAttribute('fill')).toBe('currentColor')
    expect(text.textContent).toBe('R1')
  })

  it('forwards size / weight / anchor / opacity', () => {
    const { container } = render(
      <Svg>
        <SymbolText x={0} y={0} size={14} weight="bold" anchor="start" opacity={0.5}>
          x
        </SymbolText>
      </Svg>,
    )
    const text = container.querySelector('text')!
    expect(text.getAttribute('font-size')).toBe('14')
    expect(text.getAttribute('font-weight')).toBe('bold')
    expect(text.getAttribute('text-anchor')).toBe('start')
    expect(text.getAttribute('opacity')).toBe('0.5')
  })
})

describe('OrientedLabel', () => {
  it('returns null when neither label nor value is provided', () => {
    const { container } = render(
      <Svg>
        <OrientedLabel x={0} y={0} orient="right" />
      </Svg>,
    )
    expect(container.querySelectorAll('text')).toHaveLength(0)
  })

  it('renders only the label when value is omitted', () => {
    const { container } = render(
      <Svg>
        <OrientedLabel x={0} y={0} orient="right" label="B1" />
      </Svg>,
    )
    const texts = container.querySelectorAll('text')
    expect(texts).toHaveLength(1)
    expect(texts[0]?.textContent).toBe('B1')
  })

  it('horizontal: label above (y-14), value below (y+4), centered', () => {
    const { container } = render(
      <Svg>
        <OrientedLabel x={100} y={50} orient="right" label="B1" value="9V" />
      </Svg>,
    )
    const [labelEl, valueEl] = Array.from(container.querySelectorAll('text'))
    expect(labelEl?.getAttribute('y')).toBe('36')
    expect(labelEl?.getAttribute('text-anchor')).toBe('middle')
    expect(labelEl?.getAttribute('font-weight')).toBe('bold')
    expect(valueEl?.getAttribute('y')).toBe('54')
    expect(valueEl?.getAttribute('opacity')).toBe('0.7')
  })

  it('vertical: shifts both texts to the right of the body', () => {
    const { container } = render(
      <Svg>
        <OrientedLabel x={100} y={50} orient="down" label="B1" value="9V" />
      </Svg>,
    )
    const texts = Array.from(container.querySelectorAll('text'))
    texts.forEach(t => {
      expect(t.getAttribute('x')).toBe('118') // 100 + default offset 18
      expect(t.getAttribute('text-anchor')).toBe('start')
    })
  })
})
