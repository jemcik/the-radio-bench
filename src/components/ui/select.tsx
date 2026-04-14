import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Native <select> with the shared form styling. Deliberately not a
 * Radix Select — widgets only need platform dropdowns for now.
 */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-md',
        'border border-input bg-background text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        'transition-colors cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'
