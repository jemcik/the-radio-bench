/**
 * Chapter 1.6 §5 — schematic for the RL charging circuit. Mirror of
 * `RCChargingSchematic` but with an inductor in the storage slot and
 * an AMMETER inline in the loop instead of a voltmeter across the
 * capacitor — because the energy-storage variable for an inductor is
 * current, not voltage.
 *
 * Topology:
 *   - Battery V_in on the left.
 *   - Top rail: Switch S → Resistor R → top of Inductor L.
 *   - Inductor vertical; bottom of L on bottom return rail.
 *   - AMMETER inline between R and L (green probes/circle to match
 *     the «A» letter); the meter's reading IS I, the loop current —
 *     the variable that climbs along τ = L/R.
 *
 * Uses `@/lib/circuit` primitives only (per the no-hand-drawn-SVG rule).
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Inductor,
  Battery,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import {
  SwitchSPST,
  Meter,
  meterPins,
  METER_ACCENT_A,
} from '@/lib/circuit/symbols/instruments'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 510

const TOP_Y = SCHEMATIC_PAD_TOP // 35
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)

const LEFT_X = 60   // battery column
const SW_X = 130    // switch
const R_X = 210     // resistor
const A_X = 290     // ammeter (inline on the top rail)
const L_X = 380     // inductor column

const BAT_Y = (TOP_Y + BOT_Y) / 2
const L_Y = BAT_Y

const bat = pins2(LEFT_X, BAT_Y, 'down')
const sw = pins2(SW_X, TOP_Y)
const r = pins2(R_X, TOP_Y)
const am = meterPins(A_X, TOP_Y, 'right')
const l = pins2(L_X, L_Y, 'down')

export default function RLChargingSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_6.rlSchematicCaption"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
      maxWidth={560}
    >
      {/* ── Main loop ─────────────────────────────────────────────── */}
      {/* Battery+ up to top rail, across to switch */}
      <Wire points={[bat.p1, { x: LEFT_X, y: TOP_Y }, sw.p1]} />
      {/* Top rail: switch → resistor → ammeter → top of inductor */}
      <Wire points={[sw.p2, r.p1]} />
      <Wire points={[r.p2, am.p1]} />
      <Wire points={[am.p2, { x: L_X, y: TOP_Y }, l.p1]} />
      {/* Vertical branch down through inductor to bottom rail */}
      <Wire points={[l.p2, { x: L_X, y: BOT_Y }]} />
      {/* Bottom rail back to battery− */}
      <Wire points={[{ x: L_X, y: BOT_Y }, { x: LEFT_X, y: BOT_Y }, bat.p2]} />

      {/* ── Components ────────────────────────────────────────────── */}
      <Battery x={LEFT_X} y={BAT_Y} orient="down" value="V_in" />
      <SwitchSPST x={SW_X} y={TOP_Y} label="S" closed={false} />
      <Resistor x={R_X} y={TOP_Y} label="R" />
      <Meter
        x={A_X}
        y={TOP_Y}
        orient="right"
        letter="A"
        accent={METER_ACCENT_A}
      />
      <Inductor x={L_X} y={L_Y} orient="down" label="L" />

      {/* ── Current label hanging off the ammeter ─────────────────── */}
      <TerminalLabel
        x={A_X}
        y={TOP_Y - 32}
        anchor="middle"
        color={METER_ACCENT_A}
        weight={700}
      >
        I
      </TerminalLabel>

      {/* No junction dots needed — the loop is a single straight path,
          no T-joints. */}
      <Junction x={L_X} y={TOP_Y} />
    </Circuit>
  )
}
