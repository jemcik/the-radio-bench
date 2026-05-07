/**
 * Chapter 1.10 §4 — Bridge (full-wave) rectifier schematic.
 *
 * Layout:
 *   Top rail   = DC+ output (+).
 *   Bottom rail= DC− output (−).
 *   Two columns of vertical diodes, each pair sandwiching the AC node:
 *     Left column  (x = AC+):  D1 above (anode at AC+, cathode at DC+)
 *                              D3 below (anode at DC−, cathode at AC+)
 *     Right column (x = AC−):  D2 above (anode at AC−, cathode at DC+)
 *                              D4 below (anode at DC−, cathode at AC−)
 *   AC source sits horizontally between the two AC nodes; its left pin
 *   feeds AC+, its right pin feeds AC−.
 *   Load resistor R_L hangs vertically on the right between the rails.
 *
 * Both half-cycles drive current through R_L in the same direction
 * (top → bottom on the load), so the load voltage is full-wave
 * rectified — bumps with NO gaps, twice the average of the half-wave
 * version.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  AcSource,
  pins2,
} from '@/lib/circuit'
import { Diode } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 540
const SCHEMATIC_H = 250

const TOP_Y = 35       // DC+ rail
const AC_Y = 130       // horizontal axis where AC source + AC nodes sit
const BOT_Y = 220      // DC− rail

const ACPOS_X = 200    // left column — AC+ node
const ACNEG_X = 320    // right column — AC- node
const LOAD_X = 460     // load resistor

const SRC_X = (ACPOS_X + ACNEG_X) / 2 // 260 — AC source between the bridge nodes

// Diode centres — each centred at 30 px below TOP_Y or 30 px above BOT_Y so
// one of its pins sits exactly on the rail it connects to.
const D1 = pins2(ACPOS_X, TOP_Y + 30, 'up')
const D2 = pins2(ACNEG_X, TOP_Y + 30, 'up')
const D3 = pins2(ACPOS_X, BOT_Y - 30, 'up')
const D4 = pins2(ACNEG_X, BOT_Y - 30, 'up')

const SRC = pins2(SRC_X, AC_Y) // horizontal AC source
const RL = pins2(LOAD_X, (TOP_Y + BOT_Y) / 2, 'down')

export default function BridgeRectifierSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_10.bridgeSchematicCaption"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
      maxWidth={580}
    >
      {/* ── Top rail (DC+) — runs from D1 cathode to load top ─── */}
      <Wire points={[D1.p2, { x: ACNEG_X, y: TOP_Y }, { x: LOAD_X, y: TOP_Y }, RL.p1]} />

      {/* D2 cathode taps the top rail at ACNEG_X */}
      <Wire points={[D2.p2, { x: ACNEG_X, y: TOP_Y }]} />

      {/* ── Bottom rail (DC−) — runs from D3 anode to load bottom ── */}
      <Wire points={[D3.p1, { x: ACNEG_X, y: BOT_Y }, { x: LOAD_X, y: BOT_Y }, RL.p2]} />
      <Wire points={[D4.p1, { x: ACNEG_X, y: BOT_Y }]} />

      {/* ── AC+ node: short vertical between D1 anode (bottom) and D3 cathode (top), passing through AC_Y ── */}
      <Wire points={[D1.p1, { x: ACPOS_X, y: AC_Y }, D3.p2]} />

      {/* ── AC− node: same on the right column ── */}
      <Wire points={[D2.p1, { x: ACNEG_X, y: AC_Y }, D4.p2]} />

      {/* ── AC source horizontal: left pin = AC+ node, right pin = AC− node ── */}
      <Wire points={[{ x: ACPOS_X, y: AC_Y }, SRC.p1]} />
      <Wire points={[SRC.p2, { x: ACNEG_X, y: AC_Y }]} />

      {/* ── Components ────────────────────────────────────────── */}
      <AcSource x={SRC_X} y={AC_Y} value="V_in" />
      <Diode x={ACPOS_X} y={TOP_Y + 30} orient="up" label="D1" />
      <Diode x={ACNEG_X} y={TOP_Y + 30} orient="up" label="D2" />
      <Diode x={ACPOS_X} y={BOT_Y - 30} orient="up" label="D3" />
      <Diode x={ACNEG_X} y={BOT_Y - 30} orient="up" label="D4" />
      <Resistor x={LOAD_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="R_L" />

      {/* ── Junctions ─────────────────────────────────────────── */}
      {/* AC+ node — 3-way: D1, D3, source-wire */}
      <Junction x={ACPOS_X} y={AC_Y} />
      {/* AC− node — 3-way: D2, D4, source-wire */}
      <Junction x={ACNEG_X} y={AC_Y} />
      {/* DC+ rail mid-junction — D2 taps in here */}
      <Junction x={ACNEG_X} y={TOP_Y} />
      {/* DC− rail mid-junction — D4 taps in here */}
      <Junction x={ACNEG_X} y={BOT_Y} />
    </Circuit>
  )
}
