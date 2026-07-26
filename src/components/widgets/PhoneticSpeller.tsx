/**
 * Chapter 4.4 §2 — phonetic-alphabet speller and self-test.
 *
 * Type a call sign, get it back in the ITU spelling alphabet (Radio
 * Regulations, Appendix 14). The «hide the words» switch turns the same
 * display into a drill: the letters stay, the words vanish, and you say them
 * yourself before revealing.
 *
 * Digits are shown as plain numerals on purpose. Appendix 14 does carry a
 * figure code (Nadazero, Unaone, Bissotwo …) but amateur practice speaks the
 * numbers plainly, so teaching the figure code here would teach something the
 * reader will not hear on air.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { mathComponents } from '@/lib/trans-defaults'
import { ITU_ALPHABET } from '@/lib/phonetic-alphabet'

const PRESETS = ['UR5HAA', 'W1AW', 'DL1ABC'] as const

/** Call signs are Latin letters and digits; anything else cannot be spelled. */
const spell = (raw: string) =>
  raw
    .toUpperCase()
    .split('')
    .filter(ch => /[A-Z0-9]/.test(ch))
    .map(ch => ({ ch, word: ITU_ALPHABET[ch] ?? null }))

export default function PhoneticSpeller() {
  const { t } = useTranslation('ui')
  const [input, setInput] = useState('UR5HAA')
  const [hidden, setHidden] = useState(false)

  const parts = useMemo(() => spell(input), [input])

  return (
    <Widget
      title={t('ch4_4.phonetics.title')}
      description={<Trans i18nKey="ch4_4.phonetics.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap items-end gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="phon-input" className="text-foreground font-medium">
            {t('ch4_4.phonetics.inputLabel')}
          </label>
          <input
            id="phon-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground font-mono text-sm w-40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-foreground font-medium">{t('ch4_4.phonetics.presetLabel')}</span>
          <div className="flex gap-2">
            {PRESETS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setInput(p)}
                className="border border-border rounded px-2 py-1 bg-background text-foreground font-mono text-sm hover:bg-muted"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-foreground">
          <input
            id="phon-hide"
            type="checkbox"
            checked={hidden}
            onChange={e => setHidden(e.target.checked)}
          />
          {t('ch4_4.phonetics.hideLabel')}
        </label>
      </div>

      {parts.length === 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="phon-empty">
          {t('ch4_4.phonetics.emptyNote')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2" data-testid="phon-output">
          {parts.map((part, i) => (
            <div
              key={`${part.ch}-${i}`}
              className="rounded-md border border-border bg-muted/30 px-3 py-2 text-center min-w-[5.5rem]"
            >
              <p className="text-2xl font-mono font-semibold text-foreground">{part.ch}</p>
              <p className="text-sm text-muted-foreground" data-testid={`phon-word-${i}`}>
                {part.word === null ? part.ch : hidden ? '·····' : part.word}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-[13px] text-muted-foreground rounded-md border border-callout-note/30 bg-callout-note/[0.06] px-3 py-2">
        {t('ch4_4.phonetics.digitNote')}
      </p>
    </Widget>
  )
}
