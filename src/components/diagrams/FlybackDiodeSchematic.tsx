/**
 * Chapter 1.10 §6 — Flyback diode protecting a transistor switch.
 *
 * Topology:
 *   +V supply at the top rail. A relay coil (drawn as an inductor with
 *   a label «coil») hangs vertically between +V and a switching node.
 *   The switching node connects to the collector of an NPN transistor;
 *   the emitter goes to ground. The base is driven by an «in» terminal
 *   through a base resistor.
 *
 *   Across the relay coil sits the flyback diode, with cathode UP toward
 *   +V and anode DOWN toward the switching node. In normal conduction
 *   the diode is reverse-biased (it sits there idly). When the
 *   transistor turns OFF, the coil's collapsing magnetic field tries
 *   to keep current flowing the same way; the switching node spikes
 *   above +V and the diode forward-conducts, RECIRCULATING the coil's
 *   current through the diode-coil loop until the energy dissipates.
 *
 * Pure `@/lib/circuit` primitives.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Inductor,
  Battery,
  Ground,
  TerminalLabel,
  pins2,
  pinsBJT,
} from '@/lib/circuit'
import { Diode, TransistorNPN } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 540
const SCHEMATIC_H = 280

const TOP_Y = 35
const COIL_TOP_Y = 70
const SW_Y = 150        // switching node height (collector level)
const TR_Y = 200        // transistor centre
const GND_Y = 250

const SUPPLY_X = 80
const COIL_X = 240
const DIODE_X = 340
// Transistor centred 12 px LEFT of COIL_X so its collector / emitter
// pins (which both sit at cx + 12 in pinsBJT for orient='right') land
// at x = COIL_X. That puts the collector directly under the switching
// node and the emitter directly above the bottom-rail-meets-ground
// point — both wires become straight verticals with NO right-angle
// stubs. Earlier revision had TR_X = COIL_X = 240, which forced 12-px
// horizontal stubs (and before that, a single 31-px diagonal) out to
// the pins. The Q1 designator above the body shifts left with the
// body and leaves a clean 3-4 px gap from the collector wire passing
// through x=COIL_X.
const TR_X = COIL_X - 12   // 228

const supply = pins2(SUPPLY_X, (TOP_Y + GND_Y) / 2, 'down')
const coil = pins2(COIL_X, (COIL_TOP_Y + SW_Y) / 2, 'down')
const flyback = pins2(DIODE_X, (COIL_TOP_Y + SW_Y) / 2, 'up') // cathode UP
const tr = pinsBJT(TR_X, TR_Y, 'right')
const baseR = pins2(150, TR_Y)

export default function FlybackDiodeSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_10.flybackSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
      maxWidth={580}
    >
      {/* +V rail */}
      <Wire points={[supply.p1, { x: SUPPLY_X, y: TOP_Y }, { x: DIODE_X, y: TOP_Y }, flyback.p2]} />
      {/* +V branch into coil top */}
      <Wire points={[{ x: COIL_X, y: TOP_Y }, coil.p1]} />
      {/* Switching node: coil bottom — diode anode — collector.
          With TR_X = COIL_X − 12, the collector pin sits at exactly
          (COIL_X, tr.collector.y), so the wire from the switching
          node down to the collector is a single straight vertical
          line — no corner, no diagonal, no horizontal stub. Same
          for the emitter wire below. */}
      <Wire points={[coil.p2, { x: COIL_X, y: SW_Y }, { x: DIODE_X, y: SW_Y }, flyback.p1]} />
      <Wire points={[{ x: COIL_X, y: SW_Y }, tr.collector]} />
      {/* Emitter straight down to the bottom rail (emitter.x ==
          COIL_X by construction). */}
      <Wire points={[tr.emitter, { x: tr.emitter.x, y: GND_Y }]} />
      {/* Base via resistor to «in» terminal. The terminal label lives
          at x=70 with anchor='end' — i.e. the visible right edge of
          the «in» glyph sits at x=70. Wire reaches that x so the line
          flushes against the label, no visual gap. */}
      <Wire points={[tr.base, baseR.p2]} />
      <Wire points={[baseR.p1, { x: 70, y: TR_Y }]} />
      {/* Battery negative side back to ground rail. Rail extends to
          x=COIL_X so it meets the emitter wire and the Ground stem
          at the same point (the bottom-rail T-junction). */}
      <Wire points={[supply.p2, { x: SUPPLY_X, y: GND_Y }, { x: COIL_X, y: GND_Y }]} />

      {/* ── Components ────────────────────────────────────────── */}
      <Battery x={SUPPLY_X} y={(TOP_Y + GND_Y) / 2} orient="down" value="V_in" />
      <Inductor x={COIL_X} y={(COIL_TOP_Y + SW_Y) / 2} orient="down" label="coil" />
      <Diode x={DIODE_X} y={(COIL_TOP_Y + SW_Y) / 2} orient="up" label="D" />
      <Resistor x={150} y={TR_Y} label="R_b" />
      <TransistorNPN x={TR_X} y={TR_Y} orient="right" label="Q1" />

      {/* Placement: y = GND_Y + 15 puts Ground's PIN exactly on the
          bottom rail at y=GND_Y, with the stem and bars hanging
          BELOW the rail. Earlier revision had y=GND_Y, which put
          Ground's CENTER on the rail and its first horizontal bar
          drawn AT y=GND_Y — overlapping the rail wire.

          orient="right" (NOT orient="down"). The Ground primitive's
          local geometry is already drawn «pin up, bars below»; the
          rotate(orientAngle(orient)) transform then rotates the
          whole symbol. orient="right" → 0° rotation → keeps the
          as-drawn orientation. orient="down" → 90° CW → bars become
          vertical at x=TR_X. Same fix BalunSchematic.tsx documents
          for itself. */}
      {/* ground-with-battery-ok: transistor-stage convention — the
          +V battery's «−» terminal and the NPN emitter both return
          to the same bottom rail; per ARRL textbook convention the
          emitter return is drawn as an explicit GND. Case (b) of
          circuit-schematics.md «Ground vs battery». */}
      <Ground x={COIL_X} y={GND_Y + 15} orient="right" />

      {/* «in» terminal label on the left of the base resistor */}
      <TerminalLabel x={70} y={TR_Y} anchor="end">in</TerminalLabel>

      {/* Junctions
          ─────────
          Two real T-joints at the top-rail tap into the coil and at
          the switching node where coil-bottom / diode-anode-via-rail /
          collector-stub all meet. The (TR_X, GND_Y) dot marks where
          the bottom rail, the emitter return, and the Ground stem all
          tie together. The earlier (DIODE_X, SW_Y) dot was a
          convention violation: only the switching-node wire turns a
          corner there (going right to (340,150) then up to flyback.p1)
          — one wire, two segments, NOT a 3-way junction. Removed. */}
      <Junction x={COIL_X} y={TOP_Y} />
      <Junction x={COIL_X} y={SW_Y} />
      <Junction x={COIL_X} y={GND_Y} />
    </Circuit>
  )
}
