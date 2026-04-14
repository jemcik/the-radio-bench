import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Generic surface primitive used across the site for any "card"-shaped
 * container — stat tiles, callouts-with-no-icon, chapter overview groups,
 * lab subsections, etc. Padding is intentionally NOT baked in; pass the
 * appropriate `p-*` utility on `className`.
 *
 * Variants:
 *  - `surface` controls border + background tint
 *  - `radius`  controls corner rounding
 *
 * Use `asChild` to render as a Link/button while keeping the styles.
 */
const cardVariants = cva('border', {
  variants: {
    surface: {
      default: 'border-border bg-card',
      muted:   'border-border bg-card/60',
      accent:  'border-primary/30 bg-primary/5',
      teal:    'border-teal-500/25 bg-teal-500/[0.08]',
    },
    radius: {
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    },
  },
  defaultVariants: {
    surface: 'default',
    radius: 'xl',
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Render as a Link/button while keeping the card styles. */
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, surface, radius, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ surface, radius }), className)}
        {...props}
      />
    )
  },
)
Card.displayName = 'Card'

export { Card, cardVariants }
