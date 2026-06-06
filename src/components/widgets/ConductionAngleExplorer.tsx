/**
 * Chapter 2.3 §3 — amplifier-class explorer.
 *
 * Drag the conduction angle Φ (how much of each cycle the device conducts).
 * The widget shows the class, the best-case (ideal) efficiency, which modes it
 * can carry, and the device-current pulse.
 *
 * Ideal efficiency vs conduction half-angle α (= Φ/2), classic result:
 *   η = ¼ · (2α − sin 2α) / (sin α − α cos α)
 * giving 50 % at Φ = 360° (Class A), 78.5 % at 180° (Class B), rising further
 * as conduction shrinks. cf. ARRL Handbook 2023, §17.2; Cripps, RF Power
 * Amplifiers for Wireless Communications.
 */
import { useId, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'

const PRIMARY = 'hsl(var(--primary))'
const WARN = 'hsl(var(--callout-caution))'
const BORDER = 'hsl(var(--border))'

const VB_W = 300
const VB_H = 104
const BASE_Y = 80
const AMP = 56
const HALF_W = 120
const CX = VB_W / 2

/** Ideal efficiency (%) for full conduction angle Φ (degrees). */
function idealEfficiency(phiDeg: number): number {
  const alpha = ((phiDeg / 2) * Math.PI) / 180
  const numer = 2 * alpha - Math.sin(2 * alpha)
  const denom = Math.sin(alpha) - alpha * Math.cos(alpha)
  if (denom <= 1e-6) return 100
  return Math.min(100, (numer / denom) * 25)
}

function classify(phiDeg: number): { key: string; nonlinear: boolean } {
  if (phiDeg >= 350) return { key: 'classAName', nonlinear: false }
  if (phiDeg >= 200) return { key: 'classABName', nonlinear: false }
  if (phiDeg >= 180) return { key: 'classBName', nonlinear: false }
  return { key: 'classCName', nonlinear: true }
}

/** Filled device-current pulse for full conduction angle Φ (degrees). */
function pulsePath(phiDeg: number): string {
  const alpha = (phiDeg / 2) * (Math.PI / 180)
  const cosA = Math.cos(alpha)
  const denom = 1 - cosA
  const N = 80
  let d = `M ${CX - HALF_W} ${BASE_Y} `
  for (let i = 0; i <= N; i++) {
    const theta = (-180 + (360 * i) / N) * (Math.PI / 180)
    const norm = denom <= 1e-6 ? (Math.cos(theta) > cosA ? 1 : 0) : Math.max(0, (Math.cos(theta) - cosA) / denom)
    const x = CX - HALF_W + (2 * HALF_W * i) / N
    const y = BASE_Y - AMP * norm
    d += `L ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  d += `L ${CX + HALF_W} ${BASE_Y} Z`
  return d
}

export default function ConductionAngleExplorer() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const labelId = useId()

  const [phi, setPhi] = useState(360)

  const { cls, eff, color } = useMemo(() => {
    const c = classify(phi)
    return { cls: c, eff: idealEfficiency(phi), color: classify(phi).nonlinear ? WARN : PRIMARY }
  }, [phi])

  return (
    <Widget
      title={t('ch2_3.conduction.title')}
      description={<Trans i18nKey="ch2_3.conduction.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* slider */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor={labelId} className="text-foreground font-medium shrink-0 w-44">
          {t('ch2_3.conduction.angleLabel')}
        </label>
        <input
          id={labelId}
          type="range"
          min={90}
          max={360}
          step={5}
          value={phi}
          onChange={e => setPhi(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-16 text-right shrink-0">{num(phi)}°</span>
      </div>

      {/* device-current pulse */}
      <div className="flex justify-center">
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t('ch2_3.conduction.waveLabel')}
          style={{ maxWidth: '100%', height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1={CX - HALF_W} y1={BASE_Y} x2={CX + HALF_W} y2={BASE_Y} stroke={BORDER} strokeWidth={1} />
          <path d={pulsePath(phi)} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
          <text x={CX} y={98} fontSize="13" textAnchor="middle" fill="hsl(var(--muted-foreground))"
            fontFamily="ui-sans-serif, system-ui, sans-serif">
            {t('ch2_3.conduction.waveLabel')}
          </text>
        </svg>
      </div>

      {/* readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone={cls.nonlinear ? 'warn' : 'primary'} label={t('ch2_3.conduction.classReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {t(`ch2_3.conduction.${cls.key}`)}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch2_3.conduction.effReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">{num(Math.round(eff))} %</p>
        </ResultBox>
        <ResultBox tone={cls.nonlinear ? 'warn' : 'success'} label={t('ch2_3.conduction.useReadout')}>
          <p className="text-sm font-medium text-foreground">
            {cls.nonlinear ? t('ch2_3.conduction.nonlinearUse') : t('ch2_3.conduction.linearUse')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch2_3.conduction.hint" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
