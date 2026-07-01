/**
 * Chapter 3.4 §2 — how one tiny movement covers every range.
 *
 *  • Shunt (top): a small resistor in PARALLEL with the movement carries most
 *    of the current, so only the movement's full-scale current (e.g. 50 µA)
 *    ever flows through the coil → the meter reads amps.
 *  • Multiplier (bottom): a large resistor in SERIES with the movement drops
 *    almost all the voltage, so only full-scale current flows → the meter
 *    reads volts.
 *
 * Composed entirely from @/lib/circuit primitives (zero hand-drawn SVG).
 * Every <Wire> starts and ends on a component pin (or a far terminal stub);
 * the parallel-branch jogs are intermediate bends, not endpoints. The math
 * designators (shunt, multiplier and full-scale-current symbols) are
 * introduced in the prose; the schematic labels stay plain to keep the SVG
 * legible.
 */
import { useTranslation } from 'react-i18next'
import {
  Circuit, Wire, Junction, Resistor, Meter,
  meterPins, pins2, TerminalLabel,
} from '@/lib/circuit'

// Wide enough that the long UA labels («вимірювальний механізм» ≈ 169 px,
// «додатковий резистор» ≈ 146 px) sit side by side without overlapping.
const W = 470

/* ── Shunt (current range) ───────────────────────────────────────────── */
const S_ROW = 64 // movement row
const S_BOT = 120 // shunt-resistor row
const S_CX = 235 // centred
const sMtr = meterPins(S_CX, S_ROW) // p1=(215,64), p2=(255,64)
const sRes = pins2(S_CX, S_BOT)     // p1=(205,120), p2=(265,120)

/* ── Multiplier (voltage range) ──────────────────────────────────────── */
const M_ROW = 66
const mMtr = meterPins(140, M_ROW) // p1=(120,66), p2=(160,66)
const mRes = pins2(330, M_ROW)     // p1=(300,66), p2=(360,66)

function ShuntCircuit({ caption }: { caption: string }) {
  const { t } = useTranslation('ui')
  return (
    <Circuit width={W} height={170} maxWidth={W} caption={caption}>
      {/* movement on the top row, terminals left & right */}
      <Wire points={[{ x: 90, y: S_ROW }, sMtr.p1]} />
      <Wire points={[sMtr.p2, { x: 380, y: S_ROW }]} />
      {/* shunt resistor hangs in parallel below — drops land on its pins */}
      <Wire points={[sMtr.p1, { x: sMtr.p1.x, y: S_BOT }, sRes.p1]} />
      <Wire points={[sMtr.p2, { x: sMtr.p2.x, y: S_BOT }, sRes.p2]} />

      <Meter x={S_CX} y={S_ROW} letter="G" />
      <Resistor x={S_CX} y={S_BOT} orient="right" />

      {/* T-junctions: meter pin + terminal + shunt drop (3 conductors) */}
      <Junction x={sMtr.p1.x} y={sMtr.p1.y} />
      <Junction x={sMtr.p2.x} y={sMtr.p2.y} />

      <TerminalLabel x={S_CX} y={S_ROW - 34} anchor="middle">{t('ch3_4.shuntMult.movement')}</TerminalLabel>
      <TerminalLabel x={S_CX} y={S_BOT + 30} anchor="middle">{t('ch3_4.shuntMult.shunt')}</TerminalLabel>
      <TerminalLabel x={86} y={S_ROW - 12} anchor="start">{t('ch3_4.shuntMult.current')}</TerminalLabel>
    </Circuit>
  )
}

function MultiplierCircuit({ caption }: { caption: string }) {
  const { t } = useTranslation('ui')
  return (
    <Circuit width={W} height={150} maxWidth={W} caption={caption}>
      <Wire points={[{ x: 60, y: M_ROW }, mMtr.p1]} />
      <Wire points={[mMtr.p2, mRes.p1]} />
      <Wire points={[mRes.p2, { x: 410, y: M_ROW }]} />

      <Meter x={140} y={M_ROW} letter="G" />
      <Resistor x={330} y={M_ROW} orient="right" />

      <TerminalLabel x={140} y={M_ROW - 34} anchor="middle">{t('ch3_4.shuntMult.movement')}</TerminalLabel>
      <TerminalLabel x={330} y={M_ROW - 34} anchor="middle">{t('ch3_4.shuntMult.multiplier')}</TerminalLabel>
      <TerminalLabel x={235} y={M_ROW + 36} anchor="middle">{t('ch3_4.shuntMult.voltage')}</TerminalLabel>
    </Circuit>
  )
}

export default function ShuntMultiplierSchematic() {
  const { t } = useTranslation('ui')
  return (
    <div className="my-8 flex flex-col gap-6 not-prose">
      <ShuntCircuit caption={t('ch3_4.shuntMult.shuntCaption')} />
      <MultiplierCircuit caption={t('ch3_4.shuntMult.multCaption')} />
    </div>
  )
}
