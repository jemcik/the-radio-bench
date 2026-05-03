/**
 * Chapter 1.9 §7 — 4:1 voltage balun. A 1:2 turns-ratio transformer
 * connected so the unbalanced (coax) side has its bottom terminal
 * grounded, while the balanced (dipole) side has neither terminal
 * grounded — the two leads carry equal-and-opposite voltages relative
 * to the centre.
 *
 * Topology:
 *
 *   coax inner ──[primary ●●]──┤ ┤──[secondary ●●●●]── + dipole leg 1
 *
 *   coax shield ─[primary ●●]──┤ ┤──[secondary ●●●●]── − dipole leg 2
 *           │
 *          GND
 *
 * The transformer drawing is the standard library primitive; the
 * unbalanced/balanced distinction is shown by adding a ground symbol
 * on one of the primary leads only.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Transformer,
  Ground,
  TerminalLabel,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'

const SCHEMATIC_W = 580

const TOP_Y = SCHEMATIC_PAD_TOP + 25
const RAIL_SPAN = 100
const BOT_Y = TOP_Y + RAIL_SPAN
const MID_Y = (TOP_Y + BOT_Y) / 2
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 24

const LEFT_EDGE_X = 60
const X_TX = 290
const RIGHT_EDGE_X = 525

const TX_PRI_X = X_TX - 30
const TX_SEC_X = X_TX + 30
const TX_TOP_Y = MID_Y - 12
const TX_BOT_Y = MID_Y + 12

// Ground symbol on the primary's bottom terminal — sits between the
// transformer and the left edge.
const X_GND = 170

export default function BalunSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={620}
      caption={
        <Trans
          i18nKey="ch1_9.schematicBalunCaption"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      }
    >
      <title>{t('ch1_9.schematicBalunAria')}</title>

      {/* ── UNBALANCED (coax) SIDE ──────────────────────────────────── */}
      {/* Inner conductor: left edge → primary top */}
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: TX_PRI_X, y: TOP_Y }, { x: TX_PRI_X, y: TX_TOP_Y }]} />

      {/* Shield: left edge → ground tap → primary bottom */}
      <Wire points={[{ x: LEFT_EDGE_X, y: BOT_Y }, { x: X_GND, y: BOT_Y }]} />
      <Wire points={[{ x: X_GND, y: BOT_Y }, { x: TX_PRI_X, y: BOT_Y }, { x: TX_PRI_X, y: TX_BOT_Y }]} />

      {/* ── BALANCED (dipole) SIDE ──────────────────────────────────── */}
      {/* Top dipole leg: secondary top → right edge */}
      <Wire points={[{ x: TX_SEC_X, y: TX_TOP_Y }, { x: TX_SEC_X, y: TOP_Y }, { x: RIGHT_EDGE_X, y: TOP_Y }]} />

      {/* Bottom dipole leg: secondary bottom → right edge (NO ground) */}
      <Wire points={[{ x: TX_SEC_X, y: TX_BOT_Y }, { x: TX_SEC_X, y: BOT_Y }, { x: RIGHT_EDGE_X, y: BOT_Y }]} />

      {/* ── COMPONENTS ──────────────────────────────────────────────── */}
      <Transformer x={X_TX} y={MID_Y} ratio="1 : 2" />
      <Ground x={X_GND} y={BOT_Y + 7} orient="down" />

      {/* ── LABELS ──────────────────────────────────────────────────── */}
      <TerminalLabel x={LEFT_EDGE_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_9.schematicBalunCoax')}
      </TerminalLabel>
      <TerminalLabel x={LEFT_EDGE_X - 6} y={BOT_Y} anchor="end" tone="mutedFg">
        {t('ch1_9.schematicBalunGnd')}
      </TerminalLabel>
      <TerminalLabel x={RIGHT_EDGE_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_9.schematicBalunDipole')}
      </TerminalLabel>
    </Circuit>
  )
}
