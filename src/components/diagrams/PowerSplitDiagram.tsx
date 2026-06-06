/**
 * Chapter 2.3 §2 — where the DC input power goes (a to-scale flow split).
 *
 * One wide input stream (DC, 290 W) forks into a thin stream (RF, 100 W) and a
 * thick one (heat, 190 W). Band heights are drawn proportional to the watts —
 * 0.4 px/W — so the eye reads at a glance that heat is the big stream and the
 * signal the small one.
 *
 *   290 W → 116 px   ·   100 W → 40 px   ·   190 W → 76 px   (40 + 76 = 116 ✓)
 *
 * Static snapshot. Bare <svg>, fixed px = viewBox, per the diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 560
const VB_H = 226

const SANS = 'ui-sans-serif, system-ui, sans-serif'

// Input band: x 24..170, y 52..168 (116 px tall = 290 W).
const IN_X0 = 24
const SPLIT_X = 170
const OUT_X = 398

// heat (top, 76 px) and RF (bottom, 40 px) at the split, fanned apart on the right.
const HEAT = { lTop: 52, lBot: 128, rTop: 30, rBot: 106 }
const RF = { lTop: 128, lBot: 168, rTop: 140, rBot: 180 }

export default function PowerSplitDiagram() {
  const { t } = useTranslation('ui')

  return (
    <DiagramFigure caption={t('ch2_3.powerSplit.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_3.powerSplit.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Heat stream (top, the big one) ───────────────────────── */}
        <path
          d={`M ${SPLIT_X} ${HEAT.lTop} L ${OUT_X} ${HEAT.rTop} L ${OUT_X} ${HEAT.rBot} L ${SPLIT_X} ${HEAT.lBot} Z`}
          fill="hsl(var(--callout-caution))" fillOpacity={0.28}
          stroke="hsl(var(--callout-caution))" strokeWidth={1.4} />

        {/* ── RF stream (bottom, the small one) ────────────────────── */}
        <path
          d={`M ${SPLIT_X} ${RF.lTop} L ${OUT_X} ${RF.rTop} L ${OUT_X} ${RF.rBot} L ${SPLIT_X} ${RF.lBot} Z`}
          fill={svgTokens.primary} fillOpacity={0.28}
          stroke={svgTokens.primary} strokeWidth={1.4} />

        {/* ── DC input band ────────────────────────────────────────── */}
        <rect x={IN_X0} y={52} width={SPLIT_X - IN_X0} height={116}
          fill="hsl(var(--muted))" stroke={svgTokens.fg} strokeWidth={1.4} />
        <text x={(IN_X0 + SPLIT_X) / 2} y={104} fontSize="14" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.powerSplit.dcIn')}
        </text>
        <text x={(IN_X0 + SPLIT_X) / 2} y={124} fontSize="15" fontWeight={700}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.powerSplit.dcValue')}
        </text>

        {/* ── Heat label (right gutter) ────────────────────────────── */}
        <text x={OUT_X + 12} y={62} fontSize="14" fontWeight={600}
          fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.powerSplit.heat')}
        </text>
        <text x={OUT_X + 12} y={81} fontSize="15" fontWeight={700}
          fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.powerSplit.heatValue')}
        </text>

        {/* ── RF label (right gutter) ──────────────────────────────── */}
        <text x={OUT_X + 12} y={156} fontSize="14" fontWeight={600}
          fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.powerSplit.rfOut')}
        </text>
        <text x={OUT_X + 12} y={175} fontSize="15" fontWeight={700}
          fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch2_3.powerSplit.rfValue')}
        </text>
        <text x={OUT_X + 12} y={193} fontSize="13" fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch2_3.powerSplit.effLabel')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
