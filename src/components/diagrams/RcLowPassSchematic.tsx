/**
 * Chapter 1.8 §3 — first-order RC low-pass filter.
 *
 * Topology (left → right):
 *   V_in terminal → R in series → node V_out → C down to GND rail
 *                                              │
 *                                             GND
 *
 * Dual to BlocksHighPassSchematic from chapter 1.5 — the same R and C,
 * arranged the other way around: here R is in the signal path and C
 * is the shunt to ground. The cutoff frequency is the same in both
 * topologies; only the side of f_c that is the passband flips.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Capacitor,
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
const R_X = 180
const NODE_X = 290
const C_X = NODE_X
const OUT_X = 410

const r = pins2(R_X, TOP_Y)
const c = pins2(C_X, (TOP_Y + BOT_Y) / 2, 'down')

export default function RcLowPassSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={520}
      caption={
        <Trans
          i18nKey="ch1_8.schematicRcLpfCaption"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
          }}
        />
      }
    >
      <title>{t('ch1_8.schematicRcLpfAria')}</title>

      {/* Signal rail: in → R → node → out */}
      <Wire points={[{ x: IN_X, y: TOP_Y }, r.p1]} />
      <Wire points={[r.p2, { x: NODE_X, y: TOP_Y }, { x: OUT_X, y: TOP_Y }]} />

      {/* Shunt C from node down to GND rail */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, c.p1]} />
      <Wire points={[c.p2, { x: C_X, y: BOT_Y }]} />

      {/* GND rail under the load */}
      <Wire points={[{ x: C_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Resistor x={R_X} y={TOP_Y} label="R" />
      <Capacitor x={C_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="C" />

      {/* T-junction where C taps off the signal rail */}
      <Junction x={NODE_X} y={TOP_Y} />

      {/* Terminal labels */}
      <TerminalLabel x={IN_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_8.schematicRcLpfIn')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_8.schematicRcLpfOut')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch1_8.schematicRcLpfGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
