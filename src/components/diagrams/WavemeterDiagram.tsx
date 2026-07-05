/**
 * Chapter 3.4 §4 — the absorption wavemeter.
 *
 * Left: the transmitter driving its tank coil. Right: the wavemeter — a coil
 * in parallel with a variable capacitor (the tuned circuit), feeding a diode
 * detector and a meter. Hold the wavemeter coil near the transmitter so the
 * two coils couple loosely; tune the capacitor until the circuit resonates at
 * the transmitter's frequency — the meter peaks, and you read the frequency
 * off the capacitor's calibrated dial.
 *
 * Composed entirely from @/lib/circuit primitives (zero hand-drawn SVG); the
 * loose magnetic coupling is shown by the two coils facing across a gap.
 */
import { useTranslation } from 'react-i18next'
import {
  Circuit, Wire, Junction, Inductor, CapacitorVariable,
  Diode, Meter, AcSource, TerminalLabel, pins2, meterPins,
} from '@/lib/circuit'

const W = 680
const H = 244
const TOP_Y = 58 // wavemeter top rail (node T)
const BOT_Y = 178 // common rail
const MID_Y = (TOP_Y + BOT_Y) / 2 // 118 — coil / cap / source centres

// Transmitter loop (left)
const TXS_X = 72 // AC source
const TXL_X = 152 // transmitter tank coil
const txS = pins2(TXS_X, MID_Y, 'down')
const txL = pins2(TXL_X, MID_Y, 'down')

// Wavemeter (right)
const WL_X = 250 // wavemeter coil
const WC_X = 350 // variable capacitor (tuning)
const DX = 470 // diode detector centre
const MTR_X = 560 // meter
const wL = pins2(WL_X, MID_Y, 'down')
const wC = pins2(WC_X, MID_Y, 'down')
const diode = pins2(DX, TOP_Y, 'right')
const mtr = meterPins(MTR_X, MID_Y, 'down')

export default function WavemeterDiagram() {
  const { t } = useTranslation('ui')
  return (
    <Circuit width={W} height={H} maxWidth={W} caption={t('ch3_4.wavemeter.caption')}>
      {/* ── transmitter loop ─────────────────────────────────────────── */}
      <Wire points={[txS.p1, txL.p1]} />
      <Wire points={[txS.p2, txL.p2]} />

      {/* ── wavemeter coil branch ────────────────────────────────────── */}
      <Wire points={[{ x: WL_X, y: TOP_Y }, wL.p1]} />
      <Wire points={[wL.p2, { x: WL_X, y: BOT_Y }]} />
      {/* ── variable-cap branch ──────────────────────────────────────── */}
      <Wire points={[{ x: WC_X, y: TOP_Y }, wC.p1]} />
      <Wire points={[wC.p2, { x: WC_X, y: BOT_Y }]} />
      {/* ── top rail: coil-top → cap-top → diode anode ───────────────── */}
      <Wire points={[{ x: WL_X, y: TOP_Y }, diode.p1]} />
      {/* ── diode cathode → meter top ────────────────────────────────── */}
      <Wire points={[diode.p2, { x: MTR_X, y: TOP_Y }, mtr.p1]} />
      {/* ── meter bottom → common rail ───────────────────────────────── */}
      <Wire points={[mtr.p2, { x: MTR_X, y: BOT_Y }]} />
      {/* ── common rail ──────────────────────────────────────────────── */}
      <Wire points={[{ x: WL_X, y: BOT_Y }, { x: MTR_X, y: BOT_Y }]} />

      {/* ── components ───────────────────────────────────────────────── */}
      <AcSource x={TXS_X} y={MID_Y} orient="down" />
      <Inductor x={TXL_X} y={MID_Y} orient="down" />
      <Inductor x={WL_X} y={MID_Y} orient="down" />
      <CapacitorVariable x={WC_X} y={MID_Y} orient="down" />
      <Diode x={DX} y={TOP_Y} orient="right" />
      <Meter x={MTR_X} y={MID_Y} orient="down" letter="µA" />

      {/* ── junction dots (3+ conductors) ────────────────────────────── */}
      <Junction x={WC_X} y={TOP_Y} />
      <Junction x={WC_X} y={BOT_Y} />

      {/* ── labels ───────────────────────────────────────────────────── */}
      <TerminalLabel x={112} y={TOP_Y + 2} anchor="middle">{t('ch3_4.wavemeter.transmitter')}</TerminalLabel>
      <TerminalLabel x={201} y={MID_Y + 4} anchor="middle">{t('ch3_4.wavemeter.coupling')}</TerminalLabel>
      <TerminalLabel x={WC_X + 18} y={MID_Y + 4} anchor="start">{t('ch3_4.wavemeter.tuning')}</TerminalLabel>
      <TerminalLabel x={DX} y={TOP_Y - 28} anchor="middle">{t('ch3_4.wavemeter.detector')}</TerminalLabel>
      <TerminalLabel x={MTR_X} y={BOT_Y + 22} anchor="middle">{t('ch3_4.wavemeter.peak')}</TerminalLabel>
    </Circuit>
  )
}
