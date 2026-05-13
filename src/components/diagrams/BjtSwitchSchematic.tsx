/**
 * Chapter 1.11 §2 — BJT switch driving an LED.
 *
 * Topology:
 *   Supply rail (3.3 V logic supply) at the top. The collector resistor
 *   R_c and the LED hang in series from the rail down to the
 *   transistor's collector, with R_c on top so the LED's cathode
 *   connects directly to the collector. The emitter sits on the
 *   bottom rail, which returns to the supply's negative terminal.
 *
 *   Base drive: an «in» terminal on the left feeds through R_b to
 *   the base. When «in» goes HIGH (3.3 V) the transistor saturates
 *   and current flows through R_c → LED → Q1 to ground.
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
  pinsBJT,
} from '@/lib/circuit'
import { LED, TransistorNPN } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'

// viewBox sized to actual content extent (content x: 59..313, y: 35..285).
// SCHEMATIC_W was 540 before — gave ~227 px of empty space on the right,
// because the schematic occupies the left half of an over-wide canvas.
// Reader-flagged for ch 1.11 (and earlier ch 1.10 flyback) — now enforced
// by check:diagram-viewbox-fit, which scans rendered diagrams at test time.
const SCHEMATIC_W = 340
const SCHEMATIC_H = 320

const TOP_Y = 35
const RC_Y = 75
const LED_Y = 135
const TR_Y = 215
const BOT_Y = 285

const SUPPLY_X = 80
const LOAD_X = 280       // R_c + LED + collector column
const TR_X = LOAD_X - 10 // shift transistor centre 10 px left so its
                          // collector pin (cx+10 per chris-pikul
                          // TransistorNPN) lands at x=LOAD_X — same
                          // trick as FlybackDiodeSchematic, gives a
                          // single straight vertical from LED-cathode
                          // to collector with no stub.
const BASE_TERM_X = 70

const supply = pins2(SUPPLY_X, (TOP_Y + BOT_Y) / 2, 'down')
const rc = pins2(LOAD_X, RC_Y, 'down')
const led = pins2(LOAD_X, LED_Y, 'down')
const tr = pinsBJT(TR_X, TR_Y, 'right')
const baseR = pins2(160, TR_Y)

export default function BjtSwitchSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_11.bjtSwitchSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
      maxWidth={420}
    >
      {/* +V rail from supply up and across to the top of R_c */}
      <Wire points={[supply.p1, { x: SUPPLY_X, y: TOP_Y }, { x: LOAD_X, y: TOP_Y }, rc.p1]} />

      {/* R_c bottom → LED top */}
      <Wire points={[rc.p2, led.p1]} />

      {/* LED cathode → collector (single straight vertical thanks to TR_X offset) */}
      <Wire points={[led.p2, tr.collector]} />

      {/* Emitter straight down to the bottom rail */}
      <Wire points={[tr.emitter, { x: tr.emitter.x, y: BOT_Y }]} />

      {/* Bottom rail: emitter back to supply «−» terminal */}
      <Wire points={[supply.p2, { x: SUPPLY_X, y: BOT_Y }, { x: tr.emitter.x, y: BOT_Y }]} />

      {/* Base resistor + «in» terminal label */}
      <Wire points={[tr.base, baseR.p2]} />
      <Wire points={[baseR.p1, { x: BASE_TERM_X + 6, y: TR_Y }]} />

      {/* ── Components ────────────────────────────────────────── */}
      <Battery x={SUPPLY_X} y={(TOP_Y + BOT_Y) / 2} orient="down" value="3.3V" />
      <Resistor x={LOAD_X} y={RC_Y} orient="down" label="R_c" />
      <LED x={LOAD_X} y={LED_Y} orient="down" />
      <Resistor x={160} y={TR_Y} label="R_b" />
      <TransistorNPN x={TR_X} y={TR_Y} orient="right" label="Q1" />

      {/* Uppercase V_in: this is a DC logic-level input (3.3 V HIGH /
          0 V LOW), not an AC small signal. Matches the bjtSwitchKey /
          bjtSwitchHowItWorks prose which discusses V_in throughout.
          AoE/Sedra-Smith convention: V_X = DC bias, v_x = AC small signal. */}
      <TerminalLabel x={BASE_TERM_X} y={TR_Y} anchor="end">V_in</TerminalLabel>
    </Circuit>
  )
}
