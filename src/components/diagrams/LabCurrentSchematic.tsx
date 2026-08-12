/**
 * Chapter 1.1 lab — schematic for the current measurement in step 4.
 *
 * Why it exists: the step described the loop as a chain of arrows —
 * «battery + → one lead of the resistor → other lead → multimeter red probe →
 * multimeter black probe → battery −». Read literally that says to connect the
 * red probe to the black probe, which is a short across the meter; read
 * charitably it still never says the thing that matters, which is that the
 * meter is IN the break of the loop rather than across anything. A reader who
 * has just been taught (labStep1) to touch both probes to a battery has every
 * reason to do the same here and short the cell.
 *
 * CLAUDE.md: «Every circuit described in prose needs a schematic above the
 * first paragraph that names its components.» This lab had none — reader-flagged.
 *
 * Topology: AA cell on the left (+ up), top rail to the resistor, resistor
 * down the right-hand column into the ammeter, ammeter back to the return
 * rail. One loop, no branches, so no junction dots — the meter's own two pins
 * ARE the break. The ammeter is drawn in the current accent so it reads
 * differently from the voltmeter-across-a-part pattern used by ch0.4's
 * `LabDividerSchematic` and ch1.4's `DividerSchematic`.
 *
 * Composed from `@/lib/circuit` primitives only (zero hand-drawn SVG).
 */
import { Trans, useTranslation } from 'react-i18next'
import { MathVar } from '@/components/ui/math'
import {
  Circuit, Wire,
  Resistor, Battery, Meter, meterPins, METER_ACCENT_A,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'

// ── Geometry ─────────────────────────────────────────────────────────
const SCHEMATIC_W = 400
const RAIL_SPAN = 170
const TOP_Y = SCHEMATIC_PAD_TOP
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)

const BAT_X = 70            // battery column, left
const COL_X = 300           // resistor + meter column, right
const MID_Y = (TOP_Y + BOT_Y) / 2

const R_CY = TOP_Y + RAIL_SPAN * 0.28   // resistor high in the right column
const M_CY = TOP_Y + RAIL_SPAN * 0.74   // ammeter below it, same column

const bat = pins2(BAT_X, MID_Y, 'down')
const res = pins2(COL_X, R_CY, 'down')
const meter = meterPins(COL_X, M_CY, 'down')

export default function LabCurrentSchematic() {
  const { t } = useTranslation('ui')
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={440}
      caption={
        <Trans
          i18nKey="ch1_1.labSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
    >
      {/* ── Battery + → top rail → resistor ─────────────────────── */}
      <Wire points={[bat.p1, { x: BAT_X, y: TOP_Y }, { x: COL_X, y: TOP_Y }, res.p1]} />
      <Battery x={BAT_X} y={MID_Y} orient="down" />
      <Resistor x={COL_X} y={R_CY} orient="down" label="R" />

      {/* ── Resistor → ammeter: the meter sits IN the loop ───────── */}
      <Wire color={METER_ACCENT_A} points={[res.p2, meter.p1]} />
      <Meter x={COL_X} y={M_CY} orient="down" letter="A" accent={METER_ACCENT_A} />

      {/* ── Ammeter → return rail → battery − ────────────────────── */}
      <Wire color={METER_ACCENT_A} points={[meter.p2, { x: COL_X, y: BOT_Y }]} />
      <Wire points={[{ x: COL_X, y: BOT_Y }, { x: BAT_X, y: BOT_Y }, bat.p2]} />

      {/* ── Terminal labels ─────────────────────────────────────── */}
      <TerminalLabel x={BAT_X - 12} y={TOP_Y}>
        {t('ch1_1.labSchematicPlus')}
      </TerminalLabel>
      <TerminalLabel x={BAT_X - 12} y={BOT_Y} tone="mutedFg">
        {t('ch1_1.labSchematicMinus')}
      </TerminalLabel>
      <TerminalLabel
        x={COL_X - 30} y={M_CY}
        anchor="end"
        color={METER_ACCENT_A}
      >
        {t('ch1_1.labSchematicMeter')}
      </TerminalLabel>
    </Circuit>
  )
}
