/**
 * Chapter 1.5 §6 — schematic for the RC charging circuit described in
 * prose. The reader should never have to imagine the topology: this
 * diagram shows it directly so every "switch", "resistor", "capacitor",
 * "V_in", "V_C" in the surrounding text has a visual anchor.
 *
 * Topology:
 *   - Battery V_in on the left (orient='down', + on top, − on bottom).
 *   - Top rail: Switch S → Resistor R → top of Capacitor C.
 *   - Capacitor vertical; its bottom plate sits on the bottom return
 *     rail that loops back to the battery's negative terminal.
 *   - VOLTMETER in parallel with C — blue probes tap the two rails
 *     above and below the capacitor. The meter's reading IS V_C; the
 *     label «V_C» hangs off the meter (not off a bare wire-point) so
 *     the reader sees what physical quantity the name refers to.
 *
 * Uses only `@/lib/circuit` primitives (per CLAUDE.md "zero hand-drawn
 * SVG" rule for schematics). The voltmeter pattern mirrors the one in
 * `DividerSchematic.tsx` — blue probe wires, blue circle, blue label.
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
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import {
  SwitchSPST,
  Meter,
  meterPins,
  METER_ACCENT_V,
} from '@/lib/circuit/symbols/instruments'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 510

const TOP_Y = SCHEMATIC_PAD_TOP // 35
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)

const LEFT_X = 60 // battery column
const SW_X = 140 // switch
const R_X = 220 // resistor
const C_X = 310 // capacitor column
const VM_X = 410 // voltmeter column

const BAT_Y = (TOP_Y + BOT_Y) / 2
const C_Y = BAT_Y
const VM_Y = BAT_Y

const bat = pins2(LEFT_X, BAT_Y, 'down')
const sw = pins2(SW_X, TOP_Y)
const r = pins2(R_X, TOP_Y)
const c = pins2(C_X, C_Y, 'down')
const vm = meterPins(VM_X, VM_Y, 'down')

export default function RCChargingSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_5.rcSchematicCaption"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
      maxWidth={560}
    >
      {/* ── Main loop (foreground colour) ─────────────────────────── */}
      {/* Battery+ up to top rail, across to switch */}
      <Wire points={[bat.p1, { x: LEFT_X, y: TOP_Y }, sw.p1]} />
      {/* Top rail: switch → resistor → top of capacitor */}
      <Wire points={[sw.p2, r.p1]} />
      <Wire points={[r.p2, { x: C_X, y: TOP_Y }, c.p1]} />
      {/* Vertical branch down through capacitor to bottom rail */}
      <Wire points={[c.p2, { x: C_X, y: BOT_Y }]} />
      {/* Bottom rail back to battery− */}
      <Wire points={[{ x: C_X, y: BOT_Y }, { x: LEFT_X, y: BOT_Y }, bat.p2]} />

      {/* ── Voltmeter probes (coloured to match the meter) ────────── */}
      {/* Top probe: tap at (C_X, TOP_Y), run right, down to voltmeter top */}
      <Wire
        color={METER_ACCENT_V}
        points={[
          { x: C_X, y: TOP_Y },
          { x: VM_X, y: TOP_Y },
          vm.p1,
        ]}
      />
      {/* Bottom probe: voltmeter bottom down to bottom rail, left to cap node */}
      <Wire
        color={METER_ACCENT_V}
        points={[
          vm.p2,
          { x: VM_X, y: BOT_Y },
          { x: C_X, y: BOT_Y },
        ]}
      />

      {/* ── Components ────────────────────────────────────────────── */}
      {/* Battery — only value (V_in); the component designator would
          duplicate the voltage label, cluttering the schematic. The
          «V_in» string is parsed by the shared `renderLabelContent`
          helper in `SymbolLabel.tsx`, so «in» appears as a proper
          baseline-shifted subscript (no literal underscore). */}
      <Battery x={LEFT_X} y={BAT_Y} orient="down" value="V_in" />
      <SwitchSPST x={SW_X} y={TOP_Y} label="S" closed={false} />
      <Resistor x={R_X} y={TOP_Y} label="R" />
      <Capacitor x={C_X} y={C_Y} orient="down" label="C" />

      {/* Voltmeter — reading IS V_C. Blue circle + blue probes make
          clear that this is a separate measurement instrument, not a
          circuit element. */}
      <Meter
        x={VM_X}
        y={VM_Y}
        orient="down"
        letter="V"
        accent={METER_ACCENT_V}
      />

      {/* ── Junction dots at the T-joints where voltmeter taps in ─── */}
      <Junction x={C_X} y={TOP_Y} />
      <Junction x={C_X} y={BOT_Y} />

      {/* ── V_C label hanging off the voltmeter ───────────────────── */}
      <TerminalLabel
        x={VM_X + 26}
        y={VM_Y}
        anchor="start"
        color={METER_ACCENT_V}
        weight={700}
      >
        V_C
      </TerminalLabel>
    </Circuit>
  )
}
