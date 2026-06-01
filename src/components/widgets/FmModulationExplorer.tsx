/**
 * Chapter 2.2 §6 — interactive FM modulation explorer.
 *
 * One slider sets the frequency deviation (kHz). Two stacked views:
 *   Top    — the slow message.
 *   Bottom — the FM carrier (phase-accumulated so the cycles genuinely
 *            bunch and stretch), with a faint constant-frequency «rest»
 *            reference behind it. The carrier's height never changes.
 *
 * A Carson's-rule readout shows the resulting bandwidth, 2·(deviation +
 * audio), with the audio fixed at 3 kHz (communications speech).
 *
 * Slider-driven, no animation (per the chapter's interactive-not-animated
 * choice), so prefers-reduced-motion needs no special handling.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { svgTokens } from '@/components/diagrams/svgTokens'

const AUDIO_KHZ = 3 // fixed communications-speech audio bandwidth
const MAX_DEV = 8 // slider max, kHz
const BASE_FC = 18 // carrier cycles across the view at rest

const W = 500
const H = 175
const PAD = 12
const PLOT_W = W - 2 * PAD

const A_MID = 40 // message band mid
const A_AMP = 17
const B_MID = 120 // FM band mid
const B_AMP = 34

function msgAt(t: number): number {
  return Math.sin(2 * Math.PI * t)
}

export default function FmModulationExplorer() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const [devKhz, setDevKhz] = useState(5)

  const { msgPath, fmPath, refPath } = useMemo(() => {
    const N = 700
    let msg = ''
    let fm = ''
    let ref = ''
    let phase = 0
    let refPhase = 0
    const swing = 0.7 * (devKhz / MAX_DEV)
    for (let i = 0; i <= N; i++) {
      const tt = i / N
      const x = PAD + tt * PLOT_W
      const yMsg = A_MID - A_AMP * msgAt(tt)
      const yFm = B_MID - B_AMP * Math.sin(phase)
      const yRef = B_MID - B_AMP * Math.sin(refPhase)
      msg += i === 0 ? `M${x.toFixed(2)} ${yMsg.toFixed(2)}` : ` L${x.toFixed(2)} ${yMsg.toFixed(2)}`
      fm += i === 0 ? `M${x.toFixed(2)} ${yFm.toFixed(2)}` : ` L${x.toFixed(2)} ${yFm.toFixed(2)}`
      ref += i === 0 ? `M${x.toFixed(2)} ${yRef.toFixed(2)}` : ` L${x.toFixed(2)} ${yRef.toFixed(2)}`
      phase += (2 * Math.PI * BASE_FC * (1 + swing * msgAt(tt))) / N
      refPhase += (2 * Math.PI * BASE_FC) / N
    }
    return { msgPath: msg, fmPath: fm, refPath: ref }
  }, [devKhz])

  const carsonKhz = 2 * (devKhz + AUDIO_KHZ)

  return (
    <Widget
      title={t('ch2_2.fmExplorer.title')}
      description={<Trans i18nKey="ch2_2.fmExplorer.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* slider */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="fm-dev" className="text-foreground font-medium shrink-0 w-44">
          {t('ch2_2.fmExplorer.deviationLabel')}
        </label>
        <input
          id="fm-dev"
          type="range"
          min={0}
          max={MAX_DEV}
          step={0.5}
          value={devKhz}
          onChange={e => setDevKhz(Number(e.target.value))}
          className="flex-1 min-w-[140px] accent-primary"
        />
        <span className="font-mono text-foreground w-24 text-right shrink-0">
          ±{num(devKhz)} {tUnit('khz')}
        </span>
      </div>

      <p className="text-[13px] text-muted-foreground">{t('ch2_2.fmExplorer.deviationHint')}</p>

      {/* time view */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">{t('ch2_2.fmExplorer.timeTitle')}</p>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t('ch2_2.fmExplorer.timeTitle')}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* message band */}
          <text x={PAD} y={14} fontSize="13" fontWeight={600} fill={svgTokens.fg} fontFamily="ui-sans-serif, system-ui, sans-serif">
            {t('ch2_2.fmExplorer.messageLabel')}
          </text>
          <line x1={PAD} y1={A_MID} x2={W - PAD} y2={A_MID} stroke={svgTokens.border} strokeWidth={0.6} opacity={0.5} />
          <path d={msgPath} fill="none" stroke={svgTokens.mutedFg} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />

          {/* FM band */}
          <text x={PAD} y={78} fontSize="13" fontWeight={600} fill={svgTokens.fg} fontFamily="ui-sans-serif, system-ui, sans-serif">
            {t('ch2_2.fmExplorer.fmLabel')}
          </text>
          <line x1={PAD} y1={B_MID} x2={W - PAD} y2={B_MID} stroke={svgTokens.border} strokeWidth={0.6} opacity={0.5} />
          {/* faint rest-frequency reference (background) */}
          <path d={refPath} fill="none" stroke={svgTokens.border} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
          <text x={W - PAD} y={B_MID + B_AMP + 16} fontSize="13" textAnchor="end" fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif">
            {t('ch2_2.fmExplorer.restLabel')}
          </text>
          {/* FM trace */}
          <path d={fmPath} fill="none" stroke={svgTokens.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Carson readout */}
      <ResultBox tone="info" label={t('ch2_2.fmExplorer.bwReadout')}>
        <p className="text-xl font-mono font-semibold text-foreground">
          {num(carsonKhz)} {tUnit('khz')}
        </p>
        <p className="text-[13px] text-muted-foreground mt-1">
          2 × (±{num(devKhz)} + {num(AUDIO_KHZ)}) {tUnit('khz')}
        </p>
      </ResultBox>
    </Widget>
  )
}
