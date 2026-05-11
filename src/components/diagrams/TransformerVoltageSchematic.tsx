/**
 * Chapter 1.9 §2 — basic two-winding transformer with AC source and load.
 *
 * Topology — two rectangular loops sharing the transformer in the middle:
 *
 *   ┌───[AcSource]───┐                   ┌───[R_load]───┐
 *   │                │                   │              │
 *   │     primary ●─┤  Transformer  ├─● secondary       │
 *   │                │  [1:N ratio]  │                  │
 *   │     primary ●─┤               ├─● secondary       │
 *   │                │                   │              │
 *   └────────────────┘                   └──────────────┘
 *
 * The left loop carries primary current driven by V_p; the right loop
 * carries secondary current through R_load. The transformer primitive's
 * iron-core bars between the windings imply magnetic coupling — the
 * only path by which power crosses from left loop to right.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  AcSource,
  AC_SOURCE_RADIUS,
  Resistor,
  Transformer,
  TerminalLabel,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 580

// Two horizontal rails — primary loop and secondary loop share the
// same Y-pair so the transformer pins fall between them.
const TOP_Y = SCHEMATIC_PAD_TOP + 15
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const MID_Y = (TOP_Y + BOT_Y) / 2
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 12

// Layout columns
const LEFT_EDGE_X = 60
const X_AC = 145
const X_TX = 290
const X_LOAD = 440
const RIGHT_EDGE_X = 525

// Transformer in native orient='right' — primary winding vertical on the
// LEFT, secondary vertical on the RIGHT (matches the schematic flow:
// V_p loop on left → primary; R_load loop on right → secondary). Pin
// positions after the chris-pikul wrapper's 0.4 down-scale:
//   primary p1 (top-left)     = (X_TX-30, MID_Y-25)
//   primary p2 (bottom-left)  = (X_TX-30, MID_Y+25)
//   secondary p1 (top-right)  = (X_TX+30, MID_Y-25)
//   secondary p2 (bot-right)  = (X_TX+30, MID_Y+25)
const TX_PRI_X = X_TX - 30
const TX_SEC_X = X_TX + 30
const TX_TOP_Y = MID_Y - 25
const TX_BOT_Y = MID_Y + 25

export default function TransformerVoltageSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={620}
      caption={
        <Trans
          i18nKey="ch1_9.schematicVoltageDemoCaption"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      }
    >
      <title>{t('ch1_9.schematicVoltageDemoAria')}</title>

      {/* ── PRIMARY LOOP (left side) ─────────────────────────────────── */}
      {/* Top rail: left edge → AcSource → primary top stub */}
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: X_AC - 30, y: TOP_Y }]} />
      <Wire points={[{ x: X_AC + 30, y: TOP_Y }, { x: TX_PRI_X, y: TOP_Y }, { x: TX_PRI_X, y: TX_TOP_Y }]} />

      {/* Left edge wire down to bottom rail */}
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: LEFT_EDGE_X, y: BOT_Y }]} />

      {/* Bottom rail: left edge → primary bottom stub */}
      <Wire points={[{ x: LEFT_EDGE_X, y: BOT_Y }, { x: TX_PRI_X, y: BOT_Y }, { x: TX_PRI_X, y: TX_BOT_Y }]} />

      {/* ── SECONDARY LOOP (right side) ──────────────────────────────── */}
      {/* Top rail: secondary top stub → R_load → right edge */}
      <Wire points={[{ x: TX_SEC_X, y: TX_TOP_Y }, { x: TX_SEC_X, y: TOP_Y }, { x: X_LOAD - 30, y: TOP_Y }]} />
      <Wire points={[{ x: X_LOAD + 30, y: TOP_Y }, { x: RIGHT_EDGE_X, y: TOP_Y }]} />

      {/* Right edge wire down to bottom rail */}
      <Wire points={[{ x: RIGHT_EDGE_X, y: TOP_Y }, { x: RIGHT_EDGE_X, y: BOT_Y }]} />

      {/* Bottom rail: right edge → secondary bottom stub */}
      <Wire points={[{ x: RIGHT_EDGE_X, y: BOT_Y }, { x: TX_SEC_X, y: BOT_Y }, { x: TX_SEC_X, y: TX_BOT_Y }]} />

      {/* ── COMPONENTS ───────────────────────────────────────────────── */}
      <AcSource x={X_AC} y={TOP_Y} />
      <Transformer
        x={X_TX}
        y={MID_Y}
        ratio={t('ch1_9.schematicVoltageDemoRatio')}
      />
      <Resistor x={X_LOAD} y={TOP_Y} />

      {/* No junction dots here — each rail-to-stub turn is an L-bend
          inside ONE polyline <Wire>, not a T-joint of three wires.
          Junction dots are reserved for 3-wire intersections. */}

      {/* ── LABELS ───────────────────────────────────────────────────── */}
      {/* AC source label — clears the chris-pikul circle (radius 20)
          by a 10-px gap. Hardcoded `TOP_Y - 22` baked the previous
          ARRL-style r=12 body and ended up overlapping after migration. */}
      <TerminalLabel x={X_AC} y={TOP_Y - (AC_SOURCE_RADIUS + 10)} anchor="middle">
        {t('ch1_9.schematicVoltageDemoVp')}
      </TerminalLabel>

      {/* Load label — same 30-px clearance as the AC label for symmetry */}
      <TerminalLabel x={X_LOAD} y={TOP_Y - (AC_SOURCE_RADIUS + 10)} anchor="middle">
        {t('ch1_9.schematicVoltageDemoLoad')}
      </TerminalLabel>

    </Circuit>
  )
}
