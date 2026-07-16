/**
 * Chapter 1.8 §7 — series-LC notch (band-stop) filter, a.k.a. the trap.
 *
 * Topology (left → right, with a shunt leg down to ground):
 *   V_in → R_source in series → V_out node ──┐
 *                                             L   (series)
 *                                             C   (series)
 *                                             │
 *                                            GND
 *
 * A SERIES LC pair sits in shunt from the signal node to ground.
 *   – At resonance (f_0): the series pair is a near-SHORT, so it dumps
 *     f_0 straight to ground — the node (and the output) collapses to a
 *     deep notch.
 *   – Off-resonance: the series pair is high-impedance (a near-open), so
 *     it draws almost no current and every other frequency passes
 *     through untouched.
 *
 * This is the correct band-STOP. (A *parallel* LC in shunt is the
 * band-PASS — high-Z at f_0 means f_0 is NOT shunted, so it passes. That
 * dual is exactly what the earlier version of this schematic got wrong.)
 * The mirror of this trap is the LcBandPassSchematic: the SAME series LC,
 * but wired IN THE LINE instead of to ground, passes f_0 instead.
 *
 * R_source is drawn as a series resistor at the input. Without it the
 * shunt has nothing to form a divider against and the notch cannot bite.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Inductor,
  Capacitor,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 560

// The shunt leg stacks L above C (each a 60 px two-terminal part) with a
// short lead between them, so it needs a deep rail.
const TOP_Y = SCHEMATIC_PAD_TOP + 10 // 45
const RAIL_SPAN = 150
const BOT_Y = TOP_Y + RAIL_SPAN // 195
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 10

const IN_X = 60
const R_X = 170
// V_out node = the shunt tap-off on the signal rail
const NODE_X = 320
const OUT_X = 480

const rSrc = pins2(R_X, TOP_Y)

// Series L–C in the shunt leg, both centred on NODE_X, C stacked below L.
// pins2 span is 60 (±30): L pins 65..125, C pins 135..195 (= BOT_Y).
const l = pins2(NODE_X, 95, 'down')
const c = pins2(NODE_X, 165, 'down')

export default function LcNotchSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={600}
      caption={
        <Trans
          i18nKey="ch1_8.schematicLcNotchCaption"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      }
    >
      <title>{t('ch1_8.schematicLcNotchAria')}</title>

      {/* Signal rail: in → R_src → node → out */}
      <Wire points={[{ x: IN_X, y: TOP_Y }, rSrc.p1]} />
      <Wire points={[rSrc.p2, { x: NODE_X, y: TOP_Y }, { x: OUT_X, y: TOP_Y }]} />

      {/* Series-LC shunt: node → L → C → GND rail */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, l.p1]} />
      <Wire points={[l.p2, c.p1]} />
      <Wire points={[c.p2, { x: NODE_X, y: BOT_Y }]} />

      {/* GND rail under the output */}
      <Wire points={[{ x: NODE_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Resistor x={R_X} y={TOP_Y} label="R" />
      <Inductor x={NODE_X} y={95} orient="down" label="L" />
      <Capacitor x={NODE_X} y={165} orient="down" label="C" />

      {/* Junction at the shunt tap-off (T-joint on the signal rail) */}
      <Junction x={NODE_X} y={TOP_Y} />

      {/* Terminal labels */}
      <TerminalLabel x={IN_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_8.schematicLcNotchIn')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_8.schematicLcNotchOut')}
      </TerminalLabel>
      <TerminalLabel x={OUT_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch1_8.schematicLcNotchGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
