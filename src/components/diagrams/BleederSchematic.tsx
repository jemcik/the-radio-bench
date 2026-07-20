/**
 * Chapter 4.3 §3 — the bleeder resistor, shown where the prose puts it:
 * permanently across the reservoir capacitor of a high-tension supply.
 *
 * The prose claims "good designs fit a bleeder resistor across the reservoir
 * capacitor". This schematic is that sentence, drawn — so the reader never has
 * to imagine the topology, and so «reservoir capacitor», «bleeder» and «HT
 * rail» each have a visual anchor before they appear in the text.
 *
 * Topology (a rectifier front-end, cut down to only what the point needs):
 *   - AcSource on the left (transformer secondary), orient='down'.
 *   - Top rail: D1 rectifies → HT rail.
 *   - C1 (reservoir electrolytic) vertical from HT rail to the return rail.
 *   - R1 (bleeder) vertical, in PARALLEL with C1 — the whole point.
 *   - Return rail back to the source, earthed (chassis) at GND_X.
 *
 * Why the bleeder is drawn to the RIGHT of the capacitor rather than left:
 * reading order. The eye arrives along the top rail, meets the reservoir cap
 * first (the thing that stores the charge), then the bleeder (the thing that
 * drains it) — which is the causal order the prose uses.
 *
 * Uses only `@/lib/circuit` primitives (CLAUDE.md "zero hand-drawn SVG" rule).
 *
 * ── Horizontal budget (label collisions) ──────────────────────────────
 * Vertical symbols place label+value to the RIGHT of the body at x+20,
 * start-anchored (see CenteredLabel in SymbolLabel.tsx). Worst case:
 *   C1 value «100 µF» / UA «100 мкФ» — 7 chars × ~6 px ≈ 42 px from x=290
 *     → ends ≈ 332. R1 body spans 381–399. Clearance ≈ 49 px. Safe.
 *   R1 value «100 kΩ» / UA «100 кОм» — 7 chars × ~6 px ≈ 42 px from x=410
 *     → ends ≈ 452. Canvas is 480. Clearance ≈ 28 px. Safe.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  CapacitorElectrolytic,
  Diode,
  AcSource,
  Ground,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 480

// `Circuit.maxWidth` caps the CARD, not the svg — the card's own padding eats
// ~34 px, and `SVGDiagram` then stretches the svg to whatever is left. Passing
// maxWidth === width therefore renders the viewBox at ~0.93×, shrinking every
// 13-unit symbol label to ~12.1 px on screen — under the 13 px floor, and
// invisible to `check:circuit-maxwidth` (which only checks the prop exists).
// Adding the padding back keeps the scale at ~1. Same +50 convention as
// RCChargingSchematic (width 510 / maxWidth 560).
const CARD_PAD = 50

const TOP_Y = SCHEMATIC_PAD_TOP // 35 — the HT rail
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN // 145 — the return rail
const MID_Y = (TOP_Y + BOT_Y) / 2 // 90

// +25 below the bottom rail for the compact Ground symbol's stripes —
// `schematicHeight` only allots 20, which clips the smallest stripe.
// (Same allowance as BalunSchematic; see the Ground docstring.)
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 25

const SRC_X = 60 // transformer secondary / AC source column
const D_X = 165 // rectifier diode, in the top rail
const GND_X = 165 // chassis earth on the return rail, under the diode
const C_X = 280 // reservoir capacitor column
const R_X = 390 // bleeder resistor column — parallel with C

const src = pins2(SRC_X, MID_Y, 'down')
const d = pins2(D_X, TOP_Y)
// C1 is orient='up', NOT 'down'. The vendored polarised-capacitor path draws
// the curved (negative) plate on the left and the straight plate + «+» mark on
// the right; `orient` rotates the whole glyph. 'down' = rotate(+90°) sweeps the
// «+» to the BOTTOM, which would put the electrolytic's positive terminal on
// the earthed return rail and its negative on the HT rail — backwards, and a
// reversed electrolytic is exactly the thing that explodes. 'up' = rotate(−90°)
// puts «+» at the top, so p2 (top) is positive → HT, p1 (bottom) → return.
const c = pins2(C_X, MID_Y, 'up')
const r = pins2(R_X, MID_Y, 'down')

export default function BleederSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch4_3.bleederCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
      maxWidth={SCHEMATIC_W + CARD_PAD}
    >
      {/* ── Supply side: source → rectifier → HT rail ──────────────── */}
      <Wire points={[src.p1, { x: SRC_X, y: TOP_Y }, d.p1]} />
      <Wire points={[d.p2, { x: C_X, y: TOP_Y }, c.p2]} />

      {/* ── The parallel branch: HT rail across to the bleeder ─────── */}
      <Wire points={[{ x: C_X, y: TOP_Y }, { x: R_X, y: TOP_Y }, r.p1]} />

      {/* ── Return rail — both legs down, then back to the source ──── */}
      <Wire points={[c.p1, { x: C_X, y: BOT_Y }]} />
      <Wire points={[r.p2, { x: R_X, y: BOT_Y }, { x: C_X, y: BOT_Y }]} />
      <Wire points={[{ x: C_X, y: BOT_Y }, { x: SRC_X, y: BOT_Y }, src.p2]} />

      {/* ── Components ─────────────────────────────────────────────── */}
      <AcSource x={SRC_X} y={MID_Y} orient="down" />
      <Diode x={D_X} y={TOP_Y} label="D1" />
      <CapacitorElectrolytic x={C_X} y={MID_Y} orient="up" label="C1" value="100µF" />
      <Resistor x={R_X} y={MID_Y} orient="down" label="R1" value="100kΩ" />

      {/* Chassis earth on the return rail. `orient='right'` is the
          unrotated path with the shortened pin (tip at local (0,−10)),
          so origin y = BOT_Y + 10 lands the tip exactly on the rail. */}
      <Ground x={GND_X} y={BOT_Y + 10} orient="right" />

      {/* ── Junction dots — only where three wires actually meet ───── */}
      {/* HT node: in from D1, right to R1, down to C1 */}
      <Junction x={C_X} y={TOP_Y} />
      {/* Return node: up to C1, right to R1, left to the source */}
      <Junction x={C_X} y={BOT_Y} />
      {/* No dot at the earth tap: the Ground symbol's pin lands directly on the
          rail, so only two *conductors* (the rail's two halves) meet there —
          the symbol is the connection, not a third wire. Same treatment as
          BalunSchematic. `check:junction-placement` enforces this. */}

      {/* ── HT rail label — names the rail the prose calls dangerous ─ */}
      <TerminalLabel x={C_X - 46} y={TOP_Y - 13} anchor="middle">
        HT
      </TerminalLabel>
    </Circuit>
  )
}
