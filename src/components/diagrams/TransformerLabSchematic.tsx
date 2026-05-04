/**
 * Chapter 1.9 lab — bench wiring for the toroid winding lab activity.
 *
 *   Arduino PWM ───[primary 10t]──┤ ┤──[secondary 40t]── multimeter +
 *                                                              │
 *   Arduino GND ───[primary 10t]──┤ ┤──[secondary 40t]── multimeter −
 *
 * The Arduino sources a square wave on a PWM pin; its GND is the
 * common reference for the primary winding. The multimeter on AC
 * volts reads across the secondary leads. The transformer in the
 * middle is the same library primitive — windings are unchanged, only
 * the labels reflect the lab build (turn counts, instruments).
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  Transformer,
  Meter,
  TerminalLabel,
  meterPins,
  METER_ACCENT_V,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'

const SCHEMATIC_W = 660

const TOP_Y = SCHEMATIC_PAD_TOP + 22
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const MID_Y = (TOP_Y + BOT_Y) / 2
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 24

const LEFT_EDGE_X = 80
const X_TX = 330
const X_METER = 540

// orient='up' Transformer — primary on LEFT, secondary on RIGHT.
const TX_PRI_X = X_TX - 12
const TX_SEC_X = X_TX + 12
const TX_TOP_Y = MID_Y - 30
const TX_BOT_Y = MID_Y + 30

// Meter — vertical orientation so its two probes sit on the secondary
// rails; meterPins helper gives the absolute lead positions.
const meter = meterPins(X_METER, MID_Y, 'down')

export default function TransformerLabSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={700}
      caption={
        <Trans
          i18nKey="ch1_9.schematicLabCaption"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      }
    >
      <title>{t('ch1_9.schematicLabAria')}</title>

      {/* ── PRIMARY (Arduino → primary winding) ─────────────────────── */}
      {/* PWM pin → primary top */}
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: TX_PRI_X, y: TOP_Y }, { x: TX_PRI_X, y: TX_TOP_Y }]} />

      {/* Arduino GND → primary bottom */}
      <Wire points={[{ x: LEFT_EDGE_X, y: BOT_Y }, { x: TX_PRI_X, y: BOT_Y }, { x: TX_PRI_X, y: TX_BOT_Y }]} />

      {/* ── SECONDARY (winding → multimeter) ────────────────────────── */}
      {/* Secondary top → meter + lead */}
      <Wire points={[{ x: TX_SEC_X, y: TX_TOP_Y }, { x: TX_SEC_X, y: TOP_Y }, { x: meter.p1.x, y: TOP_Y }, meter.p1]} />

      {/* Secondary bottom → meter − lead */}
      <Wire points={[{ x: TX_SEC_X, y: TX_BOT_Y }, { x: TX_SEC_X, y: BOT_Y }, { x: meter.p2.x, y: BOT_Y }, meter.p2]} />

      {/* ── COMPONENTS ──────────────────────────────────────────────── */}
      <Transformer x={X_TX} y={MID_Y} orient="up" ratio="1 : 4" />
      <Meter
        x={X_METER}
        y={MID_Y}
        orient="down"
        accent={METER_ACCENT_V}
        letter="V"
        value="AC"
      />

      {/* T-joints where stubs meet rails */}
      <Junction x={TX_PRI_X} y={TOP_Y} />
      <Junction x={TX_PRI_X} y={BOT_Y} />
      <Junction x={TX_SEC_X} y={TOP_Y} />
      <Junction x={TX_SEC_X} y={BOT_Y} />

      {/* ── TERMINAL LABELS ─────────────────────────────────────────── */}
      <TerminalLabel x={LEFT_EDGE_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_9.schematicLabPwm')}
      </TerminalLabel>
      <TerminalLabel x={LEFT_EDGE_X - 6} y={BOT_Y} anchor="end" tone="mutedFg">
        {t('ch1_9.schematicLabGnd')}
      </TerminalLabel>

      {/* Winding-turn-count labels under the transformer */}
      <TerminalLabel x={TX_PRI_X - 6} y={BOT_Y + 22} anchor="middle" tone="mutedFg">
        {t('ch1_9.schematicLabPri')}
      </TerminalLabel>
      <TerminalLabel x={TX_SEC_X + 6} y={BOT_Y + 22} anchor="middle" tone="mutedFg">
        {t('ch1_9.schematicLabSec')}
      </TerminalLabel>
    </Circuit>
  )
}
