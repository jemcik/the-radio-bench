/**
 * Chapter 1.8 §7 — parallel-LC notch (band-stop) filter.
 *
 * Topology (left → right):
 *   V_in → R_source in series → V_out node → parallel-LC tank to GND
 *                                            │
 *                                       L  ‖  C   (tank)
 *                                            │
 *                                           GND
 *
 * The parallel LC sits in shunt from the signal node to ground.
 *   – At resonance (f_0): the tank looks like a near-open, so the
 *     signal node sees no shunt and the input passes through to the
 *     output. (It is the *opposite* of what a beginner expects — the
 *     fact that it's a parallel tank does not mean it «picks» f_0;
 *     in shunt it «hides» f_0 from the divider.)
 *   – Off-resonance: the tank impedance drops and forms a divider
 *     with the source resistance R that crushes those frequencies.
 *
 * Result: a deep notch centred on f_0, flat passband everywhere else.
 *
 * R_source is drawn as a series resistor at the input. In a real
 * receiver this is the antenna or feedline impedance (typically
 * 50 Ω); we draw it explicitly because without it the notch has no
 * divider to work against.
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

// Parallel-LC tank needs vertical room — give a deeper rail than the
// other ch1.8 schematics so the L and C inside the shunt sit cleanly
// without crowding either rail.
const TOP_Y = SCHEMATIC_PAD_TOP + 10
const RAIL_SPAN = 150
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 10

const IN_X = 60
const R_X = 170
// V_out node (signal rail tap-off into the tank)
const NODE_X = 320
const TANK_TOP_Y = TOP_Y + 30
const TANK_BOT_Y = BOT_Y - 10

// Two tank columns — L on the left of the shunt, C on the right
const TANK_LEFT_X = 280
const TANK_RIGHT_X = 360
const OUT_X = 480

const rSrc = pins2(R_X, TOP_Y)

// L and C oriented vertically (down) — both span TANK_TOP_Y..TANK_BOT_Y
const l = pins2(TANK_LEFT_X, (TANK_TOP_Y + TANK_BOT_Y) / 2, 'down')
const c = pins2(TANK_RIGHT_X, (TANK_TOP_Y + TANK_BOT_Y) / 2, 'down')

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

      {/* Wires from signal-rail node down to top of tank, branching to L and C */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, { x: NODE_X, y: TANK_TOP_Y }]} />
      <Wire points={[{ x: TANK_LEFT_X, y: TANK_TOP_Y }, { x: TANK_RIGHT_X, y: TANK_TOP_Y }]} />
      <Wire points={[{ x: TANK_LEFT_X, y: TANK_TOP_Y }, l.p1]} />
      <Wire points={[{ x: TANK_RIGHT_X, y: TANK_TOP_Y }, c.p1]} />

      {/* Bottom of tank — both legs join, then drop to GND rail */}
      <Wire points={[l.p2, { x: TANK_LEFT_X, y: TANK_BOT_Y }, { x: TANK_RIGHT_X, y: TANK_BOT_Y }, c.p2]} />
      <Wire points={[{ x: NODE_X, y: TANK_BOT_Y }, { x: NODE_X, y: BOT_Y }]} />

      {/* GND rail under the load */}
      <Wire points={[{ x: NODE_X, y: BOT_Y }, { x: OUT_X, y: BOT_Y }]} />

      {/* Components */}
      <Resistor x={R_X} y={TOP_Y} label="R" />
      <Inductor x={TANK_LEFT_X} y={(TANK_TOP_Y + TANK_BOT_Y) / 2} orient="down" label="L" />
      <Capacitor x={TANK_RIGHT_X} y={(TANK_TOP_Y + TANK_BOT_Y) / 2} orient="down" label="C" />

      {/* Junctions on signal rail (tank tap-off) and on the tank bus bars */}
      <Junction x={NODE_X} y={TOP_Y} />
      <Junction x={NODE_X} y={TANK_BOT_Y} />

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
