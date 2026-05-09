/**
 * Chapter 1.10 §family — Varactor in an LC tuner: the «two pins, two
 * jobs» visual.
 *
 * The reader's blocker was: a varicap is a 2-pin diode, so HOW does
 * one device receive both a DC bias («which sets the capacitance»)
 * and the AC radio signal at the same time without one stomping the
 * other? Words alone hadn't worked; this schematic shows the bias
 * network surrounding the diode.
 *
 * Topology
 * ────────
 *   • Varactor D and inductor L — wired in parallel, forming the LC
 *     tank that the radio uses to pick one frequency from the air.
 *   • Coupling capacitor C_c on the LEFT — passes the AC signal from
 *     the «AC in» terminal, blocks DC from leaking back to the AC
 *     source.
 *   • Bias resistor R_b on the RIGHT — feeds DC from the V_tune
 *     terminal into the tank, while presenting a high impedance to
 *     AC so it doesn't load the tank's resonance.
 *   • Both rails (tank top + tank bottom) come together at GND
 *     through the inductor; the varactor sees the DC bias as the
 *     potential difference between V_tune (via R_b) and GND, with
 *     the tank's small AC signal riding on top.
 *
 * The varactor itself in the schematic has the same two pins it
 * always had — ANODE at the bottom of its symbol, CATHODE at the
 * top, drawn as a single vertical diode body. The «two jobs» split
 * happens in the SURROUNDING circuit, not on the diode.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Capacitor,
  Inductor,
  Ground,
  TerminalLabel,
  pins2,
} from '@/lib/circuit'
import { Diode } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'

const SCHEMATIC_W = 540
const SCHEMATIC_H = 270

// Vertical layout: V_tune at top, Rb hanging down to tank top, the
// LC tank from y=110 down to y=220, ground stub below.
//
// V_tune label sits at y=24 with an italic-subscript «tune» glyph
// that extends ~6 px below the baseline (real bbox: y=29..36 from a
// 14 px Georgia-italic + 60 % subscript). The wire stub from below
// the label to rb.p1 must clear that subscript with margin — picked
// rb.p1 = 50 (i.e., 14 px below the subscript's visible bottom),
// which fits the diagram-text-overlap gate's 2 px tolerance budget
// with a comfortable buffer.
const VTUNE_Y = 24
const RB_CENTER_Y = 80          // rb.p1 = 50, rb.p2 = 110 (default span=60)
const TANK_TOP_Y = 110
const TANK_BOT_Y = 220
const GND_PIN_Y = TANK_BOT_Y    // ground pin lands on the bottom rail
const GND_BODY_Y = GND_PIN_Y + 15

// Horizontal layout: AC in on the left, Cc bridging to the tank, the
// tank itself with D on the left vertical and L on the right vertical,
// Rb at the same x as the tank's right edge so its lead goes straight
// down into the top rail.
const ACIN_X = 50               // «AC in» terminal label x
const CC_X = 130                // coupling capacitor centre
const D_X = 240                 // varactor x (left side of LC tank)
const L_X = 360                 // inductor x (right side of LC tank)
const RB_X = L_X                // bias resistor sits above the inductor's x
const VTUNE_X = RB_X            // V_tune terminal x (above Rb)
const GND_X = (D_X + L_X) / 2   // ground glyph centred between D and L

// Pin helpers
const cc = pins2(CC_X, TANK_TOP_Y)                                    // horizontal Cc
const d  = pins2(D_X, (TANK_TOP_Y + TANK_BOT_Y) / 2, 'up')             // varactor, cathode UP
const l  = pins2(L_X, (TANK_TOP_Y + TANK_BOT_Y) / 2, 'down')           // inductor vertical
const rb = pins2(RB_X, RB_CENTER_Y, 'down')                           // bias resistor vertical

export default function VaractorTunerSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_10.varactorTunerCaption"
          ns="ui"
          components={{
            var: <MathVar />,
            strong: <strong />,
            tank: <G k="tank" />,
            reson: <G k="resonance" />,
          }}
        />
      }
      maxWidth={600}
    >
      {/* ── AC in (left) → Cc → tank top ────────────────────────── */}
      {/* Wire from the «AC in» terminal at x=ACIN_X+8 (just past the
          glyph's right edge) to Cc.p1, then Cc.p2 to the tank top. */}
      <Wire points={[{ x: ACIN_X + 8, y: TANK_TOP_Y }, cc.p1]} />
      <Wire points={[cc.p2, { x: D_X, y: TANK_TOP_Y }]} />

      {/* ── Tank top rail: D top → L top → bottom of Rb ─────────── */}
      <Wire points={[{ x: D_X, y: TANK_TOP_Y }, d.p2]} />
      <Wire
        points={[
          { x: D_X, y: TANK_TOP_Y },
          { x: L_X, y: TANK_TOP_Y },
          l.p1,
        ]}
      />
      <Wire points={[{ x: RB_X, y: TANK_TOP_Y }, rb.p2]} />

      {/* ── Tank bottom rail: D anode → L bottom ────────────────── */}
      <Wire
        points={[
          d.p1,
          { x: D_X, y: TANK_BOT_Y },
          { x: L_X, y: TANK_BOT_Y },
          l.p2,
        ]}
      />

      {/* ── Rb top → V_tune terminal ──────────────────────────────
          Wire endpoint at VTUNE_Y + 14 = 38 — well below the subscript
          glyph «tune» (whose bbox bottom sits at y≈30 with VTUNE_Y=24).
          Earlier revision ended at VTUNE_Y + 8 and the wire's last px
          fell INSIDE the subscript bbox; gate flagged. */}
      <Wire points={[rb.p1, { x: RB_X, y: VTUNE_Y + 14 }]} />

      {/* ── Components ──────────────────────────────────────────── */}
      <Capacitor x={CC_X} y={TANK_TOP_Y} label="C_c" />
      <Diode x={D_X} y={(TANK_TOP_Y + TANK_BOT_Y) / 2} orient="up" label="D" />
      <Inductor x={L_X} y={(TANK_TOP_Y + TANK_BOT_Y) / 2} orient="down" label="L" />
      <Resistor x={RB_X} y={RB_CENTER_Y} orient="down" label="R_b" />

      {/* Ground hangs from the tank-bottom rail at the midpoint
          between D and L. orient='right' keeps the canonical «pin up,
          bars below» rendering (per the FlybackDiode / Balun
          convention). */}
      <Ground x={GND_X} y={GND_BODY_Y + 15} orient="right" />
      <Wire points={[{ x: GND_X, y: TANK_BOT_Y }, { x: GND_X, y: GND_BODY_Y }]} />

      {/* ── Terminal labels ─────────────────────────────────────── */}
      <TerminalLabel x={ACIN_X} y={TANK_TOP_Y} anchor="end">
        AC in
      </TerminalLabel>
      <TerminalLabel x={VTUNE_X} y={VTUNE_Y} anchor="middle">
        V_tune
      </TerminalLabel>

      {/* ── Junctions ───────────────────────────────────────────── */}
      {/* (D_X, TANK_TOP_Y): Cc end + D top + horizontal to L top — 3-way */}
      <Junction x={D_X} y={TANK_TOP_Y} />
      {/* (L_X, TANK_TOP_Y): horizontal from D + L top + vertical to Rb — 3-way */}
      <Junction x={L_X} y={TANK_TOP_Y} />
      {/* (L_X, TANK_BOT_Y): D-bottom horizontal + L bottom + ground stub
          (via the GND_X mid-bridge) — actually the ground stub starts at
          the MIDPOINT between D and L on the bottom rail. So at L_X
          there's only the rail corner + L bottom = 2 connections, not
          a junction. (D_X, TANK_BOT_Y) is also just a corner. The real
          3-way joint is (GND_X, TANK_BOT_Y) where the rail passes
          through and the ground stub goes down. */}
      <Junction x={GND_X} y={TANK_BOT_Y} />
    </Circuit>
  )
}
