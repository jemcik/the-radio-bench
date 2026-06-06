/**
 * Chapter 2.3 §1 — the two powers of a transmitter, measured at two points.
 *
 *   [13.8 V supply] → [transmitter] → antenna
 *        └── DC input (V × I), measured with volt- + ammeter ──┘
 *                          └── RF output, measured with RF power meter ──┘
 *
 * A block diagram (not a circuit schematic): the supply and transmitter are
 * labelled boxes, the antenna a simple dipole glyph. The point is the two
 * measurement brackets underneath — where each power is read, and how.
 *
 * Static snapshot. Bare <svg>, fixed px = viewBox, numeric fontSize, per the
 * diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 560
const VB_H = 232

const FLOW_Y = 70 // vertical centre of the boxes

const SUPPLY = { x: 26, y: 44, w: 120, h: 52 }
const TX = { x: 226, y: 44, w: 130, h: 52 }
const ANT_X = 470

const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** A square measurement bracket spanning x0..x1, dropping `depth` below y. */
function bracket(x0: number, x1: number, y: number, depth: number): string {
  return `M ${x0} ${y} V ${y + depth} H ${x1} V ${y}`
}

export default function PowerFlowBlocks() {
  const { t } = useTranslation('ui')

  return (
    <DiagramFigure caption={t('ch2_3.powerFlow.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_3.powerFlow.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Supply box ───────────────────────────────────────────── */}
        <rect x={SUPPLY.x} y={SUPPLY.y} width={SUPPLY.w} height={SUPPLY.h} rx={6}
          stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" />
        <text x={SUPPLY.x + SUPPLY.w / 2} y={FLOW_Y + 5} fontSize="14" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.powerFlow.supply')}
        </text>

        {/* supply → transmitter */}
        <line x1={SUPPLY.x + SUPPLY.w} y1={FLOW_Y} x2={TX.x - 6} y2={FLOW_Y}
          stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={`M ${TX.x - 6} ${FLOW_Y} l -8 -4 v 8 z`} fill={svgTokens.fg} />

        {/* ── Transmitter box ──────────────────────────────────────── */}
        <rect x={TX.x} y={TX.y} width={TX.w} height={TX.h} rx={6}
          stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" />
        <text x={TX.x + TX.w / 2} y={FLOW_Y + 5} fontSize="14" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.powerFlow.transmitter')}
        </text>

        {/* transmitter → antenna */}
        <line x1={TX.x + TX.w} y1={FLOW_Y} x2={ANT_X - 14} y2={FLOW_Y}
          stroke={svgTokens.primary} strokeWidth={2.2} />
        <path d={`M ${ANT_X - 14} ${FLOW_Y} l -8 -4 v 8 z`} fill={svgTokens.primary} />

        {/* ── Antenna glyph ────────────────────────────────────────── */}
        <line x1={ANT_X} y1={FLOW_Y - 4} x2={ANT_X} y2={FLOW_Y - 30}
          stroke={svgTokens.fg} strokeWidth={2.4} strokeLinecap="round" />
        <line x1={ANT_X} y1={FLOW_Y + 4} x2={ANT_X} y2={FLOW_Y + 30}
          stroke={svgTokens.fg} strokeWidth={2.4} strokeLinecap="round" />
        {[18, 32].map(r => (
          <path key={r} d={`M ${ANT_X + r * 0.5} ${FLOW_Y - r * 0.8} A ${r} ${r} 0 0 1 ${ANT_X + r * 0.5} ${FLOW_Y + r * 0.8}`}
            stroke={svgTokens.primary} strokeWidth={1.3} opacity={0.4} fill="none" />
        ))}
        <text x={ANT_X} y={FLOW_Y + 48} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch2_3.powerFlow.antenna')}
        </text>

        {/* ── DC measurement bracket (supply → tx span) ────────────── */}
        <path d={bracket(SUPPLY.x, TX.x - 6, 132, 8)} stroke={svgTokens.mutedFg}
          strokeWidth={1.2} fill="none" />
        <text x={(SUPPLY.x + TX.x) / 2} y={158} fontSize="13.5" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch2_3.powerFlow.dcSide')} {t('ch2_3.powerFlow.dcValue')}
        </text>
        <text x={(SUPPLY.x + TX.x) / 2} y={176} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch2_3.powerFlow.dcHow')}
        </text>

        {/* ── RF measurement bracket (tx → antenna span) ───────────── */}
        <path d={bracket(TX.x + TX.w, ANT_X, 132, 8)} stroke={svgTokens.primary}
          strokeWidth={1.2} fill="none" opacity={0.7} />
        <text x={(TX.x + TX.w + ANT_X) / 2} y={158} fontSize="13.5" fontWeight={600}
          textAnchor="middle" fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch2_3.powerFlow.rfSide')} {t('ch2_3.powerFlow.rfValue')}
        </text>
        <text x={(TX.x + TX.w + ANT_X) / 2} y={176} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch2_3.powerFlow.rfHow')}
        </text>

        {/* ── The gap, spelled out ─────────────────────────────────── */}
        <text x={VB_W / 2} y={210} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontStyle="italic" fontFamily={SANS}>
          {t('ch2_3.powerFlow.gap')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
