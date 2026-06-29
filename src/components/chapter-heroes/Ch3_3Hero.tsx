/**
 * Chapter 3.3 hero — the antenna system, at a glance.
 *
 * A centre-fed half-wave dipole launches concentric radio waves into the sky;
 * a coax feedline drops from its centre feed point to a small transceiver. The
 * chapter's three parts in one picture: antenna, feedline, and the rig.
 *
 * The two dipole halves visibly converge into the feedline at the centre (an
 * inverted-Y feed) so the antenna reads as one connected, centre-fed wire — no
 * masts, no stray dots.
 *
 * Static pen-and-ink illustration (currentColor so it tracks the theme); the
 * interactive widgets do the moving parts.
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label sizes in
 * user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 560
const VB_H = 206
const SANS = 'ui-sans-serif, system-ui, sans-serif'

const DIP_Y = 92 // height of the dipole wire
const CX = 280 // centre / feed point
const FEED_Y = 108 // where the inverted-Y meets the vertical feedline

/** A circular arc segment between two angles (degrees, screen coords). */
function arcPath(cx: number, cy: number, r: number, a0deg: number, a1deg: number): string {
  const a0 = (a0deg * Math.PI) / 180
  const a1 = (a1deg * Math.PI) / 180
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const large = Math.abs(a1deg - a0deg) > 180 ? 1 : 0
  const sweep = a1deg > a0deg ? 1 : 0
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

export default function Ch3_3Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch3_3.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── radiating waves (on the air), centred above the feed point ── */}
      {[[26, 0.95, 2.4], [42, 0.62, 2.1], [58, 0.4, 1.9]].map(([r, op, sw], i) => (
        <path key={i} d={arcPath(CX, DIP_Y, r as number, 200, 340)} stroke="hsl(var(--primary))" strokeWidth={sw as number} opacity={op as number} strokeLinecap="round" />
      ))}

      {/* ── dipole wire: two halves ────────────────────────────────── */}
      <line x1={58} y1={DIP_Y} x2={268} y2={DIP_Y} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <line x1={292} y1={DIP_Y} x2={502} y2={DIP_Y} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />

      {/* ── inverted-Y feed: both halves converge into the feedline ──── */}
      <line x1={268} y1={DIP_Y} x2={CX} y2={FEED_Y} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1={292} y1={DIP_Y} x2={CX} y2={FEED_Y} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      {/* ── coax feedline down to the rig ──────────────────────────── */}
      <line x1={CX} y1={FEED_Y} x2={CX} y2={150} stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />

      {/* ── transceiver ────────────────────────────────────────────── */}
      <rect x={244} y={150} width={72} height={34} rx={5} stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" />
      <circle cx={262} cy={167} r={8} stroke="currentColor" strokeWidth={1.6} fill="none" />
      <line x1={262} y1={167} x2={266} y2={162} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={296} cy={160} r={2.4} fill="currentColor" />
      <circle cx={296} cy={174} r={2.4} fill="currentColor" />
      {/* faint desk line under the rig */}
      <line x1={228} y1={188} x2={332} y2={188} stroke="currentColor" strokeWidth={1.2} opacity={0.4} />

      {/* ── labels ─────────────────────────────────────────────────── */}
      <text x={160} y={80} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily={SANS}>
        {t('ch3_3.hero.dipole')}
      </text>
      <text x={298} y={132} fontSize="13" textAnchor="start" fill="currentColor" opacity={0.75} fontFamily={SANS}>
        {t('ch3_3.hero.feedline')}
      </text>
      <text x={372} y={48} fontSize="13" textAnchor="start" fill="hsl(var(--primary))" fontFamily={SANS}>
        {t('ch3_3.hero.onAir')}
      </text>
    </svg>
  )
}
