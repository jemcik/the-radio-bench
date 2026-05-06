/**
 * Circuit schematic library — core types & utilities
 *
 * DESIGN CONVENTIONS (matching ARRL Handbook symbol standards)
 * ──────────────────────────────────────────────────────────────
 *  Coordinate system : pixels, y-down (standard SVG)
 *  Default orient    : 'right' — pin 1 on the LEFT, pin 2 on the RIGHT
 *  Standard span     : 60 px pin-to-pin for two-terminal components
 *  Stroke widths     : STROKE (1.8) for components, WIRE_STROKE (2) for wires
 *  Rotation          : applied via SVG `transform` at the component centre
 *  Colours           : `currentColor` (inherits from parent theme context)
 *
 * PIN NAMING
 *   Two-terminal  : p1 (entry / +) , p2 (exit / −)
 *   Transistor    : base, collector, emitter
 *   Op-amp        : inv (−), non (+ ), out
 *   Single-pin    : pin  (ground, antenna)
 */

// ─── orientation ──────────────────────────────────────────────────────────────

/** Cardinal direction the component "faces" (pin2 / output side). */
export type Orientation = 'right' | 'down' | 'left' | 'up'

/** SVG rotation degrees for each orientation. */
export function orientAngle(o: Orientation): number {
  return o === 'right' ? 0 : o === 'down' ? 90 : o === 'left' ? 180 : -90
}

/** True when the component is vertical on screen. */
export function isVertical(o: Orientation): boolean {
  return o === 'down' || o === 'up'
}

// ─── geometry ─────────────────────────────────────────────────────────────────

export interface Point {
  x: number
  y: number
}

// ─── sizing constants ─────────────────────────────────────────────────────────

/** Pin-to-pin distance for standard two-terminal components (px). */
export const SPAN = 60
/** Half-span — distance from component centre to each pin. */
export const HALF = SPAN / 2

/** Stroke width for all lines (components + wires unified to prevent visible transitions). */
export const STROKE = 2
/** Stroke width for wires (same as STROKE for seamless joins). */
export const WIRE_STROKE = 2

// ─── pin helpers ──────────────────────────────────────────────────────────────

/**
 * Compute absolute pin positions for a standard two-terminal component.
 *
 * @example
 *   const { p1, p2 } = pins2(180, 40)          // horizontal at (180,40)
 *   const { p1, p2 } = pins2(60, 120, 'down')  // vertical at (60,120)
 */
export function pins2(
  cx: number,
  cy: number,
  orient: Orientation = 'right',
  span = SPAN,
): { p1: Point; p2: Point } {
  const h = span / 2
  switch (orient) {
    case 'right': return { p1: { x: cx - h, y: cy }, p2: { x: cx + h, y: cy } }
    case 'left':  return { p1: { x: cx + h, y: cy }, p2: { x: cx - h, y: cy } }
    case 'down':  return { p1: { x: cx, y: cy - h }, p2: { x: cx, y: cy + h } }
    case 'up':    return { p1: { x: cx, y: cy + h }, p2: { x: cx, y: cy - h } }
  }
}

/**
 * Compute absolute pin positions for a BJT transistor.
 *
 *  orient='right' (default):
 *    base on left, collector upper-right, emitter lower-right
 */
export function pinsBJT(
  cx: number,
  cy: number,
  orient: Orientation = 'right',
): { base: Point; collector: Point; emitter: Point } {
  // Offsets relative to centre, in 'right' orientation.
  // Collector/emitter follow the same ~41° diagonal used inside the symbol,
  // extending just past the circle (r=18) so leads are short stubs — not
  // long lines crossing half the schematic.
  const bx = -26, by = 0
  const cUpX = 12, cUpY = -19
  const eDownX = 12, eDownY = 19

  const rot = (ox: number, oy: number): Point => {
    switch (orient) {
      case 'right': return { x: cx + ox, y: cy + oy }
      case 'down':  return { x: cx - oy, y: cy + ox }
      case 'left':  return { x: cx - ox, y: cy - oy }
      case 'up':    return { x: cx + oy, y: cy - ox }
    }
  }

  return {
    base:      rot(bx, by),
    collector: rot(cUpX, cUpY),
    emitter:   rot(eDownX, eDownY),
  }
}

/**
 * Compute absolute pin positions for an op-amp.
 *
 *  orient='right' (default):
 *    inv(−) upper-left, non(+) lower-left, out on the right
 */
export function pinsOpAmp(
  cx: number,
  cy: number,
  orient: Orientation = 'right',
): { inv: Point; non: Point; out: Point } {
  const rot = (ox: number, oy: number): Point => {
    switch (orient) {
      case 'right': return { x: cx + ox, y: cy + oy }
      case 'down':  return { x: cx - oy, y: cy + ox }
      case 'left':  return { x: cx - ox, y: cy - oy }
      case 'up':    return { x: cx + oy, y: cy - ox }
    }
  }

  return {
    inv: rot(-30, -12),
    non: rot(-30, 12),
    out: rot(30, 0),
  }
}

/**
 * Compute absolute pin position for a single-terminal symbol
 * (ground, antenna).
 */
export function pin1(
  cx: number,
  cy: number,
  orient: Orientation = 'down',
): { pin: Point } {
  const h = HALF / 2 // shorter lead for single-terminal
  switch (orient) {
    case 'right': return { pin: { x: cx - h, y: cy } }
    case 'down':  return { pin: { x: cx, y: cy - h } }
    case 'left':  return { pin: { x: cx + h, y: cy } }
    case 'up':    return { pin: { x: cx, y: cy + h } }
  }
}

// ─── shared props interface ───────────────────────────────────────────────────

export interface SymbolProps {
  /** Centre x position (px). */
  x: number
  /** Centre y position (px). */
  y: number
  /** Orientation — which way pin2 / output faces. Default 'right'. */
  orient?: Orientation
  /** Component designator label, e.g. "R1", "C3". */
  label?: string
  /**
   * Value label rendered next to the symbol. Schematic convention — no
   * space between number and unit (e.g. "1kΩ", "100nF", "1.5V"); use the
   * spaced form ("1 kΩ") only in prose, never in a value prop.
   */
  value?: string
}

/** Props for single-terminal symbols (ground, antenna). */
export interface SinglePinProps {
  x: number
  y: number
  orient?: Orientation
  label?: string
}

/** Props for three-terminal symbols (transistors). */
export interface TransistorProps extends SymbolProps {
  /** Show the enclosing circle (default true). */
  circle?: boolean
}

/** Props for op-amp. */
export type OpAmpProps = SymbolProps
