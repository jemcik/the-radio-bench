import { type ReactNode } from 'react'
import { Term } from './term'
import { glossary } from '@/data/glossary'

/**
 * A <Term> that auto-looks up its definition from the central glossary.
 *
 * Usage:
 *   <G>voltage</G>                     — looks up "voltage" in glossary
 *   <G k="vna">VNA</G>                 — displays "VNA", looks up "vna"
 *   <G k="pwm" color="text-teal-400">PWM output</G>
 */
interface GProps {
  /** Glossary key. Defaults to lowercase of children text. */
  k?: string
  /** Accent color class. Defaults to text-[hsl(var(--term-accent))]. */
  color?: string
  children: ReactNode
}

export function G({ k, color, children }: GProps) {
  const key = k ?? (typeof children === 'string' ? children.toLowerCase() : '')
  const def = glossary[key]

  if (!def) {
    // No glossary entry — render as styled text without tooltip
    return <span className={color ?? 'text-[hsl(var(--term-accent))]'}>{children}</span>
  }

  return (
    <Term def={def} className={color ?? undefined}>
      {children}
    </Term>
  )
}
