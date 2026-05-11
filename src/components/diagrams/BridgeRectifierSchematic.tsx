/**
 * Chapter 1.10 §4 — Bridge (full-wave) rectifier schematic, v3.
 *
 * History
 * ───────
 * v1 (initial ch1.10): square 2×2 layout with AC source inside the
 * bridge, no DC labels, row-major numbering, label-on-lead bug,
 * V_in-inside-circle bug. Reader-flagged.
 *
 * v2 (response 1): primitive-level fixes (CenteredLabel orient-aware,
 * AcSource custom label placement) + clockwise numbering + DC+/DC−
 * terminal labels + active-path teal highlight. Reader-flagged again
 * — the green highlight read as «random colour», D4 was disconnected
 * (I split AC+ vertical leg and forgot the lower half), and the user
 * still wanted the two structural fixes I originally listed but did
 * not implement: diamond layout, AC source outside the bridge.
 *
 * v3 (this file)
 * ──────────────
 * Full diamond layout, AC source on the left:
 *
 *                          DC+
 *                           ●─────────────────●─────●
 *                         ↗   ↖              │
 *                       D1     D2            R_L
 *                         ╲   ╱              │
 *           AC1 ●─────────●─●─────────● AC2 │
 *                         ╱   ╲              │
 *                       D4     D3            │
 *                         ↘   ↙              │
 *                           ●─────────────────●─────●
 *                          DC−
 *
 * Diamond vertices: DC+ (top), AC2 (right), DC− (bottom), AC1 (left).
 * Diodes sit on the four 45° edges, all cathodes pointing toward DC+
 * (D1 ↗, D2 ↖) at the top pair and all anodes at DC− (D3, D4) at the
 * bottom pair.
 *
 * Clockwise numbering (D1 → D2 → D3 → D4) makes diagonal-pair
 * conduction visible from the labels: D1+D3 on positive half-cycle,
 * D2+D4 on negative — the two diodes that conduct together are the
 * two opposite (diagonal) corners of the diamond.
 *
 * AC source vertical on the LEFT, well outside the bridge. Top pin
 * routes RIGHT and DOWN to AC1 (left vertex of diamond). Bottom pin
 * routes DOWN, RIGHT, and UP to AC2 (right vertex), wrapping around
 * the bottom of the schematic. The bottom-detour is the price of
 * keeping the source visually outside the bridge — every textbook
 * bridge schematic with «source on the left» pays this price.
 *
 * R_L vertical on the RIGHT, between DC+ and DC− output terminals.
 *
 * Uses the new diagonal Orientation values ('up-right', 'up-left')
 * added to `@/lib/circuit/types`. Labels are rendered manually via
 * SymbolText because CenteredLabel's vertical-fallback positioning
 * doesn't account for the 45° rotation of diagonal symbols.
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
import { SymbolText, LABEL_SIZE } from '@/lib/circuit/SymbolLabel'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 540
const SCHEMATIC_H = 290

// ── Diamond geometry ────────────────────────────────────────────
// Centre of the diamond, half-diagonal length, vertex coordinates.
const DCx = 270        // diamond centre x
const DCy = 140        // diamond centre y
const H = 80           // half-diagonal — distance from centre to each vertex

const TOP_X = DCx, TOP_Y = DCy - H              // (270, 60)  — DC+ vertex
const RIGHT_X = DCx + H, RIGHT_Y = DCy          // (350, 140) — AC2 vertex
const BOT_X = DCx, BOT_Y = DCy + H              // (270, 220) — DC− vertex
const LEFT_X = DCx - H, LEFT_Y = DCy            // (190, 140) — AC1 vertex

// ── Diode centres — at the midpoint of each diamond edge ─────────
// D1 (top-left edge):    AC1 → DC+, cathode points up-right ↗
// D2 (top-right edge):   AC2 → DC+, cathode points up-left  ↖
// D3 (bottom-right edge): DC− → AC2, cathode points up-right ↗
// D4 (bottom-left edge):  DC− → AC1, cathode points up-left  ↖
const D1_X = (LEFT_X + TOP_X) / 2,  D1_Y = (LEFT_Y + TOP_Y) / 2  // (230, 100)
const D2_X = (RIGHT_X + TOP_X) / 2, D2_Y = (RIGHT_Y + TOP_Y) / 2 // (310, 100)
const D3_X = (BOT_X + RIGHT_X) / 2, D3_Y = (BOT_Y + RIGHT_Y) / 2 // (310, 180)
const D4_X = (BOT_X + LEFT_X) / 2,  D4_Y = (BOT_Y + LEFT_Y) / 2  // (230, 180)

// ── Diode pin positions (computed via the diagonal-aware pins2) ──
const D1 = pins2(D1_X, D1_Y, 'up-right')
const D2 = pins2(D2_X, D2_Y, 'up-left')
const D3 = pins2(D3_X, D3_Y, 'up-right')
const D4 = pins2(D4_X, D4_Y, 'up-left')

// ── AC source: vertical, far left ───────────────────────────────
// orient='up' so that pins2 returns p2 = TOP pin (y - h), p1 = BOTTOM
// (y + h). The wires below assume p2 = top, p1 = bottom; using 'down'
// instead reverses the pin convention and the source-bottom wire
// would route from the top pin DOWNWARD, passing visibly THROUGH the
// source's circle body — bug shipped in v3 first cut, reader caught
// it on the close-up screenshot.
const SRC_X = 60
const SRC_Y = DCy
const SRC = pins2(SRC_X, SRC_Y, 'up')

// ── Load resistor: vertical, far right ──────────────────────────
const LOAD_X = 470
const LOAD_Y = DCy
const RL = pins2(LOAD_X, LOAD_Y, 'down')

// ── Routing waypoints ───────────────────────────────────────────
// Bottom-detour for source bottom-pin → AC2: down to y=DETOUR_Y, right
// across the schematic, up to AC2.
const DETOUR_Y = 260

// Terminal-label x position just past the load column.
const TERM_X = LOAD_X + 22

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
      {/* ════════ CURRENT-FLOW HIGHLIGHT (animated) ───────────────
          Two coloured overlay segments, one per half-cycle, alternating
          every 1 s (full period 2 s). Each segment traces only the
          DELIVERY half of the conduction path: from whichever AC source
          pin is currently positive, through the corresponding upper
          diode, along the DC+ rail to the top of R_L. The return path
          (lower diode + DC− rail + opposite AC return wire) is left
          un-highlighted so the reader's eye lands on «where the +
          terminal currently is» and «how it reaches the load» — the
          part of the diagram that actually changes between half-cycles.

          Phase A: positive half-cycle, source-top is the + pin, D1 conducts.
            Source-top → AC1 → D1 → DC+ → top of R_L.
          Phase B: negative half-cycle, source-bottom is the + pin, D2 conducts.
            Source-bottom → bottom-detour → AC2 → D2 → DC+ → top of R_L.

          Both phases share the DC+ rail → R_L top segment (current
          through the load is unidirectional — the whole point of a
          bridge rectifier). With phase A and phase B alternating, the
          shared segment effectively stays lit continuously while the
          AC-side path swings between the top route and the bottom-detour.

          Implementation notes:
            • Overlay paths are rendered FIRST so existing wires and
              symbols draw on top — the red shows as a halo.
            • Stroke width 5 (vs wire width 2) ⇒ ~1.5 px halo each side.
            • Animation uses two keyframes with a 1 % sharp transition
              (49 % → 50 %) so the cycle change reads as instantaneous,
              matching real diode switching at the AC zero-crossing.
            • prefers-reduced-motion: falls back to a dim static overlay
              (both phases visible together) — readers who disable
              animation still see WHICH paths conduct, just without
              the timing.
            • Pure CSS, no JS state — runs without re-renders. */}
      <style>{`
        .bridge-flow path {
          fill: none;
          stroke: #dc2626;
          stroke-width: 5;
          stroke-linecap: round;
          stroke-linejoin: round;
          pointer-events: none;
        }
        .bridge-flow {
          animation: bridge-flash 2s linear infinite;
        }
        .bridge-flow.bridge-phase-b {
          animation-delay: -1s;
        }
        @keyframes bridge-flash {
          0%, 49% { opacity: 0.6; }
          50%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bridge-flow,
          .bridge-flow.bridge-phase-b {
            animation: none;
            opacity: 0.35;
          }
        }
      `}</style>
      <g className="bridge-flow bridge-phase-a">
        {/* Source top (= + pin this half-cycle) → AC1 → D1 body → DC+ vertex */}
        <path d={`M${SRC.p2.x},${SRC.p2.y} L${LEFT_X},${SRC.p2.y} L${LEFT_X},${LEFT_Y} L${D1.p1.x},${D1.p1.y} L${D1.p2.x},${D1.p2.y} L${TOP_X},${TOP_Y}`} />
        {/* DC+ rail → top of R_L (delivery to load) */}
        <path d={`M${TOP_X},${TOP_Y} L${LOAD_X},${TOP_Y} L${LOAD_X},${RL.p1.y}`} />
      </g>
      <g className="bridge-flow bridge-phase-b">
        {/* Source bottom (= + pin this half-cycle) → bottom-detour → AC2 → D2 body → DC+ vertex */}
        <path d={`M${SRC.p1.x},${SRC.p1.y} L${SRC_X},${DETOUR_Y} L${RIGHT_X},${DETOUR_Y} L${RIGHT_X},${RIGHT_Y} L${D2.p1.x},${D2.p1.y} L${D2.p2.x},${D2.p2.y} L${TOP_X},${TOP_Y}`} />
        {/* DC+ rail → top of R_L (same shared segment as phase A) */}
        <path d={`M${TOP_X},${TOP_Y} L${LOAD_X},${TOP_Y} L${LOAD_X},${RL.p1.y}`} />
      </g>

      {/* ════════ DIODE STUBS ──────────────────────────────────────
          Each diode's pins land 26.6 px short of the diamond vertex
          they connect to (because the standard 60 px diode span is
          shorter than the 113 px diamond edge). Add a short wire stub
          from each pin to its vertex. */}
      <Wire points={[D1.p1, { x: LEFT_X, y: LEFT_Y }]} />
      <Wire points={[D1.p2, { x: TOP_X, y: TOP_Y }]} />
      <Wire points={[D2.p1, { x: RIGHT_X, y: RIGHT_Y }]} />
      <Wire points={[D2.p2, { x: TOP_X, y: TOP_Y }]} />
      <Wire points={[D3.p1, { x: BOT_X, y: BOT_Y }]} />
      <Wire points={[D3.p2, { x: RIGHT_X, y: RIGHT_Y }]} />
      <Wire points={[D4.p1, { x: BOT_X, y: BOT_Y }]} />
      <Wire points={[D4.p2, { x: LEFT_X, y: LEFT_Y }]} />

      {/* ════════ AC SOURCE → AC1 (top route) ───────────────────── */}
      {/* Source top pin (60, 110) → AC1 (190, 140) via (190, 110) */}
      <Wire points={[SRC.p2, { x: LEFT_X, y: SRC.p2.y }, { x: LEFT_X, y: LEFT_Y }]} />

      {/* ════════ AC SOURCE → AC2 (bottom-detour route) ──────────
          Source bottom pin → DOWN to y=DETOUR_Y → RIGHT across the
          schematic → UP to AC2 vertex. Long path is the cost of
          keeping the source visually outside the bridge. */}
      <Wire
        points={[
          SRC.p1,
          { x: SRC_X, y: DETOUR_Y },
          { x: RIGHT_X, y: DETOUR_Y },
          { x: RIGHT_X, y: RIGHT_Y },
        ]}
      />

      {/* ════════ DC+ rail → R_L top ─────────────────────────────
          For Resistor at (LOAD_X, LOAD_Y) orient='down', pins2 returns
          p1 = TOP pin (cy - h) and p2 = BOTTOM pin (cy + h). I swapped
          these on first cut — the DC+ wire ended at p2 (BOTTOM) and
          the DC− wire ended at p1 (TOP), so both wires ran THROUGH the
          resistor body diagonally. Reader caught it on the close-up.
          Same class of mistake as the AC source pin confusion. */}
      <Wire points={[{ x: TOP_X, y: TOP_Y }, { x: LOAD_X, y: TOP_Y }, RL.p1]} />

      {/* ════════ DC− rail → R_L bottom ────────────────────────── */}
      <Wire points={[{ x: BOT_X, y: BOT_Y }, { x: LOAD_X, y: BOT_Y }, RL.p2]} />

      {/* ════════ COMPONENTS ─────────────────────────────────────── */}
      <AcSource x={SRC_X} y={SRC_Y} orient="down" value="V_in" />

      {/* Diodes rendered without auto-labels — labels placed manually
          below so they sit on the OUTER side of each diode (away from
          the diamond centre), upright, perpendicular to the 45° body. */}
      <Diode x={D1_X} y={D1_Y} orient="up-right" />
      <Diode x={D2_X} y={D2_Y} orient="up-left" />
      <Diode x={D3_X} y={D3_Y} orient="up-right" />
      <Diode x={D4_X} y={D4_Y} orient="up-left" />

      <Resistor x={LOAD_X} y={LOAD_Y} orient="down" label="R_L" />

      {/* ════════ MANUAL DIODE LABELS (outer side, upright) ────── */}
      {/* D1 (top-left edge): label upper-left of body */}
      <SymbolText x={D1_X - 22} y={D1_Y - 18} size={LABEL_SIZE} anchor="end">
        D1
      </SymbolText>
      {/* D2 (top-right edge): label upper-right of body */}
      <SymbolText x={D2_X + 22} y={D2_Y - 18} size={LABEL_SIZE} anchor="start">
        D2
      </SymbolText>
      {/* D3 (bottom-right edge): label sits in the wedge BETWEEN the diode
          body and the bottom-detour wire (the latter runs vertically at
          x=RIGHT_X=350). With anchor='start' at x=D3_X+22=332 the label
          extended rightward to x≈349 — 1 px from the wire. Reader caught
          it on the close-up. anchor='end' at the same x flips the text
          INWARD so it occupies x≈[318, 332]: clear of both the diode body
          (≈ x=292 at this y) and the bottom-detour wire (x=350). D3 is
          the only label that has to flip — the others sit on outer corners
          with no nearby wire. */}
      <SymbolText x={D3_X + 22} y={D3_Y + 18} size={LABEL_SIZE} anchor="end">
        D3
      </SymbolText>
      {/* D4 (bottom-left edge): label lower-left of body */}
      <SymbolText x={D4_X - 22} y={D4_Y + 18} size={LABEL_SIZE} anchor="end">
        D4
      </SymbolText>

      {/* ════════ DC OUTPUT TERMINAL LABELS ───────────────────── */}
      <TerminalLabel x={TERM_X} y={TOP_Y} anchor="start">
        DC+
      </TerminalLabel>
      <TerminalLabel x={TERM_X} y={BOT_Y} anchor="start">
        DC−
      </TerminalLabel>

      {/* ════════ JUNCTIONS at the four diamond vertices ──────── */}
      {/* DC+: top vertex — D1, D2, R_L wire all meet here */}
      <Junction x={TOP_X} y={TOP_Y} />
      {/* AC2: right vertex — D2, D3, AC source bottom-detour wire meet */}
      <Junction x={RIGHT_X} y={RIGHT_Y} />
      {/* DC−: bottom vertex — D3, D4, R_L wire all meet here */}
      <Junction x={BOT_X} y={BOT_Y} />
      {/* AC1: left vertex — D1, D4, AC source top wire meet */}
      <Junction x={LEFT_X} y={LEFT_Y} />
    </Circuit>
  )
}
