/**
 * Chapter 3.3 §2 — half-wave dipole length calculator.
 *
 *   L_total(m) ≈ 143 / f(MHz)     free-space half-wave (150/f) trimmed 5% for end effect
 *   each leg   ≈ 71.5 / f(MHz)    = L_total / 2
 *   L_total(ft) ≈ 468 / f(MHz)    the same rule hams in feet use
 *
 * Enter a frequency or pick a band; read the wire length to cut.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

// Band-centre frequencies (MHz), IARU Region 1. Names are symbolic, not prose.
const BANDS: Array<{ name: string; f: number }> = [
  { name: '160 m', f: 1.9 },
  { name: '80 m', f: 3.65 },
  { name: '40 m', f: 7.1 },
  { name: '20 m', f: 14.175 },
  { name: '15 m', f: 21.225 },
  { name: '10 m', f: 28.5 },
  { name: '2 m', f: 145 },
]

export default function DipoleLengthCalculator() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [freqDisp, setFreqDisp] = useState('7.1')

  const computed = useMemo(() => {
    const f = parseValue(freqDisp)
    if (f <= 0) return { total: 0, leg: 0, feet: 0 }
    const total = 143 / f
    return { total, leg: total / 2, feet: 468 / f }
  }, [freqDisp])

  return (
    <Widget
      title={t('ch3_3.dipoleCalc.title')}
      description={<Trans i18nKey="ch3_3.dipoleCalc.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="dip-f" className="text-foreground font-medium shrink-0">
          {t('ch3_3.dipoleCalc.freqLabel')}
        </label>
        <input
          id="dip-f"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={freqDisp}
          onChange={e => setFreqDisp(e.target.value)}
          className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
        />
        <span className="text-muted-foreground">{tUnit('mhz')}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground shrink-0">{t('ch3_3.dipoleCalc.bandLabel')}</span>
        {BANDS.map(b => (
          <button
            key={b.name}
            type="button"
            onClick={() => setFreqDisp(String(b.f))}
            className="border border-border rounded px-2 py-1 bg-background text-foreground hover:bg-muted font-mono text-[13px]"
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="primary" label={t('ch3_3.dipoleCalc.totalLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmt(computed.total, 2)} {tUnit('m')}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch3_3.dipoleCalc.legLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmt(computed.leg, 2)} {tUnit('m')}
          </p>
        </ResultBox>
        <ResultBox tone="muted" label={t('ch3_3.dipoleCalc.feetLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmt(computed.feet, 2)} {tUnit('ft')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch3_3.dipoleCalc.note')}
      </p>
    </Widget>
  )
}
