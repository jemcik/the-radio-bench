/**
 * Chapter 1.2 lab — schematic for the two measurements the steps describe.
 *
 * Why it exists: the lab asks the reader to measure V across the resistor
 * (step 2) and then I through it (step 3) — «break the loop between the cell
 * and the resistor, then reconnect it with the multimeter in series». Both
 * are circuit descriptions, and neither had a picture. CLAUDE.md: «Every
 * circuit described in prose needs a schematic above the first paragraph that
 * names its components.»
 *
 * The two hookups are also the pair that is easiest to swap by accident, and
 * swapping them is the one mistake in this lab that damages something: a
 * meter left in amps mode and then touched across the cell is a short. So
 * both positions are drawn in ONE picture, because the contrast is the
 * lesson — the voltmeter bridges the resistor's two ends and leaves the loop
 * intact; the ammeter sits IN the loop, so everything going round passes
 * through it. The caption says explicitly that this is one meter shown in two
 * positions, not two instruments the reader is expected to own.
 *
 * Layout: source left, then the ammeter and R in series along the top rail,
 * return along the bottom. Spreading the series elements horizontally (rather
 * than dropping the ammeter into a right-hand column) is what lets the drawing
 * fill its canvas — `check:diagram-viewbox-fit` flagged an earlier
 * right-column version, which left ~110 px of dead space.
 *
 * The ammeter sits BETWEEN the cell and the resistor because that is where
 * labStep3 tells the reader to break the loop («break the loop between the
 * cell and the resistor»). An earlier version put it past the resistor, so a
 * reader following the step looked for the break on the left-hand segment and
 * found an unbroken wire.
 *
 * Composed from `@/lib/circuit` primitives only (zero hand-drawn SVG); ch1.1's
 * `LabCurrentSchematic` is the sibling this follows.
 */
import { Trans, useTranslation } from 'react-i18next'
import { MathVar } from '@/components/ui/math'
import {
  Circuit, Wire, Junction,
  Resistor, Battery, Meter, meterPins, METER_ACCENT_V, METER_ACCENT_A,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'

// ── Geometry ─────────────────────────────────────────────────────────
const SCHEMATIC_W = 440
const RAIL_SPAN = 150
// EXTRA_TOP: the resistor carries BOTH a label and a value, and `PassiveLabel`
// then lifts the label to y−32 — which lands above the canvas at the shared
// SCHEMATIC_PAD_TOP. See the note in `lib/circuit/layout.ts`.
const EXTRA_TOP = 12
const TOP_Y = SCHEMATIC_PAD_TOP + EXTRA_TOP
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + EXTRA_TOP

const BAT_X = 55            // cell, left column
const AMM_X = 160           // ammeter — in the break labStep3 asks for
const RES_X = 280           // resistor, further along the same rail
const CORNER_X = 400        // top rail turns down here for the return path
const MID_Y = (TOP_Y + BOT_Y) / 2

// Voltmeter hangs below the resistor, bridging its two ends.
const VOLT_Y = TOP_Y + 75

// Meter captions. The ammeter's goes ABOVE its circle, next to the resistor's
// own label on the same rail: below it the corner wire from the cell fills the
// band down to bat.p1, and a caption there collides with it (caught by
// `npm run test:visual`). The voltmeter hangs down, so its caption goes below.
const AMM_LABEL_Y = TOP_Y - 32
const VOLT_LABEL_Y = VOLT_Y + 34

const bat = pins2(BAT_X, MID_Y, 'down')
const res = pins2(RES_X, TOP_Y)              // p1 = RES_X−30, p2 = RES_X+30
const amm = meterPins(AMM_X, TOP_Y)          // p1 = AMM_X−20, p2 = AMM_X+20
const volt = meterPins(RES_X, VOLT_Y)

export default function OhmLabSchematic() {
  const { t } = useTranslation('ui')
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={480}
      caption={
        <Trans
          i18nKey="ch1_2.labSchematicCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
    >
      {/* ── Cell + → ammeter → resistor → return ───────────────────── */}
      <Wire points={[bat.p1, { x: BAT_X, y: TOP_Y }, amm.p1]} />
      <Battery x={BAT_X} y={MID_Y} orient="down" />
      <Meter x={AMM_X} y={TOP_Y} letter="A" accent={METER_ACCENT_A} />
      <Wire points={[amm.p2, res.p1]} />
      <Resistor x={RES_X} y={TOP_Y} label="R" value={t('ch1_2.labSchematicResistorValue')} />
      <Wire
        points={[res.p2, { x: CORNER_X, y: TOP_Y }, { x: CORNER_X, y: BOT_Y },
          { x: BAT_X, y: BOT_Y }, bat.p2]}
      />

      {/* ── Voltmeter ACROSS the resistor — it taps the resistor's two
             ends, so the series loop above is unbroken with or without
             it. Drawn in the voltage accent to separate the two roles. ─ */}
      <Wire
        color={METER_ACCENT_V}
        points={[res.p1, { x: res.p1.x, y: VOLT_Y }, volt.p1]}
      />
      <Meter x={RES_X} y={VOLT_Y} letter="V" accent={METER_ACCENT_V} />
      <Wire
        color={METER_ACCENT_V}
        points={[volt.p2, { x: res.p2.x, y: VOLT_Y }, res.p2]}
      />
      <Junction x={res.p1.x} y={res.p1.y} />
      <Junction x={res.p2.x} y={res.p2.y} />

      {/* ── Labels ───────────────────────────────────────────────── */}
      <TerminalLabel x={BAT_X - 14} y={TOP_Y}>
        {t('ch1_2.labSchematicPlus')}
      </TerminalLabel>
      <TerminalLabel x={BAT_X - 14} y={BOT_Y} tone="mutedFg">
        {t('ch1_2.labSchematicMinus')}
      </TerminalLabel>
      {/* Below and to the right of the cell: the Battery primitive draws its
          own +/− glyphs beside the plates (a label at MID_Y ran into them) and
          its symbol box reaches down to MID_Y + 32. */}
      <TerminalLabel x={BAT_X + 22} y={MID_Y + 44} anchor="start" tone="mutedFg">
        {t('ch1_2.labSchematicCell')}
      </TerminalLabel>
      <TerminalLabel x={AMM_X} y={AMM_LABEL_Y} anchor="middle" color={METER_ACCENT_A}>
        {t('ch1_2.labSchematicAmmeter')}
      </TerminalLabel>
      <TerminalLabel x={RES_X} y={VOLT_LABEL_Y} anchor="middle" color={METER_ACCENT_V}>
        {t('ch1_2.labSchematicVoltmeter')}
      </TerminalLabel>
    </Circuit>
  )
}
