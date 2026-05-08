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
const TR_X = 240

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
      {/* Switching node: coil bottom — diode anode — collector */}
      <Wire points={[coil.p2, { x: COIL_X, y: SW_Y }, { x: DIODE_X, y: SW_Y }, flyback.p1]} />
      <Wire points={[{ x: COIL_X, y: SW_Y }, { x: TR_X, y: SW_Y }, tr.collector]} />
      {/* Emitter to ground */}
      <Wire points={[tr.emitter, { x: TR_X, y: GND_Y }]} />
      {/* Base via resistor to «in» terminal */}
      <Wire points={[tr.base, baseR.p2]} />
      <Wire points={[baseR.p1, { x: 80, y: TR_Y }]} />
      {/* Battery negative side back to ground rail */}
      <Wire points={[supply.p2, { x: SUPPLY_X, y: GND_Y }, { x: TR_X, y: GND_Y }]} />

      {/* ── Components ────────────────────────────────────────── */}
      <Battery x={SUPPLY_X} y={(TOP_Y + GND_Y) / 2} orient="down" value="+V" />
      <Inductor x={COIL_X} y={(COIL_TOP_Y + SW_Y) / 2} orient="down" label="coil" />
      <Diode x={DIODE_X} y={(COIL_TOP_Y + SW_Y) / 2} orient="up" label="D" />
      <Resistor x={150} y={TR_Y} label="R_b" />
      <TransistorNPN x={TR_X} y={TR_Y} orient="right" label="Q1" />

      {/* ground-with-battery-ok: transistor-stage convention. The +V
          battery's «−» terminal and the NPN emitter both return to
          the same bottom rail; per ARRL textbook convention the
          emitter return is drawn as an explicit GND symbol so the
          reader instantly parses «this is the 0 V reference for the
          switching stage». Falls under case (b) of the «Ground vs
          battery» rule in circuit-schematics.md. */}
      <Ground x={TR_X} y={GND_Y} orient="down" />

      {/* «in» terminal label on the left of the base resistor */}
      <TerminalLabel x={70} y={TR_Y} anchor="end">in</TerminalLabel>

      {/* Junctions */}
      <Junction x={COIL_X} y={TOP_Y} />
      <Junction x={COIL_X} y={SW_Y} />
      <Junction x={DIODE_X} y={SW_Y} />
      <Junction x={TR_X} y={GND_Y} />
    </Circuit>
  )
}
