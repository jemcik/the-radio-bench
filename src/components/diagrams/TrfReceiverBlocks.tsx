/**
 * Chapter 3.1 §2 — the straight (TRF) receiver.
 *
 *   antenna → [tuned RF amp] → [tuned RF amp] → [detector] → [AF amp] → speaker
 *             └──── every stage retunes together for each station ────┘
 *
 * Block diagram (not a circuit schematic). Static snapshot — bare <svg>,
 * fixed px = viewBox, numeric fontSize, per the diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 700
const VB_H = 196
const FLOW_Y = 70

const RF1 = { x: 62, y: 46, w: 128, h: 48 }
const RF2 = { x: 214, y: 46, w: 128, h: 48 }
const DET = { x: 362, y: 46, w: 104, h: 48 }
const AF = { x: 486, y: 46, w: 104, h: 48 }
const ANT_X = 26
const SPK_X = 652

const SANS = 'ui-sans-serif, system-ui, sans-serif'

function arrowGap(fromRight: number, toLeft: number, y: number, color: string, w = 1.6) {
  return (
    <>
      <line x1={fromRight} y1={y} x2={toLeft - 6} y2={y} stroke={color} strokeWidth={w} />
      <path d={`M ${toLeft - 6} ${y} l -8 -4 v 8 z`} fill={color} />
    </>
  )
}

export default function TrfReceiverBlocks() {
  const { t } = useTranslation('ui')
  const boxes: Array<{ id: string; box: typeof RF1; label: string }> = [
    { id: 'rf1', box: RF1, label: t('ch3_1.trf.rfAmp1') },
    { id: 'rf2', box: RF2, label: t('ch3_1.trf.rfAmp2') },
    { id: 'det', box: DET, label: t('ch3_1.trf.det') },
    { id: 'af', box: AF, label: t('ch3_1.trf.afAmp') },
  ]

  return (
    <DiagramFigure caption={t('ch3_1.trf.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_1.trf.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Antenna — aerial: mast + two arms (matches @/lib/circuit Antenna) ── */}
        <path
          d={`M ${ANT_X} ${FLOW_Y} V ${FLOW_Y - 36} M ${ANT_X} ${FLOW_Y - 22} L ${ANT_X - 13} ${FLOW_Y - 36} M ${ANT_X} ${FLOW_Y - 22} L ${ANT_X + 13} ${FLOW_Y - 36}`}
          stroke={svgTokens.fg} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={ANT_X} y={FLOW_Y + 26} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.trf.antenna')}
        </text>

        {/* antenna → first box */}
        {arrowGap(ANT_X, RF1.x, FLOW_Y, svgTokens.fg)}

        {/* ── Boxes ────────────────────────────────────────────────── */}
        {boxes.map(({ id, box: b, label }, i) => {
          const next = boxes[i + 1]?.box
          return (
            <g key={id}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6}
                stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" />
              <text x={b.x + b.w / 2} y={FLOW_Y + 5} fontSize="14" fontWeight={600}
                textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
                {label}
              </text>
              {next && arrowGap(b.x + b.w, next.x, FLOW_Y, svgTokens.fg)}
            </g>
          )
        })}

        {/* AF → speaker */}
        <line x1={AF.x + AF.w} y1={FLOW_Y} x2={SPK_X - 14} y2={FLOW_Y}
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
          {t('ch3_1.trf.speaker')}
        </text>

        {/* ── "every stage retunes together" bracket under the tuned stages ── */}
        <path d={`M ${RF1.x} 126 V 134 H ${RF2.x + RF2.w} V 126`} stroke={svgTokens.caution}
          strokeWidth={1.3} fill="none" />
        <text x={(RF1.x + RF2.x + RF2.w) / 2} y={152} fontSize="13" fontWeight={600}
          textAnchor="middle" fill={svgTokens.caution} fontFamily={SANS}>
          {t('ch3_1.trf.retune')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
