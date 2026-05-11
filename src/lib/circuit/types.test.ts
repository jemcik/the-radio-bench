import { describe, expect, it } from 'vitest'
import {
  isDiagonal,
  isVertical,
  orientAngle,
  pins2,
  pinsBJT,
} from './types'

// Standard span = 60 (was previously exported as SPAN, now internal).
// HALF = SPAN/2 = 30; pin endpoints sit ±HALF from the component centre.
const SPAN = 60
const HALF = 30

describe('orientAngle', () => {
  it.each([
    ['right', 0],
    ['down', 90],
    ['left', 180],
    ['up', -90],
    ['down-right', 45],
    ['down-left', 135],
    ['up-right', -45],
    ['up-left', -135],
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
  it('treats diagonals as vertical (label-placement purposes)', () => {
    expect(isVertical('up-right')).toBe(true)
    expect(isVertical('up-left')).toBe(true)
    expect(isVertical('down-right')).toBe(true)
    expect(isVertical('down-left')).toBe(true)
  })
})

describe('isDiagonal', () => {
  it.each(['up-right', 'up-left', 'down-right', 'down-left'] as const)(
    '%s is diagonal',
    o => {
      expect(isDiagonal(o)).toBe(true)
    },
  )
  it.each(['right', 'left', 'up', 'down'] as const)('%s is NOT diagonal', o => {
    expect(isDiagonal(o)).toBe(false)
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

  describe('diagonal orientations', () => {
    // dh = HALF / √2 ≈ 21.21 for the default span of 60
    const dh = HALF * Math.SQRT1_2
    const closeTo = (a: number, b: number) => Math.abs(a - b) < 0.001

    it('up-right: p1 lower-left of centre, p2 upper-right', () => {
      const { p1, p2 } = pins2(100, 50, 'up-right')
      expect(closeTo(p1.x, 100 - dh)).toBe(true)
      expect(closeTo(p1.y, 50 + dh)).toBe(true)
      expect(closeTo(p2.x, 100 + dh)).toBe(true)
      expect(closeTo(p2.y, 50 - dh)).toBe(true)
    })

    it('up-left: p1 lower-right, p2 upper-left', () => {
      const { p1, p2 } = pins2(100, 50, 'up-left')
      expect(closeTo(p1.x, 100 + dh)).toBe(true)
      expect(closeTo(p1.y, 50 + dh)).toBe(true)
      expect(closeTo(p2.x, 100 - dh)).toBe(true)
      expect(closeTo(p2.y, 50 - dh)).toBe(true)
    })

    it('down-right: p1 upper-left, p2 lower-right', () => {
      const { p1, p2 } = pins2(100, 50, 'down-right')
      expect(closeTo(p1.x, 100 - dh)).toBe(true)
      expect(closeTo(p1.y, 50 - dh)).toBe(true)
      expect(closeTo(p2.x, 100 + dh)).toBe(true)
      expect(closeTo(p2.y, 50 + dh)).toBe(true)
    })

    it('down-left: p1 upper-right, p2 lower-left', () => {
      const { p1, p2 } = pins2(100, 50, 'down-left')
      expect(closeTo(p1.x, 100 + dh)).toBe(true)
      expect(closeTo(p1.y, 50 - dh)).toBe(true)
      expect(closeTo(p2.x, 100 - dh)).toBe(true)
      expect(closeTo(p2.y, 50 + dh)).toBe(true)
    })

    it('pin-to-pin distance equals span for diagonals (same as cardinals)', () => {
      const { p1, p2 } = pins2(0, 0, 'up-right', 60)
      const dx = p2.x - p1.x, dy = p2.y - p1.y
      expect(closeTo(Math.sqrt(dx * dx + dy * dy), 60)).toBe(true)
    })
  })
})

describe('pinsBJT', () => {
  // Offsets match the chris-pikul TransistorNPN primitive's actual
  // external pin endpoints in local coords: base (-30, 0), collector
  // (+10, -30), emitter (+10, +30). Was previously -26 / +12,±19 — the
  // ARRL-era hand-drawn-transistor geometry that was NOT updated during
  // the chris-pikul migration. Corrected May 2026.
  it('right: base on left, collector upper-right, emitter lower-right', () => {
    const { base, collector, emitter } = pinsBJT(0, 0, 'right')
    expect(base).toEqual({ x: -30, y: 0 })
    expect(collector).toEqual({ x: 10, y: -30 })
    expect(emitter).toEqual({ x: 10, y: 30 })
  })

  it('down rotates the layout 90° clockwise', () => {
    const { base, collector, emitter } = pinsBJT(0, 0, 'down')
    expect(base).toEqual({ x: 0, y: -30 })
    expect(collector).toEqual({ x: 30, y: 10 })
    expect(emitter).toEqual({ x: -30, y: 10 })
  })
})

// `pinsOpAmp` and `pin1` helpers were removed May 2026 (chris-pikul
// migration cleanup) — their offsets were stale and the helpers had
// zero callsites. See types.ts comment for the rationale.
