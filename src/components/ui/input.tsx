import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Basic form input styled to match the rest of the site (tokens from
 * `index.css`). Kept deliberately thin — no variants yet; widgets that
 * need richer controls can compose on top.
 */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-md',
        'border border-input bg-background text-foreground',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        'transition-colors',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
