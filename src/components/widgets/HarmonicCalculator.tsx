/**
 * Chapter 3.2 §6 — harmonic-landing calculator.
 *
 * Enter a transmit frequency; the PA also radiates harmonics at 2×, 3× and 4×.
 * For each, show the frequency and which amateur band (if any) it falls in —
 * the bands the output low-pass filter must keep your harmonics out of.
 *
 * The classic example: 7 MHz (40 m) → 14 / 21 / 28 MHz, landing right on the
 * 20 / 15 / 10 m bands.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n >= 0 ? n : 0
}

// Amateur bands (MHz), IARU Region 1 — designators are symbolic, not prose.
const BANDS: Array<{ lo: number; hi: number; name: string }> = [
  { lo: 1.81, hi: 2.0, name: '160 m' },
  { lo: 3.5, hi: 3.8, name: '80 m' },
  { lo: 7.0, hi: 7.2, name: '40 m' },
  { lo: 10.1, hi: 10.15, name: '30 m' },
  { lo: 14.0, hi: 14.35, name: '20 m' },
  { lo: 18.068, hi: 18.168, name: '17 m' },
  { lo: 21.0, hi: 21.45, name: '15 m' },
  { lo: 24.89, hi: 24.99, name: '12 m' },
  { lo: 28.0, hi: 29.7, name: '10 m' },
  { lo: 50, hi: 52, name: '6 m' },
  { lo: 144, hi: 146, name: '2 m' },
  { lo: 430, hi: 440, name: '70 cm' },
]

function bandFor(freq: number): string | null {
  const b = BANDS.find(b => freq >= b.lo && freq <= b.hi)
  return b ? b.name : null
}

export default function HarmonicCalculator() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [freqDisp, setFreqDisp] = useState('7.0')

  const harmonics = useMemo(() => {
    const f = parseValue(freqDisp)
    return [2, 3, 4].map(n => {
      const value = n * f
      return { n, value, band: bandFor(value) }
    })
  }, [freqDisp])

  const labels = [t('ch3_2.harmCalc.h2'), t('ch3_2.harmCalc.h3'), t('ch3_2.harmCalc.h4')]

  return (
    <Widget
      title={t('ch3_2.harmCalc.title')}
      description={<Trans i18nKey="ch3_2.harmCalc.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="harm-f" className="text-foreground font-medium shrink-0">
          {t('ch3_2.harmCalc.freqLabel')}
        </label>
        <input
          id="harm-f"
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {harmonics.map((h, i) => (
          <ResultBox key={h.n} tone={h.band ? 'warn' : 'info'} label={labels[i]}>
            <p className="text-xl font-mono font-semibold text-foreground">
              {fmt(h.value, 2)} {tUnit('mhz')}
            </p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {h.band ? `→ ${h.band}` : t('ch3_2.harmCalc.noBand')}
            </p>
          </ResultBox>
        ))}
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch3_2.harmCalc.hint" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
