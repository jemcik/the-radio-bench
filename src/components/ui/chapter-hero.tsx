import { type ReactNode } from 'react'

/**
 * Wrapper for the vintage pen-and-ink illustration that sits under every
 * chapter title. Centres the SVG, applies consistent vertical spacing, and
 * ensures it scales down on narrow screens.
 *
 * The inner SVG should use `stroke="currentColor"` (not a hardcoded colour)
 * so it inherits the page's `--foreground` and adapts to every theme.
 *
 * ```tsx
 * <ChapterHero ariaLabel={t('ch0_2.heroAriaLabel')}>
 *   <Ch0_2Hero />
 * </ChapterHero>
 * ```
 *
 * Prose-chapter wraps chapter bodies with `prose` styles; this component is
 * marked `not-prose` so the margins around the SVG don't pick up the
 * paragraph rhythm.
 */
interface ChapterHeroProps {
  /** Screen-reader description of the illustration (i18n-resolved string). */
  ariaLabel: string
  /** The SVG illustration. Use `stroke="currentColor"` inside. */
  children: ReactNode
}

export function ChapterHero({ ariaLabel, children }: ChapterHeroProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="not-prose my-6 flex justify-center text-[hsl(var(--sketch-stroke))] [&>svg]:max-w-full [&>svg]:h-auto"
    >
      {children}
    </div>
  )
}
