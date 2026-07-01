/**
 * Chapter 3.4 §5 — the test-bench connection.
 *
 * The transmitter feeds a through-line power/SWR meter into a 50 Ω dummy
 * load, so the rig runs at full power without radiating. A scope probe taps
 * the load to measure the RF voltage (→ power = V_peak² / 100 on 50 Ω).
 *
 * Composed entirely from @/lib/circuit primitives (zero hand-drawn SVG).
 */
import { useTranslation } from 'react-i18next'
import {
  Circuit, Wire, Junction, Resistor, Meter, AcSource,
  TerminalLabel, pins2, meterPins,
} from '@/lib/circuit'

const W = 540
const H = 206
const MID_Y = 108
// Rails sit exactly on the source/load pins (span 60 → ±30) so every wire
// endpoint lands on a pin, not 12 px short of one.
const TOP_Y = MID_Y - 30 // 78
const BOT_Y = MID_Y + 30 // 138
const SCOPE_TOP = 34 // top of the scope-probe lead (leads off-sheet to the label)

const SRC_X = 72
const MTR_X = 215
const LOAD_X = 430

const src = pins2(SRC_X, MID_Y, 'down')   // (72,78) ↔ (72,138)
const mtr = meterPins(MTR_X, TOP_Y)       // (195,78) ↔ (235,78)
const load = pins2(LOAD_X, MID_Y, 'down') // (430,78) ↔ (430,138)

export default function BenchMeasurementSchematic() {
  const { t } = useTranslation('ui')
  return (
    <Circuit width={W} height={H} maxWidth={W} caption={t('ch3_4.bench.caption')}>
      {/* ── top rail: source.p1 → meter → load.p1 ───────────────────── */}
      <Wire points={[src.p1, mtr.p1]} />
      <Wire points={[mtr.p2, load.p1]} />
      {/* ── bottom rail: source.p2 → load.p2 ────────────────────────── */}
      <Wire points={[src.p2, load.p2]} />
      {/* ── scope-probe lead: taps the load, runs off-sheet to the label ─ */}
      <Wire points={[load.p1, { x: LOAD_X, y: SCOPE_TOP }]} />

      {/* ── components ──────────────────────────────────────────────── */}
      <AcSource x={SRC_X} y={MID_Y} orient="down" />
      <Meter x={MTR_X} y={TOP_Y} letter="W" />
      <Resistor x={LOAD_X} y={MID_Y} orient="down" />

      {/* ── junction: top rail + load pin + scope lead (3 conductors) ── */}
      <Junction x={LOAD_X} y={TOP_Y} />

      {/* ── labels ──────────────────────────────────────────────────── */}
      <TerminalLabel x={SRC_X} y={BOT_Y + 26} anchor="middle">{t('ch3_4.bench.transmitter')}</TerminalLabel>
      <TerminalLabel x={MTR_X} y={TOP_Y - 34} anchor="middle">{t('ch3_4.bench.meter')}</TerminalLabel>
      <TerminalLabel x={LOAD_X} y={BOT_Y + 26} anchor="middle">{t('ch3_4.bench.dummyLoad')}</TerminalLabel>
      <TerminalLabel x={LOAD_X} y={SCOPE_TOP - 14} anchor="middle">{t('ch3_4.bench.scope')}</TerminalLabel>
    </Circuit>
  )
}
