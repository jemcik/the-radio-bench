/**
 * Chapter 4.2 §2 — where a transmitter's harmonics land.
 *
 * Ch 3.2 asked which *amateur* bands your harmonics hit (why the output filter
 * exists). Here the question is who ELSE they reach: FM broadcast, the aircraft
 * band, DAB / VHF, and UHF TV. The classic case is 6 m (50 MHz) whose 2nd
 * harmonic (100 MHz) lands squarely in the FM broadcast band — the reason a
 * clean output filter is not optional.
 *
 * Service edges (MHz): FM broadcast 87.5–108, aircraft 108–137, DAB/VHF band III
 * 174–240, DVB-T2 UHF TV 470–694 (Europe/Ukraine). Amateur band edges are IARU
 * Region 1. Verified against the ARRL Handbook 2023 ch27 and current EU/UA plans.
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

// Broadcast / safety-of-life services your harmonics must stay out of (MHz).
const SERVICES: Array<{ key: string; lo: number; hi: number }> = [
  { key: 'fmBroadcast', lo: 87.5, hi: 108 },
  { key: 'airband', lo: 108, hi: 137 },
  { key: 'vhfTv', lo: 174, hi: 240 },
  { key: 'uhfTv', lo: 470, hi: 694 },
]

function bandFor(freq: number): string | null {
  const b = BANDS.find(b => freq >= b.lo && freq <= b.hi)
  return b ? b.name : null
}
function serviceFor(freq: number): string | null {
  const s = SERVICES.find(s => freq >= s.lo && freq <= s.hi)
  return s ? s.key : null
}

const HARMONICS = [2, 3, 4, 5] as const

export default function HarmonicReachCalculator() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [freqDisp, setFreqDisp] = useState('50')

  const f = parseValue(freqDisp)
  const homeBand = useMemo(() => bandFor(f), [f])
  const rows = useMemo(
    () =>
      HARMONICS.map(n => {
        const value = n * f
        const service = serviceFor(value)
        return { n, value, service, band: service ? null : bandFor(value) }
      }),
    [f],
  )

  return (
    <Widget
      title={t('ch4_2.harmReach.title')}
      description={<Trans i18nKey="ch4_2.harmReach.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="hr-f" className="text-foreground font-medium shrink-0">
          {t('ch4_2.harmReach.freqLabel')}
        </label>
        <input
          id="hr-f"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={freqDisp}
          onChange={e => setFreqDisp(e.target.value)}
          className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
        />
        <span className="text-muted-foreground">{tUnit('mhz')}</span>
        <span className="text-muted-foreground">
          {homeBand
            ? t('ch4_2.harmReach.homeBand', { band: homeBand })
            : t('ch4_2.harmReach.homeNone')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rows.map(h => (
          <ResultBox
            key={h.n}
            tone={h.service ? 'warn' : h.band ? 'info' : 'muted'}
            label={t('ch4_2.harmReach.order', { count: h.n })}
          >
            <p className="text-xl font-mono font-semibold text-foreground">
              {fmt(h.value, 2)} {tUnit('mhz')}
            </p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {h.service
                ? `→ ${t(`ch4_2.harmReach.svc.${h.service}`)}`
                : h.band
                  ? `→ ${t('ch4_2.harmReach.amateur', { band: h.band })}`
                  : t('ch4_2.harmReach.clear')}
            </p>
          </ResultBox>
        ))}
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch4_2.harmReach.hint" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
