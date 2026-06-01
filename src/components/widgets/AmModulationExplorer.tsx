/**
 * Chapter 2.2 §4 — interactive AM modulation explorer.
 *
 * One slider sets the modulation index m (0 … 1.3). Two synced views:
 *   Time view      — the modulated carrier (1 + m·message)·sin(carrier),
 *                    with its envelope drawn dashed. Past m = 1 the envelope
 *                    crosses zero and the trace tears: overmodulation.
 *   Frequency view — the carrier (constant) plus two sidebands whose height
 *                    grows with m (each = m/2 of the carrier).
 *
 * Slider-driven, no animation (per the chapter's interactive-not-animated
 * choice), so prefers-reduced-motion needs no special handling.
 */
import { useId, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { svgTokens } from '@/components/diagrams/svgTokens'

const FC = 18 // carrier cycles across the time view
const MAX_MAG = 2.3 // 1 + max modulation index

// Time view geometry
const T_W = 500
const T_H = 150
const T_PAD = 12
const T_PLOT_W = T_W - 2 * T_PAD
const T_MID = T_H / 2
const T_AMP = T_H / 2 - 10
const T_SCALE = T_AMP / MAX_MAG

// Spectrum view geometry
const S_W = 500
const S_H = 150
const S_BY = 118
const S_CARH = 92
const S_OFF = 78

function msgAt(t: number): number {
  return Math.sin(2 * Math.PI * t)
}

export default function AmModulationExplorer() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const [mi, setMi] = useState(0.7)
  const clipId = useId()

  const overmod = mi > 1.0

  const { modPath, envUpper, envLower } = useMemo(() => {
    const N = 600
    let mod = ''
    let up = ''
    let lo = ''
    for (let i = 0; i <= N; i++) {
      const tt = i / N
      const x = T_PAD + tt * T_PLOT_W
      const env = 1 + mi * msgAt(tt)
      const yMod = T_MID - T_SCALE * env * Math.sin(2 * Math.PI * FC * tt)
      const yUp = T_MID - T_SCALE * env
      const yLo = T_MID + T_SCALE * env
      mod += i === 0 ? `M${x.toFixed(2)} ${yMod.toFixed(2)}` : ` L${x.toFixed(2)} ${yMod.toFixed(2)}`
      up += i === 0 ? `M${x.toFixed(2)} ${yUp.toFixed(2)}` : ` L${x.toFixed(2)} ${yUp.toFixed(2)}`
      lo += i === 0 ? `M${x.toFixed(2)} ${yLo.toFixed(2)}` : ` L${x.toFixed(2)} ${yLo.toFixed(2)}`
    }
    return { modPath: mod, envUpper: up, envLower: lo }
  }, [mi])

  // Spectrum: sideband height = (m/2) of carrier, capped at carrier height.
  const sbH = Math.min(1, mi / 2) * S_CARH
  const cx = S_W / 2

  return (
    <Widget
      title={t('ch2_2.amExplorer.title')}
      description={<Trans i18nKey="ch2_2.amExplorer.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* slider */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="am-mi" className="text-foreground font-medium shrink-0 w-44">
          {t('ch2_2.amExplorer.indexLabel')}
        </label>
        <input
          id="am-mi"
          type="range"
          min={0}
          max={1.3}
          step={0.05}
          value={mi}
          onChange={e => setMi(Number(e.target.value))}
          className="flex-1 min-w-[140px] accent-primary"
        />
        <span className="font-mono text-foreground w-16 text-right shrink-0">
          {num(Math.round(mi * 100) / 100)}
        </span>
      </div>

      <p className="text-[13px] text-muted-foreground">{t('ch2_2.amExplorer.indexHint')}</p>

      {/* time view */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">{t('ch2_2.amExplorer.timeTitle')}</p>
        <svg
          width={T_W}
          height={T_H}
          viewBox={`0 0 ${T_W} ${T_H}`}
          role="img"
          aria-label={t('ch2_2.amExplorer.timeTitle')}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={T_PAD - 3} y={-3} width={T_PLOT_W + 6} height={T_H + 6} />
            </clipPath>
          </defs>
          <line x1={T_PAD} y1={T_MID} x2={T_W - T_PAD} y2={T_MID} stroke={svgTokens.border} strokeWidth={0.8} />
          <g clipPath={`url(#${clipId})`}>
            <path d={envUpper} fill="none" stroke={svgTokens.mutedFg} strokeWidth={1.3} strokeDasharray="4 3" opacity={0.7} />
            <path d={envLower} fill="none" stroke={svgTokens.mutedFg} strokeWidth={1.3} strokeDasharray="4 3" opacity={0.7} />
            <path d={modPath} fill="none" stroke={overmod ? svgTokens.caution : svgTokens.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>

      {/* spectrum view */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">{t('ch2_2.amExplorer.spectrumTitle')}</p>
        <svg
          width={S_W}
          height={S_H}
          viewBox={`0 0 ${S_W} ${S_H}`}
          role="img"
          aria-label={t('ch2_2.amExplorer.spectrumTitle')}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1={40} y1={S_BY} x2={S_W - 40} y2={S_BY} stroke={svgTokens.border} strokeWidth={1} />
          {/* lower sideband */}
          {sbH > 0.5 && (
            <line x1={cx - S_OFF} y1={S_BY} x2={cx - S_OFF} y2={S_BY - sbH} stroke={svgTokens.experiment} strokeWidth={6} strokeLinecap="round" />
          )}
          {/* upper sideband */}
          {sbH > 0.5 && (
            <line x1={cx + S_OFF} y1={S_BY} x2={cx + S_OFF} y2={S_BY - sbH} stroke={svgTokens.experiment} strokeWidth={6} strokeLinecap="round" />
          )}
          {/* carrier */}
          <line x1={cx} y1={S_BY} x2={cx} y2={S_BY - S_CARH} stroke={svgTokens.primary} strokeWidth={6} strokeLinecap="round" />
          {/* labels */}
          <text x={cx} y={S_BY + 18} fontSize="13" textAnchor="middle" fill={svgTokens.primary} fontFamily="ui-sans-serif, system-ui, sans-serif">
            {t('ch2_2.amExplorer.carrierTick')}
          </text>
          <text x={cx - S_OFF} y={S_BY + 18} fontSize="13" textAnchor="middle" fill={svgTokens.experiment} fontFamily="ui-sans-serif, system-ui, sans-serif">
            {t('ch2_2.amExplorer.lsbTick')}
          </text>
          <text x={cx + S_OFF} y={S_BY + 18} fontSize="13" textAnchor="middle" fill={svgTokens.experiment} fontFamily="ui-sans-serif, system-ui, sans-serif">
            {t('ch2_2.amExplorer.usbTick')}
          </text>
        </svg>
      </div>

      {/* readout */}
      <ResultBox tone={overmod ? 'error' : 'success'} label={t('ch2_2.amExplorer.stateLabel')}>
        <p className="text-foreground">
          {overmod
            ? t('ch2_2.amExplorer.overmodWarn')
            : t('ch2_2.amExplorer.okState', { pct: num(Math.round(mi * 100)) })}
        </p>
      </ResultBox>
    </Widget>
  )
}
