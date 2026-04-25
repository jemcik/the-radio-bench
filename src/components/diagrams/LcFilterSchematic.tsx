/**
 * Chapter 1.6 §7.2 — LC low-pass filter (power-supply ripple filter).
 *
 * Topology (left → right):
 *   rectified DC in → series inductor L → LC node → smoothed DC out
 *                                          │
 *                                          C (vertical, to GND)
 *                                          │
 *                                         GND
 *
 * The inductor opposes the AC ripple component (high impedance at the
 * ripple frequency); the capacitor shunts whatever ripple gets through
 * to GND. Together they cut ripple by orders of magnitude per stage.
 * Same arrangement, scaled for audio, is a speaker crossover splitting
 * bass from treble.
 *
 * Uses `@/lib/circuit` primitives only.
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
import { useTranslation } from 'react-i18next'
import { MathText } from '@/components/ui/math-text'

const SCHEMATIC_W = 500

const TOP_Y = SCHEMATIC_PAD_TOP + 10 // signal rail
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 10

// Column positions
const IN_X = 60
const L_X = 200       // series inductor on signal rail
const NODE_X = 290    // LC node
const C_X = NODE_X    // shunt capacitor
const OUT_X = 420

const l = pins2(L_X, TOP_Y)
const c = pins2(C_X, (TOP_Y + BOT_Y) / 2, 'down')

export default function LcFilterSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={540}
      caption={<MathText>{t('ch1_6.filterChokeSchematicCaption')}</MathText>}
    >
      {/* Signal rail: in → L → node → out */}
      <Wire points={[{ x: IN_X, y: TOP_Y }, l.p1]} />
      <Wire points={[l.p2, { x: NODE_X, y: TOP_Y }, { x: OUT_X, y: TOP_Y }]} />

      {/* Shunt cap from LC node down to GND rail */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, c.p1]} />
      <Wire points={[c.p2, { x: C_X, y: BOT_Y }]} />

      {/* GND rail extending under the load (from C down to OUT_X bottom) */}
      <Wire points={[{ x: C_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Inductor x={L_X} y={TOP_Y} label="L" />
      <Capacitor x={C_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="C" />

      {/* T-junction where C and signal rail meet */}
      <Junction x={NODE_X} y={TOP_Y} />

      {/* Terminal labels */}
      <TerminalLabel x={IN_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_6.filterChokeIn')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_6.filterChokeOut')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch1_6.filterChokeGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
