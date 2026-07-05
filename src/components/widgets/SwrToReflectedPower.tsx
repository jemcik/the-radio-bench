/**
 * Chapter 3.4 §3 — SWR → reflected-power converter.
 *
 * An SWR meter shows one number; this widget turns that number into watts.
 * Pick an SWR and a forward (transmitter) power and read how many watts
 * bounce back off the mismatch versus how many actually reach the antenna.
 *
 *   Γ           = (SWR − 1) / (SWR + 1)        (reflection coefficient, magnitude)
 *   reflected % = Γ²
 *   return loss = −20·log₁₀ Γ                  (dB)
 *   P_reflected = P_forward · Γ²
 *   P_delivered = P_forward · (1 − Γ²)
 *
 * Landmark check (ARRL Hbk 2023 Ch.25): SWR 2.0 → Γ = 0.333 → 11.1 % reflected.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Input } from '@/components/ui/input'
import { ResultBox } from '@/components/ui/result-box'
import { MathVar } from '@/components/ui/math'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/** Parse a string to a positive finite number, returning NaN otherwise. */
function parsePositive(raw: string): number {
  const trimmed = raw.trim().replace(',', '.')
  if (!trimmed) return NaN
  const n = parseFloat(trimmed)
  if (!isFinite(n) || n <= 0) return NaN
  return n
}

/** Keep only digits and a decimal separator. */
function stripNonNumeric(raw: string): string {
  return raw.replace(/[^0-9.,]/g, '')
}

export default function SwrToReflectedPower() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [swr, setSwr] = useState(2)
  const [pfText, setPfText] = useState('100')

  const m = useMemo(() => {
    const g = (swr - 1) / (swr + 1) // SWR ≥ 1 → Γ ∈ [0, 1)
    const reflFrac = g * g
    const rl = g <= 1e-9 ? Infinity : -20 * Math.log10(g)
    const pf = parsePositive(pfText)
    const hasPf = !isNaN(pf)
    const pRefl = hasPf ? pf * reflFrac : NaN
    const pDel = hasPf ? pf * (1 - reflFrac) : NaN
    return { g, reflPct: reflFrac * 100, rl, hasPf, pRefl, pDel }
  }, [swr, pfText])

  // status: one of three markup-free keys, safe for plain t()
  const statusKey = swr < 2 ? 'good' : swr < 3 ? 'watch' : 'bad'
  const statusTone = statusKey === 'good' ? 'success' : statusKey === 'watch' ? 'warn' : 'error'

  return (
    <Widget
      title={t('ch3_4.swrPower.title')}
      description={<Trans i18nKey="ch3_4.swrPower.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* SWR slider */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="swrp-swr" className="text-foreground font-medium shrink-0">
          {t('ch3_4.swrPower.swrLabel')}
        </label>
        <input
          id="swrp-swr"
          type="range"
          min={1}
          max={5}
          step={0.1}
          value={swr}
          onChange={e => setSwr(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-[hsl(var(--primary))]"
        />
        <span className="font-mono text-foreground w-20 text-right">{fmt(swr, 1)} : 1</span>
      </div>

      {/* Forward power */}
      <div className="space-y-2">
        <label htmlFor="swrp-pf" className="text-sm font-medium text-foreground">
          {t('ch3_4.swrPower.forwardLabel')}{' '}
          <span className="text-xs text-muted-foreground">({tUnit('w')})</span>
        </label>
        <Input
          id="swrp-pf"
          type="text"
          inputMode="decimal"
          value={pfText}
          onChange={e => setPfText(stripNonNumeric(e.target.value))}
          placeholder={t('ch3_4.swrPower.forwardPlaceholder')}
        />
      </div>

      {/* Mismatch readouts (independent of forward power) */}
      <div className="grid grid-cols-3 gap-3">
        <ResultBox tone="info" label={<span>{t('ch3_4.swrPower.gammaOut')} |<MathVar>{'\\Gamma'}</MathVar>|</span>}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmt(m.g, 2)}</p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch3_4.swrPower.reflPctOut')}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmt(m.reflPct, 1)} %</p>
        </ResultBox>
        <ResultBox tone="muted" label={t('ch3_4.swrPower.rlOut')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {m.rl === Infinity ? '∞' : fmt(m.rl, 1)} {tUnit('db')}
          </p>
        </ResultBox>
      </div>

      {/* Power split (needs a forward power) */}
      {m.hasPf ? (
        <div className="grid grid-cols-2 gap-3">
          <ResultBox tone="success" label={t('ch3_4.swrPower.deliveredOut')}>
            <p className="text-xl font-mono font-semibold text-foreground">{fmt(m.pDel, 1)} {tUnit('w')}</p>
          </ResultBox>
          <ResultBox tone="error" label={t('ch3_4.swrPower.reflectedOut')}>
            <p className="text-xl font-mono font-semibold text-foreground">{fmt(m.pRefl, 1)} {tUnit('w')}</p>
          </ResultBox>
        </div>
      ) : (
        <ResultBox tone="muted" className="text-center">
          <p className="text-sm text-muted-foreground">{t('ch3_4.swrPower.invalid')}</p>
        </ResultBox>
      )}

      <ResultBox tone={statusTone}>
        <p className="text-[13px] text-foreground">{t(`ch3_4.swrPower.${statusKey}`)}</p>
      </ResultBox>
    </Widget>
  )
}
