/**
 * Chapter 1.8 §7 — series-LC band-pass filter.
 *
 * Topology (left → right):
 *   V_in → L in series → C in series → V_out node → R_load down to GND
 *
 * The series LC pair sits in the signal path. At its resonant frequency
 * f_0 = 1 / (2π√(LC)) the pair looks like a near-short, so the signal
 * at f_0 sails through to the load resistor. Off-resonance the series
 * impedance climbs and very little reaches the load.
 *
 * The load resistor R is drawn explicitly because the LC's bandwidth
 * is set by the loaded Q, which depends on R — without it the «open»
 * output would have an undefined response. Same convention as the
 * VnaSweep widget assumes a 50 Ω load.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  Inductor,
  Capacitor,
  Resistor,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 540

const TOP_Y = SCHEMATIC_PAD_TOP + 10
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 10

const IN_X = 60
const L_X = 170
const C_X = 280
const NODE_X = 360
const R_X = NODE_X
const OUT_X = 470

const l = pins2(L_X, TOP_Y)
const c = pins2(C_X, TOP_Y)
const r = pins2(R_X, (TOP_Y + BOT_Y) / 2, 'down')

export default function LcBandPassSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={580}
      caption={
        <Trans
          i18nKey="ch1_8.schematicLcBpfCaption"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      }
    >
      <title>{t('ch1_8.schematicLcBpfAria')}</title>

      {/* Signal rail: in → L → C → node → out */}
      <Wire points={[{ x: IN_X, y: TOP_Y }, l.p1]} />
      <Wire points={[l.p2, c.p1]} />
      <Wire points={[c.p2, { x: NODE_X, y: TOP_Y }, { x: OUT_X, y: TOP_Y }]} />

      {/* Load R from node down to GND */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, r.p1]} />
      <Wire points={[r.p2, { x: R_X, y: BOT_Y }]} />

      {/* GND rail */}
      <Wire points={[{ x: R_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Inductor x={L_X} y={TOP_Y} label="L" />
      <Capacitor x={C_X} y={TOP_Y} label="C" />
      <Resistor x={R_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="R" />

      {/* Junction where R taps off the signal rail */}
      <Junction x={NODE_X} y={TOP_Y} />

      {/* Terminal labels */}
      <TerminalLabel x={IN_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_8.schematicLcBpfIn')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_8.schematicLcBpfOut')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch1_8.schematicLcBpfGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
