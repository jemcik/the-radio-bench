/**
 * Chapter 2.2 §3 — the carrier's three knobs.
 *
 * Four stacked rows sharing one time axis:
 *   1. message     — the slow modulating signal.
 *   2. AM          — carrier amplitude follows the message (constant freq).
 *   3. FM          — carrier frequency follows the message (constant amp).
 *   4. PM          — carrier phase follows the message (constant amp).
 *
 * The same message drives all three, so the reader can see which property
 * each modulation moves. FM is computed by true phase accumulation so the
 * cycles genuinely bunch and stretch.
 *
 * Static snapshot (the lesson is the comparison of shapes). Faint vertical
 * guides are drawn at low opacity / sub-1 stroke width so they read as
 * background and the diagram-text-overlap test ignores them.
 *
 * Sizing per the diagram-quality skill: bare <svg>, fixed px, no SVGDiagram.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 540
const VB_H = 320

const PAD_L = 14
const PAD_R = 14
const PAD_T = 6
const PAD_B = 18

const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_X0 = PAD_L
const PLOT_X1 = PAD_L + PLOT_W

const ROWS = 4
const ROW_H = (VB_H - PAD_T - PAD_B) / ROWS
const TITLE_H = 15
const AMP = (ROW_H - TITLE_H) / 2 - 6

const SAMPLES = 480
const FC = 18 // carrier cycles across the span
const FM = 1.5 // message cycles across the span

function msgAt(t: number): number {
  return Math.sin(2 * Math.PI * FM * t)
}

function rowMid(r: number): number {
  return PAD_T + r * ROW_H + TITLE_H + (ROW_H - TITLE_H) / 2
}

/** message (row 0): the slow sine itself. */
function messagePath(): string {
  const mid = rowMid(0)
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const y = mid - AMP * msgAt(t)
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

/** AM (row 1): amplitude rides the message. */
function amPath(): string {
  const mid = rowMid(1)
  const base = AMP * 0.35
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const amp = base + (AMP - base) * (1 + msgAt(t)) / 2
    const y = mid - amp * Math.sin(2 * Math.PI * FC * t)
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

/** FM (row 2): frequency rides the message, via phase accumulation. */
function fmPath(): string {
  const mid = rowMid(2)
  let phase = 0
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const y = mid - AMP * Math.sin(phase)
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
    const instFreq = FC * (1 + 0.6 * msgAt(t))
    phase += (2 * Math.PI * instFreq) / SAMPLES
  }
  return d
}

/** PM (row 3): phase rides the message. */
function pmPath(): string {
  const mid = rowMid(3)
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const y = mid - AMP * Math.sin(2 * Math.PI * FC * t + 2.2 * msgAt(t))
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

export default function CarrierKnobs() {
  const { t } = useTranslation('ui')

  const rows: { title: string; path: string; color: string }[] = [
    { title: t('ch2_2.carrierKnobs.messageLabel'), path: messagePath(), color: svgTokens.mutedFg },
    { title: t('ch2_2.carrierKnobs.amLabel'), path: amPath(), color: svgTokens.primary },
    { title: t('ch2_2.carrierKnobs.fmLabel'), path: fmPath(), color: svgTokens.primary },
    { title: t('ch2_2.carrierKnobs.pmLabel'), path: pmPath(), color: svgTokens.primary },
  ]

  // Faint guides at message extrema (drawn as background — overlap test ignores).
  const guideXs = [1 / 6, 3 / 6, 5 / 6].map(f => PLOT_X0 + f * PLOT_W)

  return (
    <DiagramFigure caption={t('ch2_2.carrierKnobs.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_2.carrierKnobs.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* faint full-height guides */}
        {guideXs.map((x, i) => (
          <line key={i} x1={x} y1={PAD_T} x2={x} y2={VB_H - PAD_B}
            stroke={svgTokens.border} strokeWidth={0.6} strokeDasharray="3 3" opacity={0.35} />
        ))}

        {rows.map((row, r) => (
          <g key={r}>
            <text
              x={PLOT_X0}
              y={PAD_T + r * ROW_H + 12}
              fontSize="13"
              fontWeight={600}
              fill={svgTokens.fg}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {row.title}
            </text>
            {/* zero line */}
            <line x1={PLOT_X0} y1={rowMid(r)} x2={PLOT_X1} y2={rowMid(r)}
              stroke={svgTokens.border} strokeWidth={0.6} opacity={0.5} />
            <path d={row.path} fill="none" stroke={row.color} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
      </svg>
    </DiagramFigure>
  )
}
