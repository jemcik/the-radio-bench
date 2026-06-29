/**
 * Chapter 3.3 §3 — three common antennas, same half-wave idea.
 *
 *   dipole (centre-fed)  ·  ¼-wave vertical on radials  ·  Yagi beam
 *
 * Static conceptual illustration. All readable text sits below the silhouettes
 * (well clear of the wires/elements) so the diagram-text-overlap test stays green.
 *
 * hardcoded-fontsize-file-ok: standalone illustration with hand-tuned label
 * sizes in user-space units. No SVGDiagram wrapper.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 660
const VB_H = 276
const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** Split a trait label on its first comma into two lines (keeps wide UA
 *  traits inside their panel instead of crossing the column dividers). */
function splitComma(s: string): [string, string] {
  const i = s.indexOf(', ')
  return i === -1 ? [s, ''] : [s.slice(0, i), s.slice(i + 2)]
}

export default function AntennaTypesGallery() {
  const { t } = useTranslation('ui')

  const nameProps = { fontSize: '14', fontWeight: 700, textAnchor: 'middle' as const, fill: svgTokens.fg, fontFamily: SANS }
  const traitProps = { fontSize: '13', textAnchor: 'middle' as const, fill: svgTokens.mutedFg, fontFamily: SANS }
  const partProps = { fontSize: '12.5', textAnchor: 'middle' as const, fill: svgTokens.mutedFg, fontFamily: SANS }

  const traits = {
    dipole: splitComma(t('ch3_3.antennaGallery.dipoleTrait')),
    vert: splitComma(t('ch3_3.antennaGallery.vertTrait')),
    yagi: splitComma(t('ch3_3.antennaGallery.yagiTrait')),
  }

  return (
    <DiagramFigure caption={t('ch3_3.antennaGallery.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_3.antennaGallery.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* dividers */}
        <line x1={220} y1={24} x2={220} y2={234} stroke={svgTokens.border} strokeWidth={1} strokeDasharray="3 5" />
        <line x1={440} y1={24} x2={440} y2={234} stroke={svgTokens.border} strokeWidth={1} strokeDasharray="3 5" />

        {/* ── Panel A: half-wave dipole (cx 110) ───────────────────── */}
        <line x1={45} y1={100} x2={103} y2={100} stroke={svgTokens.fg} strokeWidth={3} strokeLinecap="round" />
        <line x1={117} y1={100} x2={175} y2={100} stroke={svgTokens.fg} strokeWidth={3} strokeLinecap="round" />
        <line x1={110} y1={100} x2={110} y2={128} stroke={svgTokens.primary} strokeWidth={2} />
        <circle cx={103} cy={100} r={3} fill={svgTokens.fg} />
        <circle cx={117} cy={100} r={3} fill={svgTokens.fg} />
        <text x={110} y={146} {...partProps}>{t('ch3_3.antennaGallery.feedLabel')}</text>
        <text x={110} y={200} {...nameProps}>{t('ch3_3.antennaGallery.dipoleName')}</text>
        <text x={110} y={216} {...traitProps}>
          <tspan x={110}>{traits.dipole[0]}</tspan>
          {traits.dipole[1] && <tspan x={110} dy="16">{traits.dipole[1]}</tspan>}
        </text>

        {/* ── Panel B: ¼-wave vertical on radials (cx 330) ─────────── */}
        <line x1={330} y1={140} x2={330} y2={52} stroke={svgTokens.fg} strokeWidth={3} strokeLinecap="round" />
        <line x1={330} y1={140} x2={276} y2={152} stroke={svgTokens.fg} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={330} y1={140} x2={304} y2={156} stroke={svgTokens.fg} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={330} y1={140} x2={356} y2={156} stroke={svgTokens.fg} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={330} y1={140} x2={384} y2={152} stroke={svgTokens.fg} strokeWidth={1.6} strokeLinecap="round" />
        <text x={330} y={176} {...partProps}>{t('ch3_3.antennaGallery.radialsLabel')}</text>
        <text x={330} y={200} {...nameProps}>{t('ch3_3.antennaGallery.vertName')}</text>
        <text x={330} y={216} {...traitProps}>
          <tspan x={330}>{traits.vert[0]}</tspan>
          {traits.vert[1] && <tspan x={330} dy="16">{traits.vert[1]}</tspan>}
        </text>

        {/* ── Panel C: Yagi beam (cx 550) ──────────────────────────── */}
        {/* beam arrow (top, clear of the elements) */}
        <line x1={515} y1={48} x2={598} y2={48} stroke={svgTokens.primary} strokeWidth={1.8} />
        <path d="M 598 44 L 606 48 L 598 52 Z" fill={svgTokens.primary} />
        <text x={553} y={40} fontSize="12.5" textAnchor="middle" fill={svgTokens.primary} fontFamily={SANS}>{t('ch3_3.antennaGallery.beamLabel')}</text>
        {/* boom + elements */}
        <line x1={492} y1={100} x2={616} y2={100} stroke={svgTokens.mutedFg} strokeWidth={2} />
        <line x1={500} y1={62} x2={500} y2={138} stroke={svgTokens.fg} strokeWidth={2.6} strokeLinecap="round" />
        <line x1={535} y1={70} x2={535} y2={130} stroke={svgTokens.primary} strokeWidth={2.6} strokeLinecap="round" />
        <line x1={572} y1={76} x2={572} y2={124} stroke={svgTokens.fg} strokeWidth={2.6} strokeLinecap="round" />
        <line x1={606} y1={78} x2={606} y2={122} stroke={svgTokens.fg} strokeWidth={2.6} strokeLinecap="round" />
        <text x={535} y={158} {...partProps} fill={svgTokens.primary}>{t('ch3_3.antennaGallery.drivenLabel')}</text>
        <text x={500} y={176} {...partProps}>{t('ch3_3.antennaGallery.reflLabel')}</text>
        <text x={589} y={176} {...partProps}>{t('ch3_3.antennaGallery.dirLabel')}</text>
        <text x={553} y={200} {...nameProps}>{t('ch3_3.antennaGallery.yagiName')}</text>
        <text x={553} y={216} {...traitProps}>
          <tspan x={553}>{traits.yagi[0]}</tspan>
          {traits.yagi[1] && <tspan x={553} dy="16">{traits.yagi[1]}</tspan>}
        </text>
      </svg>
    </DiagramFigure>
  )
}
