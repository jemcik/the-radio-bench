/**
 * Chapter 4.2 §7 — a three-question path to the culprit.
 *
 * The systematic questions an operator asks to place an interference problem
 * on the source → path → victim map (ARRL Handbook 2023 ch27 §27.5). Each leaf
 * is tagged with the element it implicates, tying the diagnosis back to §1.
 *
 * Rendered as an HTML decision flow (not SVG): the outcome text is prose-length
 * and must wrap naturally in both locales, so there is no font-floor or overlap
 * risk to manage. Wrapped in DiagramFigure for a consistent bordered figure.
 */
import { type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { mathComponents } from '@/lib/trans-defaults'

type LeafTone = 'external' | 'source' | 'path' | 'victim'

const LEAF_BOX: Record<LeafTone, string> = {
  external: 'border-border bg-muted/50',
  source: 'border-callout-caution/40 bg-callout-caution/[0.07]',
  path: 'border-callout-note/40 bg-callout-note/[0.07]',
  victim: 'border-callout-key/40 bg-callout-key/[0.07]',
}
const LEAF_TAG: Record<LeafTone, string> = {
  external: 'text-muted-foreground',
  source: 'text-callout-caution',
  path: 'text-callout-note',
  victim: 'text-callout-key',
}

function Leaf({ tone, tag, children }: { tone: LeafTone; tag: string; children: ReactNode }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-[13px] text-foreground ${LEAF_BOX[tone]}`}>
      <span className={`text-[11px] font-semibold uppercase tracking-wider mr-2 ${LEAF_TAG[tone]}`}>{tag}</span>
      {children}
    </div>
  )
}

/** A branch row: a Yes/No pill, then either a leaf or a "continue" hint. */
function Branch({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 mt-0.5 inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function Question({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground">
      {children}
    </div>
  )
}

export default function DiagnosticFlow() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_2.diagnose.${s}`)
  const tr = (s: string) => <Trans i18nKey={`ch4_2.diagnose.${s}`} ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
  const yes = k('yes')
  const no = k('no')

  return (
    <DiagramFigure title={k('title')} caption={k('caption')}>
      <div className="not-prose flex flex-col gap-2 text-foreground max-w-2xl mx-auto">
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-center text-muted-foreground">
          {k('start')}
        </div>
        <div className="text-center text-muted-foreground/50 text-xs leading-none">↓</div>

        {/* Q1 */}
        <Question>{tr('q1')}</Question>
        <div className="pl-3 flex flex-col gap-2 border-l-2 border-border/60 ml-2">
          <Branch label={no}>
            <Leaf tone="external" tag={k('tagExternal')}>{tr('q1no')}</Leaf>
          </Branch>
          <Branch label={yes}>
            <span className="text-[13px] text-muted-foreground">{k('continue')}</span>
          </Branch>
        </div>

        {/* Q2 */}
        <Question>{tr('q2')}</Question>
        <div className="pl-3 flex flex-col gap-2 border-l-2 border-border/60 ml-2">
          <Branch label={yes}>
            <Leaf tone="source" tag={k('tagSource')}>{tr('q2yes')}</Leaf>
          </Branch>
          <Branch label={no}>
            <span className="text-[13px] text-muted-foreground">{k('continue')}</span>
          </Branch>
        </div>

        {/* Q3 */}
        <Question>{tr('q3')}</Question>
        <div className="pl-3 flex flex-col gap-2 border-l-2 border-border/60 ml-2">
          <Branch label={yes}>
            <Leaf tone="path" tag={k('tagPath')}>{tr('q3yes')}</Leaf>
          </Branch>
          <Branch label={no}>
            <Leaf tone="victim" tag={k('tagVictim')}>{tr('q3no')}</Leaf>
          </Branch>
        </div>
      </div>
    </DiagramFigure>
  )
}
