/**
 * Chapter 2.3 §3 — the four amplifier classes by conduction angle.
 *
 * Each panel shows ONE cycle of the drive signal as a thin cosine curve, plus
 * a dashed "conduction threshold" line. The device conducts only while the
 * signal rises ABOVE that threshold — that slice is shaded, and its angular
 * width is the conduction angle:
 *
 *   Class A  threshold at the trough  → conducts the whole cycle (360°)
 *   Class AB threshold below centre   → a little over half
 *   Class B  threshold at centre      → exactly half (180°)
 *   Class C  threshold high           → a brief slice (< 180°)
 *
 * Conducting less wastes less power (higher efficiency) but distorts the wave,
 * so Class C is nonlinear. cf. ARRL Handbook 2023, §17.2.
 *
 * The full cosine + the threshold are what make "the shaded part of the cycle"
 * legible: without them the reader sees four filled bumps and no reference for
 * what is conducting vs not (reader-flagged, ch 2.3).
 *
 * Static snapshot. Bare <svg>, fixed px = viewBox, per the diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 560
const VB_H = 232

const SANS = 'ui-sans-serif, system-ui, sans-serif'
const WARN = 'hsl(var(--callout-caution))'

const MID_Y = 96 // cosine centre line (cos = 0)
const WAVE_AMP = 30 // cosine amplitude (cos = ±1 → ±30 px)
const HALF_W = 56 // half plot width per panel

const PANELS = [
  { key: 'a', alphaDeg: 180, nonlinear: false },
  { key: 'ab', alphaDeg: 120, nonlinear: false },
  { key: 'b', alphaDeg: 90, nonlinear: false },
  { key: 'c', alphaDeg: 60, nonlinear: true },
] as const

const CX = [70, 210, 350, 490]

const cosY = (c: number) => MID_Y - WAVE_AMP * c
const xOf = (cx: number, thetaDeg: number) => cx - HALF_W + ((thetaDeg + 180) / 360) * 2 * HALF_W

/** Full one-cycle cosine curve (peak centred, troughs at the edges). */
function cosineLine(cx: number): string {
  const N = 72
  let d = ''
  for (let i = 0; i <= N; i++) {
    const theta = -180 + (360 * i) / N
    const x = xOf(cx, theta)
    const y = cosY(Math.cos((theta * Math.PI) / 180))
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

/** Filled conduction slice: the area above the threshold (cos > cosα), bounded
 *  by the cosine on top and the flat threshold line on the bottom. */
function conductionFill(cx: number, alphaDeg: number): string {
  const cosA = Math.cos((alphaDeg * Math.PI) / 180)
  const thY = cosY(cosA)
  const N = 48
  let d = `M ${xOf(cx, -alphaDeg).toFixed(1)} ${thY.toFixed(1)} `
  for (let i = 0; i <= N; i++) {
    const theta = -alphaDeg + (2 * alphaDeg * i) / N
    const x = xOf(cx, theta)
    const y = cosY(Math.cos((theta * Math.PI) / 180))
    d += `L ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  d += `L ${xOf(cx, alphaDeg).toFixed(1)} ${thY.toFixed(1)} Z`
  return d
}

export default function AmplifierClassChart() {
  const { t } = useTranslation('ui')

  return (
    <DiagramFigure caption={t('ch2_3.classChart.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_3.classChart.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {PANELS.map((p, i) => {
          const cx = CX[i]
          const color = p.nonlinear ? WARN : svgTokens.primary
          const thY = cosY(Math.cos((p.alphaDeg * Math.PI) / 180))
          return (
            <g key={p.key}>
              {/* conduction threshold (dashed) */}
              <line x1={cx - HALF_W} y1={thY} x2={cx + HALF_W} y2={thY}
                stroke={color} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.8} />
              {/* shaded conduction slice (above the threshold) */}
              <path d={conductionFill(cx, p.alphaDeg)} fill={color} fillOpacity={0.28}
                stroke="none" />
              {/* one cycle of the drive signal */}
              <path d={cosineLine(cx)} fill="none" stroke={svgTokens.fg}
                strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />

              {/* labels */}
              <text x={cx} y={148} fontSize="14" fontWeight={700} textAnchor="middle"
                fill={svgTokens.fg} fontFamily={SANS}>
                {t(`ch2_3.classChart.${p.key}Name`)}
              </text>
              <text x={cx} y={166} fontSize="13" textAnchor="middle"
                fill={svgTokens.mutedFg} fontFamily={SANS}>
                {t(`ch2_3.classChart.${p.key}Cond`)}
              </text>
              <text x={cx} y={186} fontSize="13.5" fontWeight={600} textAnchor="middle"
                fill={svgTokens.fg} fontFamily={SANS}>
                {t(`ch2_3.classChart.${p.key}Eff`)}
              </text>
              <text x={cx} y={206} fontSize="13" textAnchor="middle"
                fill={p.nonlinear ? WARN : svgTokens.primary} fontFamily={SANS}>
                {t(`ch2_3.classChart.${p.key}Tag`)}
              </text>
            </g>
          )
        })}
      </svg>
    </DiagramFigure>
  )
}
