/**
 * Chapter 1.10 §5 — Zener voltage regulator schematic.
 *
 * Topology:
 *   V_in (raw rail, e.g. 9–12 V wall-wart) → R_s (series resistor) →
 *   junction at the regulated rail, where the Zener (reverse-biased,
 *   so cathode pointing up to the +rail) and the load both hang.
 *   Bottom of Zener and bottom of load both return to the source's
 *   negative terminal via the bottom rail — there is no separate
 *   ground node, the battery's «−» pin IS the reference. Earlier
 *   revisions of this diagram drew an explicit Ground symbol at the
 *   bottom rail, which was both pedagogically misleading (suggests a
 *   second reference where there is only one) and a convention
 *   violation (real schematics show GND only when there is no
 *   explicit two-terminal source, or when a multi-stage circuit
 *   needs a common reference across stages).
 *
 *   The Zener is drawn with its CATHODE up so it sits in REVERSE bias —
 *   this is the operating mode that gives a steady regulated voltage.
 *   The series resistor drops the surplus voltage and limits Zener
 *   current.
 *
 * Pure `@/lib/circuit` primitives.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Battery,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { DiodeZener } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 480

const TOP_Y = SCHEMATIC_PAD_TOP // 35
const RAIL_SPAN = 130
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)

const SRC_X = 70
const RS_X = 180
const ZD_X = 280
const RL_X = 380

const SRC_Y = (TOP_Y + BOT_Y) / 2
const ZD_Y = (TOP_Y + BOT_Y) / 2
const RL_Y = (TOP_Y + BOT_Y) / 2

const src = pins2(SRC_X, SRC_Y, 'down')
const rs = pins2(RS_X, TOP_Y)
const zd = pins2(ZD_X, ZD_Y, 'up')   // cathode up (orient='up' puts p2 at top — for a diode that means the cathode is up, i.e. reverse bias against +rail)
const rl = pins2(RL_X, RL_Y, 'down')

export default function ZenerRegulatorSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_10.zenerSchematicCaption"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
      maxWidth={520}
    >
      {/* Source up to top rail, across through Rs to regulated node */}
      <Wire points={[src.p1, { x: SRC_X, y: TOP_Y }, rs.p1]} />
      <Wire points={[rs.p2, { x: ZD_X, y: TOP_Y }, zd.p2]} />
      {/* Regulated node continues right to load */}
      <Wire points={[{ x: ZD_X, y: TOP_Y }, { x: RL_X, y: TOP_Y }, rl.p1]} />
      {/* Bottom rail back to source */}
      <Wire points={[zd.p1, { x: ZD_X, y: BOT_Y }, { x: SRC_X, y: BOT_Y }, src.p2]} />
      <Wire points={[rl.p2, { x: RL_X, y: BOT_Y }, { x: ZD_X, y: BOT_Y }]} />

      {/* ── Components ────────────────────────────────────────── */}
      <Battery x={SRC_X} y={SRC_Y} orient="down" value="V_in" />
      <Resistor x={RS_X} y={TOP_Y} label="R_s" />
      <DiodeZener x={ZD_X} y={ZD_Y} orient="up" label="Z" />
      <Resistor x={RL_X} y={RL_Y} orient="down" label="R_L" />

      {/* Junctions
          ─────────
          Convention: junction dot ONLY at 3+ way electrical
          connections. A simple wire turning a corner gets no dot —
          the reader would otherwise see the dot as «something
          branches here» when nothing branches.

          The two corners at (RL_X, TOP_Y) and (RL_X, BOT_Y) used to
          have spurious junction dots; removed. The remaining two
          junctions sit at the regulated-rail tap (top of Zener +
          load tap-off) and the return tap (bottom of Zener + bottom
          of load + bottom rail back to source). Both are real
          3-way connections. */}
      <Junction x={ZD_X} y={TOP_Y} />
      <Junction x={ZD_X} y={BOT_Y} />
    </Circuit>
  )
}
