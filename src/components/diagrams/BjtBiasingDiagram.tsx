import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { withSubscripts } from '@/lib/text-with-subscripts'

/**
 * Chapter 1.11 — companion to `insideBiasNote`.
 *
 * Shows an NPN transistor in active-mode bias as a horizontal sandwich
 * with node voltages V_E = 0, V_B = 0.7, V_C = 5 explicitly labelled,
 * and the resulting bias state on each junction (BE: forward because
 * + is on the P side; BC: reverse because + is on the N side).
 *
 * Static diagram — depicts a snapshot, not a process, so no animation
 * per diagram-quality § 8.
 *
 * Padding budget (worst case is UA):
 *   Top voltage labels e.g. «V_C = 5 В» → 7 chars × 6.5 px @13 ≈ 46 px
 *   wide; centred at E_CX / B_CX / C_CX. PAD_T = 60 gives 32 px from top
 *   of canvas + label height (≈ 16) + arrow stub (20) before the body.
 *   Bottom bias panel: «ЗВОРОТНЕ ЗМІЩЕННЯ» (UA) — 17 chars × 6.5 ≈ 110 px,
 *   centred at E_CX (= 155) and C_CX (= 385). Both panel centres are
 *   ≥ 55 px from canvas edges, so labels fit symmetrically.
 */
const VB_W = 560
const VB_H = 280

const BODY_Y0 = 60
const BODY_Y1 = 160

const E_X0 = 80
const E_X1 = 230
const B_X0 = 230
const B_X1 = 290
const C_X0 = 290
const C_X1 = 480
const BE_JUNCTION_X = B_X0
const BC_JUNCTION_X = B_X1

const E_CX = (E_X0 + E_X1) / 2
const B_CX = (B_X0 + B_X1) / 2
const C_CX = (C_X0 + C_X1) / 2

const SANS = 'ui-sans-serif, system-ui, sans-serif'
const SERIF = 'Georgia, serif'

export default function BjtBiasingDiagram() {
  const { t } = useTranslation('ui')
  const arrowId = useId()

  return (
    <DiagramFigure caption={withSubscripts(t('ch1_11.biasingDiagram.caption'))}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_11.biasingDiagram.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 8 6"
            refX="7" refY="3"
            markerWidth="6"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0 0 L8 3 L0 6 Z" fill={svgTokens.fg} />
          </marker>
        </defs>

        {/* Top: node voltages with downward arrows pointing into each block */}
        <text x={E_CX} y={28} textAnchor="middle" fontSize="13" fill={svgTokens.fg} fontFamily={SERIF}>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="10">E</tspan>
          <tspan dy="-3" fontSize="13"> = 0 В</tspan>
        </text>
        <line x1={E_CX} y1={36} x2={E_CX} y2={56} stroke={svgTokens.fg} strokeWidth={1.5} markerEnd={`url(#${arrowId})`} />

        <text x={B_CX} y={28} textAnchor="middle" fontSize="13" fill={svgTokens.fg} fontFamily={SERIF}>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="10">B</tspan>
          <tspan dy="-3" fontSize="13"> = 0,7 В</tspan>
        </text>
        <line x1={B_CX} y1={36} x2={B_CX} y2={56} stroke={svgTokens.fg} strokeWidth={1.5} markerEnd={`url(#${arrowId})`} />

        <text x={C_CX} y={28} textAnchor="middle" fontSize="13" fill={svgTokens.fg} fontFamily={SERIF}>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="10">C</tspan>
          <tspan dy="-3" fontSize="13"> = 5 В</tspan>
        </text>
        <line x1={C_CX} y1={36} x2={C_CX} y2={56} stroke={svgTokens.fg} strokeWidth={1.5} markerEnd={`url(#${arrowId})`} />

        {/* Structure body — three doped silicon blocks */}
        <rect x={E_X0} y={BODY_Y0} width={E_X1 - E_X0} height={BODY_Y1 - BODY_Y0}
          fill="hsl(var(--callout-experiment))" opacity={0.18}
          stroke={svgTokens.fg} strokeWidth={1.2} />
        <rect x={B_X0} y={BODY_Y0} width={B_X1 - B_X0} height={BODY_Y1 - BODY_Y0}
          fill="hsl(var(--callout-caution))" opacity={0.25}
          stroke={svgTokens.fg} strokeWidth={1.2} />
        <rect x={C_X0} y={BODY_Y0} width={C_X1 - C_X0} height={BODY_Y1 - BODY_Y0}
          fill="hsl(var(--callout-experiment))" opacity={0.18}
          stroke={svgTokens.fg} strokeWidth={1.2} />

        {/* Big terminal letter inside each block */}
        <text x={E_CX} y={105} textAnchor="middle" fontSize="22" fontWeight="600" fontStyle="italic" fill={svgTokens.fg} fontFamily={SERIF}>
          E
        </text>
        <text x={E_CX} y={132} textAnchor="middle" fontSize="13" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.typeN')}
        </text>

        <text x={B_CX} y={105} textAnchor="middle" fontSize="22" fontWeight="600" fontStyle="italic" fill={svgTokens.fg} fontFamily={SERIF}>
          B
        </text>
        <text x={B_CX} y={132} textAnchor="middle" fontSize="13" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.typeP')}
        </text>

        <text x={C_CX} y={105} textAnchor="middle" fontSize="22" fontWeight="600" fontStyle="italic" fill={svgTokens.fg} fontFamily={SERIF}>
          C
        </text>
        <text x={C_CX} y={132} textAnchor="middle" fontSize="13" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.typeN')}
        </text>

        {/* BE-junction panel (under emitter block, points right-up to BE line) */}
        <line x1={E_CX + 30} y1={195} x2={BE_JUNCTION_X - 3} y2={BODY_Y1 + 5}
          stroke={svgTokens.fg} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
        <text x={E_CX} y={215} textAnchor="middle" fontSize="13" fontWeight="600" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.beTitle')}
        </text>
        <text x={E_CX} y={235} textAnchor="middle" fontSize="13" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.beState')}
        </text>
        <text x={E_CX} y={253} textAnchor="middle" fontSize="12" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.beReason')}
        </text>

        {/* BC-junction panel (under collector block, points left-up to BC line) */}
        <line x1={C_CX - 30} y1={195} x2={BC_JUNCTION_X + 3} y2={BODY_Y1 + 5}
          stroke={svgTokens.fg} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
        <text x={C_CX} y={215} textAnchor="middle" fontSize="13" fontWeight="600" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.bcTitle')}
        </text>
        <text x={C_CX} y={235} textAnchor="middle" fontSize="13" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.bcState')}
        </text>
        <text x={C_CX} y={253} textAnchor="middle" fontSize="12" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch1_11.biasingDiagram.bcReason')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
