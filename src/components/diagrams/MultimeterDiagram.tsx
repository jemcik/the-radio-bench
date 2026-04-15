/**
 * MultimeterDiagram — educational diagrams showing how to connect
 * a voltmeter (in parallel) and an ammeter (in series).
 *
 * Uses the local circuit schematic library (@/lib/circuit) with
 * ARRL-standard symbols and explicit waypoint wiring.
 */
import { useTranslation } from 'react-i18next'
import { Circuit, Wire, Junction, Resistor, Battery, Meter, pins2, type LegendItem } from '@/lib/circuit'

const W = 360
const H = 220

/* ── pin positions ─────────────────────────────────────────────────────── */

// Voltmeter circuit
const vR1  = pins2(180, 40)               // R₁ horizontal on top wire
const vBat = pins2(75, 142, 'down')       // battery vertical on left rail
const vMtr = pins2(180, 100, 'right', 40) // voltmeter — span=40 matches circle r=20

// Ammeter circuit
const aAm  = pins2(148, 48, 'right', 40) // ammeter — span=40 matches circle r=20
const aR1  = pins2(238, 48)              // R₁ on top wire (series with ammeter)
const aBat = pins2(65, 130, 'down')      // battery on left rail

/* ── accent colours for meter highlights ───────────────────────────────── */
const VOLT_ACCENT = 'hsl(210 70% 55%)'
const AMP_ACCENT  = 'hsl(142 55% 42%)'

/* ── Voltmeter in parallel ─────────────────────────────────────────────── *
 *
 *  ┌─────────[R₁]─────────┐        y = TOP (40)
 *  │         • │ • │         │          • = T-junction (probes tap at R₁'s pins)
 *  │         │   │           │
 *  │         └─(V)─┘         │        y = MID (100)
 *  │                         │
 *  ┤ [Bat]                   │          y ≈ 142
 *  │                         │
 *  └─────────────────────────┘          y = BOT (195)
 *
 * The probes tap the circuit AT the resistor's pins — that mirrors how
 * you physically place a voltmeter's probes on a component's leads.
 * Junction dots only at true T-junctions (3+ wires meeting); plain 90°
 * bends in a single wire are NOT junctions.
 */
const L = 75, R = 285, TOP = 40, BOT = 195
// Y-level of the voltmeter branch; the Meter's pins sit 20 px left/right
// of its centre (span = 40), so short horizontal stubs connect the
// vertical probe drops to the meter's pins.
const VMID = 100

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
      <Wire points={[vBat.p1, { x: L, y: TOP }, vR1.p1]} />
      <Wire points={[vR1.p2, { x: R, y: TOP }, { x: R, y: BOT }, { x: L, y: BOT }, vBat.p2]} />

      {/* ── voltmeter probes: drop from R₁'s pins down to the meter ── */}
      <Wire points={[vR1.p1, { x: vR1.p1.x, y: VMID }, vMtr.p1]} color={VOLT_ACCENT} />
      <Wire points={[vMtr.p2, { x: vR1.p2.x, y: VMID }, vR1.p2]} color={VOLT_ACCENT} />

      {/* ── components ── */}
      <Battery x={75} y={142} orient="down" value="1.5 V" />
      <Resistor x={180} y={40} label="R₁" />
      <Meter x={180} y={100} letter="V" accent={VOLT_ACCENT} />

      {/* ── junction dots — only at the two T-junctions where probes
            tap the main loop at R₁'s pins. Corners (L,TOP) etc. are
            single-wire bends, not electrical connections. ── */}
      <Junction x={vR1.p1.x} y={vR1.p1.y} />
      <Junction x={vR1.p2.x} y={vR1.p2.y} />
    </Circuit>
  )
}

/* ── Ammeter in series ─────────────────────────────────────────────────── *
 *
 *  ┌────(A)────[R₁]────┐              y = 48
 *  │                    │
 *  ┤ [Bat]              │              y ≈ 130
 *  │                    │
 *  └────────────────────┘              y = 190
 */
const AL = 65, AR = 295, ATOP = 48, ABOT = 190

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
      <Wire points={[aBat.p1, { x: AL, y: ATOP }, aAm.p1]} />
      <Wire points={[aAm.p2, aR1.p1]} />
      <Wire points={[aR1.p2, { x: AR, y: ATOP }]} />
      <Wire points={[{ x: AR, y: ATOP }, { x: AR, y: ABOT }]} />
      <Wire points={[{ x: AR, y: ABOT }, { x: AL, y: ABOT }]} />
      <Wire points={[{ x: AL, y: ABOT }, aBat.p2]} />

      {/* ── components ── */}
      <Battery x={65} y={130} orient="down" value="1.5 V" />
      <Meter x={148} y={48} letter="A" accent={AMP_ACCENT} />
      <Resistor x={238} y={48} label="R₁" />

      {/* ── junction dots — only at the ammeter's pin connections, where
            the meter is inserted "into" the wire. Corners (AL,ATOP) etc.
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
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
      <VoltmeterParallel caption={t('ch0_2.voltmeterCaption')} legend={voltmeterLegend} />
      <AmmeterSeries caption={t('ch0_2.ammeterCaption')} legend={ammeterLegend} />
    </div>
  )
}
