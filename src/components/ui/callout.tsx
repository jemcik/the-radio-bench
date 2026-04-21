import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  IconDanger,
  IconKeyConcept,
  IconProTip,
  IconNote,
  IconCaution,
  IconExperiment,
  IconOnAir,
  IconMath,
} from './callout-icons'

/**
 * Color comes from the per-theme `--callout-*` CSS variables (defined in
 * src/index.css; wired into Tailwind utilities in tailwind.config.ts as
 * `text-callout-*`, `border-l-callout-*`, `bg-callout-*`). Each theme may
 * retune individual entries without touching this component.
 */

export type CalloutVariant =
  | 'danger'
  | 'key'
  | 'tip'
  | 'note'
  | 'caution'
  | 'experiment'
  | 'onair'
  | 'math'

const ICONS: Record<CalloutVariant, typeof IconDanger> = {
  danger:     IconDanger,
  key:        IconKeyConcept,
  tip:        IconProTip,
  note:       IconNote,
  caution:    IconCaution,
  experiment: IconExperiment,
  onair:      IconOnAir,
  math:       IconMath,
}

/** Default English label per variant — used as i18n fallback. */
const DEFAULT_LABELS: Record<CalloutVariant, string> = {
  danger:     'Danger',
  key:        'Key Concept',
  tip:        'Pro Tip',
  note:       'Note',
  caution:    'Caution',
  experiment: 'Experiment',
  onair:      'On Air',
  math:       'Math',
}

const calloutVariants = cva(
  'flex gap-3 items-start rounded-lg border-l-[3px] px-4 py-3 my-4',
  {
    variants: {
      variant: {
        danger:     'border-l-callout-danger     bg-callout-danger/[0.06]',
        key:        'border-l-callout-key        bg-callout-key/[0.06]',
        tip:        'border-l-callout-tip        bg-callout-tip/[0.06]',
        note:       'border-l-callout-note       bg-callout-note/[0.06]',
        caution:    'border-l-callout-caution    bg-callout-caution/[0.06]',
        experiment: 'border-l-callout-experiment bg-callout-experiment/[0.06]',
        onair:      'border-l-callout-onair      bg-callout-onair/[0.06]',
        math:       'border-l-callout-math       bg-callout-math/[0.06]',
      },
    },
    defaultVariants: { variant: 'note' },
  },
)

/** Text-color utility (icon + label) per variant — kept separate so callers
 *  reading the JSX can see which colour applies where. */
const TEXT_BY_VARIANT: Record<CalloutVariant, string> = {
  danger:     'text-callout-danger',
  key:        'text-callout-key',
  tip:        'text-callout-tip',
  note:       'text-callout-note',
  caution:    'text-callout-caution',
  experiment: 'text-callout-experiment',
  onair:      'text-callout-onair',
  math:       'text-callout-math',
}

interface CalloutProps extends VariantProps<typeof calloutVariants> {
  variant: CalloutVariant
  /** Override the default label text */
  title?: string
  children: ReactNode
  className?: string
}

export function Callout({ variant, title, children, className }: CalloutProps) {
  const Icon = ICONS[variant]
  const text = TEXT_BY_VARIANT[variant]
  const { t } = useTranslation('ui')
  const translatedLabel = t(`calloutLabels.${variant}`, { defaultValue: DEFAULT_LABELS[variant] })

  return (
    <div className={cn(calloutVariants({ variant }), className)}>
      <Icon size={36} className={cn(text, 'shrink-0 mt-0.5')} />
      <div className="min-w-0 flex-1">
        <p className={cn('text-[10px] font-bold uppercase tracking-[0.15em] mb-1', text)}>
          {title ?? translatedLabel}
        </p>
        <div className="text-[14px] leading-relaxed text-foreground/90">{children}</div>
      </div>
    </div>
  )
}
