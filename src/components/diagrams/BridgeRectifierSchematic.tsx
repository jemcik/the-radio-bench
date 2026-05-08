/**
 * Chapter 1.10 §4 — Bridge (full-wave) rectifier schematic, v2.
 *
 * History
 * ───────
 * v1 (initial ch1.10 commit) had multiple readability/pedagogy issues
 * the reader caught on first review:
 *
 *   • All four diodes drawn vertically with arrows pointing UP — no
 *     visual hint about which two conduct each half-cycle.
 *   • AC source sat INSIDE the bridge between the two AC nodes — no
 *     clear «here is the source feeding the bridge» anchor.
 *   • Load resistor 140 px to the right of the bridge with empty rails
 *     in between — visually disjointed.
 *   • No DC+ / DC− terminal labels — reader had to guess which rail
 *     was the positive output.
 *   • Diode numbering was row-major (D1, D2 top; D3, D4 bottom) instead
 *     of conventional clockwise — incompatible with most textbook
 *     diagrams.
 *   • No current-flow indication for either half-cycle.
 *   • PRIMITIVE-LEVEL bug: D1–D4 labels rendered ON the vertical leads,
 *     unreadable. (Fixed in CenteredLabel — orient-aware now.)
 *   • PRIMITIVE-LEVEL bug: V_in label sat INSIDE the AC-source circle,
 *     overlapping the sine wave. (Fixed in AcSource — custom label
 *     placement that clears the 12-radius body.)
 *
 * v2 (this file)
 * ──────────────
 * Topology unchanged (electrically identical), but:
 *
 *   • Clockwise diode numbering: D1=top-left, D2=top-right,
 *     D3=bottom-right, D4=bottom-left. This makes «opposite (diagonal)
 *     diodes conduct together» visible in the labels themselves — D1+D3
 *     conduct on positive half-cycle, D2+D4 on negative.
 *
 *   • Explicit DC+ / DC− terminal labels at the right ends of the top
 *     and bottom rails (next to where the load connects) — reader can
 *     see at a glance which rail is the positive output.
 *
 *   • Active-path highlight: the wires that carry current on the
 *     positive half-cycle (AC+ → D1 → DC+ → load → DC− → D3 → AC−) are
 *     drawn in the «callout-experiment» teal accent, and a small caption
 *     under the schematic notes which pair this is. The other half-cycle
 *     uses D2+D4 along the symmetric mirror path.
 *
 *   • R_L moved closer to the bridge (LOAD_X 460 → 420) and the right
 *     column of diodes shifted slightly so the rails' empty stretch
 *     between bridge and load is visually balanced.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  AcSource,
  TerminalLabel,
  pins2,
} from '@/lib/circuit'
import { Diode } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 540
const SCHEMATIC_H = 250

const TOP_Y = 35       // DC+ rail
const AC_Y = 130       // horizontal axis where the AC source + AC nodes sit
const BOT_Y = 220      // DC− rail

// Bridge columns
const ACPOS_X = 220    // left column — AC+ node (between D1 and D4)
const ACNEG_X = 340    // right column — AC− node (between D2 and D3)

// AC source between the AC columns (in-line with the AC node level).
const SRC_X = (ACPOS_X + ACNEG_X) / 2 // 280

// Load on the right.
const LOAD_X = 460
// Terminal-label x position just past the load column.
const TERM_X = LOAD_X + 22

// Diode centres — each centred 30 px below TOP_Y or above BOT_Y so one
// pin sits exactly on the rail it connects to.
const D1 = pins2(ACPOS_X, TOP_Y + 30, 'up')   // top-left  — anode AC+, cathode DC+
const D2 = pins2(ACNEG_X, TOP_Y + 30, 'up')   // top-right — anode AC−, cathode DC+
const D3 = pins2(ACNEG_X, BOT_Y - 30, 'up')   // bottom-right — anode DC−, cathode AC−
const D4 = pins2(ACPOS_X, BOT_Y - 30, 'up')   // bottom-left  — anode DC−, cathode AC+

const SRC = pins2(SRC_X, AC_Y) // horizontal AC source
const RL = pins2(LOAD_X, (TOP_Y + BOT_Y) / 2, 'down')

// Active-path accent. The wires that conduct on the positive half-cycle
// — AC+ → D1 → DC+ → load → DC− → D3 → AC− — are drawn in this colour
// to highlight the conducting path. Off-cycle wires use the default
// schematic stroke.
const ACTIVE = 'hsl(var(--callout-experiment))'

export default function BridgeRectifierSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_10.bridgeSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
      maxWidth={580}
    >
      {/* ════════ INACTIVE-CYCLE WIRES (default stroke) ════════════
          The rails serve both half-cycles, so they're drawn neutrally.
          Only the diode-paths that conduct on the OFF-cycle (D2 cathode
          tap on top rail, D4 anode tap on bottom rail) are drawn here. */}

      {/* INACTIVE: D2 cathode meets the top rail at (ACNEG_X, TOP_Y).
          Zero-length stub since they coincide — preserved for the
          junction dot. */}
      <Wire points={[D2.p2, { x: ACNEG_X, y: TOP_Y }]} />

      {/* INACTIVE: D4 anode meets the bottom rail at (ACPOS_X, BOT_Y).
          Same idea — zero-length, just the junction. */}
      <Wire points={[D4.p1, { x: ACPOS_X, y: BOT_Y }]} />

      {/* INACTIVE: AC− vertical leg from D2 anode (top) through AC source
          right pin level to D3 cathode (bottom). The AC− portion of the
          source-to-bridge connection is on the active path on the negative
          half-cycle (and so D2 + D4 conduct), but on the positive half-cycle
          shown here, only the lower part (AC source → D3 cathode) carries
          current; the upper part (D2 anode → AC source) does not. So we
          split the AC− vertical into two segments. */}

      {/* AC− upper leg (inactive on positive cycle): D2 anode → AC− node */}
      <Wire points={[D2.p1, { x: ACNEG_X, y: AC_Y }]} />

      {/* INACTIVE: bottom-rail LEFT half (between D4 anode and D3 anode).
          On positive cycle no current flows here — D4 is off, so its anode
          point is just connected to the bottom rail without driving current. */}
      <Wire points={[D4.p1, D3.p1]} />

      {/* ════════ ACTIVE-CYCLE WIRES (highlight) ════════════════════
          Positive half-cycle current path, in clockwise order around
          the loop:
            AC source → AC+ node → D1 → DC+ rail → R_L → DC− rail
            → D3 → AC− node → back to AC source

          Drawn in the experiment-callout teal so the reader sees the
          conducting loop at a glance. */}

      {/* AC source LEFT pin → AC+ node (no inactive part — fully active) */}
      <Wire color={ACTIVE} points={[{ x: ACPOS_X, y: AC_Y }, SRC.p1]} />

      {/* AC+ vertical leg: AC+ node UP to D1 anode (only this part is active;
          on positive cycle D4 is off so no current flows DOWN to D4). */}
      <Wire color={ACTIVE} points={[{ x: ACPOS_X, y: AC_Y }, D1.p1]} />

      {/* Top rail (DC+): D1 cathode → across the rail → load top.
          Single straight wire, left-to-right. Passes through D2's
          cathode tap at (ACNEG_X, TOP_Y) but D2 is off so no current
          branches off there. */}
      <Wire color={ACTIVE} points={[D1.p2, { x: ACNEG_X, y: TOP_Y }, { x: LOAD_X, y: TOP_Y }]} />

      {/* Load drops vertically between top and bottom rails */}
      <Wire color={ACTIVE} points={[{ x: LOAD_X, y: TOP_Y }, RL.p2]} />
      <Wire color={ACTIVE} points={[RL.p1, { x: LOAD_X, y: BOT_Y }]} />

      {/* Bottom rail (DC−) RIGHT half: load bottom → D3 anode.
          Single straight wire, right-to-left direction of current,
          rendered left-to-right for normal SVG ordering. */}
      <Wire color={ACTIVE} points={[D3.p1, { x: LOAD_X, y: BOT_Y }]} />

      {/* AC− lower leg: D3 cathode → AC− node */}
      <Wire color={ACTIVE} points={[D3.p2, { x: ACNEG_X, y: AC_Y }]} />

      {/* AC source RIGHT pin → AC− node */}
      <Wire color={ACTIVE} points={[SRC.p2, { x: ACNEG_X, y: AC_Y }]} />

      {/* ════════ COMPONENTS ═══════════════════════════════════════ */}
      <AcSource x={SRC_X} y={AC_Y} value="V_in" />
      <Diode x={ACPOS_X} y={TOP_Y + 30} orient="up" label="D1" />
      <Diode x={ACNEG_X} y={TOP_Y + 30} orient="up" label="D2" />
      <Diode x={ACNEG_X} y={BOT_Y - 30} orient="up" label="D3" />
      <Diode x={ACPOS_X} y={BOT_Y - 30} orient="up" label="D4" />
      <Resistor x={LOAD_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="R_L" />

      {/* ════════ DC OUTPUT TERMINAL LABELS ═══════════════════════ */}
      <TerminalLabel x={TERM_X} y={TOP_Y} anchor="start" weight={600}>
        DC+
      </TerminalLabel>
      <TerminalLabel x={TERM_X} y={BOT_Y} anchor="start" weight={600}>
        DC−
      </TerminalLabel>

      {/* ════════ JUNCTIONS ═══════════════════════════════════════ */}
      {/* AC+ node — 3-way: D1, D4, source-wire */}
      <Junction x={ACPOS_X} y={AC_Y} />
      {/* AC− node — 3-way: D2, D3, source-wire */}
      <Junction x={ACNEG_X} y={AC_Y} />
      {/* DC+ rail tap where D2 cathode meets the rail going right */}
      <Junction x={ACNEG_X} y={TOP_Y} />
      {/* DC− rail tap where D4 anode meets the rail going right */}
      <Junction x={ACPOS_X} y={BOT_Y} />
    </Circuit>
  )
}
