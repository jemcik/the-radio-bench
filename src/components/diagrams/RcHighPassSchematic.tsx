/**
 * Chapter 1.8 §4 — first-order RC high-pass filter.
 *
 * Topology (left → right):
 *   V_in terminal → C in series → node V_out → R down to GND rail
 *                                              │
 *                                             GND
 *
 * Dual to RcLowPassSchematic — the same R and C, swapped roles. Built
 * to mirror the LPF's geometry exactly so the two schematics, when
 * shown sequentially in chapter 1.8, have identical viewBox / display
 * scale / label-font size / GND-label placement. The legacy
 * BlocksHighPassSchematic (ch1.5) has different proportions and a
 * left-extending bottom rail; using THIS schematic in ch1.8 keeps
 * LPF and HPF visually consistent on the same page.
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

// Geometry constants are intentionally identical to RcLowPassSchematic
// so the two schematics scale to the same on-screen size and labels
// render at the same font size on every viewport.
const SCHEMATIC_W = 480

const TOP_Y = SCHEMATIC_PAD_TOP + 10
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 10

const IN_X = 60
const C_X = 180        // series capacitor on signal rail (HPF: C is in series)
const NODE_X = 290     // V_out tap-off junction
const R_X = NODE_X     // shunt resistor drops from this column
const OUT_X = 410

const c = pins2(C_X, TOP_Y)
const r = pins2(R_X, (TOP_Y + BOT_Y) / 2, 'down')

export default function RcHighPassSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={520}
      caption={
        <Trans
          i18nKey="ch1_8.schematicRcHpfCaption"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
          }}
        />
      }
    >
      <title>{t('ch1_8.schematicRcHpfAria')}</title>

      {/* Signal rail: in → C → node → out */}
      <Wire points={[{ x: IN_X, y: TOP_Y }, c.p1]} />
      <Wire points={[c.p2, { x: NODE_X, y: TOP_Y }, { x: OUT_X, y: TOP_Y }]} />

      {/* Shunt R from node down to GND rail */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, r.p1]} />
      <Wire points={[r.p2, { x: R_X, y: BOT_Y }]} />

      {/* GND rail under the load — same direction as LPF (extends to OUT_X
          on the right) so the GND label lines up with the V_out terminal
          column above it, matching the LPF visual rhythm. */}
      <Wire points={[{ x: R_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Capacitor x={C_X} y={TOP_Y} label="C" />
      <Resistor x={R_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="R" />

      {/* T-junction where R taps off the signal rail */}
      <Junction x={NODE_X} y={TOP_Y} />

      {/* Terminal labels — identical positions to LPF (V_in at IN_X-6,
          V_out at OUT_X+6, GND at OUT_X+6 on bottom rail). */}
      <TerminalLabel x={IN_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_8.schematicRcHpfIn')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_8.schematicRcHpfOut')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch1_8.schematicRcHpfGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
