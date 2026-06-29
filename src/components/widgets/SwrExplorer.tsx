/**
 * Chapter 3.3 §6 — standing-wave / SWR explorer.
 *
 * Slide the antenna feed impedance away from the 50 Ω the line wants and watch
 * the voltage envelope along the feedline swell from flat (matched) into a
 * standing wave. Live readouts: SWR, reflection |Γ|, power reflected, return loss.
 *
 *   Γ   = (Z − Z₀) / (Z + Z₀)            (resistive load → real Γ)
 *   SWR = (1 + |Γ|) / (1 − |Γ|)
 *   reflected power = |Γ|²
 *   return loss = −20·log₁₀|Γ|
 *
 * The envelope is the magnitude |1 + Γ·e^(−j2βd)| of forward + reflected waves;
 * for R ≥ Z₀ a voltage maximum sits at the load, for R < Z₀ a minimum does.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { MathVar } from '@/components/ui/math'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const Z0 = 50

// SVG geometry
const W = 560
const H = 212
const PAD_L = 44
const PAD_R = 70
const X0 = PAD_L
const X1 = W - PAD_R
const PLOT_W = X1 - X0
const MID = 92
const HALF_H = 72
// Largest |Γ| on the slider (R = 10 or 250) → Vmax = 1.667; leave headroom.
const SCALE = HALF_H / 1.85
const N = 150

export default function SwrExplorer() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [r, setR] = useState(73)

  const m = useMemo(() => {
    const gamma = (r - Z0) / (r + Z0)
    const g = Math.abs(gamma)
    const swr = g >= 1 ? Infinity : (1 + g) / (1 - g)
    const refl = g * g * 100
    const rl = g <= 1e-9 ? Infinity : -20 * Math.log10(g)
    const theta = r >= Z0 ? 0 : Math.PI
    return { g, swr, refl, rl, theta }
  }, [r])

  const env = useMemo(() => {
    const up: string[] = []
    const lo: string[] = []
    for (let i = 0; i <= N; i++) {
      const x = X0 + (PLOT_W * i) / N
      const uFromAnt = (X1 - x) / PLOT_W // 0 at the antenna (right), 1 at the rig
      const arg = 6 * Math.PI * uFromAnt - m.theta
      const v = Math.sqrt(1 + m.g * m.g + 2 * m.g * Math.cos(arg))
      const yUp = MID - v * SCALE
      const yLo = MID + v * SCALE
      up.push(`${x.toFixed(2)},${yUp.toFixed(2)}`)
      lo.push(`${x.toFixed(2)},${yLo.toFixed(2)}`)
    }
    const area = `M ${up.join(' L ')} L ${[...lo].reverse().join(' L ')} Z`
    return {
      upper: `M ${up.join(' L ')}`,
      lower: `M ${lo.join(' L ')}`,
      area,
      vmaxY: MID - (1 + m.g) * SCALE,
      vminY: MID - (1 - m.g) * SCALE,
    }
  }, [m])

  // status message — one of three markup-free keys, safe for plain t():
  //   swrExplorer.matched / .mild / .high
  const statusKey = m.swr <= 1.05 ? 'matched' : m.swr >= 3 ? 'high' : 'mild'
  const statusTone = statusKey === 'matched' ? 'success' : statusKey === 'high' ? 'warn' : 'info'

  return (
    <Widget
      title={t('ch3_3.swrExplorer.title')}
      description={<Trans i18nKey="ch3_3.swrExplorer.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* slider */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="swr-r" className="text-foreground font-medium shrink-0">
          {t('ch3_3.swrExplorer.loadLabel')}
        </label>
        <input
          id="swr-r"
          type="range"
          min={10}
          max={250}
          step={1}
          value={r}
          onChange={e => setR(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-[hsl(var(--primary))]"
        />
        <span className="font-mono text-foreground w-24 text-right">
          {r} {tUnit('ohm')} <span className="text-muted-foreground">/ {Z0}</span>
        </span>
      </div>
      <p className="text-[13px] text-muted-foreground -mt-2">{t('ch3_3.swrExplorer.z0Note')}</p>

      {/* standing-wave display */}
      <div className="overflow-x-auto">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t('ch3_3.swrExplorer.ariaLabel')}
          style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        >
          {/* feedline baseline */}
          <line x1={X0} y1={MID} x2={X1} y2={MID} stroke="hsl(var(--border))" strokeWidth={1} />
          {/* Vmax / Vmin guide lines (only when there is a standing wave) */}
          {m.g > 0.02 && (
            <>
              <line x1={X0} y1={env.vmaxY} x2={X1} y2={env.vmaxY} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
              <line x1={X0} y1={env.vminY} x2={X1} y2={env.vminY} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
              <text x={X1 + 6} y={env.vmaxY + 4} fontSize={13} fill="hsl(var(--muted-foreground))">{t('ch3_3.swrExplorer.vmax')}</text>
              <text x={X1 + 6} y={env.vminY + 4} fontSize={13} fill="hsl(var(--muted-foreground))">{t('ch3_3.swrExplorer.vmin')}</text>
            </>
          )}
          {/* envelope band + edges */}
          <path d={env.area} fill="hsl(var(--primary))" opacity={0.12} />
          <path d={env.upper} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          <path d={env.lower} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} opacity={0.5} />
          {/* end labels */}
          <text x={X0} y={H - 8} fontSize={13} fontWeight={600} fill="hsl(var(--foreground))" textAnchor="start">{t('ch3_3.swrExplorer.rigEnd')}</text>
          <text x={X1} y={H - 8} fontSize={13} fontWeight={600} fill="hsl(var(--foreground))" textAnchor="end">{t('ch3_3.swrExplorer.antEnd')}</text>
          <text x={(X0 + X1) / 2} y={H - 8} fontSize={13} fill="hsl(var(--muted-foreground))" textAnchor="middle">{t('ch3_3.swrExplorer.lineLabel')}</text>
        </svg>
      </div>

      {/* readouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultBox tone="primary" label={t('ch3_3.swrExplorer.swrOut')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {m.swr === Infinity ? '∞' : `${fmt(m.swr, 2)} : 1`}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={<span>{t('ch3_3.swrExplorer.gammaOut')} |<MathVar>{'\\Gamma'}</MathVar>|</span>}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmt(m.g, 2)}</p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch3_3.swrExplorer.reflOut')}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmt(m.refl, 1)} %</p>
        </ResultBox>
        <ResultBox tone="muted" label={t('ch3_3.swrExplorer.rlOut')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {m.rl === Infinity ? '∞' : fmt(m.rl, 1)} {tUnit('db')}
          </p>
        </ResultBox>
      </div>

      <ResultBox tone={statusTone}>
        <p className="text-[13px] text-foreground">{t(`ch3_3.swrExplorer.${statusKey}`)}</p>
      </ResultBox>
    </Widget>
  )
}
