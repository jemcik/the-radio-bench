/**
 * MultimeterDiagram — educational diagrams showing how to connect
 * a voltmeter (in parallel) and an ammeter (in series).
 *
 * Uses the local circuit schematic library (@/lib/circuit) with
 * ARRL-standard symbols and explicit waypoint wiring.
 */
import { useTranslation } from 'react-i18next'
import {
  Circuit, Wire, Junction, Resistor, Battery, Meter, pins2,
  SCHEMATIC_PAD_TOP, schematicHeight,
  type LegendItem,
} from '@/lib/circuit'

/* ── shared vertical layout ────────────────────────────────────────────── *
 * Top rail lives at SCHEMATIC_PAD_TOP, total height comes from the shared
 * `schematicHeight(railSpan)` helper — every schematic in the project uses
 * the same padding rule so the cards line up visually. */
const W = 360
const V_RAIL_SPAN = 140
const A_RAIL_SPAN = 135
const H = schematicHeight(Math.max(V_RAIL_SPAN, A_RAIL_SPAN))
const V_TOP = SCHEMATIC_PAD_TOP
const V_BOT = V_TOP + V_RAIL_SPAN
const A_TOP = SCHEMATIC_PAD_TOP
const A_BOT = A_TOP + A_RAIL_SPAN

/* ── component centres ─────────────────────────────────────────────────── *
 * Single source of truth for every symbol's (x, y). The pin-helper bindings
 * below derive from these, and the JSX <Component {...CENTRE} ...> render
 * MUST use the same object — otherwise pins and symbol body drift apart
 * (wires disconnect from the drawn symbol).  See
 * `feedback_schematic_pin_symbol_drift.md` in project memory. */

// Voltmeter circuit
const V_R1  = { x: 180, y: V_TOP }                  // R₁ on top wire
const V_MTR = { x: 180, y: (V_TOP + V_BOT) / 2 }    // voltmeter centred
const V_BAT = { x: 75,  y: (V_TOP + V_BOT) / 2 + 25 } // battery below-centre

// Ammeter circuit
const A_AM  = { x: 148, y: A_TOP }                 // ammeter on top wire
const A_R1  = { x: 238, y: A_TOP }                 // R₁ on top wire (series)
const A_BAT = { x: 65,  y: (A_TOP + A_BOT) / 2 + 13 } // battery below-centre

/* ── pin bindings (derived from centres) ───────────────────────────────── */
const vR1  = pins2(V_R1.x,  V_R1.y)
const vBat = pins2(V_BAT.x, V_BAT.y, 'down')
const vMtr = pins2(V_MTR.x, V_MTR.y, 'right', 40) // span=40 matches circle r=20

const aAm  = pins2(A_AM.x,  A_AM.y,  'right', 40) // span=40 matches circle r=20
const aR1  = pins2(A_R1.x,  A_R1.y)
const aBat = pins2(A_BAT.x, A_BAT.y, 'down')

/* ── accent colours for meter highlights ───────────────────────────────── */
const VOLT_ACCENT = 'hsl(210 70% 55%)'
const AMP_ACCENT  = 'hsl(142 55% 42%)'

/* ── Voltmeter in parallel ─────────────────────────────────────────────── *
 *
 *  ┌─────────[R₁]─────────┐        y = V_TOP
 *  │         • │ • │         │      • = T-junction (probes tap at R₁'s pins)
 *  │         │   │           │
 *  │         └─(V)─┘         │        y = V_MTR.y (voltmeter branch)
 *  │                         │
 *  ┤ [Bat]                   │        y = V_BAT.y
 *  │                         │
 *  └─────────────────────────┘        y = V_BOT
 *
 * The probes tap the circuit AT the resistor's pins — that mirrors how
 * you physically place a voltmeter's probes on a component's leads.
 * Junction dots only at true T-junctions (3+ wires meeting); plain 90°
 * bends in a single wire are NOT junctions.
 */
const L = 75, R = 285

function VoltmeterParallel({
  caption,
  legend,
}: {
  caption: string
  legend: LegendItem[]
}) {
  return (
    <Circuit width={W} height={H} caption={caption} legend={legend}>

      {/* ── main loop wires (no accent colour) ── */}
      <Wire points={[vBat.p1, { x: L, y: V_TOP }, vR1.p1]} />
      <Wire points={[vR1.p2, { x: R, y: V_TOP }, { x: R, y: V_BOT }, { x: L, y: V_BOT }, vBat.p2]} />

      {/* ── voltmeter probes: drop from R₁'s pins down to the meter ── */}
      <Wire points={[vR1.p1, { x: vR1.p1.x, y: V_MTR.y }, vMtr.p1]} color={VOLT_ACCENT} />
      <Wire points={[vMtr.p2, { x: vR1.p2.x, y: V_MTR.y }, vR1.p2]} color={VOLT_ACCENT} />

      {/* ── components (positions derived from the shared centres) ── */}
      <Battery {...V_BAT} orient="down" value="1.5V" />
      <Resistor {...V_R1} label="R₁" />
      <Meter {...V_MTR} letter="V" accent={VOLT_ACCENT} />

      {/* ── junction dots — only at the two T-junctions where probes
            tap the main loop at R₁'s pins. Corners (L, V_TOP) etc. are
            single-wire bends, not electrical connections. ── */}
      <Junction x={vR1.p1.x} y={vR1.p1.y} />
      <Junction x={vR1.p2.x} y={vR1.p2.y} />
    </Circuit>
  )
}

/* ── Ammeter in series ─────────────────────────────────────────────────── *
 *
 *  ┌────(A)────[R₁]────┐              y = A_TOP
 *  │                    │
 *  ┤ [Bat]              │              y = A_BAT.y
 *  │                    │
 *  └────────────────────┘              y = A_BOT
 */
const AL = 65, AR = 295

function AmmeterSeries({
  caption,
  legend,
}: {
  caption: string
  legend: LegendItem[]
}) {
  return (
    <Circuit width={W} height={H} caption={caption} legend={legend}>

      {/* ── wires ── */}
      <Wire points={[aBat.p1, { x: AL, y: A_TOP }, aAm.p1]} />
      <Wire points={[aAm.p2, aR1.p1]} />
      <Wire points={[aR1.p2, { x: AR, y: A_TOP }]} />
      <Wire points={[{ x: AR, y: A_TOP }, { x: AR, y: A_BOT }]} />
      <Wire points={[{ x: AR, y: A_BOT }, { x: AL, y: A_BOT }]} />
      <Wire points={[{ x: AL, y: A_BOT }, aBat.p2]} />

      {/* ── components (positions derived from the shared centres) ── */}
      <Battery {...A_BAT} orient="down" value="1.5V" />
      <Meter {...A_AM} letter="A" accent={AMP_ACCENT} />
      <Resistor {...A_R1} label="R₁" />

      {/* ── junction dots — only at the ammeter's pin connections, where
            the meter is inserted "into" the wire. Corners (AL,A_TOP) etc.
            are single-wire bends, not electrical connections. ── */}
      <Junction x={aAm.p1.x} y={aAm.p1.y} />
      <Junction x={aAm.p2.x} y={aAm.p2.y} />
    </Circuit>
  )
}

/* ── exported component ────────────────────────────────────────────────── */

export default function MultimeterDiagram() {
  const { t } = useTranslation('ui')

  const voltmeterLegend: LegendItem[] = [
    { kind: 'line',     label: t('ch0_2.legendMainLoop') },
    { kind: 'battery',  label: t('ch0_2.legendBattery') },
    { kind: 'resistor', label: t('ch0_2.legendResistor') },
    { kind: 'line',     color: VOLT_ACCENT, label: t('ch0_2.legendVoltmeterProbes') },
    { kind: 'dot',      label: t('ch0_2.legendJunction') },
  ]

  const ammeterLegend: LegendItem[] = [
    { kind: 'line',     label: t('ch0_2.legendMainLoop') },
    { kind: 'battery',  label: t('ch0_2.legendBattery') },
    { kind: 'resistor', label: t('ch0_2.legendResistor') },
    { kind: 'circle',   color: AMP_ACCENT, label: t('ch0_2.legendAmmeterInline') },
    { kind: 'dot',      label: t('ch0_2.legendJunction') },
  ]

  return (
    <div className="my-8 flex flex-col gap-6 not-prose">
      <VoltmeterParallel caption={t('ch0_2.voltmeterCaption')} legend={voltmeterLegend} />
      <AmmeterSeries caption={t('ch0_2.ammeterCaption')} legend={ammeterLegend} />
    </div>
  )
}
