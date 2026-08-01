/**
 * Chapter 0.4 lab — schematic for the divider the lab steps describe.
 *
 * Why it exists: the lab names the resistors by position — «swap the bottom
 * resistor for the 3 kΩ one, leaving 1 kΩ on top» — and asks for a reading
 * «between the junction of the two resistors and the battery's negative
 * terminal». Both instructions lean on a picture the reader did not have:
 * «top» and «bottom» mean nothing without one, and getting them the wrong way
 * round turns 0.75 into 0.25.
 *
 * Topology: AA cell on the left (+ up), top rail to the resistor column,
 * R_top from the top rail down to the junction, R_bottom from the junction
 * to the return rail. The multimeter sits in parallel with R_bottom, so its
 * reading IS V_out — the same probe-coloured pattern as ch1.4's
 * `DividerSchematic` and ch1.5's `RCChargingSchematic`.
 *
 * Composed from `@/lib/circuit` primitives only (CLAUDE.md: zero hand-drawn
 * SVG in schematics). The resistor labels are i18n keys rather than «R₁ /
 * R₂» because the prose names them by position, not by number.
 */
import { Trans, useTranslation } from 'react-i18next'
import { MathVar } from '@/components/ui/math'
import {
  Circuit, Wire, Junction,
  Resistor, Battery, Meter, meterPins, METER_ACCENT_V,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'

// ── Geometry ─────────────────────────────────────────────────────────
const SCHEMATIC_W = 440
const RAIL_SPAN = 190
const TOP_Y = SCHEMATIC_PAD_TOP
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)
const JUNCTION_Y = (TOP_Y + BOT_Y) / 2

const BAT_X = 70                            // battery column
const COL_X = 210                           // resistor column
const METER_X = 350                         // multimeter column
const RAIL_R = METER_X                      // rails stop under the meter
const METER_Y = (JUNCTION_Y + BOT_Y) / 2    // centred beside R_bottom

const R_TOP_CY = (TOP_Y + JUNCTION_Y) / 2
const R_BOT_CY = (JUNCTION_Y + BOT_Y) / 2

const bat = pins2(BAT_X, (TOP_Y + BOT_Y) / 2, 'down')
const rTop = pins2(COL_X, R_TOP_CY, 'down')
const rBot = pins2(COL_X, R_BOT_CY, 'down')
const meter = meterPins(METER_X, METER_Y, 'down')

export default function LabDividerSchematic() {
  const { t } = useTranslation('ui')
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={500}
      caption={
        <Trans
          i18nKey="ch0_4.labSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
    >
      {/* ── Battery: + to the top rail, − to the return rail ─────── */}
      <Wire points={[bat.p1, { x: BAT_X, y: TOP_Y }, { x: COL_X, y: TOP_Y }]} />
      <Battery x={BAT_X} y={(TOP_Y + BOT_Y) / 2} orient="down" />
      <Wire points={[bat.p2, { x: BAT_X, y: BOT_Y }, { x: COL_X, y: BOT_Y }]} />

      {/* ── Rails onward to the meter column ────────────────────── */}
      <Wire points={[{ x: COL_X, y: BOT_Y }, { x: RAIL_R, y: BOT_Y }]} />

      {/* ── Top resistor: top rail → junction ───────────────────── */}
      <Wire points={[{ x: COL_X, y: TOP_Y }, rTop.p1]} />
      <Resistor x={COL_X} y={R_TOP_CY} orient="down" label={t('ch0_4.labSchematicTop')} />
      <Wire points={[rTop.p2, { x: COL_X, y: JUNCTION_Y }]} />

      {/* ── Bottom resistor: junction → return rail ─────────────── */}
      <Wire points={[{ x: COL_X, y: JUNCTION_Y }, rBot.p1]} />
      <Resistor x={COL_X} y={R_BOT_CY} orient="down" label={t('ch0_4.labSchematicBottom')} />
      <Wire points={[rBot.p2, { x: COL_X, y: BOT_Y }]} />

      {/* ── Multimeter across the bottom resistor — reads V_out ─── */}
      <Wire
        color={METER_ACCENT_V}
        points={[
          { x: COL_X, y: JUNCTION_Y },
          { x: METER_X, y: JUNCTION_Y },
          meter.p1,
        ]}
      />
      <Meter x={METER_X} y={METER_Y} orient="down" letter="V" accent={METER_ACCENT_V} />
      <Wire color={METER_ACCENT_V} points={[meter.p2, { x: METER_X, y: BOT_Y }]} />

      {/* ── Junction dots — one per T-joint ─────────────────────── */}
      <Junction x={COL_X} y={JUNCTION_Y} />
      <Junction x={COL_X} y={BOT_Y} />

      {/* ── Terminal labels ─────────────────────────────────────── */}
      <TerminalLabel x={BAT_X - 12} y={TOP_Y}>
        {t('ch0_4.labSchematicVin')}
      </TerminalLabel>
      <TerminalLabel x={BAT_X - 12} y={BOT_Y} tone="mutedFg">
        {t('ch0_4.labSchematicGround')}
      </TerminalLabel>
      <TerminalLabel
        x={METER_X + 28} y={METER_Y}
        anchor="start"
        color={METER_ACCENT_V}
      >
        {t('ch0_4.labSchematicVout')}
      </TerminalLabel>
    </Circuit>
  )
}
