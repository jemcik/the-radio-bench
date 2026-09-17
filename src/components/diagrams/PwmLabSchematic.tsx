/**
 * Chapter 1.3 lab — schematic for the Arduino PWM measurement (steps 3–6).
 *
 * Why it exists: `labStep3` says «connect pin 9 through the 10 kΩ resistor to
 * GND on the breadboard», and `labStep4` then says «probe pin 9 to GND». Those
 * two sentences are the whole circuit, and the chapter drew none of it.
 * CLAUDE.md: «Every circuit described in prose needs a schematic above the
 * first paragraph that names its components.»
 *
 * The picture also answers the question the steps leave open: what the resistor
 * is FOR. Nothing in the prose says, and a reader who has just met Ohm's law
 * reasonably assumes it limits a current that would otherwise be too large. It
 * does not — a voltmeter draws almost nothing. The resistor is there so the pin
 * drives a defined load instead of an open circuit, and the meter reads across
 * it. Drawn, that is obvious: the meter and the resistor are the same two
 * nodes.
 *
 * Steps 1 and 2 (probes across a cell, probes across a USB supply) are two
 * points and a meter, with no third component to place — they are not drawn.
 *
 * Composed from `@/lib/circuit` primitives only (zero hand-drawn SVG); ch1.1's
 * `LabCurrentSchematic` and ch1.2's `OhmLabSchematic` are the siblings.
 */
import { Trans, useTranslation } from 'react-i18next'
import { MathVar } from '@/components/ui/math'
import {
  Circuit, Wire, Junction,
  Resistor, Ground, Meter, meterPins, METER_ACCENT_V,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'

// ── Geometry ─────────────────────────────────────────────────────────
const SCHEMATIC_W = 350
const RAIL_SPAN = 150
// The resistor carries both a label and a value; `PassiveLabel` lifts the label
// clear of the symbol, which needs more headroom than the shared pad. See the
// note in `lib/circuit/layout.ts`.
const EXTRA_TOP = 12
const TOP_Y = SCHEMATIC_PAD_TOP + EXTRA_TOP
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + EXTRA_TOP + 12

const PIN_X = 110           // the board's PWM pin — the only source in the loop
const MET_X = 170           // multimeter, across the resistor
const RES_X = 270           // the 10 kΩ load
const GND_X = 220           // ground tap on the return rail
const MID_Y = (TOP_Y + BOT_Y) / 2

const res = pins2(RES_X, MID_Y, 'down')
const met = meterPins(MET_X, MID_Y, 'down')

export default function PwmLabSchematic() {
  const { t } = useTranslation('ui')
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={400}
      caption={
        <Trans
          i18nKey="ch1_3.labSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
    >
      {/* ── Pin 9 → top rail → resistor → ground ────────────────────── */}
      <Wire points={[{ x: PIN_X, y: TOP_Y }, { x: RES_X, y: TOP_Y }, res.p1]} />
      <Resistor
        x={RES_X}
        y={MID_Y}
        orient="down"
        label="R"
        value={t('ch1_3.labSchematicResistorValue')}
      />
      <Wire points={[res.p2, { x: RES_X, y: BOT_Y }, { x: MET_X, y: BOT_Y }]} />
      {/* `orient="right"` and a 10-unit drop below the rail — the house call
          for a ground hanging off a horizontal return (BleederSchematic,
          BalunSchematic, CrystalRadioSchematic all do this). The primitive's
          default `down` rotates the earth stripes 90°, which drew them
          in-line with the rail and read as a two-plate capacitor in series.
          No junction dot: `check:junction-placement` counts wire directions,
          and a ground tap is two conductors plus a symbol. */}
      <Ground x={GND_X} y={BOT_Y + 10} orient="right" />
      <TerminalLabel x={GND_X + 16} y={BOT_Y + 16} anchor="start" tone="mutedFg">
        {t('ch1_3.labSchematicGnd')}
      </TerminalLabel>

      {/* ── Meter across the same two nodes as the resistor. It does not
             sit in the loop: a voltmeter passes almost nothing, so the
             resistor is what the pin actually drives. ───────────────── */}
      <Wire color={METER_ACCENT_V} points={[{ x: MET_X, y: TOP_Y }, met.p1]} />
      <Meter x={MET_X} y={MID_Y} orient="down" letter="V" accent={METER_ACCENT_V} />
      <Wire color={METER_ACCENT_V} points={[met.p2, { x: MET_X, y: BOT_Y }]} />
      <Junction x={MET_X} y={TOP_Y} />

      {/* ── Labels ───────────────────────────────────────────────── */}
      {/* The pin is a port, not a node: the rail simply starts at it. A
          `NodePoint` here put its glyph on top of the wire that starts at the
          same coordinate (caught by the diagram-overlap tests); in
          `DividerSchematic` NodePoints sit BESIDE the rail, not on it.
          The name goes ABOVE rather than to the left — «Arduino pin 9 (PWM)»
          is 142 units wide and ran 35 units off the canvas when anchored to
          the left of x = 110. */}
      <TerminalLabel x={PIN_X} y={TOP_Y - 24} anchor="middle">
        {t('ch1_3.labSchematicPin')}
      </TerminalLabel>
      <TerminalLabel x={MET_X - 26} y={MID_Y} anchor="end" color={METER_ACCENT_V}>
        {t('ch1_3.labSchematicMeter')}
      </TerminalLabel>
    </Circuit>
  )
}
