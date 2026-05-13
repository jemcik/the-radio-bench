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

// Collector node = bottom pin of R_C, where the collector wire +
// output-coupling-cap branch meet. Used both for the y-position of C_out
// and for the junction dot. RC_Y + 30 because pins2 default span=60.
const COLLECTOR_NODE_Y = RC_Y + 30

// Columns
const SUPPLY_X = 80
const DIV_X = 220       // R_1 / R_2 divider column
const TR_COL_X = 360    // collector / R_C / output column
const TR_X = TR_COL_X - 10 // shift transistor 10 px left so its collector
                            // pin (cx+10 per chris-pikul TransistorNPN)
                            // lands on the collector column. Was -12
                            // before chris-pikul pin geometry was fixed
                            // in pinsBJT (May 2026).
const COUT_X = 460      // output coupling cap on the right
const CIN_X = 140       // input coupling cap on the left

const BASE_Y = TR_Y     // base node sits at transistor's base y
const IN_TERM_X = 70

const supply = pins2(SUPPLY_X, (TOP_Y + BOT_Y) / 2, 'down')
const r1 = pins2(DIV_X, (TOP_Y + BASE_Y) / 2, 'down')
const r2 = pins2(DIV_X, (BASE_Y + BOT_Y) / 2, 'down')
const rc = pins2(TR_COL_X, RC_Y, 'down')
// R_E sits on TR_COL_X — the same x as the transistor's emitter pin
// (TR_X + 10 per chris-pikul TransistorNPN). Was TR_COL_X - 12 from the
// pre-May-2026 pinsBJT geometry where emitter offset was +12; after the
// pin geometry was corrected, this constant was never updated and the
// emitter/bottom-rail wires ran at a 12-px diagonal, reader-flagged.
const re = pins2(TR_COL_X, RE_Y, 'down')
const tr = pinsBJT(TR_X, TR_Y, 'right')
const cin = pins2(CIN_X, BASE_Y)
// C_out sits at the COLLECTOR node (= bottom of R_C, where wire from R_C,
// wire to transistor collector, and branch to C_out converge). Was at RC_Y
// (centre of R_C body) — the branch wire visibly cut through the R_C
// symbol. Reader-flagged.
const cout = pins2(COUT_X, COLLECTOR_NODE_Y)

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

      {/* ── Collector node: R_C bottom pin meets the wire down to the
            collector pin and the horizontal branch out to C_out ── */}
      <Wire points={[rc.p2, tr.collector]} />
      <Wire points={[rc.p2, cout.p1]} />
      {/* wire-pin-alignment-ok: «out» rail extension past C_out — endpoint
          intentionally 6 px past the cap's right pin to leave room for
          the «out» terminal label. */}
      <Wire points={[cout.p2, { x: COUT_X + 30 + 6, y: COLLECTOR_NODE_Y }]} />

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
      <Resistor x={TR_COL_X} y={RE_Y} orient="down" label="R_E" />
      <Capacitor x={CIN_X} y={BASE_Y} label="C_in" />
      <Capacitor x={COUT_X} y={COLLECTOR_NODE_Y} label="C_out" />
      <TransistorNPN x={TR_X} y={TR_Y} orient="right" label="Q1" />

      {/* I/O terminal labels */}
      {/* Terminal labels match the chapter prose:
          • CE amp is analysed in terms of the small-signal AC variables
            v_in (input wiggle on the base) and v_out (output wiggle on
            the collector), so the terminal labels use lowercase v —
            consistent with «v_X(t) = V_X + v_x(t)» textbook convention
            (AoE / Sedra-Smith): uppercase V_X for DC bias, lowercase v_x
            for the AC component. Bare «in» / «out» terminals on the
            previous version forced the reader to map «in» (schematic
            label) ↔ «v_in» (prose) themselves — reader-flagged. */}
      <TerminalLabel x={IN_TERM_X} y={BASE_Y} anchor="end">v_in</TerminalLabel>
      <TerminalLabel x={COUT_X + 30 + 12} y={COLLECTOR_NODE_Y} anchor="start">v_out</TerminalLabel>

      {/* Junctions where 3+ wires meet:
          • (DIV_X, TOP_Y) — top rail tap into R_1.
          • (DIV_X, BASE_Y) — R_1/R_2 mid-point + C_in tap into base.
          • (TR_COL_X, COLLECTOR_NODE_Y) — R_C bottom pin meets wire down
            to collector AND wire right to C_out. */}
      <Junction x={DIV_X} y={TOP_Y} />
      <Junction x={DIV_X} y={BASE_Y} />
      <Junction x={TR_COL_X} y={COLLECTOR_NODE_Y} />
    </Circuit>
  )
}
