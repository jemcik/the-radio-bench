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

/**
 * Direction the component "faces" (pin2 / output side).
 *
 *  Cardinal: 'right' / 'down' / 'left' / 'up'
 *  Diagonal: 'up-right' / 'up-left' / 'down-right' / 'down-left'
 *
 * Diagonals describe where pin2 (cathode for diodes, output for op-amps,
 * etc.) ends up: 'up-right' means the symbol is rotated so pin2 points
 * toward the upper-right (−45° in SVG's y-down coordinate system).
 *
 * Diagonal orientations were added for diamond-layout bridge rectifiers
 * (ch 1.10) where the diodes sit on the four 45° edges of the diamond.
 */
export type Orientation =
  | 'right' | 'down' | 'left' | 'up'
  | 'up-right' | 'up-left' | 'down-right' | 'down-left'

/** SVG rotation degrees for each orientation. */
export function orientAngle(o: Orientation): number {
  switch (o) {
    case 'right':      return 0
    case 'down':       return 90
    case 'left':       return 180
    case 'up':         return -90
    case 'down-right': return 45
    case 'down-left':  return 135
    case 'up-right':   return -45
    case 'up-left':    return -135
  }
}

/**
 * True when the component is closer to vertical than horizontal on
 * screen — used by label-placement helpers to choose between
 * «above/below» (horizontal) and «to the side» (vertical or diagonal)
 * placement. Diagonals are treated as vertical for label purposes
 * because their leads occupy both horizontal AND vertical space — the
 * symbol's «above» and «below» areas overlap with the lead path.
 */
export function isVertical(o: Orientation): boolean {
  return o !== 'right' && o !== 'left'
}

/** True when the orientation is a diagonal (45° / 135° / 225° / 315°). */
export function isDiagonal(o: Orientation): boolean {
  return o === 'up-right' || o === 'up-left'
      || o === 'down-right' || o === 'down-left'
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
  // For diagonals, project the pin offset onto the rotated axis. Pin1
  // sits at -h along the rotation axis (negative direction = «back» of
  // the symbol = anode for a diode); pin2 at +h (cathode / output).
  const dh = h * Math.SQRT1_2 // h / √2 — half-span projected onto each axis
  switch (orient) {
    case 'right':      return { p1: { x: cx - h,  y: cy      }, p2: { x: cx + h,  y: cy      } }
    case 'left':       return { p1: { x: cx + h,  y: cy      }, p2: { x: cx - h,  y: cy      } }
    case 'down':       return { p1: { x: cx,      y: cy - h  }, p2: { x: cx,      y: cy + h  } }
    case 'up':         return { p1: { x: cx,      y: cy + h  }, p2: { x: cx,      y: cy - h  } }
    case 'down-right': return { p1: { x: cx - dh, y: cy - dh }, p2: { x: cx + dh, y: cy + dh } }
    case 'down-left':  return { p1: { x: cx + dh, y: cy - dh }, p2: { x: cx - dh, y: cy + dh } }
    case 'up-right':   return { p1: { x: cx - dh, y: cy + dh }, p2: { x: cx + dh, y: cy - dh } }
    case 'up-left':    return { p1: { x: cx + dh, y: cy + dh }, p2: { x: cx - dh, y: cy - dh } }
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
