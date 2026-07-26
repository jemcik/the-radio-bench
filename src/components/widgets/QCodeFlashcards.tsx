/**
 * Chapter 4.4 §3 — Q-code flashcards.
 *
 * The deck is not a selection of our own: it is exactly the fifteen codes the
 * CEPT novice syllabus (ERC Report 32, section b, chapter 2) lists, in
 * alphabetical order. Each card carries both halves of the code, because that
 * is what a Q-code actually is — the same three letters ask a question with a
 * question mark and answer it without one.
 *
 * Two directions, because recall runs one way and recognition the other:
 *   – «code → meaning» is what you need when you hear QRX on air
 *   – «meaning → code» is what you need when you want to send it
 */
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'

/** ERC Report 32 §b ch.2, alphabetised. Do not add to this list without a source. */
const CODES = [
  'qrk', 'qrm', 'qrn', 'qro', 'qrp', 'qrs', 'qrt', 'qrv',
  'qrx', 'qrz', 'qsb', 'qsl', 'qso', 'qsy', 'qth',
] as const
type Code = (typeof CODES)[number]

type Direction = 'toMeaning' | 'toCode'

export default function QCodeFlashcards() {
  const { t } = useTranslation('ui')
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [direction, setDirection] = useState<Direction>('toMeaning')

  const code: Code = CODES[index]
  const label = code.toUpperCase()

  const step = (delta: number) => {
    setIndex(prev => (prev + delta + CODES.length) % CODES.length)
    setRevealed(false)
  }

  const switchDirection = (next: Direction) => {
    setDirection(next)
    setRevealed(false)
  }

  const selectClass =
    'border border-border rounded px-2 py-1 bg-background text-foreground text-sm'
  const buttonClass =
    'border border-border rounded px-3 py-1.5 bg-background text-foreground text-sm hover:bg-muted'

  return (
    <Widget
      title={t('ch4_4.qcodes.title')}
      description={<Trans i18nKey="ch4_4.qcodes.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap items-end gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="qcode-direction" className="text-foreground font-medium">
            {t('ch4_4.qcodes.directionLabel')}
          </label>
          <select
            id="qcode-direction"
            value={direction}
            onChange={e => switchDirection(e.target.value as Direction)}
            className={selectClass}
          >
            <option value="toMeaning">{t('ch4_4.qcodes.directionToMeaning')}</option>
            <option value="toCode">{t('ch4_4.qcodes.directionToCode')}</option>
          </select>
        </div>
        <p className="text-muted-foreground" data-testid="qcode-counter">
          {t('ch4_4.qcodes.counter', { current: index + 1, total: CODES.length })}
        </p>
      </div>

      {/* The prompt side of the card */}
      <div className="rounded-md border border-border bg-muted/30 px-4 py-6 text-center">
        {direction === 'toMeaning' ? (
          <p className="text-3xl font-mono font-semibold text-foreground" data-testid="qcode-prompt">
            {label}
          </p>
        ) : (
          <p className="text-lg text-foreground" data-testid="qcode-prompt">
            {t(`ch4_4.qcodes.a_${code}`)}
          </p>
        )}
      </div>

      {revealed ? (
        <ResultBox tone="primary" label={t('ch4_4.qcodes.answerLabel')}>
          {direction === 'toMeaning' ? (
            <div data-testid="qcode-answer">
              <p className="text-foreground mb-1">
                <span className="font-semibold">{t('ch4_4.qcodes.asksLabel')}</span>{' '}
                {t(`ch4_4.qcodes.q_${code}`)}
              </p>
              <p className="text-foreground">
                <span className="font-semibold">{t('ch4_4.qcodes.statesLabel')}</span>{' '}
                {t(`ch4_4.qcodes.a_${code}`)}
              </p>
            </div>
          ) : (
            <p className="text-3xl font-mono font-semibold text-foreground" data-testid="qcode-answer">
              {label}
            </p>
          )}
        </ResultBox>
      ) : (
        <button type="button" onClick={() => setRevealed(true)} className={buttonClass} data-testid="qcode-reveal">
          {t('ch4_4.qcodes.reveal')}
        </button>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => step(-1)} className={buttonClass} data-testid="qcode-prev">
          {t('ch4_4.qcodes.prev')}
        </button>
        <button type="button" onClick={() => step(1)} className={buttonClass} data-testid="qcode-next">
          {t('ch4_4.qcodes.next')}
        </button>
      </div>
    </Widget>
  )
}
