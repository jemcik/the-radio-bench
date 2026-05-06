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
  Junction,
  AcSource,
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

// Transformer used in orient='up' so primary appears on the LEFT
// (matching the schematic flow). After rotation:
//   primary.p2 (top-left)    = (X_TX-12, MID_Y-30)
//   primary.p1 (bottom-left) = (X_TX-12, MID_Y+30)
//   secondary.p2 (top-right) = (X_TX+12, MID_Y-30)
//   secondary.p1 (bot-right) = (X_TX+12, MID_Y+30)
const TX_PRI_X = X_TX - 12
const TX_SEC_X = X_TX + 12
const TX_TOP_Y = MID_Y - 30
const TX_BOT_Y = MID_Y + 30

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
        orient="up"
        ratio={t('ch1_9.schematicVoltageDemoRatio')}
      />
      <Resistor x={X_LOAD} y={TOP_Y} />

      {/* Junction dots where stubs meet rails (T-joints) */}
      <Junction x={TX_PRI_X} y={TOP_Y} />
      <Junction x={TX_PRI_X} y={BOT_Y} />
      <Junction x={TX_SEC_X} y={TOP_Y} />
      <Junction x={TX_SEC_X} y={BOT_Y} />

      {/* ── LABELS ───────────────────────────────────────────────────── */}
      {/* AC source label above the rail */}
      <TerminalLabel x={X_AC} y={TOP_Y - 22} anchor="middle">
        {t('ch1_9.schematicVoltageDemoVp')}
      </TerminalLabel>

      {/* Load label above the rail */}
      <TerminalLabel x={X_LOAD} y={TOP_Y - 22} anchor="middle">
        {t('ch1_9.schematicVoltageDemoLoad')}
      </TerminalLabel>

    </Circuit>
  )
}
