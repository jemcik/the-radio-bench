/**
 * Chapter 1.8 §7 — generic LC low-pass filter (series inductor + shunt
 * capacitor to ground), drawn for the «LC filters» section.
 *
 * Same topology as `LcFilterSchematic` from ch1.6, but with generic
 * V_in / V_out / GND terminal labels matching the rest of the ch1.8
 * schematics (RcLowPass, RcHighPass, LcBandPass, LcNotch). The ch1.6
 * version uses semantic labels («rectified DC» → «smoothed DC» →
 * «ground») because there it specifically illustrates a power-supply
 * ripple filter; in ch1.8 the schematic stands for a general-purpose
 * LC LPF (e.g. the harmonic filter after a transmitter PA), so the
 * generic labels are the right choice.
 *
 * Geometry constants are intentionally identical to RcLowPassSchematic
 * so the two LPF schematics on the same page (RC and LC) scale to the
 * same on-screen size and labels render at the same font size on
 * every viewport.
 */
import {
  Circuit,
  Wire,
  Junction,
  Capacitor,
  Inductor,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 480

const TOP_Y = SCHEMATIC_PAD_TOP + 10
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 10

const IN_X = 60
const L_X = 180          // series inductor on signal rail
const NODE_X = 290       // V_out tap-off + shunt cap column
const C_X = NODE_X
const OUT_X = 410

const l = pins2(L_X, TOP_Y)
const c = pins2(C_X, (TOP_Y + BOT_Y) / 2, 'down')

export default function LcLowPassSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={520}
      caption={
        <Trans
          i18nKey="ch1_8.schematicLcLpfCaption"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      }
    >
      <title>{t('ch1_8.schematicLcLpfAria')}</title>

      {/* Signal rail: in → L → node → out */}
      <Wire points={[{ x: IN_X, y: TOP_Y }, l.p1]} />
      <Wire points={[l.p2, { x: NODE_X, y: TOP_Y }, { x: OUT_X, y: TOP_Y }]} />

      {/* Shunt C from node down to GND rail */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, c.p1]} />
      <Wire points={[c.p2, { x: C_X, y: BOT_Y }]} />

      {/* GND rail under the load */}
      <Wire points={[{ x: C_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Inductor x={L_X} y={TOP_Y} label="L" />
      <Capacitor x={C_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="C" />

      {/* T-junction where C taps off the signal rail */}
      <Junction x={NODE_X} y={TOP_Y} />

      {/* Terminal labels — same positions as RcLowPassSchematic so the
          two LPF diagrams in ch1.8 are visually a matched pair. */}
      <TerminalLabel x={IN_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_8.schematicLcLpfIn')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_8.schematicLcLpfOut')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch1_8.schematicLcLpfGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
