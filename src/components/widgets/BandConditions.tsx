/**
 * Chapter 4.1 §6 — band-conditions "what's open?" explorer.
 *
 * A deliberately simple rule-of-thumb lookup, not a live forecast. Pick a
 * band, the time of day and the state of the sun; the widget returns the kind
 * of contact you could expect and the one-line reason behind it, encoding the
 * propagation rules taught in the chapter:
 *   – low bands: D-layer absorbed by day, open at night
 *   – middle HF: reliable sky wave most of the time
 *   – high bands: need an active sun to lift the MUF
 *   – VHF: line-of-sight, indifferent to the sun
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'

type Time = 'day' | 'night'
type Sun = 'low' | 'med' | 'high'
type Verdict = 'vDx' | 'vRegional' | 'vLocal' | 'vClosed'

const BANDS = ['80m', '40m', '20m', '15m', '10m', '2m'] as const
type Band = (typeof BANDS)[number]

const BAND_NAMES: Record<Band, string> = {
  '80m': '80 m',
  '40m': '40 m',
  '20m': '20 m',
  '15m': '15 m',
  '10m': '10 m',
  '2m': '2 m',
}

const SUN_LEVEL: Record<Sun, number> = { low: 0, med: 1, high: 2 }

const VERDICT_TONE: Record<Verdict, 'success' | 'primary' | 'info' | 'muted'> = {
  vDx: 'success',
  vRegional: 'primary',
  vLocal: 'info',
  vClosed: 'muted',
}

function assess(band: Band, time: Time, sun: Sun): { verdict: Verdict; reason: string } {
  const lvl = SUN_LEVEL[sun]
  switch (band) {
    case '2m':
      return { verdict: 'vLocal', reason: 'rLineOfSight' }
    case '80m':
      return time === 'day'
        ? { verdict: 'vLocal', reason: 'rDayAbsorbed' }
        : { verdict: 'vRegional', reason: 'rNightOpen' }
    case '40m':
      return time === 'day'
        ? { verdict: 'vRegional', reason: 'rReliable' }
        : { verdict: 'vDx', reason: 'rNightOpen' }
    case '20m':
      if (time === 'day') {
        return lvl >= 1 ? { verdict: 'vDx', reason: 'rDxHigh' } : { verdict: 'vRegional', reason: 'rReliable' }
      }
      return { verdict: 'vRegional', reason: 'rReliable' }
    case '15m':
    case '10m':
      if (time === 'day') {
        if (lvl === 2) return { verdict: 'vDx', reason: 'rDxHigh' }
        if (lvl === 1) return { verdict: 'vRegional', reason: 'rReliable' }
        return { verdict: 'vClosed', reason: 'rNeedSun' }
      }
      return { verdict: 'vClosed', reason: 'rNeedSun' }
  }
}

export default function BandConditions() {
  const { t } = useTranslation('ui')

  const [band, setBand] = useState<Band>('10m')
  const [time, setTime] = useState<Time>('day')
  const [sun, setSun] = useState<Sun>('high')

  const { verdict, reason } = useMemo(() => assess(band, time, sun), [band, time, sun])

  const selectClass =
    'border border-border rounded px-2 py-1 bg-background text-foreground text-sm'

  return (
    <Widget
      title={t('ch4_1.conditions.title')}
      description={<Trans i18nKey="ch4_1.conditions.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="cond-band" className="text-foreground font-medium">
            {t('ch4_1.conditions.bandLabel')}
          </label>
          <select id="cond-band" value={band} onChange={e => setBand(e.target.value as Band)} className={selectClass}>
            {BANDS.map(b => (
              <option key={b} value={b}>
                {BAND_NAMES[b]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cond-time" className="text-foreground font-medium">
            {t('ch4_1.conditions.timeLabel')}
          </label>
          <select id="cond-time" value={time} onChange={e => setTime(e.target.value as Time)} className={selectClass}>
            <option value="day">{t('ch4_1.conditions.timeDay')}</option>
            <option value="night">{t('ch4_1.conditions.timeNight')}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cond-sun" className="text-foreground font-medium">
            {t('ch4_1.conditions.sunLabel')}
          </label>
          <select id="cond-sun" value={sun} onChange={e => setSun(e.target.value as Sun)} className={selectClass}>
            <option value="low">{t('ch4_1.conditions.sunLow')}</option>
            <option value="med">{t('ch4_1.conditions.sunMed')}</option>
            <option value="high">{t('ch4_1.conditions.sunHigh')}</option>
          </select>
        </div>
      </div>

      <ResultBox tone={VERDICT_TONE[verdict]} label={t('ch4_1.conditions.verdictLabel')}>
        <p className="text-xl font-semibold text-foreground mb-1">{t(`ch4_1.conditions.${verdict}`)}</p>
        <p className="text-sm text-muted-foreground">{t(`ch4_1.conditions.${reason}`)}</p>
      </ResultBox>

      <p className="text-[13px] text-muted-foreground rounded-md border border-callout-note/30 bg-callout-note/[0.06] px-3 py-2">
        {t('ch4_1.conditions.hereNote')}
      </p>
    </Widget>
  )
}
