/**
 * Chapter 3.3 §4 — the same power, shaped three ways.
 *
 *   isotropic (uniform circle)  ·  dipole (broadside figure-of-eight)
 *   ·  Yagi (one forward lobe + small back lobe)
 *
 * Polar plots. The dipole and Yagi curves are wrapped in a clipPath (plotted-
 * curve rule); the isotropic circle is a plain <circle>. All readable text sits
 * outside the lobes so the diagram-text-overlap test stays green.
 *
 * hardcoded-fontsize-file-ok: standalone illustration with hand-tuned label
 * sizes in user-space units. No SVGDiagram wrapper.
 */
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 660
const VB_H = 268
const CY = 104
const R = 60
const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** Build a closed polar path from r(φ); φ=0 points right (east), CCW positive. */
function polar(cx: number, rFn: (phi: number) => number): string {
  const N = 200
  let d = ''
  for (let i = 0; i <= N; i++) {
    const phi = (i / N) * 2 * Math.PI
    const r = rFn(phi)
    const x = cx + r * Math.cos(phi)
    const y = CY - r * Math.sin(phi)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `
  }
  return `${d.trim()} Z`
}

export default function GainPolarPatterns() {
  const { t } = useTranslation('ui')
  const clipId = useId()

  const dipole = polar(330, phi => R * Math.abs(Math.sin(phi)))
  const yagi = polar(550, phi => {
    const fwd = R * Math.pow(Math.max(0, Math.cos(phi)), 0.7)
    const back = 0.14 * R * Math.max(0, -Math.cos(phi))
    return fwd + back
  })

  const nameProps = { fontSize: '14', fontWeight: 700, textAnchor: 'middle' as const, fill: svgTokens.fg, fontFamily: SANS }
  const traitProps = { fontSize: '13', textAnchor: 'middle' as const, fill: svgTokens.mutedFg, fontFamily: SANS }
  const tinyProps = { fontSize: '12.5', fill: svgTokens.mutedFg, fontFamily: SANS }

  return (
    <DiagramFigure caption={t('ch3_3.gainPatterns.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_3.gainPatterns.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <clipPath id={clipId}>
          <rect x={30} y={28} width={600} height={150} />
        </clipPath>

        {/* dividers */}
        <line x1={220} y1={26} x2={220} y2={186} stroke={svgTokens.border} strokeWidth={1} strokeDasharray="3 5" />
        <line x1={440} y1={26} x2={440} y2={186} stroke={svgTokens.border} strokeWidth={1} strokeDasharray="3 5" />

        {/* centre dots */}
        {[110, 330, 550].map(cx => (
          <circle key={cx} cx={cx} cy={CY} r={2} fill={svgTokens.mutedFg} />
        ))}

        {/* ── Isotropic (cx 110) ───────────────────────────────────── */}
        <circle cx={110} cy={CY} r={R} fill="hsl(var(--primary))" fillOpacity={0.1} stroke={svgTokens.primary} strokeWidth={2} />
        <text x={110} y={210} {...nameProps}>{t('ch3_3.gainPatterns.isoName')}</text>
        <text x={110} y={232} {...traitProps}>{t('ch3_3.gainPatterns.isoTrait')}</text>

        {/* ── Dipole figure-of-eight (cx 330) ──────────────────────── */}
        {/* the wire, along the horizontal (nulls off its ends) */}
        <line x1={300} y1={CY} x2={360} y2={CY} stroke={svgTokens.fg} strokeWidth={2} strokeLinecap="round" />
        <g clipPath={`url(#${clipId})`}>
          <path d={dipole} fill="hsl(var(--primary))" fillOpacity={0.1} stroke={svgTokens.primary} strokeWidth={2} />
        </g>
        <text x={252} y={CY + 4} textAnchor="end" {...tinyProps}>{t('ch3_3.gainPatterns.nullLabel')}</text>
        <text x={408} y={CY + 4} textAnchor="start" {...tinyProps}>{t('ch3_3.gainPatterns.nullLabel')}</text>
        <text x={330} y={210} {...nameProps}>{t('ch3_3.gainPatterns.dipoleName')}</text>
        <text x={330} y={232} {...traitProps}>{t('ch3_3.gainPatterns.dipoleTrait')}</text>

        {/* ── Yagi forward beam (cx 550) ───────────────────────────── */}
        <g clipPath={`url(#${clipId})`}>
          <path d={yagi} fill="hsl(var(--primary))" fillOpacity={0.1} stroke={svgTokens.primary} strokeWidth={2} />
        </g>
        {/* beam arrow above the plot, label well above the arrow */}
        <line x1={544} y1={46} x2={596} y2={46} stroke={svgTokens.primary} strokeWidth={1.8} />
        <path d="M 596 42 L 604 46 L 596 50 Z" fill={svgTokens.primary} />
        <text x={570} y={32} textAnchor="middle" fill={svgTokens.primary} fontSize="12.5" fontFamily={SANS}>{t('ch3_3.gainPatterns.beamLabel')}</text>
        {/* back-lobe callout (lower-left, leader up to the small lobe, label well below) */}
        <line x1={542} y1={112} x2={520} y2={140} stroke={svgTokens.mutedFg} strokeWidth={1} />
        <text x={512} y={172} textAnchor="middle" {...tinyProps}>{t('ch3_3.gainPatterns.backLabel')}</text>
        <text x={550} y={210} {...nameProps}>{t('ch3_3.gainPatterns.yagiName')}</text>
        <text x={550} y={232} {...traitProps}>{t('ch3_3.gainPatterns.yagiTrait')}</text>
      </svg>
    </DiagramFigure>
  )
}
