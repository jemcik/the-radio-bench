/**
 * Chapter 3.3 §1 — current and voltage along a half-wave dipole.
 *
 * Current (solid, primary) peaks at the centre feed point and falls to zero at
 * the ends; voltage (dashed) does the reverse. Feeding at the centre — high
 * current, low voltage — is what gives the dipole its ~73 Ω feed impedance.
 *
 * Static snapshot — bare <svg>, fixed px = viewBox, numeric fontSize. The two
 * curves are wrapped in a clipPath (per the plotted-curve rule).
 *
 * hardcoded-fontsize-file-ok: standalone illustration with hand-tuned label
 * sizes in user-space units. No SVGDiagram wrapper.
 */
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 560
const VB_H = 240
const DIP_Y = 150
const X_L = 70
const X_R = 490
const CX = (X_L + X_R) / 2
const HALF = (X_R - X_L) / 2
const AMP_I = 70
const AMP_V = 56
const SANS = 'ui-sans-serif, system-ui, sans-serif'

function currentPath(): string {
  const N = 120
  let d = ''
  for (let i = 0; i <= N; i++) {
    const x = X_L + ((X_R - X_L) * i) / N
    const u = (x - CX) / HALF
    const y = DIP_Y - AMP_I * Math.cos((u * Math.PI) / 2)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

function voltagePath(): string {
  const N = 120
  let d = ''
  for (let i = 0; i <= N; i++) {
    const x = X_L + ((X_R - X_L) * i) / N
    const u = (x - CX) / HALF
    const y = DIP_Y + AMP_V * Math.abs(Math.sin((u * Math.PI) / 2))
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

export default function DipoleCurrentVoltage() {
  const { t } = useTranslation('ui')
  const clipId = useId()

  return (
    <DiagramFigure caption={t('ch3_3.dipoleIV.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_3.dipoleIV.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <clipPath id={clipId}>
          <rect x={X_L - 6} y={DIP_Y - AMP_I - 8} width={X_R - X_L + 12} height={AMP_I + AMP_V + 16} />
        </clipPath>

        {/* the dipole wire, with a feed gap at the centre */}
        <line x1={X_L} y1={DIP_Y} x2={CX - 8} y2={DIP_Y} stroke={svgTokens.fg} strokeWidth={3} strokeLinecap="round" />
        <line x1={CX + 8} y1={DIP_Y} x2={X_R} y2={DIP_Y} stroke={svgTokens.fg} strokeWidth={3} strokeLinecap="round" />
        <circle cx={CX - 8} cy={DIP_Y} r={3.2} fill={svgTokens.fg} />
        <circle cx={CX + 8} cy={DIP_Y} r={3.2} fill={svgTokens.fg} />

        {/* curves */}
        <g clipPath={`url(#${clipId})`}>
          <path d={currentPath()} fill="none" stroke={svgTokens.primary} strokeWidth={2.4} strokeLinecap="round" />
          <path d={voltagePath()} fill="none" stroke={svgTokens.note} strokeWidth={2.2} strokeDasharray="5 4" strokeLinecap="round" />
        </g>

        {/* feed-point callout (leader straight down from the gap, clear of curves) */}
        <line x1={CX} y1={DIP_Y} x2={CX} y2={DIP_Y + 64} stroke={svgTokens.mutedFg} strokeWidth={1} />
        <text x={CX} y={DIP_Y + 80} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_3.dipoleIV.feedLabel')}
        </text>

        {/* end labels, in the gutter beyond each tip */}
        <text x={X_L - 12} y={DIP_Y + 4} fontSize="13" textAnchor="end" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_3.dipoleIV.endLabel')}
        </text>
        <text x={X_R + 12} y={DIP_Y + 4} fontSize="13" textAnchor="start" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_3.dipoleIV.endLabel')}
        </text>

        {/* legend (top-right, above the current curve) */}
        <line x1={398} y1={30} x2={426} y2={30} stroke={svgTokens.primary} strokeWidth={2.4} />
        <text x={432} y={34} fontSize="13" textAnchor="start" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_3.dipoleIV.current')}
        </text>
        <line x1={398} y1={50} x2={426} y2={50} stroke={svgTokens.note} strokeWidth={2.2} strokeDasharray="5 4" />
        <text x={432} y={54} fontSize="13" textAnchor="start" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_3.dipoleIV.voltage')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
