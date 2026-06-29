/**
 * Chapter 3.3 §7 — the whole antenna system, and where the SWR really lives.
 *
 *   transceiver → ATU → SWR meter →···feedline···→ choke balun → dipole
 *
 * The tuner flattens the match only on the short link back to the rig (1:1);
 * the true antenna SWR is still present on the feedline beyond it.
 *
 * Block diagram (rounded rects + connectors), not a schematic — its own genre,
 * like TxBlockDiagram. Block labels sit inside their rects; bracket labels above
 * the brackets; part labels below the line. Geometry leaves room for the wider
 * Ukrainian labels («дросельний балун») without colliding with «антена».
 *
 * hardcoded-fontsize-file-ok: block diagram with hand-tuned label sizes in
 * user-space units. No SVGDiagram wrapper.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 720
const VB_H = 196
const BY = 104 // block vertical centre
const BH = 44
const SANS = 'ui-sans-serif, system-ui, sans-serif'

interface Block { x: number; w: number; label: string }

export default function AntennaSystemBlock() {
  const { t } = useTranslation('ui')

  const blocks: Block[] = [
    { x: 26, w: 92, label: t('ch3_3.systemBlock.rigLabel') },
    { x: 134, w: 74, label: t('ch3_3.systemBlock.atuLabel') },
    { x: 224, w: 96, label: t('ch3_3.systemBlock.meterLabel') },
  ]

  const blockProps = { fontSize: '13', textAnchor: 'middle' as const, fill: svgTokens.fg, fontFamily: SANS }
  const partProps = { fontSize: '12.5', textAnchor: 'middle' as const, fill: svgTokens.mutedFg, fontFamily: SANS }
  const brkProps = { fontSize: '12.5', fontWeight: 600 as const, textAnchor: 'middle' as const, fontFamily: SANS }

  return (
    <DiagramFigure caption={t('ch3_3.systemBlock.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_3.systemBlock.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* connectors (drawn first, under the blocks) */}
        <line x1={118} y1={BY} x2={134} y2={BY} stroke={svgTokens.fg} strokeWidth={1.6} />
        <line x1={208} y1={BY} x2={224} y2={BY} stroke={svgTokens.fg} strokeWidth={1.6} />
        {/* feedline (the long run) */}
        <line x1={320} y1={BY} x2={540} y2={BY} stroke={svgTokens.fg} strokeWidth={2.4} />
        {/* balun → antenna feed */}
        <line x1={586} y1={BY} x2={660} y2={BY} stroke={svgTokens.fg} strokeWidth={1.6} />
        <line x1={660} y1={BY} x2={660} y2={72} stroke={svgTokens.fg} strokeWidth={1.6} />
        {/* dipole at the end */}
        <line x1={636} y1={72} x2={684} y2={72} stroke={svgTokens.fg} strokeWidth={3} strokeLinecap="round" />

        {/* blocks */}
        {blocks.map(b => (
          <g key={b.label}>
            <rect x={b.x} y={BY - BH / 2} width={b.w} height={BH} rx={8} fill="hsl(var(--muted))" stroke={svgTokens.border} strokeWidth={1.5} />
            <text x={b.x + b.w / 2} y={BY + 4} {...blockProps}>{b.label}</text>
          </g>
        ))}

        {/* choke balun (small box on the feedline) */}
        <rect x={540} y={BY - 16} width={46} height={32} rx={6} fill="hsl(var(--muted))" stroke={svgTokens.primary} strokeWidth={1.6} />
        {/* little choke-coil glyph, three bumps, centred in the box */}
        <path d="M 548 107 q 5 -9 10 0 q 5 -9 10 0 q 5 -9 10 0" fill="none" stroke={svgTokens.primary} strokeWidth={1.4} />
        <text x={563} y={BY + 36} {...partProps}>{t('ch3_3.systemBlock.balunLabel')}</text>

        {/* labels below the line */}
        <text x={430} y={BY + 34} {...partProps}>{t('ch3_3.systemBlock.feedlineLabel')}</text>
        <text x={660} y={BY + 36} {...partProps}>{t('ch3_3.systemBlock.antennaLabel')}</text>

        {/* brackets above */}
        <path d="M 26 64 V 56 H 208 V 64" fill="none" stroke={svgTokens.experiment} strokeWidth={1.5} />
        <text x={117} y={46} {...brkProps} fill={svgTokens.experiment}>{t('ch3_3.systemBlock.matchedBracket')}</text>
        <path d="M 320 64 V 56 H 684 V 64" fill="none" stroke={svgTokens.caution} strokeWidth={1.5} />
        <text x={502} y={46} {...brkProps} fill={svgTokens.caution}>{t('ch3_3.systemBlock.trueBracket')}</text>
      </svg>
    </DiagramFigure>
  )
}
