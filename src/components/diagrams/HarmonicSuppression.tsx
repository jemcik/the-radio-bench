/**
 * Chapter 3.2 §6 — why the output filter is low-pass.
 *
 * A spectrum: the fundamental sits inside the filter's passband (shaded) and
 * passes; the 2nd/3rd/4th harmonics the PA makes (dashed) fall above the
 * passband and get crushed to the solid stubs that reach the antenna. The
 * low-pass response curve is drawn as a faint guide.
 *
 * Static snapshot — bare <svg>, fixed px = viewBox, numeric fontSize.
 * hardcoded-fontsize-file-ok: spectrum with hand-tuned label sizes; the
 * multiplier ticks (1× … 4×) are symbolic, not translatable prose.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 600
const VB_H = 216
const PLOT_X0 = 52
const PLOT_X1 = 540
const BASE_Y = 170
const PLOT_TOP = 30

const X = [128, 232, 340, 452] // 1× (fundamental), 2×, 3×, 4×
const PB_X = 182               // passband edge (cutoff)
const RC_TOP = 46
const RC_BOT = 160
const ROLL_END = 336

const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** Low-pass response: flat across the passband, rolling off above the cutoff. */
function responsePath(): string {
  let d = ''
  for (let x = PLOT_X0; x <= PLOT_X1; x += 6) {
    let y = RC_TOP
    if (x > PB_X) {
      const t = Math.min(1, (x - PB_X) / (ROLL_END - PB_X))
      y = RC_TOP + (RC_BOT - RC_TOP) * Math.pow(t, 1.3)
    }
    d += `${x === PLOT_X0 ? 'M' : 'L'} ${x} ${y.toFixed(1)} `
  }
  return d.trim()
}

export default function HarmonicSuppression() {
  const { t } = useTranslation('ui')
  // ghost (PA output) and survivor (after filter) spike tops, per harmonic
  const ghostTop = [44, 80, 106, 124]
  const survTop = [44, 158, 161, 163]
  const ticks = ['1×', '2×', '3×', '4×']

  return (
    <DiagramFigure caption={t('ch3_2.harmSpectrum.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_2.harmSpectrum.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* passband shading */}
        <rect x={PLOT_X0} y={PLOT_TOP} width={PB_X - PLOT_X0} height={BASE_Y - PLOT_TOP}
          fill="hsl(var(--callout-note))" opacity={0.12} />
        {/* faint low-pass response curve (kept ≤0.6 opacity = background guide) */}
        <path d={responsePath()} stroke="hsl(var(--callout-note))" strokeWidth={1.6} fill="none" opacity={0.6} strokeLinecap="round" />

        {/* x-axis */}
        <line x1={PLOT_X0} y1={BASE_Y} x2={PLOT_X1} y2={BASE_Y} stroke={svgTokens.mutedFg} strokeWidth={1.2} />

        {/* harmonic ghost spikes (what the PA makes) + survivor stubs (after filter) */}
        {X.map((x, i) => i === 0 ? null : (
          <g key={`h${i}`}>
            <line x1={x} y1={BASE_Y} x2={x} y2={ghostTop[i]} stroke={svgTokens.caution} strokeWidth={3} strokeDasharray="3 3" opacity={0.5} />
            <line x1={x} y1={BASE_Y} x2={x} y2={survTop[i]} stroke={svgTokens.caution} strokeWidth={4} />
          </g>
        ))}
        {/* fundamental spike */}
        <line x1={X[0]} y1={BASE_Y} x2={X[0]} y2={ghostTop[0]} stroke={svgTokens.primary} strokeWidth={5} strokeLinecap="round" />

        {/* labels */}
        <text x={X[0]} y={22} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch3_2.harmSpectrum.fundamental')}
        </text>
        <text x={392} y={22} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.caution} fontFamily={SANS}>
          {t('ch3_2.harmSpectrum.crushed')}
        </text>
        <text x={(PLOT_X0 + PB_X) / 2} y={204} fontSize="12" textAnchor="middle" fill="hsl(var(--callout-note))" fontFamily={SANS}>
          {t('ch3_2.harmSpectrum.passband')}
        </text>

        {/* ticks + axis label */}
        {X.map((x, i) => (
          <text key={`t${i}`} x={x} y={188} fontSize="12.5" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
            {ticks[i]}
          </text>
        ))}
        <text x={PLOT_X1} y={188} fontSize="12" textAnchor="end" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.harmSpectrum.freq')} →
        </text>
      </svg>
    </DiagramFigure>
  )
}
