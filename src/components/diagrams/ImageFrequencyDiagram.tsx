/**
 * Chapter 3.1 §5 — why the image frequency exists.
 *
 *   front-end filter
 *     ┌────┐
 *  ───┴─●──┴──────●──────────●──────────────▶ frequency
 *     wanted      LO        image
 *        └── IF ──┘└── IF ──┘
 *        └──── 2 × IF apart ────┘
 *
 * A frequency-axis figure (not a circuit schematic). Static snapshot — bare
 * <svg>, fixed px = viewBox, numeric fontSize, per the diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 620
const VB_H = 196
const AXIS_Y = 120
const AXIS_X0 = 70
const AXIS_X1 = 566

const WANTED = 150
const LO = 330
const IMAGE = 510

const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** Square bracket spanning x0..x1, dropping `depth` below y. */
function bracket(x0: number, x1: number, y: number, depth: number): string {
  return `M ${x0} ${y} V ${y + depth} H ${x1} V ${y}`
}

export default function ImageFrequencyDiagram() {
  const { t } = useTranslation('ui')

  const markers: Array<[number, string, string]> = [
    [WANTED, t('ch3_1.imageAxis.wanted'), svgTokens.primary],
    [LO, t('ch3_1.imageAxis.lo'), svgTokens.fg],
    [IMAGE, t('ch3_1.imageAxis.image'), svgTokens.caution],
  ]

  return (
    <DiagramFigure caption={t('ch3_1.imageAxis.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_1.imageAxis.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Front-end filter passband (shaded, behind the markers) ── */}
        <rect x={WANTED - 38} y={AXIS_Y - 22} width={76} height={22}
          fill={svgTokens.primary} opacity={0.13} />
        <text x={WANTED} y={72} fontSize="13" fontWeight={600} textAnchor="middle"
          fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch3_1.imageAxis.filter')}
        </text>

        {/* ── Frequency axis ───────────────────────────────────────── */}
        <line x1={AXIS_X0} y1={AXIS_Y} x2={AXIS_X1} y2={AXIS_Y} stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={`M ${AXIS_X1} ${AXIS_Y} l -9 -4 v 8 z`} fill={svgTokens.fg} />
        <text x={545} y={140} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.imageAxis.freqAxis')}
        </text>

        {/* ── Markers ──────────────────────────────────────────────── */}
        {markers.map(([x, label, color]) => (
          <g key={label}>
            <line x1={x} y1={AXIS_Y} x2={x} y2={98} stroke={color} strokeWidth={2.2} />
            <circle cx={x} cy={AXIS_Y} r={3.2} fill={color} />
            <text x={x} y={90} fontSize="13.5" fontWeight={600} textAnchor="middle" fill={color} fontFamily={SANS}>
              {label}
            </text>
          </g>
        ))}

        {/* ── IF gap brackets ──────────────────────────────────────── */}
        <path d={bracket(WANTED, LO, 134, 8)} stroke={svgTokens.mutedFg} strokeWidth={1.2} fill="none" />
        <text x={(WANTED + LO) / 2} y={158} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.imageAxis.ifGapL')}
        </text>
        <path d={bracket(LO, IMAGE, 134, 8)} stroke={svgTokens.mutedFg} strokeWidth={1.2} fill="none" />
        <text x={(LO + IMAGE) / 2} y={158} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.imageAxis.ifGapR')}
        </text>

        {/* ── 2 × IF span ──────────────────────────────────────────── */}
        <path d={bracket(WANTED, IMAGE, 166, 8)} stroke={svgTokens.caution} strokeWidth={1.3} fill="none" />
        <text x={(WANTED + IMAGE) / 2} y={186} fontSize="13" fontWeight={600} textAnchor="middle"
          fill={svgTokens.caution} fontFamily={SANS}>
          {t('ch3_1.imageAxis.twoIf')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
