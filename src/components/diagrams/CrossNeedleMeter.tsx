/**
 * Chapter 3.4 §3 — the cross-needle SWR / power meter, as the reader sees it.
 *
 * Two needles share one face: one swings up from the bottom-left with the
 * FORWARD power, the other up from the bottom-right with the REFLECTED power.
 * A family of printed curves marks constant SWR; wherever the two needles
 * cross, the curve through that point is the SWR. No switching, no two-step
 * "set FWD then read REF" — both powers and the SWR at a glance.
 *
 * Illustrative instrument artwork (currentColor → theme-aware), not a
 * schematic; the coupler internals are described in the prose.
 *
 * hardcoded-fontsize-file-ok: meter-face illustration with hand-tuned label
 * sizes in user-space units; no SVGDiagram scaling wrapper in this file.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'

const VB_W = 460
const VB_H = 268
const SANS = 'ui-sans-serif, system-ui, sans-serif'

// needle pivots
const LP: [number, number] = [60, 214] // forward pivot (bottom-left)
const RP: [number, number] = [400, 214] // reflected pivot (bottom-right)
// needle tips (chosen so the two needles visibly cross near the "2" curve)
const FTIP: [number, number] = [245, 84]
const RTIP: [number, number] = [225, 84]
// precomputed intersection of the two needles (see chapter notes): (234.7, 91.1)
const CROSS: [number, number] = [234.7, 91.1]

// SWR curves: arcs of circles sharing a centre well below the face.
const ARC_C: [number, number] = [235, 420]
function arc(r: number): string {
  const a0 = (250 * Math.PI) / 180
  const a1 = (290 * Math.PI) / 180
  const x0 = ARC_C[0] + r * Math.cos(a0)
  const y0 = ARC_C[1] + r * Math.sin(a0)
  const x1 = ARC_C[0] + r * Math.cos(a1)
  const y1 = ARC_C[1] + r * Math.sin(a1)
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}
const SWR_ARCS = [
  { r: 300, key: 'swrLo' },
  { r: 330, key: 'swrMid' },
  { r: 360, key: 'swrHi' },
] as const

export default function CrossNeedleMeter() {
  const { t } = useTranslation('ui')
  return (
    <DiagramFigure caption={t('ch3_4.crossNeedle.caption')}>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width={VB_W}
          height={VB_H}
          role="img"
          aria-label={t('ch3_4.crossNeedle.aria')}
          style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* meter body */}
          <rect x={24} y={24} width={VB_W - 48} height={VB_H - 44} rx={10} stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" />

          {/* ── SWR curves ───────────────────────────────────────────── */}
          {SWR_ARCS.map(({ r, key }) => (
            <g key={key}>
              <path d={arc(r)} stroke="currentColor" strokeWidth={1.4} opacity={0.45} fill="none" />
              {/* numbers parked on the LEFT shoulder of each curve, clear of the crossing-point callout on the right */}
              <text x={ARC_C[0] - 92} y={ARC_C[1] - r + 4} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.7} fontFamily={SANS}>{t(`ch3_4.crossNeedle.${key}`)}</text>
            </g>
          ))}
          <text x={ARC_C[0]} y={ARC_C[1] - 360 - 8} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.75} fontWeight={600} fontFamily={SANS}>{t('ch3_4.crossNeedle.swrLabel')}</text>

          {/* ── needles ──────────────────────────────────────────────── */}
          <line x1={LP[0]} y1={LP[1]} x2={FTIP[0]} y2={FTIP[1]} stroke="hsl(var(--primary))" strokeWidth={2.6} strokeLinecap="round" />
          <line x1={RP[0]} y1={RP[1]} x2={RTIP[0]} y2={RTIP[1]} stroke="hsl(var(--callout-caution))" strokeWidth={2.6} strokeLinecap="round" />
          <circle cx={LP[0]} cy={LP[1]} r={5} fill="currentColor" />
          <circle cx={RP[0]} cy={RP[1]} r={5} fill="currentColor" />

          {/* ── crossing point ───────────────────────────────────────── */}
          <circle cx={CROSS[0]} cy={CROSS[1]} r={5} fill="hsl(var(--foreground))" stroke="hsl(var(--background))" strokeWidth={1.5} />

          {/* ── needle identity labels — in the bottom strip, below the
                pivots so the needles (which sweep upward) never cross them ── */}
          <text x={64} y={238} fontSize="13" textAnchor="start" fill="hsl(var(--primary))" fontWeight={600} fontFamily={SANS}>{t('ch3_4.crossNeedle.forward')}</text>
          <text x={396} y={238} fontSize="13" textAnchor="end" fill="hsl(var(--callout-caution))" fontWeight={600} fontFamily={SANS}>{t('ch3_4.crossNeedle.reflected')}</text>
          {/* callout sits above the crossing dot, clear of both needle tips (y≈84) */}
          <text x={CROSS[0] + 26} y={CROSS[1] - 16} fontSize="13" textAnchor="start" fill="currentColor" opacity={0.8} fontFamily={SANS}>{t('ch3_4.crossNeedle.readHere')}</text>
        </svg>
      </div>
    </DiagramFigure>
  )
}
