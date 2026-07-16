/**
 * Chapter 4.2 hero — interference and its cure, in one frame.
 *
 * Left: a transmitter whose radiated energy (primary accent) spills outward as
 * concentric arcs. Right: a neighbour's TV showing the classic herringbone /
 * roll-bar disturbance of RFI — with a ferrite bead clamped on its cable, the
 * chapter's signature cure. Frames the whole chapter: source → path → victim,
 * and the tools that break the link. Distinct from the §1 triad block diagram,
 * which labels the model explicitly.
 *
 * Static line illustration, `currentColor` so it follows the theme; the one
 * primary accent is the radiated (interfering) field.
 *
 * hardcoded-fontsize-file-ok: hero illustration, no readable text labels
 * (aria-label only); the geometry is hand-tuned in user-space units.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 580
const VB_H = 206

// Radiation centre (near the antenna) and the concentric emission arcs.
const CX = 62
const CY = 80
// span ±40° about horizontal-right; cos40≈0.766, sin40≈0.643
const ARC_C = 0.766
const ARC_S = 0.643
const ARCS = [
  { r: 26, w: 2.2, o: 0.9 },
  { r: 44, w: 1.8, o: 0.68 },
  { r: 62, w: 1.6, o: 0.5 },
  { r: 80, w: 1.4, o: 0.36 },
]

/** One emission arc, bulging to the right, centred on the antenna. */
function arcPath(r: number): string {
  const tx = CX + r * ARC_C
  const ty = CY - r * ARC_S
  const bx = CX + r * ARC_C
  const by = CY + r * ARC_S
  return `M ${tx.toFixed(1)} ${ty.toFixed(1)} A ${r} ${r} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}`
}

/** Diagonal herringbone lines inside the TV screen (the RFI pattern). */
function herringbone(x0: number, y0: number, w: number, h: number): string {
  let d = ''
  for (let off = -h; off < w; off += 11) {
    const sx = x0 + off
    d += `M ${sx} ${y0 + h} L ${sx + h} ${y0} `
  }
  return d.trim()
}

export default function Ch4_2Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch4_2.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Transmitter (source) ── */}
      {/* rig */}
      <rect x={40} y={130} width={46} height={30} rx={3} stroke="currentColor" strokeWidth="1.6" opacity={0.85} />
      <circle cx={53} cy={145} r={5} stroke="currentColor" strokeWidth="1.4" opacity={0.7} />
      <line x1={70} y1={140} x2={80} y2={140} stroke="currentColor" strokeWidth="1.4" opacity={0.6} />
      <line x1={70} y1={146} x2={80} y2={146} stroke="currentColor" strokeWidth="1.4" opacity={0.6} />
      <line x1={70} y1={152} x2={80} y2={152} stroke="currentColor" strokeWidth="1.4" opacity={0.6} />
      {/* whip antenna */}
      <line x1={62} y1={130} x2={62} y2={46} stroke="currentColor" strokeWidth="1.8" opacity={0.85} />
      <circle cx={62} cy={44} r={3} fill="currentColor" opacity={0.85} />
      {/* shelf */}
      <line x1={34} y1={162} x2={92} y2={162} stroke="currentColor" strokeWidth="1.2" opacity={0.4} />

      {/* ── Radiated (interfering) field — the one primary accent ── */}
      {ARCS.map(a => (
        <path key={a.r} d={arcPath(a.r)} stroke="hsl(var(--primary))" strokeWidth={a.w} opacity={a.o} strokeLinecap="round" />
      ))}
      {/* travel toward the victim */}
      <line x1={150} y1={80} x2={430} y2={62} stroke="hsl(var(--primary))" strokeWidth="1.4" strokeDasharray="2 7" opacity={0.5} strokeLinecap="round" />
      {/* RFI striking the aerial — a small primary zap */}
      <path d="M 452 40 l -10 12 l 6 1 l -8 12" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />

      {/* ── Victim TV ── */}
      {/* rabbit-ear aerial */}
      <line x1={472} y1={64} x2={450} y2={38} stroke="currentColor" strokeWidth="1.6" opacity={0.8} />
      <line x1={472} y1={64} x2={502} y2={34} stroke="currentColor" strokeWidth="1.6" opacity={0.8} />
      <circle cx={450} cy={38} r={2.4} fill="currentColor" opacity={0.8} />
      <circle cx={502} cy={34} r={2.4} fill="currentColor" opacity={0.8} />
      {/* bezel */}
      <rect x={406} y={64} width={132} height={96} rx={8} stroke="currentColor" strokeWidth="1.8" fill="hsl(var(--muted))" fillOpacity={0.4} />
      {/* screen */}
      <rect x={418} y={76} width={108} height={64} rx={3} stroke="currentColor" strokeWidth="1.2" opacity={0.75} />
      {/* herringbone + roll bars (the RFI pattern) — clipped to the screen */}
      <clipPath id="ch42-hero-screen">
        <rect x={418} y={76} width={108} height={64} rx={3} />
      </clipPath>
      <g clipPath="url(#ch42-hero-screen)">
        <path d={herringbone(418, 76, 108, 64)} stroke="currentColor" strokeWidth="1.2" opacity={0.4} />
        <rect x={418} y={92} width={108} height={7} fill="currentColor" opacity={0.14} />
        <rect x={418} y={118} width={108} height={7} fill="currentColor" opacity={0.14} />
      </g>
      {/* stand */}
      <line x1={458} y1={160} x2={452} y2={176} stroke="currentColor" strokeWidth="1.6" opacity={0.8} />
      <line x1={486} y1={160} x2={492} y2={176} stroke="currentColor" strokeWidth="1.6" opacity={0.8} />
      <line x1={440} y1={176} x2={504} y2={176} stroke="currentColor" strokeWidth="1.6" opacity={0.8} />
    </svg>
  )
}
