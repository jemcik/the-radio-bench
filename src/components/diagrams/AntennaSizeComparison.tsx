/**
 * Chapter 2.2 §2 — why audio can't be radiated directly: antenna size.
 *
 * A scale comparison. A human stick figure (the SAME size in both columns)
 * stands beside:
 *   Left  — the ¼-wave antenna for a 3 kHz audio tone: ~25 km, drawn as a
 *           mast running off the top of the frame with a break symbol.
 *   Right — the ¼-wave antenna for a 145 MHz carrier: ~50 cm, knee-high.
 *
 * The punch is the constant-size person: audio needs a mountain of wire,
 * a radio carrier needs something you can hold.
 *
 * Static conceptual illustration. All readable text is kept OFF the vertical
 * antenna lines (above their tops or below the ground line) so the
 * diagram-text-overlap test stays green.
 *
 * Sizing per the diagram-quality skill: bare <svg>, fixed px, no SVGDiagram.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 540
const VB_H = 300

const GY = 248 // ground line

// Left column: tall audio antenna + person.
const L_ANT_X = 90
const L_PERSON_X = 150
const L_CENTER = 120

// Right column: short RF antenna + person.
const R_ANT_X = 360
const R_PERSON_X = 420
const R_CENTER = 390

const L_ANT_TOP = 70
const R_ANT_TOP = GY - 46

/** A small stick figure standing with feet on the ground line. */
function Person({ cx }: { cx: number }) {
  const feetY = GY
  const headR = 5
  const headCY = feetY - 38
  const neckY = headCY + headR
  const hipY = feetY - 16
  return (
    <g stroke={svgTokens.fg} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.85}>
      <circle cx={cx} cy={headCY} r={headR} />
      <line x1={cx} y1={neckY} x2={cx} y2={hipY} />
      {/* arms */}
      <line x1={cx} y1={neckY + 4} x2={cx - 8} y2={hipY - 2} />
      <line x1={cx} y1={neckY + 4} x2={cx + 8} y2={hipY - 2} />
      {/* legs */}
      <line x1={cx} y1={hipY} x2={cx - 7} y2={feetY} />
      <line x1={cx} y1={hipY} x2={cx + 7} y2={feetY} />
    </g>
  )
}

export default function AntennaSizeComparison() {
  const { t } = useTranslation('ui')

  return (
    <DiagramFigure caption={t('ch2_2.antennaSize.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_2.antennaSize.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Ground line ─────────────────────────────────────────── */}
        <line x1={36} y1={GY} x2={VB_W - 36} y2={GY} stroke={svgTokens.border} strokeWidth={1} />

        {/* ── LEFT: tall audio antenna ────────────────────────────── */}
        <text x={L_CENTER} y={26} fontSize="14" fontWeight={600} textAnchor="middle"
          fill={svgTokens.fg} fontFamily="ui-sans-serif, system-ui, sans-serif">
          {t('ch2_2.antennaSize.audioLabel')}
        </text>
        <text x={L_CENTER} y={45} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif">
          <tspan fontStyle="italic" fontFamily="Georgia, serif">λ</tspan> {t('ch2_2.antennaSize.audioWave')}
        </text>
        {/* mast (runs off the top) */}
        <line x1={L_ANT_X} y1={GY} x2={L_ANT_X} y2={L_ANT_TOP} stroke={svgTokens.primary} strokeWidth={2.5} strokeLinecap="round" />
        {/* break symbol — two short slashes with a gap, "continues much higher" */}
        <line x1={L_ANT_X - 6} y1={128} x2={L_ANT_X + 6} y2={120} stroke={svgTokens.primary} strokeWidth={2} />
        <line x1={L_ANT_X - 6} y1={116} x2={L_ANT_X + 6} y2={108} stroke={svgTokens.primary} strokeWidth={2} />
        {/* up arrow at the top */}
        <path d={`M ${L_ANT_X} ${L_ANT_TOP - 8} l -4 7 h 8 z`} fill={svgTokens.primary} />
        <Person cx={L_PERSON_X} />
        {/* antenna-length label below the ground line */}
        <text x={L_CENTER} y={GY + 26} fontSize="13" fontWeight={600} textAnchor="middle"
          fill={svgTokens.primary} fontFamily="ui-sans-serif, system-ui, sans-serif">
          {t('ch2_2.antennaSize.audioAnt')}
        </text>

        {/* ── RIGHT: short RF antenna ─────────────────────────────── */}
        <text x={R_CENTER} y={26} fontSize="14" fontWeight={600} textAnchor="middle"
          fill={svgTokens.fg} fontFamily="ui-sans-serif, system-ui, sans-serif">
          {t('ch2_2.antennaSize.rfLabel')}
        </text>
        <text x={R_CENTER} y={45} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif">
          <tspan fontStyle="italic" fontFamily="Georgia, serif">λ</tspan> {t('ch2_2.antennaSize.rfWave')}
        </text>
        <line x1={R_ANT_X} y1={GY} x2={R_ANT_X} y2={R_ANT_TOP} stroke={svgTokens.primary} strokeWidth={2.5} strokeLinecap="round" />
        <Person cx={R_PERSON_X} />
        <text x={R_CENTER} y={GY + 26} fontSize="13" fontWeight={600} textAnchor="middle"
          fill={svgTokens.primary} fontFamily="ui-sans-serif, system-ui, sans-serif">
          {t('ch2_2.antennaSize.rfAnt')}
        </text>

        {/* "you" pointer at the right-column person (kept clear of any line) */}
        <text x={R_PERSON_X + 16} y={GY - 30} fontSize="13" textAnchor="start"
          fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif">
          {t('ch2_2.antennaSize.person')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
