import { describe, expect, it } from 'vitest'
import {
  isVertical,
  orientAngle,
  pin1,
  pins2,
  pinsBJT,
  pinsOpAmp,
  HALF,
  SPAN,
} from './types'

describe('orientAngle', () => {
  it.each([
    ['right', 0],
    ['down', 90],
    ['left', 180],
    ['up', -90],
  ] as const)('%s → %s°', (orient, expected) => {
    expect(orientAngle(orient)).toBe(expected)
  })
})

describe('isVertical', () => {
  it('treats up/down as vertical', () => {
    expect(isVertical('up')).toBe(true)
    expect(isVertical('down')).toBe(true)
  })
  it('treats left/right as horizontal', () => {
    expect(isVertical('left')).toBe(false)
    expect(isVertical('right')).toBe(false)
  })
})

describe('pins2', () => {
  it('right places p1 left of centre, p2 right', () => {
    expect(pins2(100, 50, 'right')).toEqual({
      p1: { x: 100 - HALF, y: 50 },
      p2: { x: 100 + HALF, y: 50 },
    })
  })

  it('left swaps p1 and p2 horizontally', () => {
    expect(pins2(100, 50, 'left')).toEqual({
      p1: { x: 100 + HALF, y: 50 },
      p2: { x: 100 - HALF, y: 50 },
    })
  })

  it('down places p1 above, p2 below', () => {
    expect(pins2(100, 50, 'down')).toEqual({
      p1: { x: 100, y: 50 - HALF },
      p2: { x: 100, y: 50 + HALF },
    })
  })

  it('up swaps p1 and p2 vertically', () => {
    expect(pins2(100, 50, 'up')).toEqual({
      p1: { x: 100, y: 50 + HALF },
      p2: { x: 100, y: 50 - HALF },
    })
  })

  it('honours a custom span', () => {
    const { p1, p2 } = pins2(0, 0, 'right', 100)
    expect(p2.x - p1.x).toBe(100)
  })

  it('defaults to right + standard span', () => {
    expect(pins2(0, 0)).toEqual(pins2(0, 0, 'right', SPAN))
  })
})

describe('pinsBJT', () => {
  it('right: base on left, collector upper-right, emitter lower-right', () => {
    const { base, collector, emitter } = pinsBJT(0, 0, 'right')
    expect(base).toEqual({ x: -30, y: 0 })
    expect(collector).toEqual({ x: 12, y: -28 })
    expect(emitter).toEqual({ x: 12, y: 28 })
  })

  it('down rotates the layout 90° clockwise', () => {
    const { base, collector, emitter } = pinsBJT(0, 0, 'down')
    expect(base).toEqual({ x: 0, y: -30 })
    expect(collector).toEqual({ x: 28, y: 12 })
    expect(emitter).toEqual({ x: -28, y: 12 })
  })
})

describe('pinsOpAmp', () => {
  it('right: inputs on the left, output on the right', () => {
    const { inv, non, out } = pinsOpAmp(0, 0, 'right')
    expect(inv).toEqual({ x: -30, y: -12 })
    expect(non).toEqual({ x: -30, y: 12 })
    expect(out).toEqual({ x: 30, y: 0 })
  })
})

describe('pin1', () => {
  it('default down — pin sits above the body', () => {
    const { pin } = pin1(0, 0)
    expect(pin).toEqual({ x: 0, y: -HALF / 2 })
  })

  it('right — pin sits to the left of the body', () => {
    const { pin } = pin1(0, 0, 'right')
    expect(pin).toEqual({ x: -HALF / 2, y: 0 })
  })
})
