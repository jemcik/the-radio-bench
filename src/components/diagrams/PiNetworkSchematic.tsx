/**
 * Chapter 3.2 §6 — the transmitter output low-pass filter, pi-network form.
 *
 * Topology (left → right), shaped like the Greek letter π:
 *   from PA ─┬─ L ─┬─ to antenna
 *            │     │
 *            C1    C2        (both shunt to the ground rail)
 *            │     │
 *           GND ─── GND
 *
 * Two shunt capacitors bridged by a series inductor. The caps present a low
 * reactance to the high-frequency harmonics and short them to ground; the
 * inductor passes the lower fundamental. It also transforms the PA's output
 * impedance to the antenna's 50 Ω. Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  Capacitor,
  Inductor,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation } from 'react-i18next'

const SCHEMATIC_W = 520

const TOP_Y = SCHEMATIC_PAD_TOP + 10
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 10

const IN_X = 74
const NODE1_X = 152      // input shunt-cap column
const L_X = 256          // series inductor on the signal rail
const NODE2_X = 360      // output shunt-cap column
const OUT_X = 444

const MID_Y = (TOP_Y + BOT_Y) / 2

const l = pins2(L_X, TOP_Y)
const c1 = pins2(NODE1_X, MID_Y, 'down')
const c2 = pins2(NODE2_X, MID_Y, 'down')

export default function PiNetworkSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={560}
      caption={t('ch3_2.piSchematic.caption')}
    >
      {/* Signal rail: in → node1 → L → node2 → out */}
      <Wire points={[{ x: IN_X, y: TOP_Y }, { x: NODE1_X, y: TOP_Y }, l.p1]} />
      <Wire points={[l.p2, { x: NODE2_X, y: TOP_Y }, { x: OUT_X, y: TOP_Y }]} />

      {/* Shunt caps from each node down to the GND rail */}
      <Wire points={[{ x: NODE1_X, y: TOP_Y }, c1.p1]} />
      <Wire points={[c1.p2, { x: NODE1_X, y: BOT_Y }]} />
      <Wire points={[{ x: NODE2_X, y: TOP_Y }, c2.p1]} />
      <Wire points={[c2.p2, { x: NODE2_X, y: BOT_Y }]} />

      {/* GND rail under the network */}
      <Wire points={[{ x: NODE1_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Inductor x={L_X} y={TOP_Y} label="L" />
      <Capacitor x={NODE1_X} y={MID_Y} orient="down" label="C1" />
      <Capacitor x={NODE2_X} y={MID_Y} orient="down" label="C2" />

      {/* T-junctions: top nodes where caps tap the signal rail, and the
          bottom node where C2 meets the GND rail (rail passes through). */}
      <Junction x={NODE1_X} y={TOP_Y} />
      <Junction x={NODE2_X} y={TOP_Y} />
      <Junction x={NODE2_X} y={BOT_Y} />

      {/* Terminal labels */}
      <TerminalLabel x={IN_X - 6} y={TOP_Y} anchor="end">
        {t('ch3_2.piSchematic.fromPa')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={TOP_Y} anchor="start">
        {t('ch3_2.piSchematic.toAntenna')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch3_2.piSchematic.gnd')}
      </TerminalLabel>
    </Circuit>
  )
}
