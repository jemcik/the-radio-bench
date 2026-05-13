/**
 * Chapter 1.10 §6 — Flyback diode protecting a transistor switch.
 *
 * Topology:
 *   V_in supply at the top rail. A relay coil (drawn as an inductor
 *   with a label «coil») hangs vertically between V_in and a
 *   switching node. The switching node connects to the collector of
 *   an NPN transistor; the emitter goes back to V_in's negative
 *   terminal via the bottom rail. The base is driven by an «in»
 *   terminal through a base resistor (R_b limits base current).
 *
 *   No separate Ground symbol — V_in's «−» pin IS the reference.
 *   Earlier revisions drew an explicit GND on the bottom rail; user
 *   review flagged it as the same illusion-of-two-references bug
 *   that ZenerRegulatorSchematic had.
 *
 *   Across the relay coil sits the flyback diode, with cathode UP toward
 *   +V and anode DOWN toward the switching node. In normal conduction
 *   the diode is reverse-biased (it sits there idly). When the
 *   transistor turns OFF, the coil's collapsing magnetic field tries
 *   to keep current flowing the same way; the switching node spikes
 *   above +V and the diode forward-conducts, RECIRCULATING the coil's
 *   current through the diode-coil loop until the energy dissipates.
 *
 * Pure `@/lib/circuit` primitives.
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
  pinsBJT,
} from '@/lib/circuit'
import { Diode, TransistorNPN } from '@/lib/circuit/symbols/semiconductors'
import { MathVar } from '@/components/ui/math'

// Content extends from the «in» terminal label (left, ≈x=40 after
// italic glyph extent) to the «D» diode label (right, ≈x=380 with
// CenteredLabel's gap=20 placement). 420 viewBox width gives ~20 px
// margins on each side. Was 540 — leaving ~170 px of empty space on
// the right of the diode that the reader flagged as wasted area.
const SCHEMATIC_W = 420
const SCHEMATIC_H = 280

const TOP_Y = 35
const COIL_TOP_Y = 70
const SW_Y = 150        // switching node height (collector level)
const TR_Y = 200        // transistor centre
const GND_Y = 250

const SUPPLY_X = 80
const COIL_X = 240
const DIODE_X = 340
// Transistor centred 10 px LEFT of COIL_X so its collector / emitter
// pins (which both sit at cx + 10 in pinsBJT for orient='right',
// matching chris-pikul TransistorNPN's actual pin geometry) land at
// x = COIL_X. That puts the collector directly under the switching
// node and the emitter directly above the bottom-rail-meets-ground
// point — both wires become straight verticals with NO right-angle
// stubs.
//
// Used to be COIL_X - 12 (matching the pre-chris-pikul ARRL hand-drawn
// transistor's +12 offset); pinsBJT-offsets were corrected May 2026
// to +10 chris-pikul, and this anchor moved with them.
const TR_X = COIL_X - 10   // 230

const supply = pins2(SUPPLY_X, (TOP_Y + GND_Y) / 2, 'down')
const coil = pins2(COIL_X, (COIL_TOP_Y + SW_Y) / 2, 'down')
const flyback = pins2(DIODE_X, (COIL_TOP_Y + SW_Y) / 2, 'up') // cathode UP
const tr = pinsBJT(TR_X, TR_Y, 'right')
const baseR = pins2(150, TR_Y)

export default function FlybackDiodeSchematic() {
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      caption={
        <Trans
          i18nKey="ch1_10.flybackSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
      maxWidth={460}
    >
      {/* +V rail */}
      <Wire points={[supply.p1, { x: SUPPLY_X, y: TOP_Y }, { x: DIODE_X, y: TOP_Y }, flyback.p2]} />
      {/* +V branch into coil top */}
      <Wire points={[{ x: COIL_X, y: TOP_Y }, coil.p1]} />
      {/* Switching node: coil bottom — diode anode — collector.
          With TR_X = COIL_X − 12, the collector pin sits at exactly
          (COIL_X, tr.collector.y), so the wire from the switching
          node down to the collector is a single straight vertical
          line — no corner, no diagonal, no horizontal stub. Same
          for the emitter wire below. */}
      <Wire points={[coil.p2, { x: COIL_X, y: SW_Y }, { x: DIODE_X, y: SW_Y }, flyback.p1]} />
      <Wire points={[{ x: COIL_X, y: SW_Y }, tr.collector]} />
      {/* Emitter straight down to the bottom rail (emitter.x ==
          COIL_X by construction). */}
      <Wire points={[tr.emitter, { x: tr.emitter.x, y: GND_Y }]} />
      {/* Base via resistor to «in» terminal. The «in» TerminalLabel
          renders at x=70 anchor='end' in italic; the italic «n»
          glyph extends ~2 px past x=70 due to slant. Wire endpoint
          at x=76 leaves a clean ~4 px gap between wire end and the
          label's visible right edge — close enough to read as «label
          names this wire end», not so close that the wire enters
          the letterforms. Earlier «wire ends exactly at label
          anchor x=70» put the wire INSIDE the «n» visually. */}
      <Wire points={[tr.base, baseR.p2]} />
      <Wire points={[baseR.p1, { x: 76, y: TR_Y }]} />
      {/* Battery negative side back to ground rail. Rail extends to
          x=COIL_X so it meets the emitter wire and the Ground stem
          at the same point (the bottom-rail T-junction). */}
      <Wire points={[supply.p2, { x: SUPPLY_X, y: GND_Y }, { x: COIL_X, y: GND_Y }]} />

      {/* ── Components ────────────────────────────────────────── */}
      {/* V_CC for the relay coil supply — distinct from the V_in logic
          terminal that drives the base. Same node would render with the
          same label, but topologically these are two unrelated voltages:
          V_CC is typically 12 V (relay coil rail), V_in is logic level
          (3.3 V or 5 V from a microcontroller). */}
      <Battery x={SUPPLY_X} y={(TOP_Y + GND_Y) / 2} orient="down" value="V_CC" />
      <Inductor x={COIL_X} y={(COIL_TOP_Y + SW_Y) / 2} orient="down" label="coil" />
      <Diode x={DIODE_X} y={(COIL_TOP_Y + SW_Y) / 2} orient="up" label="D" />
      <Resistor x={150} y={TR_Y} label="R_b" />
      <TransistorNPN x={TR_X} y={TR_Y} orient="right" label="Q1" />

      {/* «V_in» terminal label on the left of the base resistor.
          Uppercase V_X for DC logic-level switching input — matches the
          flyback caption prose which names V_in. AoE/Sedra-Smith
          convention: V_X = DC bias, v_x = AC small signal. */}
      <TerminalLabel x={70} y={TR_Y} anchor="end">V_in</TerminalLabel>

      {/* Junctions
          ─────────
          Two real T-joints. (1) top-rail tap into the coil; (2) the
          switching node where coil-bottom + diode-anode wire +
          collector-stub all meet. The bottom rail at (COIL_X, GND_Y)
          is just an L-bend: the rail comes in from the left, the
          emitter wire comes down from above, they share an endpoint —
          one corner with two wire ends, NOT a 3-way junction.

          Earlier revisions of this diagram drew an explicit Ground
          symbol on the bottom rail at this point. That was a
          convention violation flagged by user review: when the
          schematic already shows a two-terminal Battery, the
          battery's «−» pin IS the 0 V reference; adding a separate
          Ground symbol creates the illusion of two distinct
          references where there is one. Removed; bottom rail returns
          directly to V_in's «−» terminal. */}
      <Junction x={COIL_X} y={TOP_Y} />
      <Junction x={COIL_X} y={SW_Y} />
    </Circuit>
  )
}
