/**
 * Chapter 3.4 §2 — the face of an analog (moving-coil) meter.
 *
 * Two scales share one needle:
 *   • inner arc — the LINEAR volts/amps scale: 0 on the left, full-scale on
 *     the right, ticks evenly spaced (deflection ∝ current through the coil).
 *   • outer arc — the REVERSED, non-linear ohms scale: 0 Ω on the right
 *     (shorted leads → full deflection), ∞ on the left (open leads → no
 *     deflection). Ticks crowd toward the ∞ end because deflection ∝ 1/R.
 * A thin mirror band under the needle teaches parallax: line the needle up
 * with its reflection to read straight-on.
 *
 * Illustrative instrument artwork (currentColor → theme-aware). Not a
 * schematic — the shunt/multiplier wiring lives in ShuntMultiplierSchematic.
 *
 * hardcoded-fontsize-file-ok: gauge-face illustration with hand-tuned label
 * sizes in user-space units; no SVGDiagram scaling wrapper in this file.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'

const VB_W = 460
const VB_H = 276
const SANS = 'ui-sans-serif, system-ui, sans-serif'

const CX = 230
const CY = 200 // pivot near the bottom
const R_OHM = 142 // outer (ohms) arc radius
const R_LIN = 110 // inner (linear V/A) arc radius
const A0 = 210 // left end of the arc (degrees, screen coords)
const A1 = 330 // right end

/** angle (deg) for a scale fraction u∈[0,1] (0 = left end, 1 = right end). */
function ang(u: number): number {
  return A0 + (A1 - A0) * u
}
function px(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}
function arcPath(r: number, u0: number, u1: number): string {
  const [x0, y0] = px(r, ang(u0))
  const [x1, y1] = px(r, ang(u1))
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

// Ohmmeter deflection fraction for a resistance R with mid-scale Rmid:
//   f = Rmid / (Rmid + R)   → R=0 ⇒ f=1 (right), R=∞ ⇒ f=0 (left)
const RMID = 20
// The 1 kΩ tick keeps its mark but drops its number: this near-∞ end is where
// the ohms scale crowds, so its labels would collide — which is the lesson.
const OHM_TICKS = [
  { r: 0, label: '0' },
  { r: 10, label: '10' },
  { r: 20, label: '20' },
  { r: 50, label: '50' },
  { r: 200, label: '200' },
  { r: 1000, label: '' },
  { r: Infinity, label: '∞' },
]
const ohmU = (r: number) => (r === Infinity ? 0 : RMID / (RMID + r))

// Linear V/A scale — six evenly spaced ticks.
const LIN_TICKS = [0, 2, 4, 6, 8, 10]

const NEEDLE_U = 0.5 // points straight up, between the "4" and "6" tick labels

export default function AnalogMeterDiagram() {
  const { t } = useTranslation('ui')
  const [nx, ny] = px(R_LIN - 6, ang(NEEDLE_U))

  return (
    <DiagramFigure caption={t('ch3_4.analogMeter.caption')}>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width={VB_W}
          height={VB_H}
          role="img"
          aria-label={t('ch3_4.analogMeter.aria')}
          style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* meter body */}
          <rect x={24} y={22} width={VB_W - 48} height={VB_H - 40} rx={10} stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" />

          {/* ── outer ohms arc (reversed, non-linear) ───────────────── */}
          <path d={arcPath(R_OHM, 0, 1)} stroke="hsl(var(--callout-caution))" strokeWidth={2.4} fill="none" />
          {OHM_TICKS.map(({ r, label }) => {
            const u = ohmU(r)
            const [x1, y1] = px(R_OHM, ang(u))
            const [x2, y2] = px(R_OHM - 11, ang(u))
            const [lx, ly] = px(R_OHM + 17, ang(u))
            return (
              <g key={`o${label}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--callout-caution))" strokeWidth={1.6} />
                {label && <text x={lx} y={ly + 4} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.85} fontFamily={SANS}>{label}</text>}
              </g>
            )
          })}

          {/* ── inner linear V/A arc ─────────────────────────────────── */}
          <path d={arcPath(R_LIN, 0, 1)} stroke="hsl(var(--primary))" strokeWidth={2.4} fill="none" />
          {LIN_TICKS.map((v, i) => {
            const u = i / (LIN_TICKS.length - 1)
            const [x1, y1] = px(R_LIN, ang(u))
            const [x2, y2] = px(R_LIN + 11, ang(u))
            const [lx, ly] = px(R_LIN - 14, ang(u))
            return (
              <g key={`l${v}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--primary))" strokeWidth={1.6} />
                <text x={lx} y={ly + 4} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.85} fontFamily={SANS}>{v}</text>
              </g>
            )
          })}

          {/* ── mirror band (parallax aid) ───────────────────────────── */}
          <path d={arcPath(R_LIN - 22, 0.18, 0.82)} stroke="currentColor" strokeWidth={6} opacity={0.12} fill="none" strokeLinecap="round" />

          {/* ── needle + pivot ───────────────────────────────────────── */}
          <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="hsl(var(--foreground))" strokeWidth={2.6} strokeLinecap="round" />
          <circle cx={CX} cy={CY} r={5} fill="currentColor" />

          {/* ── scale identity labels — stacked below the pivot, clear of
                the needle (which sweeps above the pivot) ──────────────── */}
          <text x={CX} y={CY + 26} fontSize="13" textAnchor="middle" fill="hsl(var(--callout-caution))" fontWeight={600} fontFamily={SANS}>{t('ch3_4.analogMeter.ohmsScale')}</text>
          <text x={CX} y={CY + 44} fontSize="13" textAnchor="middle" fill="hsl(var(--primary))" fontWeight={600} fontFamily={SANS}>{t('ch3_4.analogMeter.linScale')}</text>

          {/* ── reversed-direction hint at the two ohms ends ─────────── */}
          <text x={48} y={CY + 8} fontSize="13" textAnchor="start" fill="currentColor" opacity={0.7} fontFamily={SANS}>{t('ch3_4.analogMeter.openLeads')}</text>
          <text x={VB_W - 48} y={CY + 8} fontSize="13" textAnchor="end" fill="currentColor" opacity={0.7} fontFamily={SANS}>{t('ch3_4.analogMeter.shortLeads')}</text>
        </svg>
      </div>
    </DiagramFigure>
  )
}
