/**
 * Chapter 3.3 §5 — the two feedline families in cross-section.
 *
 *   coax: centre conductor inside dielectric inside shield inside jacket
 *   balanced line: two conductors with the field in the open gap between them
 *
 * Static illustration. Callout labels sit clear of the conductors with short
 * leaders so the diagram-text-overlap test stays green.
 *
 * hardcoded-fontsize-file-ok: standalone illustration with hand-tuned label
 * sizes in user-space units. No SVGDiagram wrapper.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 620
const VB_H = 292
const CY = 138
const SANS = 'ui-sans-serif, system-ui, sans-serif'

export default function CoaxVsTwinLead() {
  const { t } = useTranslation('ui')

  const lead = { fontSize: '12.5', fill: svgTokens.mutedFg, fontFamily: SANS }
  const nameProps = { fontSize: '14', fontWeight: 700, textAnchor: 'middle' as const, fill: svgTokens.fg, fontFamily: SANS }
  const zProps = { fontSize: '13', fontWeight: 600, textAnchor: 'middle' as const, fill: svgTokens.primary, fontFamily: SANS }

  const CX = 178

  return (
    <DiagramFigure caption={t('ch3_3.coaxLines.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_3.coaxLines.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1={300} y1={26} x2={300} y2={244} stroke={svgTokens.border} strokeWidth={1} strokeDasharray="3 5" />

        {/* ── Coax cross-section (cx 150) ──────────────────────────── */}
        <circle cx={CX} cy={CY} r={58} fill="hsl(var(--muted))" stroke={svgTokens.border} strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={46} fill="none" stroke={svgTokens.primary} strokeWidth={3} />
        <circle cx={CX} cy={CY} r={34} fill="hsl(var(--background))" stroke={svgTokens.border} strokeWidth={1} />
        <circle cx={CX} cy={CY} r={6} fill={svgTokens.fg} />

        {/* leaders + labels (fanned to distinct angles on the left) */}
        <line x1={149} y1={90} x2={94} y2={90} stroke={svgTokens.mutedFg} strokeWidth={1} />
        <text x={88} y={94} textAnchor="end" {...lead}>{t('ch3_3.coaxLines.jacketLabel')}</text>
        <line x1={138} y1={116} x2={94} y2={116} stroke={svgTokens.mutedFg} strokeWidth={1} />
        <text x={88} y={120} textAnchor="end" {...lead}>{t('ch3_3.coaxLines.shieldLabel')}</text>
        <line x1={149} y1={158} x2={94} y2={158} stroke={svgTokens.mutedFg} strokeWidth={1} />
        <text x={88} y={162} textAnchor="end" {...lead}>{t('ch3_3.coaxLines.dielLabel')}</text>
        {/* centre conductor — leader straight down, label below the jacket */}
        <line x1={CX} y1={CY} x2={CX} y2={206} stroke={svgTokens.mutedFg} strokeWidth={1} />
        <text x={CX} y={220} textAnchor="middle" {...lead}>{t('ch3_3.coaxLines.centerLabel')}</text>

        <text x={CX} y={250} {...nameProps}>{t('ch3_3.coaxLines.coaxName')}</text>
        <text x={CX} y={272} {...zProps}>{t('ch3_3.coaxLines.coaxZ')}</text>

        {/* ── Balanced line cross-section (cx 440) ─────────────────── */}
        <rect x={396} y={118} width={88} height={40} rx={20} fill="hsl(var(--muted))" stroke={svgTokens.border} strokeWidth={1.5} />
        {/* field lines arcing between the two conductors */}
        <path d="M 415 138 Q 440 116 465 138" fill="none" stroke={svgTokens.mutedFg} strokeWidth={1} opacity={0.7} />
        <path d="M 415 138 Q 440 160 465 138" fill="none" stroke={svgTokens.mutedFg} strokeWidth={1} opacity={0.7} />
        <circle cx={415} cy={138} r={7} fill={svgTokens.fg} />
        <circle cx={465} cy={138} r={7} fill={svgTokens.fg} />

        <line x1={472} y1={138} x2={490} y2={138} stroke={svgTokens.mutedFg} strokeWidth={1} />
        <text x={494} y={142} textAnchor="start" {...lead}>{t('ch3_3.coaxLines.condLabel')}</text>
        <text x={440} y={102} textAnchor="middle" {...lead}>{t('ch3_3.coaxLines.fieldLabel')}</text>
        <line x1={440} y1={110} x2={440} y2={124} stroke={svgTokens.mutedFg} strokeWidth={1} />

        <text x={440} y={250} {...nameProps}>{t('ch3_3.coaxLines.twinName')}</text>
        <text x={440} y={272} {...zProps}>{t('ch3_3.coaxLines.twinZ')}</text>
      </svg>
    </DiagramFigure>
  )
}
