/**
 * Chapter 4.4 §4 — RST report builder.
 *
 * Three sliders, one report. The point of the widget is that the numbers are
 * not a scale of politeness: each digit has a written definition, and the
 * widget shows the definition next to the digit so the reader stops guessing
 * what «57» is supposed to mean.
 *
 * The «on air you would say» line appears for voice only: a telegraphy report is sent,
 * not spoken, and joining its digits with «and» produced a sentence nobody says.
 *
 * Tone only exists on telegraphy — it describes the purity of a Morse note,
 * and a voice signal has no note to describe. Switching the mode to voice
 * therefore drops the third digit entirely rather than greying it out, because
 * a two-digit report is what actually goes out on air.
 */
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'

type Mode = 'voice' | 'cw'

const R_RANGE = [1, 2, 3, 4, 5]
const S_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const T_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function RstReportBuilder() {
  const { t } = useTranslation('ui')
  const [mode, setMode] = useState<Mode>('voice')
  const [r, setR] = useState(5)
  const [s, setS] = useState(9)
  const [tone, setTone] = useState(9)

  const report = mode === 'cw' ? `${r}${s}${tone}` : `${r}${s}`

  const sliderClass = 'w-full accent-[hsl(var(--term-accent))]'
  const rowClass = 'flex flex-col gap-1'

  return (
    <Widget
      title={t('ch4_4.rst.title')}
      description={<Trans i18nKey="ch4_4.rst.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className={rowClass}>
        <label htmlFor="rst-mode" className="text-foreground font-medium text-sm">
          {t('ch4_4.rst.modeLabel')}
        </label>
        <select
          id="rst-mode"
          value={mode}
          onChange={e => setMode(e.target.value as Mode)}
          className="border border-border rounded px-2 py-1 bg-background text-foreground text-sm w-fit"
        >
          <option value="voice">{t('ch4_4.rst.modeVoice')}</option>
          <option value="cw">{t('ch4_4.rst.modeCw')}</option>
        </select>
      </div>

      <div className={rowClass}>
        <label htmlFor="rst-r" className="text-foreground font-medium text-sm">
          {t('ch4_4.rst.rLabel')} — <span className="font-mono">{r}</span>
        </label>
        <input
          id="rst-r"
          type="range"
          min={R_RANGE[0]}
          max={R_RANGE[R_RANGE.length - 1]}
          step={1}
          value={r}
          onChange={e => setR(Number(e.target.value))}
          className={sliderClass}
        />
        <p className="text-sm text-muted-foreground" data-testid="rst-r-meaning">
          {t(`ch4_4.rst.r${r}`)}
        </p>
      </div>

      <div className={rowClass}>
        <label htmlFor="rst-s" className="text-foreground font-medium text-sm">
          {t('ch4_4.rst.sLabel')} — <span className="font-mono">{s}</span>
        </label>
        <input
          id="rst-s"
          type="range"
          min={S_RANGE[0]}
          max={S_RANGE[S_RANGE.length - 1]}
          step={1}
          value={s}
          onChange={e => setS(Number(e.target.value))}
          className={sliderClass}
        />
        <p className="text-sm text-muted-foreground" data-testid="rst-s-meaning">
          {t(`ch4_4.rst.s${s}`)}
        </p>
      </div>

      {mode === 'cw' && (
        <div className={rowClass}>
          <label htmlFor="rst-t" className="text-foreground font-medium text-sm">
            {t('ch4_4.rst.tLabel')} — <span className="font-mono">{tone}</span>
          </label>
          <input
            id="rst-t"
            type="range"
            min={T_RANGE[0]}
            max={T_RANGE[T_RANGE.length - 1]}
            step={1}
            value={tone}
            onChange={e => setTone(Number(e.target.value))}
            className={sliderClass}
          />
          <p className="text-sm text-muted-foreground" data-testid="rst-t-meaning">
            {t(`ch4_4.rst.t${tone}`)}
          </p>
        </div>
      )}

      <ResultBox tone="primary" label={t('ch4_4.rst.reportLabel')}>
        <p className="text-3xl font-mono font-semibold text-foreground" data-testid="rst-report">
          {report}
        </p>
        {/* Only voice is spoken. A telegraphy report is keyed as «599», never said aloud,
            so «on air you would say» produced «5 and 9 and 9» — a sentence nobody utters. */}
        {mode === 'voice' && (
          <p className="text-sm text-muted-foreground mt-1" data-testid="rst-spoken">
            {t('ch4_4.rst.spokenPrefix')} {report.split('').join(t('ch4_4.rst.spokenJoin'))}
          </p>
        )}
      </ResultBox>

      <p className="text-[13px] text-muted-foreground rounded-md border border-callout-note/30 bg-callout-note/[0.06] px-3 py-2">
        {t('ch4_4.rst.judgementNote')}
      </p>
    </Widget>
  )
}
