/**
 * Chapter 3.1 lab — the detector (crystal) radio the reader actually builds.
 *
 * Topology (left → right):
 *   - Antenna taps LOW on the coil (≈ turn 10 from the earth end) so it
 *     couples lightly and keeps the tank sharp. The coil is two inductor
 *     sections joined by a short link; the antenna taps that link.
 *   - The coil sits in parallel with the variable capacitor → the tuned
 *     circuit, bottom = earth rail, top = node T.
 *   - From T a germanium diode (the detector) feeds node A.
 *   - The earpiece and the 1 nF smoothing capacitor hang from A in
 *     parallel, both returning to the earth rail.
 *   - One Ground taps the earth rail near the coil's foot.
 *
 * Label rules (learned the hard way — see circuit-schematics.md):
 *   - Each label sits NEXT TO the component it names: above horizontal
 *     parts (antenna, diode), to the RIGHT of vertical branches (variable
 *     cap, earpiece, smoothing cap) at the component's own height, below
 *     the Ground symbol. Never parked in a row under the whole schematic.
 *   - Components are spread so each right-side label clears the next
 *     symbol. viewBox is sized to FILL the lab card, not a narrow strip.
 *   - Bottom padding leaves clear room for the «земля» label.
 *
 * Composed entirely from @/lib/circuit primitives (zero hand-drawn SVG).
 * The Speaker + CapacitorVariable primitives were added for this schematic.
 * Every junction dot is a 3-conductor wire convergence.
 */
import { useTranslation } from 'react-i18next'
import {
  Circuit,
  Wire,
  Junction,
  Inductor,
  CapacitorVariable,
  Capacitor,
  Diode,
  Antenna,
  Speaker,
  Ground,
  TerminalLabel,
  pins2,
} from '@/lib/circuit'

const SCHEMATIC_W = 690
const SCHEMATIC_H = 230

const TOP_Y = 53 // top rail = tank top (node T)
const BOT_Y = 177 // bottom rail = common earth
const MID_Y = 115 // centre of the vertical branches; also the antenna tap
const TAP_Y = MID_Y

const ANT_X = 65
const COIL_X = 150
const CVAR_X = 250
const DX = 400 // diode centre (anode 370, cathode 430) — sits right of the «налаштування» label
const EAR_X = 510
const CCAP_X = 620
const GND_X = 215 // ground taps the earth rail just right of the coil foot

// Coil = two inductor sections linked by a short wire; antenna taps the link.
const lUp = pins2(COIL_X, 83, 'down') // (COIL_X,53=T) ↔ (COIL_X,113)
const lLow = pins2(COIL_X, 147, 'down') // (COIL_X,117) ↔ (COIL_X,177)
const cvar = pins2(CVAR_X, MID_Y, 'down') // (CVAR_X,85) ↔ (CVAR_X,145)
const diode = pins2(DX, TOP_Y, 'right') // (370,53) ↔ (430,53)
const ear = pins2(EAR_X, MID_Y, 'down')
const ccap = pins2(CCAP_X, MID_Y, 'down')
const antPin = { x: ANT_X, y: TOP_Y + 30 } // Antenna orient='right' (aerial up) → pin at (x, y+30) = (65,83)

export default function CrystalRadioSchematic() {
  const { t } = useTranslation('ui')
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={SCHEMATIC_W}
      caption={t('ch3_1.labSchematic.caption')}
    >
      {/* ── Top rail: coil-top (T) → Cvar tap → diode anode ─────────── */}
      <Wire points={[lUp.p1, diode.p1]} />
      {/* diode cathode (A) → earpiece tap → Ccap tap ─────────────────── */}
      <Wire points={[diode.p2, { x: CCAP_X, y: TOP_Y }]} />

      {/* ── Coil: short link between the two sections (antenna taps it) ─ */}
      <Wire points={[lUp.p2, lLow.p1]} />

      {/* ── Variable-cap branch ───────────────────────────────────── */}
      <Wire points={[{ x: CVAR_X, y: TOP_Y }, cvar.p1]} />
      <Wire points={[cvar.p2, { x: CVAR_X, y: BOT_Y }]} />

      {/* ── Earpiece branch ───────────────────────────────────────── */}
      <Wire points={[{ x: EAR_X, y: TOP_Y }, ear.p1]} />
      <Wire points={[ear.p2, { x: EAR_X, y: BOT_Y }]} />

      {/* ── Smoothing-cap branch ──────────────────────────────────── */}
      <Wire points={[{ x: CCAP_X, y: TOP_Y }, ccap.p1]} />
      <Wire points={[ccap.p2, { x: CCAP_X, y: BOT_Y }]} />

      {/* ── Bottom (earth) rail ───────────────────────────────────── */}
      <Wire points={[lLow.p2, { x: CCAP_X, y: BOT_Y }]} />

      {/* ── Antenna down-and-across to the coil tap (mid-link point) ── */}
      {/* wire-pin-alignment-ok: the antenna ends on the coil link between the two sections, not at a component pin */}
      <Wire points={[antPin, { x: ANT_X, y: TAP_Y }, { x: COIL_X, y: TAP_Y }]} />

      {/* ── Ground drop tapping the earth rail ────────────────────── */}
      <Wire points={[{ x: GND_X, y: BOT_Y }, { x: GND_X, y: BOT_Y + 4 }]} />

      {/* ── Components ────────────────────────────────────────────── */}
      <Inductor x={COIL_X} y={83} orient="down" />
      <Inductor x={COIL_X} y={147} orient="down" />
      <CapacitorVariable x={CVAR_X} y={MID_Y} orient="down" />
      <Diode x={DX} y={TOP_Y} orient="right" />
      <Speaker x={EAR_X} y={MID_Y} orient="down" />
      <Capacitor x={CCAP_X} y={MID_Y} orient="down" />
      <Antenna x={ANT_X} y={TOP_Y} orient="right" />
      <Ground x={GND_X} y={BOT_Y + 14} orient="right" />

      {/* ── Junction dots (3+ conductors) ─────────────────────────── */}
      <Junction x={COIL_X} y={TAP_Y} />
      <Junction x={CVAR_X} y={TOP_Y} />
      <Junction x={EAR_X} y={TOP_Y} />
      <Junction x={CVAR_X} y={BOT_Y} />
      <Junction x={EAR_X} y={BOT_Y} />
      <Junction x={GND_X} y={BOT_Y} />

      {/* ── Labels — each next to the component it names ───────────── */}
      <TerminalLabel x={ANT_X} y={TOP_Y - 35} anchor="middle">
        {t('ch3_1.labSchematic.antenna')}
      </TerminalLabel>
      <TerminalLabel x={DX} y={TOP_Y - 18} anchor="middle">
        {t('ch3_1.labSchematic.detector')}
      </TerminalLabel>
      <TerminalLabel x={COIL_X + 16} y={80} anchor="start">
        {t('ch3_1.labSchematic.coil')}
      </TerminalLabel>
      <TerminalLabel x={COIL_X + 16} y={TAP_Y + 5} anchor="start">
        {t('ch3_1.labSchematic.tap')}
      </TerminalLabel>
      {/* right of the variable cap, at its own height */}
      <TerminalLabel x={CVAR_X + 22} y={MID_Y + 4} anchor="start">
        {t('ch3_1.labSchematic.tuning')}
      </TerminalLabel>
      {/* right of the earpiece */}
      <TerminalLabel x={EAR_X + 20} y={MID_Y + 4} anchor="start">
        {t('ch3_1.labSchematic.earpiece')}
      </TerminalLabel>
      {/* right of the smoothing cap */}
      <TerminalLabel x={CCAP_X + 16} y={MID_Y + 4} anchor="start">
        {t('ch3_1.labSchematic.smoothCap')}
      </TerminalLabel>
      {/* under the ground symbol */}
      <TerminalLabel x={GND_X} y={BOT_Y + 42} anchor="middle">
        {t('ch3_1.labSchematic.ground')}
      </TerminalLabel>
    </Circuit>
  )
}
