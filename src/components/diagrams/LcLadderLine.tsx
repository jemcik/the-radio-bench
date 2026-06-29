/**
 * Chapter 3.3 §5 — the "ladder" model of a transmission line.
 *
 * A feedline is, electrically, distributed series inductance (the wire) and
 * shunt capacitance (between the two conductors). This figure makes that
 * concrete: the top rail carries a chain of series inductors (L); short stubs
 * drop from each node to a shunt capacitor (C) bridging to the bottom return
 * rail; the pattern repeats and runs off to the right («…»), because the wave
 * always sees more identical line ahead. Their ratio is the characteristic
 * impedance Z₀ = √(L/C) — explained in the caption.
 *
 * Uses ONLY `@/lib/circuit` primitives (per CLAUDE.md "zero hand-drawn SVG").
 * Coordinates are spelled out as explicit named constants (no `.map()` / array
 * indexing in the JSX) so the static `check:junction-placement` analyser can
 * resolve each point: every cap node is a real 3-conductor T (rail-left +
 * rail-right + stub-to-cap) and earns its junction dot.
 *
 * The only reader-visible text inside the SVG is the locale-independent
 * designators «L» / «C» and the ellipsis «…»; all teaching prose lives in the
 * caption, so there are no per-locale label-width / edge-clip risks.
 */
import { Trans } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Inductor,
  Capacitor,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 520

const TOP_Y = SCHEMATIC_PAD_TOP // 35
const RAIL_SPAN = 96 // leaves an 18 px stub above & below each capacitor
const BOT_Y = TOP_Y + RAIL_SPAN // 131
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) // 151
const CAP_CY = (TOP_Y + BOT_Y) / 2 // 83 — cap pins (±30) land at 53 / 113

const LEFT_X = 50 // rails start here (toward the rig)
const RAIL_END = 452 // rails stop here; «…» continues the pattern

// Three identical L–C cells: inductor in series on the top rail, then a node
// where a shunt capacitor drops to the bottom rail.
const L1X = 110
const L2X = 230
const L3X = 350
const N1X = 170
const N2X = 290
const N3X = 410

const l1 = pins2(L1X, TOP_Y)
const l2 = pins2(L2X, TOP_Y)
const l3 = pins2(L3X, TOP_Y)
const c1 = pins2(N1X, CAP_CY, 'down') // p1 top (…,53) / p2 bottom (…,113)
const c2 = pins2(N2X, CAP_CY, 'down')
const c3 = pins2(N3X, CAP_CY, 'down')

export default function LcLadderLine() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={560}
      caption={
        <Trans
          i18nKey="ch3_3.lcLadder.caption"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      }
    >
      {/* ── Top rail: left lead → L1 → •node• → L2 → •node• → L3 → •node• → …
          Each node is an explicit polyline vertex, so the junction is a real
          3-conductor T (rail-left + rail-right + stub-down). */}
      <Wire points={[{ x: LEFT_X, y: TOP_Y }, l1.p1]} />
      <Wire points={[l1.p2, { x: N1X, y: TOP_Y }, l2.p1]} />
      <Wire points={[l2.p2, { x: N2X, y: TOP_Y }, l3.p1]} />
      <Wire points={[l3.p2, { x: N3X, y: TOP_Y }, { x: RAIL_END, y: TOP_Y }]} />

      {/* ── Bottom return rail: one polyline with a vertex at each node ──── */}
      <Wire
        points={[
          { x: LEFT_X, y: BOT_Y },
          { x: N1X, y: BOT_Y },
          { x: N2X, y: BOT_Y },
          { x: N3X, y: BOT_Y },
          { x: RAIL_END, y: BOT_Y },
        ]}
      />

      {/* ── Stubs: node → capacitor top, capacitor bottom → return rail ──── */}
      <Wire points={[{ x: N1X, y: TOP_Y }, c1.p1]} />
      <Wire points={[{ x: N2X, y: TOP_Y }, c2.p1]} />
      <Wire points={[{ x: N3X, y: TOP_Y }, c3.p1]} />
      <Wire points={[c1.p2, { x: N1X, y: BOT_Y }]} />
      <Wire points={[c2.p2, { x: N2X, y: BOT_Y }]} />
      <Wire points={[c3.p2, { x: N3X, y: BOT_Y }]} />

      {/* ── Components ─────────────────────────────────────────────────── */}
      <Inductor x={L1X} y={TOP_Y} label="L" />
      <Inductor x={L2X} y={TOP_Y} label="L" />
      <Inductor x={L3X} y={TOP_Y} label="L" />
      <Capacitor x={N1X} y={CAP_CY} orient="down" label="C" />
      <Capacitor x={N2X} y={CAP_CY} orient="down" label="C" />
      <Capacitor x={N3X} y={CAP_CY} orient="down" label="C" />

      {/* ── Junction dots — real T-joints (rail through + stub to cap) ──── */}
      <Junction x={N1X} y={TOP_Y} />
      <Junction x={N2X} y={TOP_Y} />
      <Junction x={N3X} y={TOP_Y} />
      <Junction x={N1X} y={BOT_Y} />
      <Junction x={N2X} y={BOT_Y} />
      <Junction x={N3X} y={BOT_Y} />

      {/* ── «…» — the chain repeats endlessly toward the antenna ───────── */}
      <TerminalLabel x={486} y={CAP_CY + 5} anchor="middle">
        …
      </TerminalLabel>
    </Circuit>
  )
}
