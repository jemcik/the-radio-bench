/**
 * Chapter 3.1 §1 — the three jobs of a receiver, on one signal-path line.
 *
 *   antenna (≈1 µV) → [select] → [amplify] → [detect] → speaker (≈1 V)
 *                     └──────── × 1 000 000 (≈ 120 dB) ────────┘
 *
 * A block diagram (not a circuit schematic): labelled boxes, an antenna glyph
 * and a speaker glyph, with a gain bracket underneath. Static snapshot —
 * bare <svg>, fixed px = viewBox, numeric fontSize, per the diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 620
const VB_H = 198
const FLOW_Y = 72

const SELECT = { x: 92, y: 48, w: 104, h: 48 }
const AMPLIFY = { x: 236, y: 48, w: 104, h: 48 }
const DETECT = { x: 380, y: 48, w: 104, h: 48 }
const ANT_X = 34
const SPK_X = 556

const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** Square measurement bracket spanning x0..x1, dropping `depth` below y. */
function bracket(x0: number, x1: number, y: number, depth: number): string {
  return `M ${x0} ${y} V ${y + depth} H ${x1} V ${y}`
}

function arrow(toX: number, y: number) {
  return `M ${toX} ${y} l -8 -4 v 8 z`
}

export default function ReceiverJobsDiagram() {
  const { t } = useTranslation('ui')
  const boxes: Array<[typeof SELECT, string]> = [
    [SELECT, t('ch3_1.jobs.select')],
    [AMPLIFY, t('ch3_1.jobs.amplify')],
    [DETECT, t('ch3_1.jobs.detect')],
  ]

  return (
    <DiagramFigure caption={t('ch3_1.jobs.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_1.jobs.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Antenna — aerial: mast + two arms (matches @/lib/circuit Antenna) ── */}
        <path
          d={`M ${ANT_X} ${FLOW_Y} V ${FLOW_Y - 36} M ${ANT_X} ${FLOW_Y - 22} L ${ANT_X - 13} ${FLOW_Y - 36} M ${ANT_X} ${FLOW_Y - 22} L ${ANT_X + 13} ${FLOW_Y - 36}`}
          stroke={svgTokens.fg} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={ANT_X} y={FLOW_Y + 24} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.jobs.antenna')}
        </text>
        <text x={ANT_X} y={FLOW_Y + 40} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_1.jobs.antLevel')}
        </text>

        {/* antenna → first box */}
        <line x1={ANT_X} y1={FLOW_Y} x2={SELECT.x - 6} y2={FLOW_Y} stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={arrow(SELECT.x - 6, FLOW_Y)} fill={svgTokens.fg} />

        {/* ── Three job boxes ──────────────────────────────────────── */}
        {boxes.map(([b, label], i) => (
          <g key={label}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6}
              stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" />
            <text x={b.x + b.w / 2} y={FLOW_Y + 5} fontSize="14" fontWeight={600}
              textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
              {label}
            </text>
            {/* arrow into the next box (or speaker) */}
            {i < 2 && (
              <>
                <line x1={b.x + b.w} y1={FLOW_Y} x2={[AMPLIFY, DETECT][i].x - 6} y2={FLOW_Y}
                  stroke={svgTokens.fg} strokeWidth={1.6} />
                <path d={arrow([AMPLIFY, DETECT][i].x - 6, FLOW_Y)} fill={svgTokens.fg} />
              </>
            )}
          </g>
        ))}

        {/* detect → speaker */}
        <line x1={DETECT.x + DETECT.w} y1={FLOW_Y} x2={SPK_X - 14} y2={FLOW_Y}
          stroke={svgTokens.primary} strokeWidth={2.2} />
        <path d={`M ${SPK_X - 14} ${FLOW_Y} l -8 -4 v 8 z`} fill={svgTokens.primary} />

        {/* ── Speaker glyph ────────────────────────────────────────── */}
        <path d={`M ${SPK_X - 4} ${FLOW_Y - 7} h -10 v 14 h 10 z M ${SPK_X - 4} ${FLOW_Y - 7} L ${SPK_X + 10} ${FLOW_Y - 16} v 32 L ${SPK_X - 4} ${FLOW_Y + 7} z`}
          stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" strokeLinejoin="round" />
        {[10, 18].map(r => (
          <path key={r} d={`M ${SPK_X + 16} ${FLOW_Y - r * 0.7} A ${r} ${r} 0 0 1 ${SPK_X + 16} ${FLOW_Y + r * 0.7}`}
            stroke={svgTokens.primary} strokeWidth={1.3} opacity={0.5} fill="none" />
        ))}
        <text x={SPK_X} y={FLOW_Y + 32} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.jobs.speaker')}
        </text>
        <text x={SPK_X} y={FLOW_Y + 48} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_1.jobs.spkLevel')}
        </text>

        {/* ── Gain bracket under the three boxes ───────────────────── */}
        <path d={bracket(SELECT.x, DETECT.x + DETECT.w, 128, 8)} stroke={svgTokens.primary}
          strokeWidth={1.2} fill="none" opacity={0.7} />
        <text x={(SELECT.x + DETECT.x + DETECT.w) / 2} y={152} fontSize="13.5" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_1.jobs.gain')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
