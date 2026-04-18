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
 * NO `overflow-x-auto` on the inner box — per user feedback, we do not
 * want widget-level scrollbars until absolutely unavoidable. Diagrams
 * render at their natural fixed pixel width; very narrow viewports
 * fall back to page-level horizontal scrolling.
 */

interface DiagramFigureProps {
  /** Caption rendered below the diagram box. */
  caption?: ReactNode
  /** Optional extra classes on the outer <figure>. */
  className?: string
  children: ReactNode
}

export default function DiagramFigure({ caption, className, children }: DiagramFigureProps) {
  return (
    <figure className={cn('my-8 not-prose', className)}>
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
