/**
 * MultimeterDiagram — educational diagrams showing how to connect
 * a voltmeter (in parallel) and an ammeter (in series).
 *
 * Uses the local circuit schematic library (@/lib/circuit) with
 * ARRL-standard symbols and explicit waypoint wiring.
 */
import { useTranslation } from 'react-i18next'
import { Circuit, Wire, Junction, Resistor, Battery, Meter, pins2 } from '@/lib/circuit'

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
 *  A ─────────[R₁]────────── B        y = 40
 *  │                         │
 *  ├── ──────(V)──────── ───┤         y = 100  (parallel branch)
 *  │                         │
 *  ┤ [Bat]                   │         y ≈ 142
 *  │                         │
 *  └─────────────────────────┘         y = 195
 */
const L = 75, R = 285, TOP = 40, MID = 100, BOT = 195

function VoltmeterParallel({ caption }: { caption: string }) {
  return (
    <Circuit width={W} height={H}
      caption={caption}>

      {/* ── main loop wires ── */}
      <Wire points={[vBat.p1, { x: L, y: TOP }, vR1.p1]} />
      <Wire points={[vR1.p2, { x: R, y: TOP }]} />
      <Wire points={[{ x: R, y: TOP }, { x: R, y: BOT }]} />
      <Wire points={[{ x: R, y: BOT }, { x: L, y: BOT }]} />
      <Wire points={[{ x: L, y: BOT }, vBat.p2]} />

      {/* ── voltmeter parallel branch (accent colour) ── */}
      <Wire points={[{ x: L, y: MID }, vMtr.p1]} color={VOLT_ACCENT} />
      <Wire points={[vMtr.p2, { x: R, y: MID }]} color={VOLT_ACCENT} />

      {/* ── components ── */}
      <Battery x={75} y={142} orient="down" value="1.5 V" />
      <Resistor x={180} y={40} label="R₁" />
      <Meter x={180} y={100} letter="V" accent={VOLT_ACCENT} />

      {/* ── junction dots ── */}
      <Junction x={L} y={TOP} />
      <Junction x={R} y={TOP} />
      <Junction x={L} y={BOT} />
      <Junction x={R} y={BOT} />
      <Junction x={L} y={MID} />
      <Junction x={R} y={MID} />
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

function AmmeterSeries({ caption }: { caption: string }) {
  return (
    <Circuit width={W} height={H}
      caption={caption}>

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

      {/* ── corner dots ── */}
      <Junction x={AL} y={ATOP} />
      <Junction x={AR} y={ATOP} />
      <Junction x={AL} y={ABOT} />
      <Junction x={AR} y={ABOT} />
    </Circuit>
  )
}

/* ── exported component ────────────────────────────────────────────────── */

export default function MultimeterDiagram() {
  const { t } = useTranslation('ui')
  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
      <VoltmeterParallel caption={t('ch0_2.voltmeterCaption')} />
      <AmmeterSeries caption={t('ch0_2.ammeterCaption')} />
    </div>
  )
}
