/**
 * Chapter 1.7 §4 — Series LC across a signal path.
 *
 * Topology:
 *
 *   source → L → C → return rail → source
 *
 * The L and C sit end-to-end in a single loop. At resonance the
 * impedance the source sees is minimum (a near-short), and the loop
 * current is maximum — the basis for «trap» behaviour.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
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

const SRC_X = 70
const L_X = 200
const C_X = 320
const END_X = 410

const src = pins2(SRC_X, (TOP_Y + BOT_Y) / 2, 'down')
const l = pins2(L_X, TOP_Y)
const c = pins2(C_X, TOP_Y)

export default function LcSeriesSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={520}
      caption={
        <Trans
          i18nKey="ch1_7.schematicSeriesCaption"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      }
    >
      <title>{t('ch1_7.schematicSeriesAria')}</title>

      {/* Top rail: source → L → C → end terminal */}
      <Wire points={[src.p1, { x: SRC_X, y: TOP_Y }, l.p1]} />
      <Wire points={[l.p2, c.p1]} />
      <Wire points={[c.p2, { x: END_X, y: TOP_Y }]} />

      {/* Return rail */}
      <Wire points={[{ x: END_X, y: TOP_Y }, { x: END_X, y: BOT_Y }, { x: SRC_X, y: BOT_Y }, src.p2]} />

      <Battery x={SRC_X} y={(TOP_Y + BOT_Y) / 2} orient="down" value="v_in" />
      <Inductor x={L_X} y={TOP_Y} label="L" />
      <Capacitor x={C_X} y={TOP_Y} label="C" />
    </Circuit>
  )
}
