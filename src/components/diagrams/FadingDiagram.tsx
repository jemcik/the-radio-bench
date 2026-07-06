/**
 * Chapter 4.1 §4 — multipath fading (QSB).
 *
 * Top: the same signal reaches the receiver by two paths of slightly different
 * length (A shorter/direct, B a longer arc). Bottom: the combined strength
 * swells and sinks over time as the two arrivals drift in and out of step.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens as S } from './svgTokens'
import { Antenna } from './scene-earth'

const W = 680
const H = 320
const MID_Y = 236
const AMP = 40
const CYCLES = 3
const X0 = 70
const X1 = 630

const TX = 84
const RX = 612
const GND = 138 // antenna base line
const TOP = GND - 22 // antenna feed / path endpoints

/** Combined-strength envelope over time — a coarse-sampled sinusoid. */
function strengthPath(): string {
  const pts: string[] = []
  for (let x = X0; x <= X1; x += 8) {
    const u = (x - X0) / (X1 - X0)
    const y = MID_Y - AMP * Math.sin(u * 2 * Math.PI * CYCLES)
    pts.push(`${x} ${y.toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}

export default function FadingDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_1.fading.${s}`)

  return (
    <DiagramFigure caption={k('caption')}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={k('aria')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Top: two paths of different length between the two stations ── */}
        {/* Path B (longer): a high arc */}
        <path d={`M ${TX} ${TOP} Q 348 58 ${RX} ${TOP}`} fill="none" stroke={S.caution} strokeWidth={2.2} strokeDasharray="6 4" />
        <text x={348} y={48} fontSize={13} fontWeight={600} fill={S.caution} textAnchor="middle">{k('pathB')}</text>
        {/* Path A (shorter): a nearly-direct line */}
        <path d={`M ${TX} ${TOP} Q 348 112 ${RX} ${TOP}`} fill="none" stroke={S.note} strokeWidth={2.2} />
        <text x={200} y={132} fontSize={13} fontWeight={600} fill={S.note} textAnchor="middle">{k('pathA')}</text>

        {/* Two stations on a common ground line */}
        <line x1={TX - 12} y1={GND} x2={TX + 12} y2={GND} stroke={S.fg} strokeWidth={1.8} strokeLinecap="round" />
        <line x1={RX - 12} y1={GND} x2={RX + 12} y2={GND} stroke={S.fg} strokeWidth={1.8} strokeLinecap="round" />
        <Antenna x={TX} baseY={GND} h={22} />
        <Antenna x={RX} baseY={GND} h={22} />

        {/* ── Bottom: combined-strength envelope over time ── */}
        <text x={30} y={MID_Y} fontSize={12} fill={S.mutedFg} transform={`rotate(-90 30 ${MID_Y})`} textAnchor="middle">
          {k('strength')}
        </text>
        <path d={strengthPath()} fill="none" stroke={S.primary} strokeWidth={2.2} />

        {/* time axis */}
        <line x1={X0} y1={300} x2={X1 + 6} y2={300} stroke={S.mutedFg} strokeWidth={1.4} />
        <path d={`M ${X1 + 6} 296 l 8 4 l -8 4 Z`} fill={S.mutedFg} />
        <text x={X1 + 2} y={316} fontSize={12} fill={S.mutedFg} textAnchor="end">{k('time')}</text>

        {/* annotations at a crest (adds up) and a trough (cancels), clear of the curve */}
        <text x={303} y={182} fontSize={13} fontWeight={600} fill={S.experiment} textAnchor="middle">{k('inStep')}</text>
        <text x={397} y={293} fontSize={13} fontWeight={600} fill={S.caution} textAnchor="middle">{k('outStep')}</text>
      </svg>
    </DiagramFigure>
  )
}
