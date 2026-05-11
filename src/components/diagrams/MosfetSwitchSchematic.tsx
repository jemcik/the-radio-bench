/**
 * Chapter 1.11 §3 — MOSFET low-side switch driving an LED.
 *
 * Topology mirrors `BjtSwitchSchematic` exactly with the BJT swapped
 * for an n-channel enhancement MOSFET (2N7000). The base resistor
 * collapses to an optional 100 Ω gate-stopper resistor R_g; for DC
 * switching even that is not strictly required, but it tames
 * switching transients in fast circuits and keeps the symbolism
 * parallel with the BJT version (a resistor between input and the
 * control terminal). The «in» terminal connects directly to a logic
 * pin — no current limiting needed since the gate is insulated.
 *
 * Pin geometry of TransistorNMOS matches TransistorNPN one-to-one
 * (gate↔base, drain↔collector, source↔emitter — see pinsMOSFET in
 * lib/circuit/types.ts), so the surrounding wire layout is identical.
 *
 * Pure `@/lib/circuit` primitives.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Resistor,
  Battery,
  TerminalLabel,
  pins2,
  pinsMOSFET,
} from '@/lib/circuit'
import { LED, TransistorNMOS } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'

const SCHEMATIC_W = 540
const SCHEMATIC_H = 320

const TOP_Y = 35
const RC_Y = 75
const LED_Y = 135
const TR_Y = 215
const BOT_Y = 285

const SUPPLY_X = 80
const LOAD_X = 280
const TR_X = LOAD_X - 12
const GATE_TERM_X = 70

const supply = pins2(SUPPLY_X, (TOP_Y + BOT_Y) / 2, 'down')
const rc = pins2(LOAD_X, RC_Y, 'down')
const led = pins2(LOAD_X, LED_Y, 'down')
const tr = pinsMOSFET(TR_X, TR_Y, 'right')
const gateR = pins2(160, TR_Y)

export default function MosfetSwitchSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_11.mosfetSwitchSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong />, g2: <G k="gate" /> }}
        />
      }
      maxWidth={580}
    >
      <Wire points={[supply.p1, { x: SUPPLY_X, y: TOP_Y }, { x: LOAD_X, y: TOP_Y }, rc.p1]} />
      <Wire points={[rc.p2, led.p1]} />
      <Wire points={[led.p2, tr.drain]} />
      <Wire points={[tr.source, { x: tr.source.x, y: BOT_Y }]} />
      <Wire points={[supply.p2, { x: SUPPLY_X, y: BOT_Y }, { x: tr.source.x, y: BOT_Y }]} />
      <Wire points={[tr.gate, gateR.p2]} />
      <Wire points={[gateR.p1, { x: GATE_TERM_X + 6, y: TR_Y }]} />

      <Battery x={SUPPLY_X} y={(TOP_Y + BOT_Y) / 2} orient="down" value="+3.3V" />
      <Resistor x={LOAD_X} y={RC_Y} orient="down" label="R_c" />
      <LED x={LOAD_X} y={LED_Y} orient="down" />
      <Resistor x={160} y={TR_Y} label="R_g" />
      <TransistorNMOS x={TR_X} y={TR_Y} orient="right" label="Q1" />

      <TerminalLabel x={GATE_TERM_X} y={TR_Y} anchor="end">in</TerminalLabel>
    </Circuit>
  )
}
