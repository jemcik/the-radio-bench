/**
 * Chapter 4.5 §6 — what goes in a log entry, and what does not.
 *
 * The widget exists because the reader's instinct after chapter 4.4 is that a
 * log is a diary. It is not: the Регламент names five things and stops. Filling
 * the fields and watching one line assemble underneath makes the shortness of
 * that list the memorable part.
 *
 * ── Source ─────────────────────────────────────────────────────────────
 * Регламент аматорського радіозв'язку України, розділ VII:
 *   п.15 — keeping a log is RECOMMENDED, not required. What IS fixed is the
 *          content, if you keep one: the correspondent's call sign; date, time,
 *          band (frequency) and mode; and the signal report. Anything further
 *          is at the operator's discretion. Repeaters and beacons must log
 *          switch-on and switch-off times. Mobile stations are exempt.
 *   п.16 — UTC and Latin letters are recommended; an electronic log is allowed.
 *   п.17 — the log is produced for inspection by authorised НКЕК officials.
 *   п.18 — kept at least one year after the last entry.
 *
 * That «recommended, not required» is the fact most often lost when Ukrainian
 * logging is summarised elsewhere, so the widget states it in its own description rather
 * than leaving it to the prose.
 *
 * The optional fields are shown alongside deliberately: the contrast is the
 * lesson, and a reader who has met ADIF or a contest log needs to know those
 * extra columns are a choice rather than an obligation.
 */
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'

const MODES = ['CW', 'SSB', 'FM', 'DIGI'] as const
type Mode = (typeof MODES)[number]

/** Fields the Регламент leaves entirely to the operator. */
const OPTIONAL_KEYS = ['name', 'qth', 'rig', 'notes'] as const

const inputClass =
  'border border-border rounded px-2 py-1 bg-background text-foreground text-sm w-full'
const rowClass = 'flex flex-col gap-1'
const labelClass = 'text-foreground font-medium text-sm'

export default function LogEntryBuilder() {
  const { t } = useTranslation('ui')
  const [callsign, setCallsign] = useState('DL1ABC')
  const [date, setDate] = useState('2026-07-27')
  const [time, setTime] = useState('18:42')
  const [freq, setFreq] = useState('7.090')
  const [mode, setMode] = useState<Mode>('SSB')
  const [report, setReport] = useState('59')

  // Latin uppercase is what п.16 recommends for call signs; doing it here
  // rather than validating means the reader sees the convention, not an error.
  const shownCall = callsign.toUpperCase()

  return (
    <Widget
      title={t('ch4_5.log.title')}
      description={
        <Trans i18nKey="ch4_5.log.description" ns="ui" components={{ ...mathComponents }} />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={rowClass}>
          <label htmlFor="log-call" className={labelClass}>
            {t('ch4_5.log.fCallsign')}
          </label>
          <input
            id="log-call"
            className={inputClass}
            value={callsign}
            onChange={e => setCallsign(e.target.value)}
          />
        </div>

        <div className={rowClass}>
          <label htmlFor="log-date" className={labelClass}>
            {t('ch4_5.log.fDate')}
          </label>
          <input
            id="log-date"
            type="date"
            className={inputClass}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div className={rowClass}>
          <label htmlFor="log-time" className={labelClass}>
            {t('ch4_5.log.fTime')}
          </label>
          <input
            id="log-time"
            type="time"
            className={inputClass}
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>

        <div className={rowClass}>
          <label htmlFor="log-freq" className={labelClass}>
            {t('ch4_5.log.fFreq')}
          </label>
          <input
            id="log-freq"
            className={inputClass}
            value={freq}
            onChange={e => setFreq(e.target.value)}
          />
        </div>

        <div className={rowClass}>
          <label htmlFor="log-mode" className={labelClass}>
            {t('ch4_5.log.fMode')}
          </label>
          <select
            id="log-mode"
            className={inputClass}
            value={mode}
            onChange={e => setMode(e.target.value as Mode)}
          >
            {MODES.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className={rowClass}>
          <label htmlFor="log-report" className={labelClass}>
            {t('ch4_5.log.fReport')}
          </label>
          <input
            id="log-report"
            className={inputClass}
            value={report}
            onChange={e => setReport(e.target.value)}
          />
        </div>
      </div>

      <ResultBox label={t('ch4_5.log.rowLabel')}>
        <span className="font-mono text-sm" data-testid="log-row">
          {`${date}  ${time}  ${freq} ${t('units.mhz')}  ${mode}  ${shownCall}  ${report}`}
        </span>
      </ResultBox>

      <div className="not-prose text-[13px] text-foreground">
        <p className="font-medium">{t('ch4_5.log.optionalTitle')}</p>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
          {OPTIONAL_KEYS.map(k => (
            <li key={k}>{t(`ch4_5.log.opt_${k}`)}</li>
          ))}
        </ul>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch4_5.log.footnote" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
