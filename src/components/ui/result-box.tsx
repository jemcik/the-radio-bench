import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Tinted box used inside widgets to frame a result, hint, or breakdown.
 *
 * Tones are routed through the per-theme `--callout-*` CSS variables so
 * each of the six themes retunes the accent on its own. Avoid reaching
 * for raw Tailwind palette colors (`bg-blue-500/10` etc.) inside widgets
 * — use <ResultBox> instead so themes stay consistent.
 *
 * The thin `label` row above the content mirrors the "eyebrow" pattern
 * used inside LabActivity and is the single place that applies the tone
 * colour to text.
 */

type Tone = 'primary' | 'info' | 'success' | 'warn' | 'error' | 'muted'

const boxVariants = cva('rounded-lg border p-4', {
  variants: {
    tone: {
      primary: 'border-primary/30           bg-primary/5',
      info:    'border-callout-note/30      bg-callout-note/[0.06]',
      success: 'border-callout-experiment/30 bg-callout-experiment/[0.06]',
      warn:    'border-callout-key/30       bg-callout-key/[0.06]',
      error:   'border-callout-danger/30    bg-callout-danger/[0.06]',
      muted:   'border-border               bg-muted/50',
    },
  },
  defaultVariants: { tone: 'primary' },
})

const LABEL_TEXT: Record<Tone, string> = {
  primary: 'text-primary',
  info:    'text-callout-note',
  success: 'text-callout-experiment',
  warn:    'text-callout-key',
  error:   'text-callout-danger',
  muted:   'text-muted-foreground',
}

interface ResultBoxProps extends VariantProps<typeof boxVariants> {
  /** Small uppercase eyebrow above the content. Omit for an untitled box. */
  label?: ReactNode
  tone?: Tone
  className?: string
  children: ReactNode
}

export function ResultBox({ tone = 'primary', label, className, children }: ResultBoxProps) {
  return (
    <div className={cn(boxVariants({ tone }), className)}>
      {label && (
        <p className={cn('text-xs font-semibold uppercase tracking-wider mb-2', LABEL_TEXT[tone])}>
          {label}
        </p>
      )}
      {children}
    </div>
  )
}
