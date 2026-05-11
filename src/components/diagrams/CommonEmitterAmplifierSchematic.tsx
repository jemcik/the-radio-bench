/**
 * Chapter 1.11 §6 — common-emitter amplifier with voltage-divider bias.
 *
 * Topology:
 *   +V_CC rail at the top. Voltage-divider R_1 / R_2 sets the base bias.
 *   R_C connects the rail to the collector; R_E connects the emitter
 *   to ground. Coupling capacitor C_in lets the AC input modulate the
 *   base without disturbing the DC bias; C_out lets the AC output
 *   leave the collector without leaking the DC offset to the next
 *   stage. Bottom rail returns to the supply's negative terminal.
 *
 * Layout choices:
 *   – R_1 hangs vertically from +V_CC down to the base node.
 *   – R_2 hangs vertically from the base node down to the bottom rail.
 *     Together they form a clean «divider stack» on the left side of
 *     the transistor.
 *   – C_in feeds the base node from the «in» terminal on the far left.
 *   – Transistor centre offset 12 px left of the collector column so
 *     the collector pin lands directly under R_C — same trick used in
 *     the BJT switch schematic.
 *
 * Pure `@/lib/circuit` primitives.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Capacitor,
  Battery,
  TerminalLabel,
  pins2,
  pinsBJT,
} from '@/lib/circuit'
import { TransistorNPN } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 580
const SCHEMATIC_H = 360

const TOP_Y = 35
const RC_Y = 100
const TR_Y = 200
const RE_Y = 270
const BOT_Y = 320

// Columns
const SUPPLY_X = 80
const DIV_X = 220       // R_1 / R_2 divider column
const TR_COL_X = 360    // collector / R_C / output column
const TR_X = TR_COL_X - 12 // shift transistor for clean vertical wires
const COUT_X = 460      // output coupling cap on the right
const CIN_X = 140       // input coupling cap on the left

const BASE_Y = TR_Y     // base node sits at transistor's base y
const IN_TERM_X = 70

const supply = pins2(SUPPLY_X, (TOP_Y + BOT_Y) / 2, 'down')
const r1 = pins2(DIV_X, (TOP_Y + BASE_Y) / 2, 'down')
const r2 = pins2(DIV_X, (BASE_Y + BOT_Y) / 2, 'down')
const rc = pins2(TR_COL_X, RC_Y, 'down')
const re = pins2(TR_COL_X - 12, RE_Y, 'down') // emitter column = TR_X + emitter_x_offset (12) = TR_COL_X
const tr = pinsBJT(TR_X, TR_Y, 'right')
const cin = pins2(CIN_X, BASE_Y)
const cout = pins2(COUT_X, RC_Y)

export default function CommonEmitterAmplifierSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_11.ceSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong />, nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      }
      maxWidth={620}
    >
      {/* ── Top rail: V_CC ──────────────────────────────────────── */}
      <Wire points={[supply.p1, { x: SUPPLY_X, y: TOP_Y }, { x: TR_COL_X, y: TOP_Y }, rc.p1]} />
      <Wire points={[{ x: DIV_X, y: TOP_Y }, r1.p1]} />

      {/* ── Divider into base node ───────────────────────────── */}
      <Wire points={[r1.p2, { x: DIV_X, y: BASE_Y }, r2.p1]} />
      <Wire points={[{ x: DIV_X, y: BASE_Y }, tr.base]} />

      {/* ── R_2 down to bottom rail ─────────────────────────── */}
      <Wire points={[r2.p2, { x: DIV_X, y: BOT_Y }]} />

      {/* ── Collector through R_C to top rail (already wired); branch
            to output coupling cap ─────────────────────────── */}
      <Wire points={[rc.p2, tr.collector]} />
      <Wire points={[{ x: TR_COL_X, y: RC_Y }, cout.p1]} />
      <Wire points={[cout.p2, { x: COUT_X + 30 + 6, y: RC_Y }]} />

      {/* ── Emitter through R_E to bottom rail ─────────────── */}
      <Wire points={[tr.emitter, re.p1]} />
      <Wire points={[re.p2, { x: TR_COL_X, y: BOT_Y }]} />

      {/* ── Bottom rail back to supply «−» ─────────────────── */}
      <Wire points={[supply.p2, { x: SUPPLY_X, y: BOT_Y }, { x: TR_COL_X, y: BOT_Y }]} />

      {/* ── Input coupling cap from «in» to base node ──────── */}
      <Wire points={[{ x: IN_TERM_X + 6, y: BASE_Y }, cin.p1]} />
      <Wire points={[cin.p2, { x: DIV_X, y: BASE_Y }]} />

      {/* ── Components ─────────────────────────────────────── */}
      <Battery x={SUPPLY_X} y={(TOP_Y + BOT_Y) / 2} orient="down" value="V_CC" />
      <Resistor x={DIV_X} y={(TOP_Y + BASE_Y) / 2} orient="down" label="R_1" />
      <Resistor x={DIV_X} y={(BASE_Y + BOT_Y) / 2} orient="down" label="R_2" />
      <Resistor x={TR_COL_X} y={RC_Y} orient="down" label="R_C" />
      <Resistor x={TR_COL_X - 12} y={RE_Y} orient="down" label="R_E" />
      <Capacitor x={CIN_X} y={BASE_Y} label="C_in" />
      <Capacitor x={COUT_X} y={RC_Y} label="C_out" />
      <TransistorNPN x={TR_X} y={TR_Y} orient="right" label="Q1" />

      {/* I/O terminal labels */}
      <TerminalLabel x={IN_TERM_X} y={BASE_Y} anchor="end">in</TerminalLabel>
      <TerminalLabel x={COUT_X + 30 + 12} y={RC_Y} anchor="start">out</TerminalLabel>

      {/* Junctions where 3+ wires meet — DIV_X nodes have R1/R2 tap +
          input cap meeting. TR_COL_X nodes were spurious L-corners
          flagged by check:junction-placement; if the visual layout
          needs T-marking there, restructure the wires to make the
          point a real 3-wire convergence first. */}
      <Junction x={DIV_X} y={TOP_Y} />
      <Junction x={DIV_X} y={BASE_Y} />
    </Circuit>
  )
}
