/**
 * Chapter 1.10 §3 — half-wave rectifier schematic.
 *
 * Topology:
 *   AC source on the left → diode in series on the top rail (anode at the
 *   source, cathode at the load) → load resistor R_L vertical between
 *   the top rail and the return path → bottom rail back to the AC source.
 *
 * This is the simplest rectifier circuit: the diode passes the positive
 * half-cycles of V_in (when the AC source is anode-positive relative to
 * cathode) and blocks the negative half-cycles. The load sees a
 * pulsating one-direction voltage — half-wave rectified.
 *
 * Pure `@/lib/circuit` primitives — zero hand-drawn SVG content.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Resistor,
  AcSource,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { Diode } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 480

const TOP_Y = SCHEMATIC_PAD_TOP // 35
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)

const SRC_X = 80   // AC source column
const D_X = 220    // diode on top rail
const R_X = 360    // load resistor column

const SRC_Y = (TOP_Y + BOT_Y) / 2
const R_Y = SRC_Y

const src = pins2(SRC_X, SRC_Y, 'down')
const d = pins2(D_X, TOP_Y)
const r = pins2(R_X, R_Y, 'down')

export default function HalfWaveRectifierSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_10.halfWaveSchematicCaption"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
      maxWidth={520}
    >
      {/* AC source up to top rail */}
      <Wire points={[src.p1, { x: SRC_X, y: TOP_Y }, d.p1]} />
      {/* Top rail through diode to top of load */}
      <Wire points={[d.p2, { x: R_X, y: TOP_Y }, r.p1]} />
      {/* Bottom rail back to AC source */}
      <Wire points={[r.p2, { x: R_X, y: BOT_Y }, { x: SRC_X, y: BOT_Y }, src.p2]} />

      <AcSource x={SRC_X} y={SRC_Y} orient="down" value="V_in" />
      <Diode x={D_X} y={TOP_Y} label="D" />
      <Resistor x={R_X} y={R_Y} orient="down" label="R_L" />
    </Circuit>
  )
}
