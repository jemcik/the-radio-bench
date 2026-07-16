/**
 * Chapter 4.2 §6 — the RFI toolkit, matched to the problem.
 *
 * Pick a symptom; the tools that help light up (the best one flagged), the
 * rest dim, and the panel names the first thing to reach for. The point: there
 * is no single "anti-interference" gadget — the cure follows from WHERE the
 * energy is (source, path, or victim). Distils ERC 32 §9.3 remedies and the
 * ARRL Handbook 2023 ch27 troubleshooting guidance.
 */
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'

const REMEDIES = ['filter', 'ferrite', 'shield', 'earth', 'separation', 'power'] as const
type Remedy = (typeof REMEDIES)[number]

const PROBLEMS = ['harmonics', 'overload', 'commonMode', 'directPickup', 'mains'] as const
type Problem = (typeof PROBLEMS)[number]

// For each problem: the primary remedy and the secondary (also-helps) ones.
const APPLIES: Record<Problem, { primary: Remedy; also: Remedy[] }> = {
  harmonics: { primary: 'filter', also: ['power', 'separation'] },
  overload: { primary: 'filter', also: ['separation', 'power'] },
  commonMode: { primary: 'ferrite', also: ['earth', 'shield'] },
  directPickup: { primary: 'shield', also: ['separation', 'power'] },
  mains: { primary: 'filter', also: ['ferrite', 'earth'] },
}

export default function RemedyMatrix() {
  const { t } = useTranslation('ui')
  const [problem, setProblem] = useState<Problem>('harmonics')

  const { primary, also } = APPLIES[problem]
  const stateOf = (r: Remedy): 'primary' | 'also' | 'off' =>
    r === primary ? 'primary' : also.includes(r) ? 'also' : 'off'

  return (
    <Widget
      title={t('ch4_2.remedy.title')}
      description={<Trans i18nKey="ch4_2.remedy.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* pick a symptom */}
      <div>
        <p className="text-sm text-foreground font-medium mb-2">{t('ch4_2.remedy.pickProblem')}</p>
        <div className="flex flex-wrap gap-2">
          {PROBLEMS.map(p => {
            const on = p === problem
            return (
              <button
                key={p}
                type="button"
                onClick={() => setProblem(p)}
                aria-pressed={on}
                className={`border rounded px-3 py-1.5 text-[13px] text-left ${
                  on
                    ? 'border-primary bg-primary/10 text-foreground font-medium'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {t(`ch4_2.remedy.prob.${p}`)}
              </button>
            )
          })}
        </div>
      </div>

      {/* remedies that apply */}
      <div>
        <p className="text-sm text-foreground font-medium mb-2">{t('ch4_2.remedy.remediesLabel')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {REMEDIES.map(r => {
            const s = stateOf(r)
            const cls =
              s === 'primary'
                ? 'border-callout-experiment/50 bg-callout-experiment/[0.10] text-foreground'
                : s === 'also'
                  ? 'border-callout-note/40 bg-callout-note/[0.06] text-foreground'
                  : 'border-border bg-muted/40 text-muted-foreground/60'
            return (
              <div key={r} className={`rounded-lg border px-3 py-2 text-[13px] ${cls}`}>
                <div className="flex items-center justify-between gap-2">
                  <span>{t(`ch4_2.remedy.rem.${r}`)}</span>
                  {s === 'primary' && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-callout-experiment shrink-0">
                      {t('ch4_2.remedy.best')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* the first thing to reach for */}
      <ResultBox tone="primary" label={t(`ch4_2.remedy.prob.${problem}`)}>
        <p className="text-sm text-foreground">
          <Trans i18nKey={`ch4_2.remedy.cure.${problem}`} ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
        </p>
      </ResultBox>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch4_2.remedy.hint" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
