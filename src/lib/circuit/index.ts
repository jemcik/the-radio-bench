/**
 * Circuit schematic library — ARRL-standard symbols for Radiopedia.
 *
 * PUBLIC API
 * ──────────
 *  Components : Circuit, Wire, Junction, and all symbols
 *  Utilities  : pins2, pinsBJT, pinsOpAmp, pin1 (pin position helpers)
 *  Types      : Orientation, Point, SymbolProps, etc.
 *  Constants  : SPAN, HALF, STROKE, WIRE_STROKE
 *
 * USAGE
 *   import { Circuit, Wire, Junction, Resistor, Battery, pins2 } from '@/lib/circuit'
 *
 *   const r1 = pins2(180, 40)
 *   const b1 = pins2(60, 120, 'down')
 *
 *   <Circuit width={360} height={220} caption="Simple circuit">
 *     <Resistor x={180} y={40} label="R1" value="1kΩ" />
 *     <Battery x={60} y={120} orient="down" label="B1" value="1.5V" />
 *     <Wire points={[b1.p1, {x:60, y:40}, r1.p1]} />
 *     <Wire points={[r1.p2, {x:300, y:40}, {x:300, y:200}, {x:60, y:200}, b1.p2]} />
 *     <Junction x={60} y={40} />
 *   </Circuit>
 */

// Layout wrapper
export { default as Circuit, type LegendItem } from './Circuit'

// Wiring
export { Wire, Junction } from './Wire'

// Pin utilities & types
export {
  type Orientation,
  type Point,
  type SymbolProps,
  type SinglePinProps,
  type TransistorProps,
  type OpAmpProps,
  pins2,
  pinsBJT,
  pinsOpAmp,
  pin1,
  orientAngle,
  isVertical,
  SPAN,
  HALF,
  STROKE,
  WIRE_STROKE,
} from './types'

// Symbols — passives
export { Resistor, Capacitor, CapacitorElectrolytic, Inductor, InductorCore } from './symbols'

// Symbols — sources
export { Battery, BatteryMulti, Ground, GroundEarth } from './symbols'

// Symbols — semiconductors
export { Diode, LED, DiodeZener, TransistorNPN, TransistorPNP, OpAmp } from './symbols'

// Symbols — instruments
export { Meter, SwitchSPST, SwitchSPDT, Fuse } from './symbols'

// Symbols — miscellaneous
export { Antenna, Crystal, Transformer } from './symbols'
