/**
 * Chapter 1.7 §5 — Parallel LC tank.
 *
 * Topology:
 *
 *   source ─┬──── L ────┬── (top rail)
 *           │           │
 *           +───── C ───+   (vertical components in parallel)
 *           │           │
 *   source ─┴───────────┴── (bottom rail return)
 *
 * Both L and C share the SAME pair of nodes — top rail and bottom
 * rail. At resonance the impedance the source sees is maximum
 * (near-open), and current circulates around the inner LC loop at
 * Q times the line current.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  Inductor,
  Capacitor,
  Battery,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 460

const TOP_Y = SCHEMATIC_PAD_TOP + 10
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 10
const MID_Y = (TOP_Y + BOT_Y) / 2

const SRC_X = 70
const L_X = 220
const C_X = 340

const src = pins2(SRC_X, MID_Y, 'down')
const l = pins2(L_X, MID_Y, 'down')
const c = pins2(C_X, MID_Y, 'down')

export default function LcParallelSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={520}
      caption={
        <Trans
          i18nKey="ch1_7.schematicParallelCaption"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      }
    >
      <title>{t('ch1_7.schematicParallelAria')}</title>

      {/* Top rail: source positive → L's top → C's top */}
      <Wire points={[src.p1, { x: SRC_X, y: TOP_Y }, { x: C_X, y: TOP_Y }]} />

      {/* Bottom rail: C's bottom → L's bottom → source negative */}
      <Wire points={[{ x: C_X, y: BOT_Y }, { x: SRC_X, y: BOT_Y }, src.p2]} />

      {/* L and C drop straight from the top rail to the bottom rail */}
      <Wire points={[{ x: L_X, y: TOP_Y }, l.p1]} />
      <Wire points={[l.p2, { x: L_X, y: BOT_Y }]} />
      <Wire points={[{ x: C_X, y: TOP_Y }, c.p1]} />
      <Wire points={[c.p2, { x: C_X, y: BOT_Y }]} />

      {/* T-junctions where each component leg meets a shared rail */}
      <Junction x={L_X} y={TOP_Y} />
      <Junction x={L_X} y={BOT_Y} />

      <Battery x={SRC_X} y={MID_Y} orient="down" value="v_in" />
      <Inductor x={L_X} y={MID_Y} orient="down" label="L" />
      <Capacitor x={C_X} y={MID_Y} orient="down" label="C" />
    </Circuit>
  )
}
