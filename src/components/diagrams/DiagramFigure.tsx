import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Figure wrapper shared by every diagram on the site.
 *
 * Replaces the repeated
 *   <figure className="my-8 not-prose">
 *     <div className="rounded-xl border border-border bg-muted/40 p-4">
 *       {children}
 *     </div>
 *     {caption && <figcaption … />}
 *   </figure>
 * block that appeared once per diagram file. Keep the box shape in a
 * single place so diagram padding/border/rounded corners stay visually
 * consistent across chapters.
 *
 * TITLE rendering — the `title` prop renders as HTML inside the padded
 * box, ABOVE the diagram body. This deliberately lives in HTML rather
 * than inside the SVG for two reasons:
 *   1. HTML titles wrap naturally when the user picks a wider font —
 *      in-SVG titles get clipped by the viewBox when the string runs
 *      past the svg width (user-flagged on MagnitudeLadder).
 *   2. HTML inherits the html-root font-size from FontContext, so the
 *      site's «size» setting actually affects the title (in-SVG
 *      `fontSize={N}` numeric attributes override CSS inheritance).
 * Caption below uses a fixed 13 px size (`text-[13px]`) — small enough
 * not to compete with the diagram body but above the 12 px floor we
 * hit on a previous iteration. Captions/hints site-wide are unified
 * on 13 px; callout body text on 14 px. Fixed pixels deliberately
 * (not `text-sm` which would scale with FontContext) so minimum
 * legibility is guaranteed at the smallest font-size setting.
 *
 * NO `overflow-x-auto` on the inner box — per user feedback, we do not
 * want widget-level scrollbars until absolutely unavoidable. Diagrams
 * render at their natural fixed pixel width; very narrow viewports
 * fall back to page-level horizontal scrolling.
 */

interface DiagramFigureProps {
  /** Optional HTML heading rendered above the diagram body, inside the
   *  padded box. Prefer this over rendering a title inside the SVG:
   *  HTML text wraps naturally and responds to the font-size setting.  */
  title?: ReactNode
  /** Caption rendered below the diagram box. */
  caption?: ReactNode
  /** Optional extra classes on the outer <figure>. */
  className?: string
  children: ReactNode
}

export default function DiagramFigure({ title, caption, className, children }: DiagramFigureProps) {
  return (
    <figure className={cn('my-8 not-prose', className)}>
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        {title && (
          <h3 className="text-center text-base font-semibold text-foreground mb-3 px-2 leading-tight">
            {title}
          </h3>
        )}
        {children}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] text-muted-foreground leading-snug">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
