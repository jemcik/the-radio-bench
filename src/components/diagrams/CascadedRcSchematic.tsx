/**
 * Chapter 1.8 §6 — two cascaded RC low-pass stages with a unity-gain
 * op-amp buffer between them.
 *
 * Topology:
 *   V_in → R1 → node V_a → C1 → GND        (first RC LPF stage)
 *           V_a → +input of op-amp follower → output
 *   output → R2 → node V_out → C2 → GND   (second RC LPF stage)
 *
 * The op-amp is wired as a unity-gain follower (output tied to −input
 * via a feedback wire). Its job is to present a HIGH input impedance
 * to stage 1 (so C1 isn't loaded by R2) and a LOW output impedance to
 * stage 2 (so it can drive R2 without sag). Without the buffer, the
 * two stages would interact: stage 1's effective output impedance is
 * R1 ∥ X_C1, which loads stage 2's input — so the cascaded cutoff is
 * not simply the product of the two individual cutoffs. With the
 * buffer, the stages are independent and the overall response is
 * truly second-order.
 *
 * This schematic is the visual companion to the prose «cascading two
 * RC pairs (with a buffer between them so they don't load each other)
 * gives a second-order filter». Without it the reader has to
 * mentally synthesise the topology from the description.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Capacitor,
  OpAmp,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 600

// Need vertical room above the signal rail for the feedback wire that
// loops over the op-amp from output back to −input. Top padding is
// generous accordingly.
const TOP_Y = SCHEMATIC_PAD_TOP + 26
const RAIL_SPAN = 130
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 36

// Stage 1 columns
const IN_X = 50
const R1_X = 130
const NODE1_X = 200       // V_a node + C1 column
const C1_X = NODE1_X

// Buffer columns
const BUF_X = 290         // op-amp body centre
const BUF_OPAMP_Y = TOP_Y + 22   // op-amp centre — 22 below rail so + input lines up below the rail

// Stage 2 columns
const R2_X = 400
const NODE2_X = 470       // V_out node + C2 column
const C2_X = NODE2_X
const OUT_X = 550

const r1 = pins2(R1_X, TOP_Y)
const c1 = pins2(C1_X, (TOP_Y + BOT_Y) / 2, 'down')
const r2 = pins2(R2_X, TOP_Y)
const c2 = pins2(C2_X, (TOP_Y + BOT_Y) / 2, 'down')

// Op-amp pin positions matching the chris-pikul OpAmp primitive's
// actual rendered geometry: source `H0` at y=50 → local y = (50-75)*0.4
// = -10 for the «+» (top) input; bottom input at local y = +10.
//
// Two past bugs in this file (both reader-flagged):
//   1. +/- y-offsets SWAPPED (PLUS_IN_Y = +12, MINUS_IN_Y = -12), which
//      routed the signal into the inverting input and the feedback into
//      the non-inverting input — positive feedback, not a unity-gain
//      follower.
//   2. y-offsets magnitude was ±12 instead of ±10, leaving a 2-px gap
//      between the external wires and the actual pin tips. The op-amp's
//      tiny pin stubs read as disconnected from the wiring.
const OPAMP_PLUS_IN_X = BUF_X - 30
const OPAMP_PLUS_IN_Y = BUF_OPAMP_Y - 10
const OPAMP_MINUS_IN_X = BUF_X - 30
const OPAMP_MINUS_IN_Y = BUF_OPAMP_Y + 10
const OPAMP_OUT_X = BUF_X + 30
const OPAMP_OUT_Y = BUF_OPAMP_Y

// Feedback loop y — sits ABOVE the signal rail so it doesn't tangle
// with the rail itself.
const FEEDBACK_Y = TOP_Y - 16

export default function CascadedRcSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={640}
      caption={
        <Trans
          i18nKey="ch1_8.schematicCascadedRcCaption"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      }
    >
      <title>{t('ch1_8.schematicCascadedRcAria')}</title>

      {/* Signal rail — segments split where the op-amp inputs/output
          break the straight line. */}
      <Wire points={[{ x: IN_X, y: TOP_Y }, r1.p1]} />
      <Wire points={[r1.p2, { x: NODE1_X, y: TOP_Y }]} />

      {/* Stage-1 → buffer +input: node1 down + across to +input */}
      <Wire points={[
        { x: NODE1_X, y: TOP_Y },
        { x: NODE1_X, y: OPAMP_PLUS_IN_Y },
        { x: OPAMP_PLUS_IN_X, y: OPAMP_PLUS_IN_Y },
      ]} />

      {/* Buffer output → stage-2 R2: output up to rail, then across */}
      <Wire points={[
        { x: OPAMP_OUT_X, y: OPAMP_OUT_Y },
        { x: OPAMP_OUT_X, y: TOP_Y },
        r2.p1,
      ]} />

      {/* Feedback loop: from output node (OPAMP_OUT_X, TOP_Y) up to
          FEEDBACK_Y, across left, down to −input. Drawn as a SEPARATE
          wire so the +/− input distinction stays visible. */}
      <Wire points={[
        { x: OPAMP_OUT_X, y: TOP_Y },
        { x: OPAMP_OUT_X, y: FEEDBACK_Y },
        { x: OPAMP_MINUS_IN_X, y: FEEDBACK_Y },
        { x: OPAMP_MINUS_IN_X, y: OPAMP_MINUS_IN_Y },
      ]} />

      {/* Stage-2 signal rail continuation */}
      <Wire points={[r2.p2, { x: NODE2_X, y: TOP_Y }, { x: OUT_X, y: TOP_Y }]} />

      {/* Shunt caps from each node down to GND rail */}
      <Wire points={[{ x: NODE1_X, y: TOP_Y }, c1.p1]} />
      <Wire points={[c1.p2, { x: C1_X, y: BOT_Y }]} />
      <Wire points={[{ x: NODE2_X, y: TOP_Y }, c2.p1]} />
      <Wire points={[c2.p2, { x: C2_X, y: BOT_Y }]} />

      {/* GND rail spanning under both caps */}
      <Wire points={[{ x: C1_X, y: BOT_Y }, { x: C2_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Resistor x={R1_X} y={TOP_Y} label="R₁" />
      <Capacitor x={C1_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="C₁" />
      <OpAmp x={BUF_X} y={BUF_OPAMP_Y} />
      {/* Buffer-stage caption sits directly under the op-amp body so the
          reader doesn't need outside context to know what this triangle
          does. */}
      <TerminalLabel x={BUF_X} y={BUF_OPAMP_Y + 36} anchor="middle" tone="mutedFg">
        {t('ch1_8.schematicCascadedRcBufferLabel')}
      </TerminalLabel>
      <Resistor x={R2_X} y={TOP_Y} label="R₂" />
      <Capacitor x={C2_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="C₂" />

      {/* Junctions where caps tap off the signal rail and where the
          buffer-output wire meets the rail (also the take-off point
          for the feedback loop, hence a true T-junction). */}
      <Junction x={NODE1_X} y={TOP_Y} />
      <Junction x={NODE2_X} y={TOP_Y} />
      <Junction x={OPAMP_OUT_X} y={TOP_Y} />

      {/* Terminal labels — V_in / V_out / GND */}
      <TerminalLabel x={IN_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_8.schematicCascadedRcIn')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_8.schematicCascadedRcOut')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch1_8.schematicCascadedRcGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
