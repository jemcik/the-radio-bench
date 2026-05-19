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

/** Pin-to-pin distance for standard two-terminal components (px).
 *  Internal — `pins2` uses this as its default span. Callers compose
 *  via `pins2(...)`, never the raw constant. */
const SPAN = 60

/** Stroke width for all schematic lines — component outlines, internal
 *  details, terminal leads, and wires. Single uniform thickness across the
 *  library (per the May 2026 chris-pikul migration decision). Wires use the
 *  same value to keep node joins seamless. Ratio stroke/circle-diameter is
 *  1.5/30 = 1/20, matching textbook conventions (Sedra-Smith, Razavi). */
export const STROKE = 1.5
/** Stroke width for wires (kept in sync with STROKE for seamless joins). */
export const WIRE_STROKE = 1.5

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
 *
 *  Offsets match the chris-pikul TransistorNPN/PNP primitive's actual
 *  external pin endpoints (derived from `Transistor-COM-BJT-NPN.svg`,
 *  source pin endpoints at (0, 75), (100, 0), (100, 150); after the
 *  wrapper's translate(-75,-75) scale(0.4) these become local
 *  (-30, 0), (10, -30), (10, 30)).
 *
 *  Earlier `pinsBJT` returned (-26, 0), (12, -19), (12, 19) — that was
 *  the ARRL-era hand-drawn-transistor geometry and was NOT updated
 *  during the chris-pikul migration. Schematics using `tr.collector`
 *  etc. ended up with wire endpoints 2–11 px off the actual primitive
 *  pin tips. Reader-flagged on FlybackDiodeSchematic; fixed May 2026
 *  by aligning helper offsets to the primitive.
 */
export function pinsBJT(
  cx: number,
  cy: number,
  orient: Orientation = 'right',
): { base: Point; collector: Point; emitter: Point } {
  // Offsets relative to centre, in 'right' orientation. Match the
  // chris-pikul TransistorNPN/PNP primitive's external pin endpoints.
  const bx = -30, by = 0
  const cUpX = 10, cUpY = -30
  const eDownX = 10, eDownY = 30

  const rot = (ox: number, oy: number): Point => {
    switch (orient) {
      case 'right': return { x: cx + ox, y: cy + oy }
      case 'down':  return { x: cx - oy, y: cy + ox }
      case 'left':  return { x: cx - ox, y: cy - oy }
      case 'up':    return { x: cx + oy, y: cy - ox }
      // Diagonal orientations were added on this branch for the bridge-
      // rectifier diodes (45° edges of the diamond). Transistors don't
      // ship with diagonal mounts in any current schematic, so we never
      // reach this branch — but TS needs the case for exhaustiveness
      // since `Orientation` was widened to include them. Fall back to
      // the unrotated position; if a diagonal-mounted BJT becomes a
      // real need, replace this with the appropriate ±45° rotation.
      default: return { x: cx + ox, y: cy + oy }
    }
  }

  return {
    base:      rot(bx, by),
    collector: rot(cUpX, cUpY),
    emitter:   rot(eDownX, eDownY),
  }
}

/**
 * Compute absolute pin positions for a MOSFET transistor.
 *
 * Pin geometry mirrors `pinsBJT` exactly — gate replaces base, drain
 * replaces collector, source replaces emitter. Identical pin coordinates
 * mean wires drawn for a BJT layout work unchanged when the symbol is
 * swapped for a MOSFET (same span, same pin positions, same lead stubs).
 *
 *  orient='right' (default):
 *    gate on left, drain upper-right, source lower-right
 */
export function pinsMOSFET(
  cx: number,
  cy: number,
  orient: Orientation = 'right',
): { gate: Point; drain: Point; source: Point } {
  const { base, collector, emitter } = pinsBJT(cx, cy, orient)
  return { gate: base, drain: collector, source: emitter }
}

// Note: `pinsOpAmp` and `pin1` were removed May 2026 as part of the
// chris-pikul migration cleanup. `pinsOpAmp` had wrong y-offsets (±12
// vs the primitive's actual ±10) and `pin1`'s offsets weren't updated
// for the compact Ground primitive (pin tip at -10, not -15). Both
// were unused at the time of removal — CascadedRcSchematic hardcodes
// op-amp pin coords inline, and Ground / Antenna callers position via
// absolute coords. If a new schematic needs a single-pin helper,
// derive it from the primitive's actual SVG path geometry, not from
// a memorised constant.

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
