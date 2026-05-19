/**
 * Chapter 1.9 §4 — 1:2 turns-ratio transformer used as a 4:1 impedance
 * match between a 50 Ω rig (primary side) and a 200 Ω antenna load
 * (secondary side).
 *
 * Visually identical to TransformerVoltageSchematic except the AC
 * source is labelled with the rig's source impedance and the load is
 * labelled with the antenna's impedance. The point of the diagram is
 * the SQUARE relation: turns ratio 1:2 → impedance ratio 1:4.
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

const TOP_Y = SCHEMATIC_PAD_TOP + 15
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const MID_Y = (TOP_Y + BOT_Y) / 2
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 12

const LEFT_EDGE_X = 60
const X_SRC = 145
const X_TX = 290
const X_LOAD = 440
const RIGHT_EDGE_X = 525

// Transformer in native orient='right' — primary winding vertical on
// the LEFT, secondary vertical on the RIGHT. Pin positions after the
// chris-pikul wrapper's 0.4 down-scale:
//   primary p1 (top-left)     = (X_TX-30, MID_Y-25)
//   primary p2 (bottom-left)  = (X_TX-30, MID_Y+25)
//   secondary p1 (top-right)  = (X_TX+30, MID_Y-25)
//   secondary p2 (bot-right)  = (X_TX+30, MID_Y+25)
const TX_PRI_X = X_TX - 30
const TX_SEC_X = X_TX + 30
const TX_TOP_Y = MID_Y - 25
const TX_BOT_Y = MID_Y + 25

export default function TransformerImpedanceSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={620}
      caption={
        <Trans
          i18nKey="ch1_9.schematicImpedanceMatchCaption"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      }
    >
      <title>{t('ch1_9.schematicImpedanceMatchAria')}</title>

      {/* Primary loop */}
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: X_SRC - 30, y: TOP_Y }]} />
      <Wire points={[{ x: X_SRC + 30, y: TOP_Y }, { x: TX_PRI_X, y: TOP_Y }, { x: TX_PRI_X, y: TX_TOP_Y }]} />
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: LEFT_EDGE_X, y: BOT_Y }]} />
      <Wire points={[{ x: LEFT_EDGE_X, y: BOT_Y }, { x: TX_PRI_X, y: BOT_Y }, { x: TX_PRI_X, y: TX_BOT_Y }]} />

      {/* Secondary loop */}
      <Wire points={[{ x: TX_SEC_X, y: TX_TOP_Y }, { x: TX_SEC_X, y: TOP_Y }, { x: X_LOAD - 30, y: TOP_Y }]} />
      <Wire points={[{ x: X_LOAD + 30, y: TOP_Y }, { x: RIGHT_EDGE_X, y: TOP_Y }]} />
      <Wire points={[{ x: RIGHT_EDGE_X, y: TOP_Y }, { x: RIGHT_EDGE_X, y: BOT_Y }]} />
      <Wire points={[{ x: RIGHT_EDGE_X, y: BOT_Y }, { x: TX_SEC_X, y: BOT_Y }, { x: TX_SEC_X, y: TX_BOT_Y }]} />

      {/* Components */}
      <AcSource x={X_SRC} y={TOP_Y} />
      <Transformer
        x={X_TX}
        y={MID_Y}
        ratio={t('ch1_9.schematicImpedanceMatchRatio')}
      />
      <Resistor x={X_LOAD} y={TOP_Y} />

      {/* No junction dots — each rail-to-stub turn is an L-bend inside
          one polyline <Wire>, not a T-joint of three conductors. */}

      {/* Labels — clear the AC source body by AC_SOURCE_RADIUS + 10. */}
      <TerminalLabel x={X_SRC} y={TOP_Y - (AC_SOURCE_RADIUS + 10)} anchor="middle">
        {t('ch1_9.schematicImpedanceMatchSrc')}
      </TerminalLabel>
      <TerminalLabel x={X_LOAD} y={TOP_Y - (AC_SOURCE_RADIUS + 10)} anchor="middle">
        {t('ch1_9.schematicImpedanceMatchLoad')}
      </TerminalLabel>
    </Circuit>
  )
}
