import { type ReactNode } from 'react'
import { Card } from './card'
import { Separator } from './separator'
import { cn } from '@/lib/utils'

interface WidgetProps {
  /**
   * Widget title shown in the header. Pre-rendered ReactNode — caller is
   * responsible for any subscript / formatting wrapping (e.g.,
   * `withSubscripts(t('...'))` for strings that contain `X_L`-style
   * subscripts). This contract is enforced by
   * `scripts/check-bare-subscript-renders.mjs`.
   */
  title: ReactNode
  /** Optional subtitle / description. Same wrapping contract as `title`. */
  description?: ReactNode
  /** Widget body */
  children: ReactNode
  className?: string
}

/**
 * Shared wrapper for all interactive chapter widgets.
 *
 * Handles:
 * - Consistent card styling (border, radius, padding)
 * - Prose isolation via `not-prose`
 * - Vertical spacing inside chapters via `my-8`
 * - Uniform title + description header with separator
 * - Consistent child spacing via `space-y-4`
 *
 * Individual widgets only need to provide their interactive content
 * as children — no need to think about Card, prose, or spacing.
 */
export default function Widget({ title, description, children, className }: WidgetProps) {
  return (
    <Card surface="default" radius="xl" className={cn('px-5 pt-3 pb-5 my-8 not-prose', className)}>
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Separator className="my-3" />
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  )
}
