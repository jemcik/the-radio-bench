import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Term } from './term'
import { glossary, type GlossaryEntry } from './glossary'

/**
 * A <Term> that auto-looks up its definition from the central glossary,
 * with i18n support — tip & detail are translated when available.
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
  /** Inline label; optional when `k` is set (uses translated glossary display name). */
  children?: ReactNode
}

export function G({ k, color, children }: GProps) {
  const { t } = useTranslation('ui')
  const key = k ?? (typeof children === 'string' ? children.toLowerCase() : '')
  const baseDef = glossary[key]
  const label =
    children ??
    t(`glossary._names.${key}`, { defaultValue: key.charAt(0).toUpperCase() + key.slice(1) })

  if (!baseDef) {
    // No glossary entry — render as styled text without tooltip
    return <span className={color ?? 'text-[hsl(var(--term-accent))]'}>{label}</span>
  }

  // Merge translated tip/detail (fall back to English base if no translation)
  const translatedTip = t(`glossary.${key}.tip`, { defaultValue: '' })
  const translatedDetail = t(`glossary.${key}.detail`, { defaultValue: '' })

  const def: GlossaryEntry = {
    ...baseDef,
    tip: translatedTip || baseDef.tip,
    detail: translatedDetail || baseDef.detail,
  }

  return (
    <Term def={def} className={color ?? undefined}>
      {label}
    </Term>
  )
}
